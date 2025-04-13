import { ref, reactive, computed } from 'vue'
import { clearHistories, getHistories, getPaginationRecords, deleteHistories } from '@/api/api.ts'
import { type ChatType } from "@/type/chat.ts"
import moment from "moment";
import { guid } from "@/utils";


const activeChatId = ref<string>('')
const history = ref<ChatType.HistoryChatMessageType[]>([])
const loading = ref<boolean>(false)
const message = ref<ChatType.ChatMessageType[]>([])
const currentChatTitle = ref<string>('')
const pageInfo = reactive({
  page: 1,
  offset: 0,
  pageSize: 20,
  total: 0,
})
const isAnswering = computed(() => {
  const lastProgress = message.value[message.value.length - 1]?.progress || 'init'
  return ['connecting', 'preThinking', 'outputting'].includes(lastProgress)
})

export interface UseChatResponse {
  loading: boolean
  activeChatId: string
  currentChatTitle: string
  history: ChatType.HistoryChatMessageType[]
  message: ChatType.ChatMessageType[]
  pageInfo: { page: number; offset: number; pageSize: number; total: number }
  setLoading : (status: boolean) => void
  setActiveChatId: (id: string) => void
  clearChatHistory: () => Promise<void>
  updateNewQuestion: (chatId: string) => void
  newChat: (appConfig: { appId: string; appName: string; apiKey: string; baseURL: string }, force?: boolean) => Promise<void>
  getChatList: () => Promise<void>
  reset: () => void
}

export const useChat = () => {

  async function getChatList() {
    if (!appConfig.appId) return false;
    setLoading(true)
    const result: any = await getHistories({
      customUid: appConfig.customUid,
      appId: appConfig.appId,
      offset: (pageInfo.page - 1) * pageInfo.pageSize,
      pageSize: 20,
      "source": ["online", "api"]
    })
    setLoading(false)
    if (!result) return;
    const list = result.data?.list || []
    history.value = history.value.concat(list)
    pageInfo.total = result.data.total || 0
    if (!list || list.length === 0) {
      newChat(appConfig, true)
    } else if (!activeChatId.value) {
      setActiveChatId(list[0].chatId)
    }
  }

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
    history.value = []
    message.value = []
  }

  function getQuestionText(item: ChatType.ChatMessageType) {
    const text = Array.isArray(item.content) ? item.content.filter(x => x.type === 'text').map(x => x.text).join('')
      : item.content
    if (!text) return;
    return text;
  }

  function updateNewQuestion(chatId: string) {
    const chat = history.value.find(chat => chat.chatId === chatId)
    if (!chat) return;
    // @ts-ignore
    const lastQuestionIndex = message.value.findLastIndex((chat: ChatType.ChatMessageType) => chat.role === 'user')
    if (lastQuestionIndex === -1) return;
    const item = message.value[lastQuestionIndex]
    const text = getQuestionText(item)
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
    history.value.unshift(newChatItem)
    setActiveChatId(chatId)
  }

  // 删除一组问答
  function deleteChatDataItem(item: ChatType.ChatMessageType): Promise<boolean> {
    return new Promise(async (resolve) => {
      const index = message.value.findIndex(chat => chat.dataId === item.dataId)
      if (index < 0) return;
      setLoading(true)
      try {
        for (let i = index + 1; i > index - 1; i--) {
          const dataId = message.value[i].dataId
          if (!dataId) continue;
          const result = await deleteHistories(activeChatId.value, dataId)
          if (result && result.code === 200) {
            message.value.splice(i, 1)
          }
        }
        setLoading(false)
        resolve(true)
      } catch(e) {
        setLoading(false)
        console.error(e)
        resolve(false)
      }
    })
  }


  // todo
  function reAskQuestion(item: ChatType.ChatMessageType) {
    const chatIndex = message.value.findIndex(chat => chat.id === item.id)
    if (chatIndex < 0) return;
    const chatItem = message.value[chatIndex]
    const text = getQuestionText(item)
    if (!text) return;
    // chat.title = text
    // currentChatTitle.value = text
  }

  function reset() {
    activeChatId.value = ''
    history.value = []
    message.value = []
    Object.assign(pageInfo, {
      page: 1,
      offset: 0,
      pageSize: 20,
      total: 0,
    })
  }

  return {
    loading,
    isAnswering,
    activeChatId,
    currentChatTitle,
    pageInfo,
    message,
    history,
    setLoading,
    setActiveChatId,
    clearChatHistory,
    reset,
    reAskQuestion,
    deleteChatDataItem,
    updateNewQuestion,
    newChat,
    getChatList,
    getQuestionText,
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
  ['chat:new']: false,// 新建对话
  ['chat:welcome']: false,// 查看欢迎语
  ['chat:history']: false,// 查看对话列表
  ['chat:regenerate']: false,// 重新问答，依赖配置删除单条对话内容 -> delete:chat:history:item
  ['chat:like']: false,// 点赞
  ['chat:dislike']: false,// 点踩
  ['delete:chat:history']: false,// 删除全部历史记录
  ['delete:chat:history:item']: false,// 删除单条历史记录
  ['delete:chat:content:item']: false,// 删除单条对话
  ['upload:file']: false,// 上传附件按钮
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

const permissionConfig = reactive(PAGE_CONFIG_DEFAULT)

export const useChatConfig = () => {

  // 设置应用配置
  function setAppConfig(config: AppConfigType) {
    if (!config) return;
    Object.assign(appConfig, config)
  }

  // 设置页面权限
  function setPageConfig(config: PageConfigType) {
    if (!config) return;
    Object.assign(permissionConfig, config)
  }

  // 判断是否有权限
  function hasRole(key: keyof PageConfigType) {
    return permissionConfig[key]
  }

  function reset() {
    Object.assign(appConfig, {
      appName: '',
      appId: '',
      apiKey: '',
      customUid: '',
      baseURL: '',
    })
    Object.assign(permissionConfig, PAGE_CONFIG_DEFAULT)
  }

  return {
    setAppConfig,
    setPageConfig,
    appConfig,
    hasRole,
    reset
  }
}

