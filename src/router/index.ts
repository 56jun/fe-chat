import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Chat from '../package/views/layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_CONTEXT),
  routes: [
    {
      path: '/',
      // name: 'home',
      redirect: '/chat',
    },
    {
      path: '/chat/:appId/:apiKey/:appName',
      name: 'chat',
      component: Chat,
    },
  ],
})

export default router
