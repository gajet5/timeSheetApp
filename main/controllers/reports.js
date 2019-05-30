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
            return await fs.readJson(path.join(config.path.reportsFolder, user, year, month, 'report.json'));
        } catch (e) {
            return false;
        }
    }
};
