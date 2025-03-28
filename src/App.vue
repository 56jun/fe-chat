<template>
  <Layout :app-config="appConfig"
          :page-config="config"
          @back="back"
  />
</template>

<script setup lang="ts">
import Layout from "@/package/views/layout.vue";
import { ref } from "vue";
import { PAGE_CONFIG_DEFAULT } from "@/stores/userChat.ts";

const appConfig = {
  apiKey: 'fastgpt-zrLYExc7wjg3QWTntFN9qc669IvYgLBDN0w4p89PzD408PXz6JpGYN',
  appId: '67b03798c1e6e49ceb54805e',
  appName: '高新区知识库',
  customUid: 'gu',
  baseURL: '/deepseek'
}

const config = ref(PAGE_CONFIG_DEFAULT)


function back() {
  console.log('back')
}
</script>

<style lang="less" scoped>

</style>
