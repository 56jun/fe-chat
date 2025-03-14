type HistoryChatMessageType = {
  appId: string
  chatId: string
  customTitle: string
  title: string
  updateTime: number
  top: boolean
  type?: string
}

type ChatMessageType = {
  role: 'user' | 'assistant';
  content: { type: string; name: string; url: string, text?: string }[] | string;
  html?: string;
  answer?: any;
  [key: string]: any;
}
