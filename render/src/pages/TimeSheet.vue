<template>
    <v-container>
        <v-layout align-center justify-center>
            <v-flex xs9>
                <v-card>
                    <v-card-text class="pb-0">
                        <web-cam
                                :class="{'rotate--src-video': rotateImg}"
                                ref="webcam"
                                :device-id="deviceId"
                                width="100%"
                                height="200px"
                                @cameras="onCameras"
                        ></web-cam>
                    </v-card-text>
                    <v-card-actions class="pb-0">
                        <v-layout class="justify-center">
                            <v-flex xs8>
                                <v-switch
                                        class="mt-0"
                                        v-model="rotateImg"
                                        label="Повернуть на 180°"
                                ></v-switch>
                            </v-flex>
                        </v-layout>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
        <v-layout class="mt-3">
            <v-flex xs12>
                <v-card>
                    <v-card-title class="pb-0 pt-2">
                        Дата: {{ dateTime }}
                    </v-card-title>
                    <v-card-text class="pb-0 pt-0">
                        <v-autocomplete
                                :items="$store.getters.users"
                                label="Сотрудник"
                                v-model="userSelected"
                        ></v-autocomplete>
                    </v-card-text>
                    <v-card-actions v-show="userSelected" class="pt-0 pb-2">
                        <v-spacer></v-spacer>
                        <div class="d-flex">
                            <div v-show="!workingOff && inWork && !outWork">
                                <v-menu
                                        ref="workingOffMenu"
                                        v-model="workingOffMenu"
                                        :close-on-content-click="false"
                                        transition="scale-transition"
                                        offset-y
                                        full-width
                                        min-width="290px"
                                >
                                    <template v-slot:activator="{ on }">
                                        <v-btn flat color="info" v-on="on">Отработка</v-btn>
                                    </template>

                                    <v-date-picker
                                            ref="workingOffDatePiker"
                                            v-model="workingOffDate"
                                            :min="minDateWorkingOff"
                                            :max="maxDateWorkingOff"
                                            :first-day-of-week="1"
                                            locale="ru-ru"
                                            :allowed-dates="allowedDates"
                                    >
                                        <v-spacer></v-spacer>
                                        <v-btn flat color="success" @click="setWorkingOffDate">OK</v-btn>
                                        <v-btn flat color="error" @click="workingOffMenu = false">Cancel</v-btn>
                                    </v-date-picker>
                                </v-menu>
                            </div>
                            <div v-show="inWork && !outWork" >
                                <v-btn flat color="warning" v-if="!inPause" @click="pauseWork">Пауза</v-btn>
                                <v-btn flat color="warning" v-else @click="unpauseWork" v-show="!unPause">Продолжить</v-btn>
                            </div>
                            <div v-show="!inWork || !outWork">
                                <v-btn flat color="success" v-if="!inWork" @click="startWork">Приход</v-btn>
                                <v-btn flat color="error" v-else @click="finishWork" v-show="!outWork">Уход</v-btn>
                            </div>
                        </div>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
  import { WebCam } from 'vue-web-cam';
  import moment from 'moment';

  export default {
    name: 'TimeSheet',
    components: {
      WebCam
    },
    beforeMount() {
      this.$store.dispatch('getUsers');
      this.setTime();
      setInterval(this.setTime, 1000);
    },
    data() {
      return {
        dateTime: '',
        camera: null,
        deviceId: null,
        devices: [],
        userSelected: '',
        reportDate: '',
        timeSheet: null,
        inWork: false,
        outWork: false,
        inPause: false,
        unPause: false,
        rotateImg: false,
        workingOffMenu: false,
        workingOff: false,
        workingOffDate: null
      };
    },
    computed: {
      maxDateWorkingOff() {
        return moment().format('YYYY-MM-DD');
      },
      minDateWorkingOff() {
        return moment().startOf('month').format('YYYY-MM-DD');
      }
    },
    watch: {
      camera(id) {
        this.deviceId = id;
      },
      devices() {
        const [first] = this.devices;
        if (first) {
          this.camera = first.deviceId;
          this.deviceId = first.deviceId;
        }
      },
      async userSelected() {
        if (!this.userSelected) {
          return false;
        }

        await this.getTimeSheet();
        const currentDay = this.timeSheet[moment().format('DD')];

        if (currentDay) {
          this.inWork = !!currentDay.startTime;
          this.outWork = !!currentDay.stopTime;
          this.inPause = !!currentDay.pauseTime;
          this.unPause = !!currentDay.unpauseTime;
          this.workingOff = currentDay.workingOff;
          this.workingOffDate = currentDay.workingOffDate;
        } else {
          this.inWork = false;
          this.outWork = false;
          this.inPause = false;
          this.unPause = false;
          this.workingOff = false;
          this.workingOffDate = null;
        }
      }
    },
    methods: {
      async getTimeSheet() {
        this.timeSheet = await this.$store.dispatch('getUserTimeSheet', {
          user: this.userSelected,
          month: moment().format('MM'),
          year: moment().format('YYYY')
        });
      },
      onCameras(cameras) {
        this.devices = cameras;
      },
      setTime() {
        this.dateTime = moment().format('DD.MM.YYYY HH:mm:ss');
      },
      async startWork() {
        if (!this.timeSheet) {
          this.timeSheet = {};
        }

        if (!(moment().format('DD') in this.timeSheet)) {
          this.timeSheet[moment().format('DD')] = {};
        }

        Object.assign(this.timeSheet[moment().format('DD')], {
          startTime: +moment(),
          startFoto: this.rotateImg ? await this.rotateImgFn(this.$refs.webcam.capture()) : this.$refs.webcam.capture(),
          stopTime: 0,
          pauseTime: 0,
          unpauseTime: 0,
          dayOfWeek: moment().format('ddd'),
          workingOff: false,
          workingOffDate: null
        });

        this.saveTimeSheet('start');
        this.userSelected = '';
      },
      async finishWork() {
        let currentDay = this.timeSheet[moment().format('DD')];
        Object.assign(currentDay, {
          stopTime: +moment(),
          stopFoto: this.rotateImg ? await this.rotateImgFn(this.$refs.webcam.capture()) : this.$refs.webcam.capture()
        });

        await this.saveTimeSheet('stop');

        if (currentDay.workingOff) {
          await this.getTimeSheet();
          currentDay = this.timeSheet[moment().format('DD')];
          const workingOffDay = currentDay.workingOffDate.split('-')[2];
          Object.assign(this.timeSheet[moment().date(workingOffDay).format('DD')], {
            stopTime: +moment(currentDay.stopTime).date(workingOffDay),
            stopFoto: currentDay.stopFoto
          });
          await this.saveTimeSheet('workingOff');
        }
        this.userSelected = '';
      },
      async pauseWork() {
        let currentDay = this.timeSheet[moment().format('DD')];
        Object.assign(currentDay, {
          pauseTime: +moment(),
          pauseFoto: this.rotateImg ? await this.rotateImgFn(this.$refs.webcam.capture()) : this.$refs.webcam.capture(),
          unpauseTime: 0
        });
        await this.saveTimeSheet('pause');

        if (currentDay.workingOff) {
          await this.getTimeSheet();
          currentDay = this.timeSheet[moment().format('DD')];
          const workingOffDay = currentDay.workingOffDate.split('-')[2];
          Object.assign(this.timeSheet[moment().date(workingOffDay).format('DD')], {
            pauseTime: +moment(currentDay.pauseTime).date(workingOffDay),
            pauseFoto: currentDay.pauseFoto
          });
          await this.saveTimeSheet('workingOff');
        }

        this.userSelected = '';
      },
      async unpauseWork() {
        let currentDay = this.timeSheet[moment().format('DD')];
        Object.assign(currentDay, {
          unpauseTime: +moment(),
          unpauseFoto: this.rotateImg ? await this.rotateImgFn(this.$refs.webcam.capture()) : this.$refs.webcam.capture()
        });
        await this.saveTimeSheet('unpause');

        if (currentDay.workingOff) {
          await this.getTimeSheet();
          currentDay = this.timeSheet[moment().format('DD')];
          const workingOffDay = currentDay.workingOffDate.split('-')[2];
          Object.assign(this.timeSheet[moment().date(workingOffDay).format('DD')], {
            unpauseTime: +moment(currentDay.unpauseTime).date(workingOffDay),
            unpauseFoto: currentDay.unpauseFoto
          });
          await this.saveTimeSheet('workingOff');
        }

        this.userSelected = '';
      },
      async saveTimeSheet(status) {
        await this.$store.dispatch('saveTimeSheet', {
          status,
          timeSheet: this.timeSheet,
          user: this.userSelected,
          day: moment().format('DD'),
          month: moment().format('MM'),
          year: moment().format('YYYY')
        });
      },
      rotateImgFn(imgBase) {
        let image = new Image();
        image.src = imgBase;
        let canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        let ctx = canvas.getContext('2d');

        return new Promise(resolve => {
          image.onload = () => {
            ctx.drawImage(image, 0, 0);
            ctx.rotate(180 * Math.PI / 180);
            ctx.drawImage(image, image.width * (-1), image.height * (-1));
            resolve(canvas.toDataURL('image/jpeg'));
          };
        });
      },
      async setWorkingOffDate() {
        const workingOffDayParse = this.workingOffDate.split('-');
        const currentDay = this.timeSheet[moment().format('DD')];
        const workingOffTimestamp = +moment(currentDay.startTime).date(workingOffDayParse[2]);
        const workingOffDay = {
          startTime: workingOffTimestamp,
          startFoto: currentDay.startFoto,
          stopTime: 0,
          pauseTime: 0,
          unpauseTime: 0,
          dayOfWeek: moment().format('ddd'),
          workingOff: false,
          workingOffDate: null
        };
        currentDay.workingOff = true;
        currentDay.workingOffDate = this.workingOffDate;

        this.timeSheet[moment(workingOffTimestamp).format('DD')] = workingOffDay;
        await this.saveTimeSheet('workingOff');
        this.workingOffMenu = false;
        this.userSelected = '';
      },
      allowedDates(value) {
        if (!this.userSelected || !this.timeSheet) {
          return false;
        }
        const day = value.split('-')[2];
        return !(day in this.timeSheet);
      }
    }
  };
</script>

<style scoped>
    .rotate--src-video {
        transform: rotate(180deg);
    }
</style>