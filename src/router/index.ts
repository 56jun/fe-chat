import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Chat from '../package/views/layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      // name: 'home',
      redirect: '/chat',
    },
    {
      path: '/chat',
      name: 'chat',
      component: Chat,
    },
  ],
})

export default router
