import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { clearHistories, getPaginationRecords } from "@/api/api.ts";
import { type ChatType } from "@/type/chat.ts"
import moment from "moment";
import { guid } from "@/utils";


const activeChatId = ref<string>('')
const chatList = ref<ChatType.HistoryChatMessageType[]>([])
const loading = ref<boolean>(false)
const message = ref<ChatType.ChatMessageType[]>([])

export const useChat = () => {

  function setActiveChatId(id: string) {
    if (!id) {
      message.value = [];
    }
    activeChatId.value = id
  }

  function setLoading(status: boolean) {
    loading.value = status
  }

  async function clearChatHistory() {
    setLoading(true)
    const res = await clearHistories()
    setLoading(false)
    if (!res) return;
    ElMessage.success('操作成功')
    chatList.value = []
    message.value = []
  }

  function resetChatCache() {
    activeChatId.value = ''
    chatList.value = []
    message.value = []
  }

  function updateNewQuestion(chatId: string) {
    const chat = chatList.value.find(chat => chat.chatId === chatId)
    if (!chat) return;
    // @ts-ignore
    const lastQuestionIndex = message.value.findLastIndex((chat: ChatType.ChatMessageType) => chat.role === 'user')
    if (lastQuestionIndex === -1) return;
    const text = message.value[lastQuestionIndex].value?.map((x: ChatType.ChatMessageType) => {
      if (x.type !== 'text') return '';
      return x.text.content;
    }).join('') || message.value[lastQuestionIndex].content
    if (!text) return;
    chat.title = text
  }

  async function newChat(appConfig: { appId: string; appName: string; apiKey: string; baseURL: string }, force: boolean = false) {
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
    const newChatItem: ChatType.HistoryChatMessageType = {
      appId: appConfig.appId,
      chatId,
      customTitle: '',
      title: '新对话',
      updateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      type: 'welcome',
      top: false,
    }
    chatList.value.unshift(newChatItem)
    setActiveChatId(chatId)
  }

  return {
    loading,
    activeChatId,
    history: chatList,
    setLoading,
    setActiveChatId,
    clearChatHistory,
    message,
    resetChatCache,
    updateNewQuestion,
    newChat,
  }
}

export type AppConfigType = {
  appName: string;
  appId: string;
  apiKey: string;
  customUid: string;
  baseURL: string;
}

export type PageConfigType = {
  ['delete.patch']: boolean
  ['delete.single']: boolean
}

const appConfig = reactive<AppConfigType>({
  appName: '',
  appId: '',
  apiKey: '',
  customUid: '',
  baseURL: '',
})

export const PAGE_CONFIG_DEFAULT = {
  ['delete.patch']: true,
  ['delete.single']: true,
}

const pageConfig = reactive(PAGE_CONFIG_DEFAULT)

export const useAppConfig = () => {

  function setAppConfig(config: AppConfigType) {
    if (!config) return;
    Object.assign(appConfig, config)
  }

  function setPageConfig(config: PageConfigType) {
    if (!config) return;
    Object.assign(pageConfig, config)
  }

  return {
    setAppConfig,
    setPageConfig,
    appConfig,
    pageConfig,
  }
}


/**
 * 使用moment计算时间距离现在的时间
 * 1、如果在当天，就显示时+分
 * 2、如果在当天，就显示时+分
 * 3、如果在昨天，就显示昨天+时+分
 * 4、如果在今年，就显示月+日
 * */
export function formatTime2shortText(time: string) {
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
