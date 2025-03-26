<template>
  <img :src="icon" alt="" v-bind="$attrs">
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'
import file_excel from '../../assets/file-surffix/excel.png'
import file_image from '../../assets/file-surffix/image.png'
import file_pdf from '../../assets/file-surffix/pdf.png'
import file_ppt from '../../assets/file-surffix/ppt.png'
import file_txt from '../../assets/file-surffix/txt.png'
import file_word from '../../assets/file-surffix/word.png'
import file_zip from '../../assets/file-surffix/zip.png'
import file_unknow from '../../assets/file-surffix/unknow.png'

const props = defineProps<{
  surffix: string | undefined
}>()

const icon = computed(() => {
  const surffix = props.surffix?.toLowerCase()
  if (!surffix) return;
  // txt|docx|csv|xlsx|pdf|md|html|pptx
  if (surffix === 'pdf') return file_pdf;
  if (['xlsx', 'xls'].includes(surffix)) return file_excel;
  if (surffix === 'txt') return file_txt;
  if (surffix === 'docx') return file_word;
  if (['ppt', 'pptx'].includes(surffix)) return file_ppt;
  if (['png', 'jpg', 'jpeg'].includes(surffix)) return file_image;
  if (['zip', '7z', 'rar'].includes(surffix)) return file_zip;
  return file_unknow
})

</script>

<style scoped lang="less">

</style>
