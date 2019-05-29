const { ipcMain } = require('electron');
const usersController = require('../controllers/users');
const timeSheetController = require('../controllers/timeSheet');

module.exports = () => {
    // Users
    ipcMain.on('get-users', async event => {
        event.sender.send('get-users-replay', await usersController.getUsers());
    });
    ipcMain.on('save-users', async (event, users) => {
        event.sender.send('save-users-replay', await usersController.saveUsers(users));
    });

    // Time Sheet
    ipcMain.on('get-user-time-sheet', async (event, userData) => {
        event.sender.send('get-user-time-sheet-replay', await timeSheetController.getUserTimeSheet(userData));
    });
};
