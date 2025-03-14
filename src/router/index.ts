import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import DeepSeek from '../views/deepseek/index.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      // name: 'home',
      redirect: '/deepseek',
    },
    {
      path: '/deepseek',
      name: 'deepseek',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: DeepSeek,
    },
  ],
})

export default router
