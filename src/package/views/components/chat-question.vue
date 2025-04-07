<template>
<div v-if="item.role === 'user'" class="chat-question">
  <div class="flex chat-question__wrapper">
    <div class="chat-question__user-avatar-wrapper">
      <ul class="chat-reset-style chat__config-bar">
        <li>
          <simple-tooltip content="重新生成">
            <el-icon @click="copyText(getQuestionText(item))" title="复制"><CopyDocument /></el-icon>
          </simple-tooltip>
        </li>
        <li>
          <simple-tooltip @click="reAsk(item)" content="重新生成"><el-icon><Refresh /></el-icon></simple-tooltip>
        </li>
        <li>
          <simple-tooltip content="删除"><el-icon><Delete /></el-icon></simple-tooltip>
        </li>
      </ul>
      <el-icon class="avatar chat-avatar"><Avatar /></el-icon>
    </div>
    <!--智能问答-->
    <div v-if="Array.isArray(item.content)" class="question-item">
      <template v-for="itemChat in item.content">
        <div v-if="itemChat.type === 'file_url'" class="question-item__file">
          <FileIcon :surffix="getSuffix(itemChat.name)"
                    class="question-item__file--icon"
          ></FileIcon>
          <div class="question-item__file--name u-line-1">{{ itemChat.name }}</div>
        </div>
        <div v-if="itemChat.type === 'text'" class="question-item__text select-text">
          {{ itemChat.text }}
        </div>
      </template>
    </div>
    <!--纯文本-->
    <div v-else class="question-item select-text">
      {{ item.content }}
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { defineProps, ref, defineEmits } from 'vue'
import FileIcon from '@/package/views/file-icon.vue'
import { copyDomText, getSuffix } from '@/utils'
import { ElMessage } from 'element-plus'
import type { ChatType } from '@/type/chat.ts'
import { useChat } from "@/stores/userChat.ts";
import SimpleTooltip from '@/package/views/components/simple-tooltip.vue'

const props = defineProps<{
  item: ChatType.ChatMessageType
}>()

const emits = defineEmits(['reAsk'])

const { getQuestionText, reAsk } = useChat()

function copyText(text: string | undefined) {
  if (!text) return
  if (copyDomText(text)) {
    ElMessage.success('已复制到剪贴板')
  }
}
</script>

<style scoped lang="less">
.chat-question {
  width: 100%;
  &__wrapper {
    flex-direction: column;
    justify-content: flex-end;
    align-items: end;
    margin-right: 10px;
    margin-bottom: 10px;
  }
  &__user-avatar-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 5px;
    .avatar {
      width: 28px;
      height: 28px;
      background-color: rgb(138 149 167);
      color: white;
      font-size: 18px;
      border-radius: 17px;
      margin-left: 10px;
    }
  }
  .question-item {
    max-width: calc(100% - 50px);
    border: 1px solid #f3f6fb;
    min-height: 20px;
    padding: 8px 15px;
    word-break: break-all;
    position: relative;
    display: inline-block;
    font-size: var(--font-base-size);
    background: #2D7CFF;
    border-radius: 10px 2px 10px 10px;
    color: #fff;

    &__text {
      display: block;
    }

    &__file {
      display: inline-flex;
      align-items: center;
      padding: 2px 4px;
      background-color: white;
      border-radius: 5px;
      color: #3b2300;
      margin: 2px 2px 5px;
      font-size: var(--font-base-size);

      &--icon {
        width: 14px;
      }

      &--name {
        margin-left: 5px;
      }
    }
  }
}
</style>
