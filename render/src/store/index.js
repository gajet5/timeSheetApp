import Vue from 'vue';
import Vuex from 'vuex';
const ipcRenderer = window.ipcRenderer;

Vue.use(Vuex);

export default new Vuex.Store({
    strict: true,
    state: {
        users: [],
        timeSheet: null
    },
    getters: {
        users(state) {
            return state.users;
        }
    },
    mutations: {
        setUsers(state, users) {
            state.users = users;
        },
        addUser(state, user) {
            state.users.push(user);
        },
        deleteUser(state, user) {
            state.users.splice(state.users.findIndex(element => element === user), 1);
        }
    },
    actions: {
        getUsers({ commit }) {
            ipcRenderer.once('get-users-replay', (event, users) => {
                if (users) {
                    commit('setUsers', users);
                }
            });
            ipcRenderer.send('get-users');
        },
        saveUsers({ getters }) {
            ipcRenderer.once('save-users-replay', (event, result) => {
                console.log(result);
            });
            ipcRenderer.send('save-users', getters.users);
        },
        getUserTimeSheet(ctx, userData) {
            ipcRenderer.send('get-time-sheet', userData);

            return new Promise(resolve => {
                ipcRenderer.once('get-time-sheet-replay', (event, result) => {
                    resolve(result);
                });
            });
        },
        saveTimeSheet(ctx, data) {
            ipcRenderer.once('save-time-sheet-replay', (event, result) => {
                console.log(result);
            });
            ipcRenderer.send('save-time-sheet', data);
        },
        getUsersReports() {
            ipcRenderer.send('get-users-reports');

            return new Promise(resolve => {
                ipcRenderer.once('get-users-reports-replay', (event, result) => {
                    resolve(result);
                });
            });
        },
        getYearReports(ctx, user) {
            ipcRenderer.send('get-year-reports', user);

            return new Promise(resolve => {
                ipcRenderer.once('get-year-reports-replay', (event, result) => {
                    resolve(result);
                });
            });
        },
        getMonthReports(ctx, data) {
            ipcRenderer.send('get-month-reports', data);

            return new Promise(resolve => {
                ipcRenderer.once('get-month-reports-replay', (event, result) => {
                    resolve(result);
                });
            });
        },
        getDayReports(ctx, data) {
            ipcRenderer.send('get-day-reports', data);

            return new Promise(resolve => {
                ipcRenderer.once('get-day-reports-replay', (event, result) => {
                    resolve(result);
                });
            });
        },
        getReports(ctx, data) {
            ipcRenderer.send('get-reports', data);

            return new Promise(resolve => {
                ipcRenderer.once('get-reports-replay', (event, result) => {
                    resolve(result);
                });
            });
        },
        getReportToExcel(ctx, data) {
            ipcRenderer.send('get-report-to-excel', data);
        }
    }
});
