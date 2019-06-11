const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

module.exports = {
    async getUsers() {
        return await fs.readdir(config.path.reportsFolder);
    },

    async getYear(user) {
        return await fs.readdir(path.join(config.path.reportsFolder, user));
    },

    async getMonth({user, year}) {
        return await fs.readdir(path.join(config.path.reportsFolder, user, year));
    },

    async getReport({user, year, month}) {
        try {
            let report = await fs.readJson(path.join(config.path.reportsFolder, user, year, month, 'report.json'));
            for (let day in report) {
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
            }
            return report;
        } catch (e) {
            return false;
        }
    }
};
