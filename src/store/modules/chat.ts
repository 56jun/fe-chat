import { defineStore } from "pinia";

type APP_CONFIG = {
  apiKey: string
  appId: string
  appName: string
  [key: string]: string // Add index signature
}

const useChatStore = defineStore(
    'chat',
    {
      state: () => ({
        appConfig: {
          // apiKey:  'fastgpt-x87J3nEBahkP7ZEolH7d14grg1lI9wAx1zH3YU6uV9yyefIZHOWUsszkq7nkQt',
          // appId: '67c9a9ac41abe3bbd437ae44',
          // appName: '督办助手',
          apiKey: '',
          appId: '',
          appName: '',
        }
      }),
      getters: {
        getAppConfig(): APP_CONFIG  {
          return this.appConfig || {};
        },
      },
      actions: {
        // 初始字典
        init(appConfig = {}) {
          Object.assign(this.appConfig, appConfig);
        }
      }
    })

export default useChatStore
