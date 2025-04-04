<template>
  <Layout :app-config="appConfig"
          :page-config="config"
          @back="back"
  >
    <template #svgIconLike>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-up">
        <path d="M14 9V5a4 4 0 0 0-4-4H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3.5l1.5-6H14z"></path>
        <path d="M23.5 11.5a1.5 1.5 0 0 1-1.5-1.5V8a1.5 1.5 0 0 1 .5-1.5h3a1.5 1.5 0 0 1 .5-.5v3a1.5 1.5 0 0 1-1.5-1.5z"></path>
      </svg>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "@/package/views/layout.vue";
import { ref } from "vue";
import { PAGE_CONFIG_DEFAULT } from "@/package/index.ts";

const appConfig = {
  "appName":"高新知识库",
  "appId":"67b03798c1e6e49ceb54805e",
  "apiKey":"fastgpt-zrLYExc7wjg3QWTntFN9qc669IvYgLBDN0w4p89PzD408PXz6JpGYN",
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
