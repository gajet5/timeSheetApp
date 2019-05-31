<template>
    <v-toolbar dark color="primary">
        <v-toolbar-items>
            <v-btn flat to="/">Табель</v-btn>
            <v-btn flat :disabled="disabledBtn" to="reports">Отчёт</v-btn>
            <v-btn flat :disabled="disabledBtn" to="users">Сотрудники</v-btn>
            <v-btn flat @click="openDialog" v-if="disabledBtn">
                <v-icon>lock_open</v-icon>
            </v-btn>
            <v-btn flat @click="removePassword" v-else>
                <v-icon>lock</v-icon>
            </v-btn>
        </v-toolbar-items>
        <v-dialog
                :value="dialog"
                width="500"
                persistent
        >

            <v-card>
                <v-card-title
                        class="headline grey lighten-2"
                        primary-title
                >
                    Введите пароль.
                </v-card-title>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-text-field
                            label="Пароль"
                            type="password"
                            v-model="inputPassword"
                    ></v-text-field>

                    <v-spacer></v-spacer>
                    <v-btn
                            color="primary"
                            flat
                            @click="dialog = false"
                    >
                        ok
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-toolbar>
</template>

<script>
    import config from '../config';

    export default {
        name: "Toolbar",
        data() {
            return {
                inputPassword: '',
                dialog: false
            };
        },
        computed: {
            disabledBtn() {
                return this.inputPassword !== config.password;
            }
        },
        methods: {
            openDialog() {
                this.dialog = true;
            },
            removePassword() {
                this.inputPassword = '';
            }
        },
    }
</script>

<style scoped>

</style>