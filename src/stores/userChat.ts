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
const currentChatTitle = ref<string>('')

export interface UseChatResponse {
  loading: boolean
  activeChatId: string
  currentChatTitle: string
  history: ChatType.HistoryChatMessageType[]
  message: ChatType.ChatMessageType[]
  setLoading : (status: boolean) => void
  setActiveChatId: (id: string) => void
  clearChatHistory: () => Promise<void>
  updateNewQuestion: (chatId: string) => void
  newChat: (appConfig: { appId: string; appName: string; apiKey: string; baseURL: string }, force?: boolean) => Promise<void>
  reset: () => void
}

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

  function reset() {
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
    const item = message.value[lastQuestionIndex]
    const text = Array.isArray(item.content) ? item.content.filter(x => x.type === 'text').map(x => x.text).join('')
      : item.content
    if (!text) return;
    console.log('text', text)
    chat.title = text
    currentChatTitle.value = text
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
    reset,
    updateNewQuestion,
    newChat,
    currentChatTitle,
  }
}

export type AppConfigType = {
  appName: string;
  appId: string;
  apiKey: string;
  customUid: string;
  baseURL: string;
}

export const PAGE_CONFIG_DEFAULT = {
  ['delete.patch']: true,// 批量删除
  ['delete.single']: true,// 删除单条
  ['upload.file']: false,// 上传附件按钮
}

export type PageConfigType = {
  // 键名为PAGE_CONFIG_DEFAULT的key，值为boolean
  [key in keyof typeof PAGE_CONFIG_DEFAULT]: boolean
}

const appConfig = reactive<AppConfigType>({
  appName: '',
  appId: '',
  apiKey: '',
  customUid: '',
  baseURL: '',
})

const pageConfig = reactive(PAGE_CONFIG_DEFAULT)

export const useChatConfig = () => {

  // 设置应用配置
  function setAppConfig(config: AppConfigType) {
    if (!config) return;
    Object.assign(appConfig, config)
  }

  // 设置页面权限
  function setPageConfig(config: PageConfigType) {
    if (!config) return;
    Object.assign(pageConfig, config)
  }

  // 判断是否有权限
  function hasRole(key: keyof PageConfigType) {
    return pageConfig[key]
  }

  function reset() {
    Object.assign(appConfig, {
      appName: '',
      appId: '',
      apiKey: '',
      customUid: '',
      baseURL: '',
    })
    Object.assign(pageConfig, PAGE_CONFIG_DEFAULT)
  }

  return {
    setAppConfig,
    setPageConfig,
    appConfig,
    hasRole,
    reset
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
