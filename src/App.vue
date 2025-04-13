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
  'appName': 'xx知识库',
  'appId': 'xxxxxx',
  'apiKey': 'fastgpt-xxxxxxx',
}

const appConfig = reactive({
  'appName': '',
  'appId': '',
  'apiKey': '',
  customUid: '56jun_demo',
  baseURL: import.meta.env.VITE_BASE_URL
})

// const permission = ref(PAGE_CONFIG_DEFAULT)
const permission = {
  ['chat:new']: true,// 新建对话
  ['chat:welcome']: true,// 查看欢迎语
  ['chat:history']: true,// 查看对话列表
  ['chat:regenerate']: true,// 重新问答，依赖配置删除单条对话内容 -> delete:chat:history:item
  ['chat:like']: true,// 点赞
  ['chat:dislike']: true,// 点踩
  ['delete:chat:history']: true,// 删除全部历史记录
  ['delete:chat:history:item']: true,// 删除单条历史记录
  ['delete:chat:content:item']: true,// 删除单条对话
  ['upload:file']: true,// 上传附件按钮
}
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
