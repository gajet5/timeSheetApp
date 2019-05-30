<template>
    <v-app>
        <toolbar></toolbar>
        <v-content>
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
    import Toolbar from './components/Toolbar';

    export default {
        name: 'App',
        components: {
            Toolbar
        }
    }
</script>

<style>
    * {
        user-select: none;
    }

    html {
        overflow: hidden;
    }

    ::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    }

    ::-webkit-scrollbar {
        width: 5px;
        background-color: #fff;
    }

    ::-webkit-scrollbar-thumb {
        background-color: #1976d2;
        /*border: 2px solid #555555;*/
    }
</style>
