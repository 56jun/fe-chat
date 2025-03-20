import 'element-plus/dist/index.css'
import './assets/style/main.less'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 图标
import 'virtual:svg-icons-register'
import SvgIcon from './components/SvgIcon/index.vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.component('svg-icon', SvgIcon)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
