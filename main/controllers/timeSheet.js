const config = require('../config');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    async getTimeSheet(userData) {
        try {
            let pathToUserFolder = path.join(config.path.reportsFolder, userData.user);
            await fs.ensureDir(pathToUserFolder);
            let pathToYearFolder = path.join(pathToUserFolder, userData.year);
            await fs.ensureDir(pathToYearFolder);
            let pathToMonthFolder = path.join(pathToYearFolder, userData.month);
            await fs.ensureDir(pathToMonthFolder);
            let pathToReportFile = path.join(pathToMonthFolder, 'report.json');
            await fs.ensureFile(pathToReportFile);
            return await fs.readJson(path.join(pathToReportFile));
        } catch (e) {
            return false;
        }
    },
    async saveTimeSheet(data) {
        try {
            let pathToReportFolder = path.join(config.path.reportsFolder, data.user, data.year, data.month);
            let fotoPath = path.join(pathToReportFolder, `${data.timeSheet[data.day][`${data.status}Time`]}.jpg`);

            await fs.outputFile(
                fotoPath,
                data.timeSheet[data.day][`${data.status}Foto`].replace(/^data:image\/jpeg;base64,/, ""),
                'base64'
            );

            data.timeSheet[data.day][`${data.status}Foto`] = fotoPath;

            await fs.writeJson(path.join(pathToReportFolder, 'report.json'), data.timeSheet);
            return true;
        } catch (e) {
            return false;
        }
    }
};
