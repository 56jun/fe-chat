<template>
<div class="layout__app-chat" v-bind="$attrs">
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
import {
  useChat,
  useChatConfig,
  PAGE_CONFIG_DEFAULT,
  type AppConfigType,
  type PageConfigType
} from "@/stores/userChat.ts";
import { defineProps, defineEmits, watch, onMounted } from 'vue'

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
  permissionConfig: {
    default: (): PageConfigType => PAGE_CONFIG_DEFAULT
  },
  showBack: {
    type: Boolean,
    default: false
  },
  genChatId: {
    type: Function,
    default: () => () => ''
  },
})

const { setAppConfig, setPageConfig } = useChatConfig()

watch(() => props.appConfig, (config) => {
  setAppConfig(config)
}, { immediate: true, deep: true })

watch(() => props.permissionConfig, (config) => {
  setPageConfig(config)
}, { immediate: true, deep: true })


const emits = defineEmits(['back'])
function onBack() {
  emits('back')
}

const { activeChatId, getChatList } = useChat()

onMounted(() => {
  getChatList()
})

</script>

<style lang="less" scoped>
.layout__app-chat {
  width: 100%;
  height: 100%;
  padding: 16px;
  flex-grow: 1;
  --font-base-size: 14px;
  font-size: var(--font-base-size);
  box-sizing: border-box;
}
.chat-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
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
    font-size: var(--font-base-size);
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
