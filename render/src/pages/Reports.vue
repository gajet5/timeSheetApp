<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <v-container grid-list-md>
        <v-layout>
            <v-flex xs12>
                <v-expansion-panel
                        v-model="panel"
                >
                    <v-expansion-panel-content>
                        <template v-slot:header>
                            <div>Настройки</div>
                        </template>
                        <v-layout>
                            <v-flex xs12>
                                <v-card>
                                    <v-card-text class="pa-2">
                                        <v-select
                                                :items="usersReports"
                                                label="Пользователь"
                                                v-model="userReportsSelected"
                                        ></v-select>
                                    </v-card-text>
                                </v-card>
                            </v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs6>
                                <v-card>
                                    <v-card-text class="pa-2">
                                        <v-select
                                                :items="yearReports"
                                                label="Год"
                                                v-model="yearReportsSelected"
                                        ></v-select>
                                    </v-card-text>
                                </v-card>
                            </v-flex>
                            <v-flex xs6>
                                <v-card>
                                    <v-card-text class="pa-2">
                                        <v-select
                                                :items="monthReports"
                                                label="Месяц"
                                                v-model="monthReportsSelected"
                                        ></v-select>
                                    </v-card-text>
                                </v-card>
                            </v-flex>
                        </v-layout>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-flex>
        </v-layout>
        <v-layout v-show="list.length">
            <v-flex xs12>
                <v-card class="scroll-y heigh-reports overflow-x-hidden">
                    <v-card-title>
                        <v-layout>
                            <v-flex xs6>
                                Дней в месяце: {{totalDays}}
                            </v-flex>
                            <v-flex xs6>
                                Часов в месяце: {{totalHours}}
                            </v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs6>
                                Переработка: {{totalExtraHours}}
                            </v-flex>
                            <v-flex xs6>
                                Выходные дни: {{totalHoursDayOff}}
                            </v-flex>
                        </v-layout>
                    </v-card-title>
                    <v-container fluid
                                 v-for="(item, index) in list"
                                 :key="index"
                    >
                        <v-card :class="{'day-off-border': isDayOff(item.dayOfWeek)}">
                            <v-card-text>
                                <v-layout>
                                    <v-flex xs6>
                                        <div>Дата: {{item.day}} {{item.dayOfWeek}}</div>
                                        <div>
                                            На работе: {{item.timeAtWork}}
                                            <v-icon color="error" v-show="!item.isStopTime">
                                                warning
                                            </v-icon>
                                        </div>
                                    </v-flex>
                                    <v-flex xs6>
                                        <div>Переработка: {{item.extraHours}}</div>
                                        <div>
                                            Пауза: {{item.pauseTotalTime}}
                                            <v-icon color="error" v-show="item.isPauseTime && !item.isUnpauseTime">
                                                warning
                                            </v-icon>
                                        </div>
                                    </v-flex>
                                </v-layout>
                                <v-expansion-panel>
                                    <v-expansion-panel-content>
                                        <template v-slot:header>
                                            <div>Приход\Уход</div>
                                        </template>
                                        <v-card>
                                            <v-card-text>
                                                <v-layout>
                                                    <v-flex xs6>
                                                        <v-avatar
                                                                size="100px"
                                                                tile
                                                                color="grey lighten-4"
                                                        >
                                                            <img :src="item.startFoto">
                                                        </v-avatar>
                                                        <div>Приход</div>
                                                        <div>{{item.startTime}}</div>
                                                    </v-flex>
                                                    <v-flex xs6>
                                                        <v-avatar
                                                                size="100px"
                                                                tile
                                                                color="grey lighten-4"
                                                        >
                                                            <img :src="item.stopFoto">
                                                        </v-avatar>
                                                        <div>Уход</div>
                                                        <div>{{item.stopTime}}</div>
                                                    </v-flex>
                                                </v-layout>
                                            </v-card-text>
                                        </v-card>
                                    </v-expansion-panel-content>
                                    <v-expansion-panel-content>
                                        <template v-slot:header>
                                            <div>Пауза\Продолжение</div>
                                        </template>
                                        <v-card>
                                            <v-card-text>
                                                <v-layout>
                                                    <v-flex xs6>
                                                        <v-avatar
                                                                size="100px"
                                                                tile
                                                                color="grey lighten-4"
                                                        >
                                                            <img :src="item.pauseFoto">
                                                        </v-avatar>
                                                        <div>Пауза</div>
                                                        <div>{{item.pauseTime}}</div>
                                                    </v-flex>
                                                    <v-flex xs6>
                                                        <v-avatar
                                                                size="100px"
                                                                tile
                                                                color="grey lighten-4"
                                                        >
                                                            <img :src="item.unpauseFoto">
                                                        </v-avatar>
                                                        <div>Продолжение</div>
                                                        <div>{{item.unpauseTime}}</div>
                                                    </v-flex>
                                                </v-layout>
                                            </v-card-text>
                                        </v-card>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-card-text>
                        </v-card>
                    </v-container>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import moment from 'moment';

    export default {
        name: "Reports",
        async beforeMount() {
            await this.getUsersReports();
        },
        data() {
            return {
                usersReports: [],
                userReportsSelected: '',
                yearReports: [],
                yearReportsSelected: '',
                monthReports: [],
                monthReportsSelected: '',
                reports: null,
                totalDays: 0,
                totalHours: 0,
                list: [],
                panel: 0,
                totalHoursDayOff: 0,
                totalExtraHours: 0
            };
        },
        watch: {
            async userReportsSelected() {
                this.yearReportsSelected = '';
                this.monthReportsSelected = '';
                this.list = [];
                this.yearReports = await this.$store.dispatch('getYearReports', this.userReportsSelected);
            },
            async yearReportsSelected() {
                this.monthReportsSelected = '';
                this.list = [];
                if (!this.yearReportsSelected) {
                    return false;
                }
                this.monthReports = await this.$store.dispatch('getMonthReports', {
                    user: this.userReportsSelected,
                    year: this.yearReportsSelected
                });
            },
            async monthReportsSelected() {
                if (!this.monthReportsSelected) {
                    return false;
                }
                this.reports = await this.$store.dispatch('getReports', {
                    user: this.userReportsSelected,
                    year: this.yearReportsSelected,
                    month: this.monthReportsSelected
                });
                this.panel = null;
            },
            reports() {
                if (!this.reports) {
                    return false;
                }

                this.totalDays = 0;
                this.totalHours = 0;
                this.totalHoursDayOff = 0;
                this.totalExtraHours = 0;
                this.list = [];

                for (let day in this.reports) {
                    let startTime = parseInt(this.reports[day].startTime);
                    let stopTime = parseInt(this.reports[day].stopTime) === 0 ? startTime : parseInt(this.reports[day].stopTime);
                    let isStopTime = parseInt(this.reports[day].stopTime) !== 0;
                    let pauseTime = parseInt(this.reports[day].pauseTime) === 0 ? +moment() : parseInt(this.reports[day].pauseTime);
                    let unpauseTime = parseInt(this.reports[day].unpauseTime) === 0 ? pauseTime : parseInt(this.reports[day].unpauseTime);
                    let isPauseTime = parseInt(this.reports[day].pauseTime) !== 0;
                    let isUnpauseTime = parseInt(this.reports[day].unpauseTime) !== 0;

                    let report = {
                        day,
                        dayOfWeek: this.reports[day].dayOfWeek,
                        startTime: moment(startTime).format('HH:mm:ss'),
                        isStopTime,
                        startFoto: this.reports[day].startFoto,
                        stopTime: moment(stopTime).format('HH:mm:ss'),
                        stopFoto: this.reports[day].stopFoto,
                        timeAtWork: Math.round(parseFloat(moment.duration((stopTime - startTime) - (unpauseTime - pauseTime)).asHours()) * 100) / 100,
                        extraHours: 0,
                        pauseTime: moment(pauseTime).format('HH:mm:ss'),
                        isPauseTime,
                        unpauseTime: moment(unpauseTime).format('HH:mm:ss'),
                        isUnpauseTime,
                        pauseTotalTime: Math.round(parseFloat(moment.duration(unpauseTime - pauseTime).asHours()) * 100) / 100,
                        pauseFoto: this.reports[day].pauseFoto,
                        unpauseFoto: this.reports[day].unpauseFoto
                    };

                    // todo: Непонятный баг с округлением.
                    // let timeRound = Math.round(report.timeAtWork * 100) / 100;

                    if (isStopTime) {
                        if (isPauseTime && !isUnpauseTime) {
                            this.list.push(report);
                            continue;
                        }

                        if (report.dayOfWeek === 'Sun' || report.dayOfWeek === 'Sat') {
                            this.totalHoursDayOff += report.timeAtWork;
                        } else {
                            if (report.timeAtWork > 9) {
                                report.extraHours = report.timeAtWork - 9;
                                report.timeAtWork = report.timeAtWork - report.extraHours;
                            }

                            this.totalHours += Math.round(report.timeAtWork * 100) / 100;
                            this.totalExtraHours += Math.round(report.extraHours * 100) / 100;
                        }

                        this.totalDays += 1;
                    }

                    this.list.push(report);
                }
            }
        },
        methods: {
            async getUsersReports() {
                this.usersReports = await this.$store.dispatch('getUsersReports');
            },
            isDayOff(day) {
                return day === 'Sun' || day === 'Sat';
            }
        }
    }
</script>

<style scoped>
    .heigh-reports {
        height: 430px;
    }

    .day-off-border {
        border: 1px solid #ff5252 !important;
    }
</style>