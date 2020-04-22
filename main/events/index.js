const { ipcMain } = require('electron');
const usersController = require('../controllers/users');
const timeSheetController = require('../controllers/timeSheet');
const reportsController = require('../controllers/reports');

module.exports = () => {
    // Users
    ipcMain.on('get-users', async event => {
        event.sender.send('get-users-replay', await usersController.getUsers());
    });
    ipcMain.on('save-users', async (event, users) => {
        event.sender.send('save-users-replay', await usersController.saveUsers(users));
    });

    // Time Sheet
    ipcMain.on('get-time-sheet', async (event, userData) => {
        event.sender.send('get-time-sheet-replay', await timeSheetController.getTimeSheet(userData));
    });
    ipcMain.on('save-time-sheet', async (event, data) => {
        event.sender.send('save-time-sheet-replay', await timeSheetController.saveTimeSheet(data));
    });

    // Reports
    ipcMain.on('get-users-reports', async event => {
        event.sender.send('get-users-reports-replay', await reportsController.getUsers());
    });
    ipcMain.on('get-year-reports', async (event, user) => {
        event.sender.send('get-year-reports-replay', await reportsController.getYear(user));
    });
    ipcMain.on('get-month-reports', async (event, data) => {
        event.sender.send('get-month-reports-replay', await reportsController.getMonth(data));
    });
    ipcMain.on('get-day-reports', async (event, data) => {
        event.sender.send('get-day-reports-replay', await reportsController.getDay(data));
    });
    ipcMain.on('get-reports', async (event, data) => {
        event.sender.send('get-reports-replay', await reportsController.getReport(data));
    });
    ipcMain.on('get-report-to-excel', async (event, data) => {
        reportsController.getReportToExcel(data);
    });
};
