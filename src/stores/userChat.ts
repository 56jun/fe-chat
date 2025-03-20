import { ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { clearHistories } from "@/api/api.ts";
import { type ChatType } from "@/type/chat.ts"


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
    if (message.value.length === 0) {
      message.value.push(({
        role: 'assistant',
        value: [{
          type: "text",
          text: {
            content: '您好，我是高新区任务督办小助手，可以精准查询项目进展情况，也可以做一些统计分析，欢迎向我提问！',
            html: '您好，我是高新区任务督办小助手，可以精准查询项目进展情况，也可以做一些统计分析，欢迎向我提问！'
          }
        }]
      }) as ChatType.ChatMessageType)
    }
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

  return {
    loading,
    activeChatId,
    history: chatList,
    setLoading,
    setActiveChatId,
    clearChatHistory,
    message
  }
}

export const useAutoScroll = (el: HTMLElement) => {
  const isAutoScroll = ref(true)
  function onScroll() {
    // @ts-ignore
    const { scrollHeight, scrollTop, offsetHeight } = el
    isAutoScroll.value = scrollTop + offsetHeight + 2 >= scrollHeight;
  }

  el.addEventListener('scroll', onScroll)
  onUnmounted(() => {
    el.removeEventListener('scroll', onScroll)
  })
  return { isAutoScroll }
}
