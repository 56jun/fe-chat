import { type App } from 'vue';
import Layout from "@/package/views/layout.vue";
import Chat from '@/package/views/chat.vue';
import AppList from '@/package/views/app-list.vue';
import ChatList from '@/package/views/chat-list.vue';

import pinia from '@/store/index.ts'  //新增代码
import { streamFetch } from '@/utils/chat-fetch.ts'
export * from '@/stores/userChat.ts'

function install(app: App) {
  app.component('Chat', Chat);
  app.component('ChatList', ChatList);
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
