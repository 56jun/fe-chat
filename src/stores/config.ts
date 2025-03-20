import { useRoute } from 'vue-router'
import { reactive } from "vue";

type APP_CONFIG = {
  apiKey: string
  appId: string
  appName: string
  [key: string]: string // Add index signature
}

const appConfig = reactive<APP_CONFIG>({
  apiKey: '',
  appId: '',
  appName: ''
})

export function getConfig() {
  const route = useRoute()
  const DEFAULT: APP_CONFIG = {

    // apiKey:  'fastgpt-x87J3nEBahkP7ZEolH7d14grg1lI9wAx1zH3YU6uV9yyefIZHOWUsszkq7nkQt',
    // appId: '67c9a9ac41abe3bbd437ae44',
    // appName: '督办助手',
    apiKey: 'fastgpt-gwibm68OVMH4b3LznnFOla2QuqE173iNWlUrEZM2ZUNm95ruKK7US0as',
    appId: '67b05c9dc1e6e49ceb55aab6',
    appName: '写作助手',
  }
  for (const key in appConfig) {
    const queryValue = route?.query?.[key] as string;
    appConfig[key] = queryValue || DEFAULT[key] || ''
  }
  return appConfig;
}

export function getHeader() {
  const appConfig = getConfig()
  return {
    Authorization: `Bearer ${appConfig.apiKey}`
  }
}
