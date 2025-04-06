import { type App } from 'vue';
import Layout from "@/package/views/layout.vue";
import Chat from '@/package/views/chat.vue';
import AppList from '@/package/views/app-list.vue';
import ChatList from '@/package/views/chat-list.vue';

// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon/index.vue'

import '@/package/assets/css/main.less'
import '@/package/assets/css/markdown.css'
import '@/package/assets/css/chat.less'

import pinia from '@/store/index.ts'  //新增代码
import { streamFetch } from '@/utils/chat-fetch.ts'
export * from '@/stores/userChat.ts'

function install(app: App) {

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.component('Chat', Chat);
  app.component('ChatList', ChatList);
  app.component('svg-icon', SvgIcon)
  app.use(pinia)
}

export {
  install,
  Layout,
  Chat,
  AppList,
  ChatList,
  streamFetch,
};
