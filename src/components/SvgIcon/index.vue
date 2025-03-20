<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName" :fill="color" />
  </svg>
</template>
<script lang="ts" setup>
import { computed, defineProps } from 'vue';

interface Props {
  iconClass: string;
  className?: string;
  color?: string;
}

const props = defineProps<Props>();

const iconName = computed(() => `#icon-${props.iconClass}`);
const svgClass = computed(() => {
  return props.className ? `svg-icon ${props.className}` : 'svg-icon';
});
</script>

<style scoped lang="less">
.sub-el-icon,
.nav-icon {
  display: inline-block;
  font-size: 15px;
  margin-right: 12px;
  position: relative;
}

.svg-icon {
  width: 1em;
  height: 1em;
  position: relative;
  fill: currentColor;
  vertical-align: -2px;
}
</style>
