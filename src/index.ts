import { type App } from 'vue';
import Chat from '@/package/views/chat.vue';
import AppList from '@/package/views/app-list.vue';
import ChatList from '@/package/views/chat-list.vue';

import { streamFetch } from '@/utils/chat-fetch.ts'

// @ts-ignore
const version = PACKAGE_CONFIG.version;

function install(app: App) {
  app.component('Chat', Chat);
  app.component('ChatList', ChatList);
}

export {
  version,
  install,
  Chat,
  AppList,
  ChatList,
  streamFetch,
};
