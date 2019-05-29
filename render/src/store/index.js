import Vue from 'vue';
import Vuex from 'vuex';

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
            ipcRenderer.send('get-user-time-sheet', userData);

            return new Promise(resolve => {
                ipcRenderer.once('get-user-time-sheet-replay', (event, result) => {
                    resolve(result);
                });
            });
        }
    }
});
