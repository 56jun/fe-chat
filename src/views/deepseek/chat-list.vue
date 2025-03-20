<template>
  <div class="chat-list">
    <div class="flex align-center">
      <el-icon style="font-size: 20px; color: #4772e1;"><Platform /></el-icon>
      <div class="chat-list__app-name">{{ appConfig.appName }}</div>
    </div>
    <div class="chat-list__chat-config">
      <el-button @click="newChat()" class="chat-list__chat-config__new-chat" :icon="ChatDotRound" round>新对话</el-button>
      <el-popconfirm @confirm="clearChatList"
                     width="220"
                     title="确认删除所有聊天记录？"
                     confirm-button-text="确认"
                     cancel-button-text="取消"
      >
        <template #reference>
          <el-button circle>
            <svg class="chakra-icon css-1fo93lp" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"><path d="m901.3 504.8-76.3-150c-13.4-26.3-40-42.6-69.5-42.6H639c-1.1 0-2-.9-2-2V120.6c0-31.1-25.3-56.3-56.3-56.3h-90c-31.1 0-56.3 25.3-56.3 56.3v189.6c0 1.1-.9 2-2 2H315.8c-29.5 0-56.1 16.3-69.5 42.6l-76.3 150c-9.2 18.1-8.4 39.3 2.2 56.6 10.3 16.8 27.9 27 47.4 27.6-4.8 101-38.3 205.9-90.2 279.5-12.5 17.8-14.1 40.8-4.1 60.1 10 19.3 29.7 31.3 51.5 31.3h601.5c35 0 66-23.6 75.2-57.4 15.5-56.5 28.4-107.9 29.4-164.9C884 685 874 636 852.9 589c19-1.1 36.1-11.2 46.2-27.6 10.6-17.3 11.4-38.5 2.2-56.6zm-681.4 25.4 76.3-150c3.8-7.4 11.3-12 19.6-12h116.4c32 0 58-26 58-58V120.6c0-.1.2-.3.3-.3h90c.1 0 .3.2.3.3v189.6c0 32 26 58 58 58h116.4c8.3 0 15.8 4.6 19.6 12l76.3 150c.2.3.5 1-.1 2s-1.3 1-1.7 1H221.7c-.4 0-1.1 0-1.7-1-.6-1-.3-1.7-.1-2zM827 736.6c-.9 50.5-12.9 98.3-27.4 151.1-2.6 9.5-11.3 16.2-21.2 16.2H651.8c11.3-22.3 18.5-44 23.1-61.2 7.1-26.7 10.7-53.5 10.6-78-.1-17.1-15.5-30.1-32.4-27.4-13.6 2.2-23.6 14-23.6 27.8.1 42.7-14.1 98.2-42.7 138.8H406.2c15.2-21.7 26.1-43.8 33.6-61.9 10-24.3 17.4-49.7 21.2-72.5 2.8-17-10.4-32.5-27.6-32.5-13.6 0-25.3 9.8-27.6 23.3-2.8 16.6-8.3 37.7-17.7 60.4-10.1 24.6-27.8 58.1-55.6 83.3H176.9c-.5 0-1.2 0-1.8-1.1-.6-1.1-.2-1.6.1-2 29.7-42.1 54.8-94.5 72.5-151.4 16.2-52.1 25.7-106.9 28-160.3h514.6C816 635.6 828 684 827 736.6z"></path></svg>
          </el-button>
        </template>
      </el-popconfirm>
    </div>
    <ul class="reset-style chat-list__chat-history-list">
      <li v-for="item in history" :key="item.chatId" @click="changeChat(item)"
          class="flex align-center"
          :class="{ active: item.chatId === activeChatId }"
      >
        <el-icon size="18"><ChatDotRound/></el-icon>
        <div class="chat-list__chat-history-list__name show-lines-1">{{ item.title }}</div>
        <div class="chat-list__chat-history-list__time">{{ formatTime2shortText(item.updateTime) }}</div>
        <el-popover
          title=""
          :width="100"
          trigger="hover"
        >
          <template #reference>
            <el-button :icon="MoreFilled" size="small" class="chat-list__chat-history-list__config__button" style="padding: 0 4px; height: 20px;"></el-button>
          </template>
          <ul class="reset-style chat-list__chat-history-list__config">
            <li @click="removeChatItem(item)" class="hover-danger">删除</li>
          </ul>
        </el-popover>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, provide, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Delete, MoreFilled } from "@element-plus/icons-vue";
