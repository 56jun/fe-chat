export type HistoryChatMessageType = {
  appId: string
  chatId: string
  customTitle: string
  title: string
  updateTime: number
  top: boolean
  type?: string
}

export type ChatMessageType = {
  role: 'user' | 'assistant';
  content: { type: string; name: string; url: string, text?: string }[] | string;
  html?: string;
  progress: string;// preThinking/outputing/done
  answer?: any;
  hide?: boolean;// 是否收起展开思考过程
  [key: string]: any;
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
