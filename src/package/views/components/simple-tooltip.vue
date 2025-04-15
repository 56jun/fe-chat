<template>
  <el-tooltip
    class="box-item"
    effect="light"
    content=""
    placement="bottom-end"
    :disabled="!$attrs.content || isMobile"
    v-bind="$attrs"
  >
    <slot></slot>
  </el-tooltip>
</template>

<script setup lang="ts">
import { ElTooltip } from 'element-plus'
import { ref, onMounted } from 'vue'

const isMobile = ref(false)
onMounted(() => {
  const clientWidth = window.innerWidth
  isMobile.value = clientWidth < 960
})
</script>

<style scoped lang="less">

</style>
