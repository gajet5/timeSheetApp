const fs = require('fs-extra');
const config = require('../config');

module.exports = () => {
    fs.ensureDirSync(config.path.productFolder);
    fs.ensureDirSync(config.path.dataFolder);
    fs.ensureDirSync(config.path.reportsFolder);
    fs.ensureFileSync(config.path.users);
};
