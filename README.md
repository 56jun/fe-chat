## 项目名称
> gxsk-chat对话插件 

## 插件使用说明

```command
// 拉取代码
$ pnpm install @56jun/fe-chat
```
### 使用方式
```vue
<template>
  <Layout :app-config="appConfig"
          :page-config="config"
          @back="back"
  />
  <Layout app-config="必填，app的配置项对象，格式为{appName: string, appId: string, apiKey: string}"
          @back="选填，展示返回按钮时，点击返回按钮触发的事件"
          @gen-chat-id="选填，自定义生成chatId的方法，返回值为chatId"
  />  
</template>
<script>
  // Layout组件为对话插件的主组件，通过useChat方法获取对话插件的相关方法
  import { Layout, useChat } from 'fe-chaaat'
  
  const appConfig = {
    appName: '',
    appId: '',
    apiKey: '',
    baseURL: '',// 接口上下文地址
    customUid: '',
  }
  
  const pageConfig = {
    ['delete.patch']: true,// 批量删除
    ['delete.single']: true,// 删除单条
    ['upload.file']: false,// 上传附件按钮
  }
  
  interface UseChatResponse = {
    loading: boolean,
    activeChatId: string,
    currentChatTitle: string,
    history: ChatType.HistoryChatMessageType[],
    message: ChatType.ChatMessageType[],
    pageInfo: { page: number, offset: number, pageSize: number, total: number },
    setLoading : (status: boolean) => void,
    setActiveChatId: (id: string) => void,
    clearChatHistory: () => Promise<void>,
    updateNewQuestion: (chatId: string) => void,
    newChat: (appConfig: { appId: string; appName: string; apiKey: string; baseURL: string }, force?: boolean) => Promise<void>,
    getChatList: () => Promise<void>,
    reset: () => void,
  }

  declare function useChat(config: StreamFetchProps): {
    loading: boolean,
    activeChatId: string,
    currentChatTitle: string,
    history: ChatType.HistoryChatMessageType[],
    message: ChatType.ChatMessageType[],
    pageInfo: { page: number; offset: number; pageSize: number; total: number }
    setLoading : (status: boolean) => void
      setActiveChatId: (id: string) => void
      clearChatHistory: () => Promise<void>
      updateNewQuestion: (chatId: string) => void
      newChat: (appConfig: { appId: string; appName: string; apiKey: string; baseURL: string }, force?: boolean) => Promise<void>
    getChatList: () => Promise<void>
      reset: () => void
  }
  
  const {
    loading, // 加载状态
    activeChatId, // 当前活跃的chatId
    history,// 聊天记录列表
    setLoading,// 设置加载状态
    setActiveChatId,// 设置当前活跃的chatId
    clearChatHistory,// 清空聊天记录
    message,// 当前对话框输入的消息
    resetChatCache,// 重置聊天缓存
    updateNewQuestion,// 更新新问题
    newChat,// 新建对话
  } = useChat()
</script>
```

## 开发 + 发布流程
> 需要进行 前置源配置
* 修改src/App.vue文件进行测试
```
// 执行打包命令
$ pnpm package

// 发布node包，!!!请先修改package.json中的版本号
$ npm publish

```

## 运行说明
* pnpm i
* pnpm dev


## 协作者
> SongFei,GuZhen
