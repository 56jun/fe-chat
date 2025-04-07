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
import { PAGE_CONFIG_DEFAULT } from '@/package/index.ts'

const DEFAULT_APP = {
  'appName': '高新知识库',
  'appId': '67b03798c1e6e49ceb54805e',
  'apiKey': 'fastgpt-zrLYExc7wjg3QWTntFN9qc669IvYgLBDN0w4p89PzD408PXz6JpGYN',
}

const appConfig = reactive({
  'appName': '',
  'appId': '',
  'apiKey': '',
  customUid: 'SonFei_demo',
  baseURL: '/deepseek'
})

const permission = ref(PAGE_CONFIG_DEFAULT)
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
