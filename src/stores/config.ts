export function getConfig() {
  return {
    apiKey: 'fastgpt-gwibm68OVMH4b3LznnFOla2QuqE173iNWlUrEZM2ZUNm95ruKK7US0as',
    appId: '67b05c9dc1e6e49ceb55aab6',
    appName: '公文助手',
  }
}

export function getHeader() {
  const { apiKey } = getConfig()
  return {
    Authorization: `Bearer ${apiKey}`
  }
}
