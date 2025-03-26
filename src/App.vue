<template>
  <Layout :app-config="appConfig"
          custom-uid="3213"
          :show-back="false"
          @back="back"
          api-prefix="/deepseek"
  />
</template>

<script setup lang="ts">
import Layout from "@/package/views/layout.vue";

const appConfig = {
  apiKey:  'fastgpt-x87J3nEBahkP7ZEolH7d14grg1lI9wAx1zH3YU6uV9yyefIZHOWUsszkq7nkQt',
  appId: '67c9a9ac41abe3bbd437ae44',
  appName: '督办助手',
}
function back() {
  console.log('back')
}
</script>

<style lang="less" scoped>

</style>
