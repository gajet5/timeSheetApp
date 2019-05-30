<template>
    <v-container>
        <v-layout align-center justify-center>
            <v-flex xs9>
                <v-card>
                    <v-card-text>
                        <web-cam
                                ref="webcam"
                                :device-id="deviceId"
                                width="100%"
                                height="200px"
                                @cameras="onCameras"
                        ></web-cam>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
        <v-layout class="mt-3">
            <v-flex xs12>
                <v-card>
                    <v-card-title>
                        Дата: {{ dateTime }}
                    </v-card-title>
                    <v-card-text>
                        <v-select
                                :items="$store.getters.users"
                                label="Сотрудник"
                                v-model="userSelected"
                        ></v-select>
                    </v-card-text>
                    <v-card-actions v-show="userSelected">
                        <v-spacer></v-spacer>
                        <div v-show="inWork">
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
                unPause: false
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
                    month:moment().format('MM'),
                    year: moment().format('YYYY')
                });
            },
            onCameras(cameras) {
                this.devices = cameras;
            },
            setTime() {
                this.dateTime = moment().format('DD.MM.YYYY HH:mm:ss');
            },
            startWork() {
                if (!this.timeSheet) {
                    this.timeSheet = {};
                }

                if (!(moment().format('DD') in this.timeSheet)) {
                    this.timeSheet[moment().format('DD')] = {};
                }

                Object.assign(this.timeSheet[moment().format('DD')], {
                    startTime: +moment(),
                    startFoto: this.$refs.webcam.capture(),
                    stopTime: 0,
                    dayOfWeek: moment().format('ddd')
                });

                this.saveTimeSheet('start');
                this.userSelected = '';
            },
            async finishWork() {
                if (!this.unPause) {
                    this.unpauseWork(null, true);
                    await this.getTimeSheet();
                }

                Object.assign(this.timeSheet[moment().format('DD')], {
                    stopTime: +moment(),
                    stopFoto: this.$refs.webcam.capture()
                });

                this.saveTimeSheet('stop');
                this.userSelected = '';
            },
            pauseWork() {
                Object.assign(this.timeSheet[moment().format('DD')], {
                    pauseTime: +moment(),
                    pauseFoto: this.$refs.webcam.capture(),
                    unpauseTime: 0,
                });

                this.saveTimeSheet('pause');
                this.userSelected = '';
            },
            unpauseWork(e, finishWork = false) {
                Object.assign(this.timeSheet[moment().format('DD')], {
                    unpauseTime: +moment(),
                    unpauseFoto: this.$refs.webcam.capture()
                });

                this.saveTimeSheet('unpause');
                if (!finishWork) {
                    this.userSelected = '';
                }
            },
            async saveTimeSheet(status) {
                await this.$store.dispatch('saveTimeSheet', {
                    status,
                    timeSheet: this.timeSheet,
                    user: this.userSelected,
                    day: moment().format('DD'),
                    month:moment().format('MM'),
                    year: moment().format('YYYY')
                });
            }
        }
    }
</script>

<style scoped>

</style>