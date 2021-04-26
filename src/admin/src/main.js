import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import Page from './views/Page.vue';
import Pages from './views/Pages.vue';
import data from './data';

const routes = [
    {
        path: '/',
        redirect: '/pages',
    },
    {
        path: '/pages',
        component: Pages,
    },
    ...data.pages.map((page) => ({
        path: `/page/${page.slug}`,
        component: Page,
        props: { page },
    }))
];

const router = createRouter({
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
})

const app = createApp(App);
app.use(router);
app.mount('#app');
