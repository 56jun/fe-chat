<template>
  <Layout :app-config="appConfig"
          :page-config="config"
          :show-back="false"
          @back="back"
  />
</template>

<script setup lang="ts">
import Layout from "@/package/views/layout.vue";
import { PAGE_CONFIG_DEFAULT } from "@/stores/userChat.ts";

const appConfig = {
  apiKey: 'fastgpt-x2Z2lYrKxg8VivcFL3BFeUYkTUiynRA16VMhlZdNoUD2IDYBsyZVbN',
  appId: '67e21c89c4cf4a50810f7078',
  appName: '测试助手',
  customUid: 'gu',
  baseURL: '/deepseek'
}

const config = PAGE_CONFIG_DEFAULT


function back() {
  console.log('back')
}
</script>

<style lang="less" scoped>

</style>
