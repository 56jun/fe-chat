<template>
<div v-loading="loading" class="layout">
  <div class="layout__app-list"><AppList/></div>
  <div class="layout__app-chat">
    <div class="chat-wrapper">
      <div class="chat-list">
        <div class="flex align-center">
          <el-icon style="font-size: 20px; color: #4772e1;"><Platform /></el-icon>
          <div class="chat-list__app-name">公文助手</div>
        </div>
        <div class="chat-list__chat-config">
          <el-button @click="newChat()" class="chat-list__chat-config__new-chat" :icon="ChatDotRound" round>新对话</el-button>
          <el-popconfirm @confirm="clearChatHistory"
                         title="确认删除所有聊天记录？"
                         confirm-button-text="确认"
                         cancel-button-text="取消"
          >
            <template #reference>
              <el-button circle><ChatSvg/></el-button>
            </template>
          </el-popconfirm>
        </div>
        <ul class="chat-list__chat-history-list">
          <li v-for="item in history" :key="item.chatId" @click="changeChat(item)"
              class="flex align-center"
              :class="{ active: item.chatId === activeChatId }"
          >
            <el-icon size="18"><ChatDotRound/></el-icon>
            <div class="chat-list__chat-history-list__name show-lines-1">{{ item.title }}</div>
            <div class="chat-list__chat-history-list__time">{{ formatterTime(item.updateTime) }}</div>
            <el-dropdown @command="(type: string) => command(type, item)" :teleported="false" class="chat-list__chat-history-list__dropdown" placement="bottom-end">
              <el-button :icon="MoreFilled" size="small" style="padding: 0 4px; height: 20px;"></el-button>
              <template #dropdown>
                <el-dropdown-menu>
<!--                  <el-dropdown-item command="title">自定义标题</el-dropdown-item>-->
                  <el-dropdown-item command="delete" class="hover-danger" :icon="Delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </li>
        </ul>
      </div>
      <div v-if="activeChatId" class="chat-detail">
        <DeepSeek/>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, provide } from 'vue'
import { ElMessage } from 'element-plus'
import moment from 'moment'
import { ChatDotRound, MoreFilled, Delete } from '@element-plus/icons-vue'
import AppList from '@/views/app-list/index.vue'
import { RouterView } from "vue-router";
import ChatSvg from '@/views/deepseek/components/chat.vue'
import { guid } from "@/utils/config.ts";
import { clearHistories, delHistory, getHistories, getPaginationRecords } from "@/api/api.ts";
import { getConfig } from "@/stores/config.ts";
import { useChat } from "@/stores/userChat.ts";
import DeepSeek from '@/views/deepseek/index.vue'

const { loading, setLoading, activeChatId, history, setActiveChatId } = useChat()

async function clearChatHistory() {
  setLoading(true)
  const res = await clearHistories()
  setLoading(false)
  if (!res) return;
  ElMessage.success('操作成功')
  history.value = []
  newChat()
}

async function newChat(force: boolean = false) {
  const { appId } = getConfig()
  if (!force) {
    setLoading(true)
    const result: any = await getPaginationRecords({
      offset: 0,
      pageSize: 20,
      appId: appId,
      chatId: activeChatId.value,
    })
    setLoading(false)
    if (result.data.total === 0) return;
  }
  const chatId = guid()
  const newChatItem = {
    appId,
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

function changeChat(item: HistoryChatMessageType) {
  setActiveChatId(item.chatId)
}

async function removeChatItem(item: HistoryChatMessageType) {
  const { appId } = getConfig()
  const result: any = await getPaginationRecords({
    offset: 0,
    pageSize: 20,
    appId: appId,
    chatId: activeChatId.value,
  })
  if (result.data.total === 0) return;
  const res = await delHistory(item.chatId)
  if (!res) return;
  ElMessage.success('操作成功')
  const index = history.value.findIndex(x => x.chatId === item.chatId)
  if (index === -1) return;
  history.value.splice(index, 1)
  setActiveChatId(history.value[0].chatId)
}

function command(commandValue: string, item: HistoryChatMessageType) {
  if (commandValue === 'delete') {
    removeChatItem(item)
  }
}

/**
 * 使用moment计算时间距离现在的时间
 * 1、如果在当天，就显示时+分
 * 2、如果在当天，就显示时+分
 * 3、如果在昨天，就显示昨天+时+分
 * 4、如果在今年，就显示月+日
 * */
function formatterTime(time: number) {
  const now = new Date().getTime()
  const diff = now - (new Date(time)).getTime()
  if (diff < 1000 * 60 * 60 * 24) {
    return moment(time).format('HH:mm')
  }
  if (diff < 1000 * 60 * 60 * 24 * 2) {
    return '昨天'
  }
  return moment(time).format('MM-DD')
}

async function getChatList() {
  const { appId } = getConfig()
  setLoading(true)
  const result: any = await getHistories({
    appId,
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
    padding: 16px;
    flex-grow: 1;
    .chat-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      padding-left: 20px;
      background-color: white;
      border-radius: 16px;
      border: 1px solid #DFE2EA;
      overflow: hidden;
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
              .chat-list__chat-history-list__dropdown {
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
          &__dropdown {
            transition: all .3s;
            display: none;
          }
        }
      }
      .chat-detail {
        flex-grow: 1;
      }
    }
  }
}
</style>
