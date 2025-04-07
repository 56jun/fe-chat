<template>
  <el-tooltip
    class="box-item"
    effect="light"
    content=""
    placement="bottom-end"
    :disabled="!$attrs.content"
    v-bind="$attrs"
  >
    <slot></slot>
  </el-tooltip>
</template>

<script setup lang="ts">
import { ElTooltip } from 'element-plus'
</script>

<style scoped lang="less">

</style>