import { useChat } from "@/stores/userChat.ts";
import { clearHistories, delHistory, getHistories, getPaginationRecords } from "@/api/api.ts";
import { getConfig } from "@/stores/config.ts";
import { guid } from "@/utils/config.ts";
import { formatTime2shortText } from "@/utils";
import type { ChatType } from "@/type/chat.ts";

const { setLoading, activeChatId, history, setActiveChatId, clearChatHistory } = useChat()

const appConfig = getConfig()

async function clearChatList() {
  await clearChatHistory()
  getChatList()
}

async function newChat(force: boolean = false) {
  if (!force) {
    setLoading(true)
    const result: any = await getPaginationRecords({
      offset: 0,
      pageSize: 20,
      appId: appConfig.appId,
      chatId: activeChatId.value,
    })
    setLoading(false)
    if (result.data.total === 0) {
      return;
    }
  }
  const chatId = guid()
  const newChatItem = {
    appId: appConfig.appId,
    chatId,
    customTitle: '',
    title: '新对话',
    updateTime: new Date().getTime(),
    type: 'welcome',
    top: false,
  }
  history.value.unshift(newChatItem)
  setActiveChatId(chatId)
}

function changeChat(item: ChatType.HistoryChatMessageType) {
  setActiveChatId(item.chatId)
}

async function removeChatItem(item: ChatType.HistoryChatMessageType) {
  const appConfig = getConfig()
  const result: any = await getPaginationRecords({
    offset: 0,
    pageSize: 20,
    appId: appConfig.appId,
    chatId: activeChatId.value,
  })
  if (result.data.total === 0) return;
  const res = await delHistory(item.chatId)
  if (!res) return;
  ElMessage.success('操作成功')
  const index = history.value.findIndex((x) => x.chatId === item.chatId)
  if (index === -1) return;
  history.value.splice(index, 1)
  setActiveChatId(history.value[0]?.chatId)
  if(history.value.length === 0) {
    newChat(true)
  }
}

async function getChatList() {
  const appConfig = getConfig()
  setLoading(true)
  const result: any = await getHistories({
    appId: appConfig.appId,
    "offset": 0,
    "pageSize": 20,
    "source": "api"
  })
  setLoading(false)
  if (!result) return;
  const list = result.data?.list || []
  history.value = list
  if (!list || list.length === 0) {
    newChat(true)
  } else {
    setActiveChatId(list[0].chatId)
  }
}

provide('getChatList', getChatList)

onMounted(getChatList)
</script>

<style scoped lang="less">
.chat-list {
  width: 300px;
  flex-shrink: 0;
  padding-top: 20px;
  padding-right: 20px;
  border-right: 1px solid #E2E8F0;
  &__app-name {
    margin-left: 10px;
    font-weight: bold;
  }
  &__chat-config {
    margin-top: 20px;
    margin-bottom: 20px;
    display: flex;
    &__new-chat {
      width: 120px;
      flex-grow: 1;
      color: #3370ff;
      box-shadow: rgba(19, 51, 107, 0.08) 0 0 1px 0, rgba(19, 51, 107, 0.05) 0 1px 2px 0;
    }
  }
  .chakra-icon {
    display: inline-block;
    line-height: 1em;
    flex-shrink: 0;
    color: currentcolor;
    width: 16px;
    height: auto;
    box-sizing: content-box;
    vertical-align: top;
    fill: currentcolor;
  }
  &__chat-history-list {
    max-height: calc(100% - 110px);
    overflow: auto;
    li {
      justify-content: space-between;
      padding: 11px;
      cursor: pointer;
      user-select: none;
      border-radius: 6px;
      transition: all .3s;
      .el-icon {
        flex: 0;
      }
      & + li {
        margin-top: 8px;
      }
      &:hover {
        background-color: #F7F8FA;

        .chat-list__chat-history-list__time {
          display: none;
        }
        .chat-list__chat-history-list__config__button {
          display: block;
        }
      }
      &.active {
        color: #3370FF;
        background-color: #F0F4FF;
      }
    }
    &__name {
      flex: 1;
      text-align: left;
      padding-left: 10px;
    }
    &__time {
      width: 60px;
      text-align: right;
      flex-shrink: 0;
      flex-grow: 0;
      transition: all .3s;
    }
    &__config__button {
      transition: all .3s;
      display: none;
    }
    &__config {
      list-style: none;
      margin: 0;
      padding: 0;
      li {
        cursor: pointer;
        padding: 4px 20px;
        &:hover {
          background-color: #F0F4FF;
          color: #3370FF;
        }
      }
    }
  }
}
</style>
