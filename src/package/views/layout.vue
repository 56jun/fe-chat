<template>
<div class="layout__app-chat">
  <div class="chat-wrapper">
    <ChatList :app-config="appConfig"
              :apiPrefix="apiPrefix"
              :custom-uid="customUid"
    />
    <div v-if="activeChatId" class="chat-detail">
      <Chat :app-config="appConfig"
            :apiPrefix="apiPrefix"
            :show-back="showBack"
            @genChatId="genChatId"
            @back="onBack"
            :custom-uid="customUid"
      />
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import ChatList from "@/package/views/chat-list.vue";
import Chat from '@/package/views/chat.vue'
import { useChat } from "@/stores/userChat.ts";
import { computed, defineProps, defineEmits, onMounted, onUnmounted } from "vue";

type AppConfig = {
  appId: string
  appName: string
  apiKey: string
}

const props = defineProps({
  appConfig: {
    required: true,
    default: (): AppConfig => ({
      appName: '',
      appId: '',
      apiKey: ''
    })
  },
  apiPrefix: {
    required: true,
    type: String,
    default: '/deepseek'
  },
  customUid: {
    required: true,
    type: String,
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
const appConfig = computed(() => props.appConfig)

const emits = defineEmits(['back'])

function onBack() {
  emits('back')
}

const { activeChatId } = useChat()

function emptyFn() {}

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
