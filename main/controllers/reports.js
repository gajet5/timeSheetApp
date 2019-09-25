const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

module.exports = {
    async getUsers() {
        return await fs.readdir(config.path.reportsFolder);
    },

    async getYear(user) {
        if (typeof user !== "string") {
            user = user.toString();
        }
        return await fs.readdir(path.join(config.path.reportsFolder, user));
    },

    async getMonth({user, year}) {
        if (typeof user !== "string") {
            user = user.toString();
        }
        if (typeof year !== "string") {
            year = year.toString();
        }
        return await fs.readdir(path.join(config.path.reportsFolder, user, year));
    },

    async getDay({user, year, month}) {
        if (typeof user !== "string") {
            user = user.toString();
        }
        if (typeof year !== "string") {
            year = year.toString();
        }
        if (typeof month !== "string") {
            month = ('0' + month).slice(-2);
        }

        let report = await fs.readJson(path.join(config.path.reportsFolder, user, year, month, 'report.json'));
        let days = [];

        for (let day in report) {
            days.push(parseInt(day));
        }

        return Math.min(...days);
    },

    async getReport({user, startDate, stopDate}) {
        const reports = {};
        const startDateArr = startDate.split('-');
        const stopDateArr = stopDate.split('-');
        let startYear = parseInt(startDateArr[0]);
        let startMonth = parseInt(startDateArr[1]);
        let startDay = parseInt(startDateArr[2]);
        let stopYear = parseInt(stopDateArr[0]);
        let stopMonth = parseInt(stopDateArr[1]);
        let stopDay = parseInt(stopDateArr[2]);
        let firstLoop = true;

        for (let year = startYear; year <= stopYear; year += 1) {
            reports[year] = {};

            for (let month = 1; month < 12; month += 1) {
                if (firstLoop) {
                    month = startMonth;
                }

                try {
                    let report = await fs.readJson(path.join(config.path.reportsFolder, user, year.toString(), ('0' + month).slice(-2), 'report.json'));
                    reports[year][month] = {};

                    for (let dayIterrator = 1; dayIterrator < 32; dayIterrator += 1) {
                        const day = ('0' + dayIterrator).slice(-2);

                        if (!report[day]) {
                            continue;
                        }

                        if (year === startYear && month === startMonth && month && dayIterrator < startDay) {
                            continue;
                        }
                        if (year === stopYear && month === stopMonth && month && dayIterrator > stopDay) {
                            break;
                        }

                        if (report[day].startFoto) {
                            report[day].startFoto = path.join(config.path.reportsFolder, report[day].startFoto)
                        }
                        if (report[day].stopFoto) {
                            report[day].stopFoto = path.join(config.path.reportsFolder, report[day].stopFoto)
                        }
                        if (report[day].pauseFoto) {
                            report[day].pauseFoto = path.join(config.path.reportsFolder, report[day].pauseFoto)
                        }
                        if (report[day].unpauseFoto) {
                            report[day].unpauseFoto = path.join(config.path.reportsFolder, report[day].unpauseFoto)
                        }

                        reports[year][month][day] = report[day];
                    }


                } catch (e) {
                    // Допустимая ошибка, нет файла репорта за месяц
                }

                firstLoop = false;
            }
        }

        return reports;
    }
};
