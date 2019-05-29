const config = require('../config');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    async getUserTimeSheet(userData) {
        try {
            await fs.ensureDir(path.join(config.path.reportsFolder, userData.user));
            await fs.ensureFile(path.join(config.path.reportsFolder, userData.user, userData.file));
            return await fs.readJson(path.join(config.path.reportsFolder, userData.user, userData.file));
        } catch (e) {
            return false;
        }
    }
};
