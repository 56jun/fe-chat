<template>
<div class="layout__app-chat">
  <div class="chat-wrapper">
    <ChatList :app-config="appConfig" :custom-uid="customUid"/>
    <div v-if="activeChatId" class="chat-detail">
      <Chat :app-config="appConfig"
            :show-back="showBack"
            @back="onBack"
            :custom-uid="customUid"/>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import ChatList from "@/package/views/chat-list.vue";
import Chat from '@/package/views/chat.vue'
import { useChat } from "@/stores/userChat.ts";
import { computed, defineProps, defineEmits, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  appConfig: {
    appId: string
    appName: string
    apiKey: string
  }
  customUid: string
  showBack: boolean
}>()
const appConfig = computed(() => props.appConfig)

const emits = defineEmits(['back'])

function onBack() {
  emits('back')
}

const { activeChatId } = useChat()

function emptyFn() {}

onMounted(() => {
  document.body.addEventListener('touchstart', emptyFn)
})

onUnmounted(() => {
  document.body.removeEventListener('touchstart', emptyFn)
})

</script>

<style lang="less" scoped>
.layout__app-chat {
  width: 100%;
  height: 100vh;
  padding: 16px;
  flex-grow: 1;
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
