import type { App, DefineComponent } from 'vue';
import type { StreamFetchProps } from '@/utils/chat-fetch.js';
import {
  type AppConfigType,
  type PageConfigType,
  PAGE_CONFIG_DEFAULT,
  useChatConfig,
  useChat,
} from './src/stores/userChat';
import type { UseChatResponse } from './src/stores/userChat'

export declare function install(app: App): void
export declare function streamFetch(config: StreamFetchProps): void
export declare function useChat(config: StreamFetchProps): UseChatResponse
export declare function useChatConfig(): {
  setAppConfig: (config: AppConfigType) => void
  setPageConfig: (config: PageConfigType) => void
  appConfig: AppConfigType
  hasRole: (key: keyof PageConfigType) => boolean
  reset: () => void
}
export declare function formatTime2shortText(time: string): string

export declare type Layout = DefineComponent;
export declare type Chat = DefineComponent;
export declare type AppList = DefineComponent;
export declare type ChatList = DefineComponent;
