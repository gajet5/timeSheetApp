const fs = require('fs-extra');
const confit = require('../config');

module.exports = {
    async getUsers() {
        try {
            return await fs.readJson(confit.path.users);
        } catch (e) {
            return false;
        }
    },
    async saveUsers(users) {
        try {
            await fs.writeJson(confit.path.users, users);
            return true;
        } catch (e) {
            return false;
        }
    }
};