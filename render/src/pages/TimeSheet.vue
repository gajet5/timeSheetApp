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
                        <v-btn flat color="success" v-if="!inWork" @click="startWork">Приход</v-btn>
                        <v-btn flat color="error" v-else @click="finishWork">Уход</v-btn>
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
            this.reportFileName = `${moment().format('YYYY-MM')}.json`;
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
                reportFileName: '',
                timeSheet: null
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
                this.timeSheet = await this.$store.dispatch('getUserTimeSheet', {
                    user: this.userSelected,
                    file: this.reportFileName
                });
                console.log(this.timeSheet);
            }
        },
        computed: {
            inWork() {
                try {
                    return !!this.timeSheet[moment().format('DD')].start;
                } catch (e) {
                    return false;
                }
            }
        },
        methods: {
            onCameras(cameras) {
                this.devices = cameras;
            },
            setTime() {
                this.dateTime = moment().format('DD.MM.YYYY HH:mm:ss');
            },
            startWork() {
                this.sendReport();
            },
            finishWork() {
                this.sendReport();
            },
            sendReport() {
                this.$store.dispatch('saveTimeSheet', this.timeSheet);
            }
        }
    }
</script>

<style scoped>

</style>