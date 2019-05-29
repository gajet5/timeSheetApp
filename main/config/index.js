const os = require('os');
const path = require('path');

module.exports = {
    path: {
        productFolder: path.join(os.homedir(), 'Documents', 'TimeSheet'),
        dataFolder: path.join(os.homedir(), 'Documents', 'TimeSheet', 'Data'),
        users: path.join(os.homedir(), 'Documents', 'TimeSheet', 'Data', 'users.json'),
        reportsFolder: path.join(os.homedir(), 'Documents', 'TimeSheet', 'Data', 'Reports')
    }
};
