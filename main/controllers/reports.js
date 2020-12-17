const fs = require('fs-extra');
const path = require('path');
const config = require('../config');
const moment = require('moment');
const { dialog } = require('electron')
const xl = require('excel4node');

module.exports = {
  async getUsers() {
    return await fs.readdir(config.path.reportsFolder);
  },

  async getYear(user) {
    if (typeof user !== 'string') {
      user = user.toString();
    }
    return await fs.readdir(path.join(config.path.reportsFolder, user));
  },

  async getMonth({ user, year }) {
    if (typeof user !== 'string') {
      user = user.toString();
    }
    if (typeof year !== 'string') {
      year = year.toString();
    }
    return await fs.readdir(path.join(config.path.reportsFolder, user, year));
  },

  async getDay({ user, year, month }) {
    if (typeof user !== 'string') {
      user = user.toString();
    }
    if (typeof year !== 'string') {
      year = year.toString();
    }
    if (typeof month !== 'string') {
      month = ('0' + month).slice(-2);
    }

    let report = await fs.readJson(path.join(config.path.reportsFolder, user, year, month, 'report.json'));
    let days = [];

    for (let day in report) {
      days.push(parseInt(day));
    }

    return Math.min(...days);
  },

  async getReport({ user, startDate, stopDate }) {
    const reports = {};
    const start = moment(startDate);
    const stop = moment(stopDate);

    do {
      const year = start.format('YYYY');
      const month = start.format('MM');

      if (!(year in reports)) {
        reports[year] = {};
      }
      if (!(month in reports[year])) {
        reports[year][month] = {};
      }

      const monthReport = await fs.readJson(path.join(config.path.reportsFolder, user, year, month, 'report.json'));

      do {
        const day = start.format('DD');

        if (day in monthReport) {
          if (!(day in reports[year][month])) {
            reports[year][month][day] = {};
          }

          //Todo: Надо зарефачить, нет идей как.
          if (monthReport[day].startFoto) {
            monthReport[day].startFoto = path.join(config.path.reportsFolder, monthReport[day].startFoto);
          }
          if (monthReport[day].stopFoto) {
            monthReport[day].stopFoto = path.join(config.path.reportsFolder, monthReport[day].stopFoto);
          }
          if (monthReport[day].pauseFoto) {
            monthReport[day].pauseFoto = path.join(config.path.reportsFolder, monthReport[day].pauseFoto);
          }
          if (monthReport[day].unpauseFoto) {
            monthReport[day].unpauseFoto = path.join(config.path.reportsFolder, monthReport[day].unpauseFoto);
          }

          reports[year][month][day] = monthReport[day];
        }
        start.add(1, 'days');
      } while (start.format('MM') === month && +start <= +stop);
    } while (+start <= +stop);

    return reports;
  },

  getReportToExcel(data) {
    let pathToSave = dialog.showSaveDialog({
      title: 'Куда сохранить отчёт?',
      defaultPath: `${data.user}.xlsx`
    });

    if (!pathToSave) {
      return false;
    }

    if (!/\.xlsx$/.test(pathToSave)) {
      pathToSave += `.xlsx`
    }

    const wb = new xl.Workbook();
    const ws = wb.addWorksheet(data.user);

    const alertStyle = wb.createStyle({
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: 'ff5252'
      }
    });

    ws.cell(1, 1, 1, 4, true).string(`Отчёт ${data.user} за ${data.startDate} ${data.stopDate}`);
    ws.cell(2, 1).string('Раб. дни');
    ws.cell(2, 2).string('Раб. время');
    ws.cell(2, 3).string('Вых. дни');
    ws.cell(2, 4).string('Переработка');

    let startRow = 3;

    function fillCell(row, item, isWeekend) {
      ws.cell(row, 1).string(`${item.day}.${item.month}.${item.year}`);
      if (isWeekend) {
        ws.cell(row, 2).string('');
        ws.cell(row, 3).number((8 / 9) * item.timeAtWork).style(!item.timeAtWork ? alertStyle : {});
      } else {
        ws.cell(row, 2).number((8 / 9) * item.timeAtWork).style(!item.timeAtWork ? alertStyle : {});
        ws.cell(row, 3).string('');
      }
      ws.cell(row, 4).number(item.extraHours);
    }
    
    for (let item of data.list) {
      if (item.dayOfWeek === 'Sun' || item.dayOfWeek === 'Sat') {
        fillCell(startRow, item, true);
      } else {
        fillCell(startRow, item, false);
      }

      startRow += 1;
    }

    ws.cell(startRow, 1).string('Всего');
    ws.cell(startRow, 2).formula(`SUM(${xl.getExcelCellRef(3, 2)}:${xl.getExcelCellRef(startRow - 1, 2)})`);
    ws.cell(startRow, 3).formula(`SUM(${xl.getExcelCellRef(3, 3)}:${xl.getExcelCellRef(startRow - 1, 3)})`);
    ws.cell(startRow, 4).formula(`SUM(${xl.getExcelCellRef(3, 4)}:${xl.getExcelCellRef(startRow - 1, 4)})`);

    ws.cell(startRow + 5, 1).string('Подпись');

    wb.write(pathToSave);
  }
};
