<template>
  <Layout :app-config="appConfig"
          :show-back="false"
          @back="back"
  />
</template>

<script setup lang="ts">
import Layout from "@/package/views/layout.vue";

const appConfig = {
  apiKey: 'fastgpt-x2Z2lYrKxg8VivcFL3BFeUYkTUiynRA16VMhlZdNoUD2IDYBsyZVbN',
  appId: '67e21c89c4cf4a50810f7078',
  appName: '测试助手',
  customUid: 'gu',
  baseURL: '/deepseek'
}
function back() {
  console.log('back')
}
</script>

<style lang="less" scoped>

</style>
