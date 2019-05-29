import Vue from 'vue';
import VueRouter from 'vue-router';

import TimeSheet from './pages/TimeSheet';
import Reports from './pages/Reports';
import Users from './pages/Users';

Vue.use(VueRouter);

export default new VueRouter({
    routes: [
        {
            name: 'timeSheet',
            path: '/',
            component: TimeSheet
        },
        {
            name: 'reports',
            path: '/reports',
            component: Reports
        },
        {
            name: 'users',
            path: '/users',
            component: Users
        }
    ]
});
