<template>
  <Layout v-if="visible"
          :app-config="appConfig"
          :permission-config="permission"
          @back="back"
          class="layout-app"
  />
</template>

<script setup lang="ts">
import Layout from '@/package/views/layout.vue'
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PAGE_CONFIG_DEFAULT, type PageConfigType } from '@/package/index.ts'

const DEFAULT_APP = {
  'appName': 'xx知识库',
  'appId': 'xxxxx',
  'apiKey': 'fastgpt-xxxxx',
}

const appConfig = reactive({
  'appName': '',
  'appId': '',
  'apiKey': '',
  customUid: '56jun_demo',
  baseURL: import.meta.env.VITE_BASE_URL
})

const permission = Object.assign(Object.fromEntries(Object.entries(PAGE_CONFIG_DEFAULT).map(([key, value]) => {
  return [key, true]
})) as PageConfigType, {
  // example
  ['chat:welcome']: false,
})

const visible = ref(false)

const router = useRouter()
watch(() => router.currentRoute.value, val => {
  const query = val.query
  if (query && query['app']) {
    Object.assign(appConfig, JSON.parse(query['app'] as string))
  } else {
    Object.assign(appConfig, DEFAULT_APP)
  }
  visible.value = true
})


function back() {
  console.log('back')
}
</script>

<style lang="less" scoped>
.layout-app {
  height: 100%;
}
@media (max-width: 960px) {
  .layout-app {
    height: 100vh;
  }
}
</style>
