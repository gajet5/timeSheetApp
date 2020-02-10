const fs = require('fs-extra');
const path = require('path');
const config = require('../config');
const moment = require('moment');

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
  }
};
