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
            <v-select
                    :items="$store.getters.users"
                    label="Сотрудник"
                    v-model="userSelected"
            ></v-select>
          </v-card-text>
          <v-card-actions v-show="userSelected" class="pt-0 pb-2">
            <v-spacer></v-spacer>
            <div v-show="inWork && !outWork">
              <v-btn flat color="warning" v-if="!inPause" @click="pauseWork">Пауза</v-btn>
              <v-btn flat color="info" v-else @click="unpauseWork" v-show="!unPause">Продолжить</v-btn>
            </div>
            <v-btn flat color="success" v-if="!inWork" @click="startWork">Приход</v-btn>
            <v-btn flat color="error" v-else @click="finishWork" v-show="!outWork">Уход</v-btn>
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
        name: "TimeSheet",
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
                rotateImg: false
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

                try {
                    this.inWork = !!this.timeSheet[moment().format('DD')].startTime;
                } catch (e) {
                    this.inWork = false;
                }
                try {
                    this.outWork = !!this.timeSheet[moment().format('DD')].stopTime;
                } catch (e) {
                    this.outWork = false;
                }
                try {
                    this.inPause = !!this.timeSheet[moment().format('DD')].pauseTime;
                } catch (e) {
                    this.inPause = false;
                }
                try {
                    this.unPause = !!this.timeSheet[moment().format('DD')].unpauseTime;
                } catch (e) {
                    this.unPause = false;
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
                    dayOfWeek: moment().format('ddd')
                });

                this.saveTimeSheet('start');
                this.userSelected = '';
            },
            async finishWork() {
                Object.assign(this.timeSheet[moment().format('DD')], {
                    stopTime: +moment(),
                    stopFoto: this.rotateImg ? await this.rotateImgFn(this.$refs.webcam.capture()) : this.$refs.webcam.capture(),
                });

                this.saveTimeSheet('stop');
                this.userSelected = '';
            },
            async pauseWork() {
                Object.assign(this.timeSheet[moment().format('DD')], {
                    pauseTime: +moment(),
                    pauseFoto: this.rotateImg ? await this.rotateImgFn(this.$refs.webcam.capture()) : this.$refs.webcam.capture(),
                    unpauseTime: 0,
                });

                this.saveTimeSheet('pause');
                this.userSelected = '';
            },
            async unpauseWork() {
                Object.assign(this.timeSheet[moment().format('DD')], {
                    unpauseTime: +moment(),
                    unpauseFoto: this.rotateImg ? await this.rotateImgFn(this.$refs.webcam.capture()) : this.$refs.webcam.capture()
                });

                this.saveTimeSheet('unpause');
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
            }
        }
    }
</script>

<style scoped>
  .rotate--src-video {
    transform: rotate(180deg);
  }
</style>