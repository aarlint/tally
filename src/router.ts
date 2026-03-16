import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/Home.vue') },
    { path: '/new', component: () => import('./views/NewGame.vue') },
    { path: '/game/:id', component: () => import('./views/Game.vue') },
    { path: '/history', component: () => import('./views/GameHistory.vue') },
  ],
})
