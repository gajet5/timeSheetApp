<template>
    <v-container>
        <v-layout>
            <v-flex xs12>
                <v-card>
                    <v-card-text class="pb-0">
                        <v-text-field
                            label="Добавить пользователя"
                            placeholder="Иванов Иван"
                            v-model="newUser"
                        >
                        </v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn flat color="success" @click="addUser">Добавить</v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
        <v-layout class="mt-3">
            <v-flex xs12>
                <v-card>
                    <v-card-text class="pb-0">
                        <v-select
                                label="Удалить пользователя"
                                :items="$store.getters.users"
                                v-model="delUser"
                        >
                        </v-select>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn flat color="error" @click="deleteUser">Удалить</v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
        <v-snackbar
                v-model="snackbar"
                :color="snackbarColor"
        >
            {{ snackbarText }}
            <v-btn
                    dark
                    flat
                    @click="snackbar = false"
            >
                Close
            </v-btn>
        </v-snackbar>
    </v-container>
</template>

<script>
    export default {
        name: "Users",
        data() {
            return {
                newUser: '',
                delUser: '',
                snackbar: false,
                snackbarText: '',
                snackbarColor: 'info'
            }
        },
        methods: {
            async addUser() {
                if (this.$store.getters.users.findIndex(element => this.newUser === element) !== -1) {
                    this.snackbarColor = 'error';
                    this.snackbarText = 'Пользователь уже существует';
                    this.snackbar = true;
                    return false;
                }
                this.$store.commit('addUser', this.newUser);
                this.newUser = '';
                await this.$store.dispatch('saveUsers');
                await this.$store.dispatch('getUsers');
            },
            async deleteUser() {
                this.$store.commit('deleteUser', this.delUser);
                await this.$store.dispatch('saveUsers');
                await this.$store.dispatch('getUsers');
            }
        }
    }
</script>

<style scoped>

</style>