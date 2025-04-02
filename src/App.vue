<template>
  <Layout :app-config="appConfig"
          :page-config="config"
          @back="back"
  />
</template>

<script setup lang="ts">
import Layout from "@/package/views/layout.vue";
import { ref } from "vue";
import { PAGE_CONFIG_DEFAULT } from "@/package/index.ts";

const appConfig = {
  apiKey: 'fastgpt-mxB1tJBfs3Hqsev0kWRKe1N7JxQPE4YaIScCR4GOShnvhSoJNNpmtWRNzL7CSUg',
  appId: '67eb3c86407a54349be14e79',
  appName: '项目总体履约分析报告',
  customUid: 'SonFei_demo',
  baseURL: '/deepseek'
}

const config = ref(PAGE_CONFIG_DEFAULT)


function back() {
  console.log('back')
}
</script>

<style lang="less" scoped>

</style>
