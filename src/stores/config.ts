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
