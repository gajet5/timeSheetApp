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
                                        <v-menu
                                                ref="startDateMenu"
                                                v-model="startDateMenu"
                                                :close-on-content-click="false"
                                                transition="scale-transition"
                                                offset-y
                                                full-width
                                                min-width="290px"
                                        >
                                            <template v-slot:activator="{ on }">
                                                <v-text-field
                                                        v-model="startDate"
                                                        label="Start date"
                                                        prepend-icon="event"
                                                        readonly
                                                        v-on="on"
                                                        :disabled="disabledStartDate"
                                                ></v-text-field>
                                            </template>
                                            <v-date-picker
                                                    ref="startDatePicker"
                                                    v-model="startDate"
                                                    :max="new Date().toISOString().substr(0, 10)"
                                                    :min="minStartDate"
                                                    @change="startDateSave"
                                                    :first-day-of-week="1"
                                                    locale="ru-ru"
                                            ></v-date-picker>
                                        </v-menu>
                                    </v-card-text>
                                </v-card>
                            </v-flex>
                            <v-flex xs6>
                                <v-card>
                                    <v-card-text class="pa-2">
                                        <v-menu
                                                ref="stopDateMenu"
                                                v-model="stopDateMenu"
                                                :close-on-content-click="false"
                                                transition="scale-transition"
                                                offset-y
                                                full-width
                                                min-width="290px"
                                        >
                                            <template v-slot:activator="{ on }">
                                                <v-text-field
                                                        v-model="stopDate"
                                                        label="Stop date"
                                                        prepend-icon="event"
                                                        readonly
                                                        v-on="on"
                                                        :disabled="disabledStopDate"
                                                ></v-text-field>
                                            </template>
                                            <v-date-picker
                                                    ref="stopDatePicker"
                                                    v-model="stopDate"
                                                    :max="new Date().toISOString().substr(0, 10)"
                                                    :min="startDate"
                                                    @change="stopDateSave"
                                                    :first-day-of-week="1"
                                                    locale="ru-ru"
                                            ></v-date-picker>
                                        </v-menu>
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
                                Рабочих дней: {{worksDay}}
                            </v-flex>
                            <v-flex xs6>
                                Рабочих часов: {{worksHour}}
                            </v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs6>
                                Отработано дней: {{totalDays}}
                            </v-flex>
                            <v-flex xs6>
                                Отработано часов: {{totalHours}}
                            </v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex xs6>
                                Переработка: {{totalExtraHours}}
                            </v-flex>
                            <v-flex xs6>
                                Выходные часы: {{totalHoursDayOff}}
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
                                        <div>Дата: {{item.dayOfWeek}} {{item.day}}.{{item.month}}.{{item.year}}</div>
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
    name: 'Reports',
    async beforeMount() {
      await this.getUsersReports();
    },
    data() {
      return {
        disabledStartDate: true,
        minStartDate: '',
        startDateMenu: false,
        startDate: null,
        disabledStopDate: true,
        stopDateMenu: false,
        stopDate: null,
        usersReports: [],
        userReportsSelected: '',
        yearsReports: [],
        monthsReports: [],
        dateSelected: false,
        reports: null,
        worksDay: 0,
        worksHour: 0,
        totalDays: 0,
        totalHours: 0,
        list: [],
        panel: 0,
        totalHoursDayOff: 0,
        totalExtraHours: 0
      };
    },
    watch: {
      startDateMenu(val) {
        val && setTimeout(() => (this.$refs.startDatePicker.activePicker = 'YEAR'));
      },
      stopDateMenu(val) {
        val && setTimeout(() => (this.$refs.stopDatePicker.activePicker = 'YEAR'));
      },
      async userReportsSelected() {
        this.disabledStartDate = false;
        this.startDate = null;
        this.stopDate = null;
        this.list = [];
        this.dateSelected = false;

        this.yearsReports = await this.$store.dispatch('getYearReports', this.userReportsSelected);
        this.yearsReports = this.yearsReports.map(value => parseInt(value));
        let minYear = Math.min(...this.yearsReports);

        this.monthsReports = await this.$store.dispatch('getMonthReports', {
          user: this.userReportsSelected,
          year: minYear
        });
        this.monthsReports = this.monthsReports.map(value => parseInt(value));
        let minMonth = Math.min(...this.monthsReports);
        let minDay = await this.$store.dispatch('getDayReports', {
          user: this.userReportsSelected,
          year: minYear,
          month: minMonth
        });

        this.minStartDate = `${minYear}-${('0' + minMonth).slice(-2)}-${('0' + minDay).slice(-2)}`;
      },
      async dateSelected() {
        if (!this.dateSelected) {
          return false;
        }
        if (!this.startDate && !this.stopDate) {
          return false;
        }

        this.getWorksDayHoursInfo();

        this.reports = await this.$store.dispatch('getReports', {
          user: this.userReportsSelected,
          startDate: this.startDate,
          stopDate: this.stopDate
        });
        this.panel = null;
        this.dateSelected = false;
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

        for (let year in this.reports) {
          for (let month in this.reports[year]) {
            for (let day in this.reports[year][month]) {
              const currentDate = this.reports[year][month][day];
              console.log(currentDate.workingOff);
              if (currentDate.workingOff) {
                continue;
              }

              let startTime = parseInt(currentDate.startTime);
              let stopTime = parseInt(currentDate.stopTime) === 0 ? startTime : parseInt(currentDate.stopTime);
              let isStopTime = parseInt(currentDate.stopTime) !== 0;
              let pauseTime = parseInt(currentDate.pauseTime) === 0 ? +moment() : parseInt(currentDate.pauseTime);
              let unpauseTime = parseInt(currentDate.unpauseTime) === 0 ? pauseTime : parseInt(currentDate.unpauseTime);
              let isPauseTime = parseInt(currentDate.pauseTime) !== 0;
              let isUnpauseTime = parseInt(currentDate.unpauseTime) !== 0;

              let report = {
                year,
                month: ('0' + month).slice(-2),
                day,
                dayOfWeek: currentDate.dayOfWeek,
                startTime: moment(startTime).format('HH:mm:ss'),
                startDateTimeStamp: startTime,
                isStopTime,
                startFoto: currentDate.startFoto,
                stopTime: moment(stopTime).format('HH:mm:ss'),
                stopFoto: currentDate.stopFoto,
                timeAtWork: Math.round(parseFloat(moment.duration((stopTime - startTime) - (unpauseTime - pauseTime)).asHours()) * 100) / 100,
                extraHours: 0,
                pauseTime: moment(pauseTime).format('HH:mm:ss'),
                isPauseTime,
                unpauseTime: moment(unpauseTime).format('HH:mm:ss'),
                isUnpauseTime,
                pauseTotalTime: Math.round(parseFloat(moment.duration(unpauseTime - pauseTime).asHours()) * 100) / 100,
                pauseFoto: currentDate.pauseFoto,
                unpauseFoto: currentDate.unpauseFoto
              };

              if (isStopTime) {
                if (isPauseTime && !isUnpauseTime) {
                  this.list.push(report);
                  continue;
                }

                if (report.dayOfWeek === 'Sun' || report.dayOfWeek === 'Sat') {
                  this.totalHoursDayOff += report.timeAtWork;
                } else {
                  if (report.timeAtWork > 9) {
                    report.extraHours = Math.round((report.timeAtWork - 9) * 100) / 100;
                    report.timeAtWork = Math.round((report.timeAtWork - report.extraHours) * 100) / 100;
                  }

                  this.totalHours = Math.round((this.totalHours + report.timeAtWork) * 100) / 100;
                  this.totalExtraHours = Math.round((this.totalExtraHours + report.extraHours) * 100) / 100;
                }

                this.totalDays += 1;
              }
              this.list.push(report);
            }
          }
        }

        this.list = this.list.sort((a, b) => {
          if (a.startDateTimeStamp < b.startDateTimeStamp) {
            return -1;
          } else if (a.startDateTimeStamp > b.startDateTimeStamp) {
            return 1;
          } else {
            return 0;
          }
        });
      }
    },
    methods: {
      async getUsersReports() {
        this.usersReports = await this.$store.dispatch('getUsersReports');
      },
      isDayOff(day) {
        return day === 'Sun' || day === 'Sat';
      },
      startDateSave(date) {
        this.$refs.startDateMenu.save(date);
        this.disabledStopDate = false;
        if (this.stopDate) {
          this.dateSelected = true;
        }
      },
      stopDateSave(date) {
        this.$refs.stopDateMenu.save(date);
        if (this.startDate && this.stopDate) {
          this.dateSelected = true;
        }
      },
      getWorksDayHoursInfo() {
        this.worksHour = 0;
        this.worksDay = 0;
        let start = moment(this.startDate, 'YYYY-MM-DD');
        let stop = moment(this.stopDate, 'YYYY-MM-DD');
        let startStamp = start.unix();
        let stopStamp = stop.unix();

        while (startStamp <= stopStamp) {
          if (!/Sa|Su/.test(start.format('dd'))) {
            this.worksHour += 9;
            this.worksDay += 1;
          }

          start = start.add(1, 'd');
          startStamp = start.unix();
        }
      }
    }
  };
</script>

<style scoped>
    .heigh-reports {
        height: 370px;
    }

    .day-off-border {
        border: 1px solid #ff5252 !important;
    }
</style>