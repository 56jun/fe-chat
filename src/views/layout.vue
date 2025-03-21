<template>
<div class="layout">
  <div class="layout__app-list"><AppList/></div>
  <div class="layout__app-chat">
    <div class="chat-wrapper">
      <ChatList/>
      <div v-if="activeChatId" class="chat-detail">
<!--        <router-view/>-->
        <DeepSeek/>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import AppList from '@/views/app-list/index.vue'
import ChatList from "@/views/deepseek/chat-list.vue";
import DeepSeek from '@/views/deepseek/chat.vue'
import { useChat } from "@/stores/userChat.ts";

const { activeChatId } = useChat()

</script>

<style lang="less" scoped>
.layout {
  width: 100%;
  height: 100%;
  display: flex;
  &__app-list {
    //width: 220px;
    width: 0;
    flex-shrink: 0;
    border-right: 1px solid #E2E8F0;
  }
  &__app-chat {
    width: calc(100% - 32px);
    padding: 16px;
    flex-grow: 1;
    .chat-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      padding-left: 20px;
      background-color: white;
      border-radius: 16px;
      border: 1px solid #DFE2EA;
      //overflow: hidden;
      .chat-detail {
        width: calc(100% - 296px);
        //flex: 1;
      }
    }
  }
}
</style>
