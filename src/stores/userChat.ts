import { ref } from 'vue'


const activeChatId = ref<string>('')
const chatList = ref<HistoryChatMessageType[]>([])
const loading = ref<boolean>(false)

export const useChat = () => {

  function setActiveChatId(id: string) {
    activeChatId.value = id
  }

  function setLoading(status: boolean) {
    loading.value = status
  }

  return { loading, activeChatId, history: chatList, setLoading, setActiveChatId }
}
