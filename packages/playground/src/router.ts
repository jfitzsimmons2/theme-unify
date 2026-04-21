import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', redirect: '/buttons' },
        { path: '/buttons', component: () => import('./pages/ButtonsPage.vue') },
        { path: '/forms', component: () => import('./pages/FormsPage.vue') },
        { path: '/data', component: () => import('./pages/DataPage.vue') },
        { path: '/panels', component: () => import('./pages/PanelsPage.vue') },
        { path: '/overlays', component: () => import('./pages/OverlaysPage.vue') },
        { path: '/menus', component: () => import('./pages/MenusPage.vue') },
        { path: '/messages', component: () => import('./pages/MessagesPage.vue') },
        { path: '/media', component: () => import('./pages/MediaPage.vue') },
        { path: '/misc', component: () => import('./pages/MiscPage.vue') },
        { path: '/unocss', component: () => import('./pages/UnocssPage.vue') },
        { path: '/palette', component: () => import('./pages/PalettePage.vue') },
    ],
})

export default router
