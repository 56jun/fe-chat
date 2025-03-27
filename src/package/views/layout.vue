<template>
<div class="layout__app-chat">
  <div class="chat-wrapper">
    <ChatList />
    <div v-if="activeChatId" class="chat-detail">
      <Chat :show-back="showBack"
            @genChatId="genChatId"
            @back="onBack"
      />
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import ChatList from "@/package/views/chat-list.vue";
import Chat from '@/package/views/chat.vue'
import { useChat, useAppConfig, type AppConfigType } from "@/stores/userChat.ts";
import { computed, defineProps, defineEmits, onMounted, onUnmounted, watch } from "vue";

const props = defineProps({
  appConfig: {
    required: true,
    default: (): AppConfigType => ({
      appName: '',
      appId: '',
      apiKey: '',
      baseURL: '',
      customUid: '',
    })
  },
  showBack: {
    type: Boolean,
    default: true
  },
  genChatId: {
    type: Function,
    default: () => () => ''
  },
})

const { setAppConfig, appConfig } = useAppConfig()

watch(() => props.appConfig, (config) => {
  setAppConfig(config)
}, { immediate: true })

const emits = defineEmits(['back'])

function onBack() {
  emits('back')
}

const { activeChatId } = useChat()

</script>

<style lang="less" scoped>
.layout__app-chat {
  width: 100%;
  height: 100%;
  padding: 16px;
  flex-grow: 1;
  --font-base-size: 14px;
}
.chat-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  padding-left: 20px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #DFE2EA;
}
.chat-detail {
  width: calc(100% - 296px);
}
@media (max-width: 960px) {
  .layout__app-chat {
    --font-base-size: 16px;
    width: 100%;
    padding: 0;
    .chat-list {
      display: none;
    }
    .chat-detail {
      width: 100%;
    }
    .chat-wrapper {
      padding-left: 0;
      border: none;
      border-radius: 0;
    }
  }
}
</style>
