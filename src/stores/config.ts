import { useRoute } from 'vue-router'
import { reactive } from "vue";

const appConfig = reactive({
  apiKey: '',
  appId: '',
  appName: ''
})

export function getConfig() {
  const route = useRoute()
  const DEFAULT = {
    apiKey: 'fastgpt-gwibm68OVMH4b3LznnFOla2QuqE173iNWlUrEZM2ZUNm95ruKK7US0as',
    appId: '67b05c9dc1e6e49ceb55aab6',
    appName: '写作助手',
  }
  for (const key in appConfig) {
    if (route.query[key]) {
      appConfig[key] = route.query[key] || DEFAULT[key]
    }
  }
  return appConfig;
}

export function getHeader() {
  const { apiKey } = getConfig()
  return {
    Authorization: `Bearer ${apiKey}`
  }
}
