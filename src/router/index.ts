import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Chart from '../views/chart.vue'
import HighChart from '../views/chartPro.vue'
import ChartMark from '../views/chartMark.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/chart',
      name: 'chart',
      component: Chart
    },
    {
      path: '/highChart',
      name: 'highChart',
      component: HighChart
    },
    {
      path: '/ChartMark',
      name: 'ChartMark',
      component: ChartMark
    }
  ]
})

export default router
