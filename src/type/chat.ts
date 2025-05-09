export namespace ChatType {
  export type HistoryChatMessageType = {
    appId: string
    chatId: string
    customTitle: string
    title: string
    updateTime: string
    top: boolean
    type?: string
  }

  export type ResponseAnswerItemType = {
    type: AnswerTypeEnum.text
    [AnswerTypeEnum.text]: {
      content: string,
      html: string
    }
  } | {
    type: AnswerTypeEnum.reasoning
    // 是否展示思考过程
    hide: boolean
    [AnswerTypeEnum.reasoning]: {
      content: string,
      html: string
    }
  }

  // 展示的消息
  export type ChatMessageType = {
    role: 'user'
    dataId: string
    time: string
    responseChatItemId?: string
    content: { type: string; name: string; url: string, text?: string }[] | string
    // waiting|preThinking|outputting|done
    progress: 'init' | 'connecting' | 'preThinking' | 'outputting' | 'done'
    [key: string]: any
  } | {
    role: 'assistant'
    // waiting|preThinking|outputting|done
    progress: 'init' | 'connecting' | 'preThinking' | 'outputting' | 'done'
    dataId: string
    time: string
    userGoodFeedback?: string | undefined
    userBadFeedback?: string | undefined
    // 模型返回列表
    value: ResponseAnswerItemType[]
    [key: string]: any
  }

  export type SSEResponseEventType = keyof typeof SseResponseEventEnum;

  export type ResponseQueueItemType =
    | {
    event: SseResponseEventEnum.fastAnswer | SseResponseEventEnum.answer;
    text?: string;
    reasoningText?: string;
  }
    | { event: SseResponseEventEnum.interactive; [key: string]: any }
    | { event: SseResponseEventEnum.flowNodeStatus; name: string; [key: string]: any }
    | { event: SseResponseEventEnum.done; [key: string]: any }
    | {
    event:
      | SseResponseEventEnum.toolCall
      | SseResponseEventEnum.toolParams
      | SseResponseEventEnum.toolResponse;
    [key: string]: any;
  };
}

export enum SseResponseEventEnum {
  fastAnswer = 'fastAnswer',
  answer = 'answer',
  interactive = 'interactive',
  toolCall = 'toolCall',
  toolParams = 'toolParams',
  toolResponse = 'toolResponse',
  flowNodeStatus = 'flowNodeStatus',
  flowResponses = 'flowResponses',
  updateVariables = 'updateVariables',
  error = 'error',
  done = 'done'
}

export enum AnswerTypeEnum {
  text = 'text',
  reasoning = 'reasoning'
}
