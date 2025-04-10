<template>
  <div class="deepseek">
    <!--对话头部标题操作按钮等-->
    <div class="chat-header flex align-center">
      <div class="flex align-center chat-header__left">
        <el-icon v-if="showBack" size="22" @click="onBack" style="margin-right: 10px;"><ArrowLeftBold /></el-icon>
        <span class="chat-header__chat-title">
          {{ (currentChatTitle || '新对话').slice(0, 20) }}
        </span>
        <img @click="viewDrawer"
             class="chat-header__chat-history"
             src="@/assets/app-config.webp"
             height="20"
        />
        <div class="flex align-center chat-header__record"
             style="margin-left: 10px;line-height: 0;flex-shrink: 0;"
             type="primary"
        >
          <el-icon>
            <Clock />
          </el-icon>
          <span>&nbsp;{{ message.length }}条记录</span>
        </div>
      </div>
      <div class="chat-header__app-name">{{ appConfig.appName || '' }}</div>
      <el-icon class="chat-header__new-chat" @click="newChat(appConfig)" size="22"><CirclePlus /></el-icon>
    </div>
    <div ref="answerWindowRef" class="answer-box">
      <div class="answer-content">
        <template v-for="(item, index) in message">
          <!--问题-->
          <ChatQuestion v-if="item.role === 'user'"
                        :item="item"
                        @handle-re-ask-question="handleReAskQuestion"
                        @handle-delete="handleDelete"
          />
          <!--回答-->
          <ChatAnswer v-if="item.role === 'assistant'"
                      :item="item"
                      @updateFeedback="(params) => updateFeedback(item, params)"
          />
        </template>
      </div>
    </div>
    <div class="input-area">
      <div v-if="fileList.length" class="input-area__file-list">
        <div v-for="(file, index) in fileList" class="input-area__file">
          <FileIcon :surffix="getSuffix(file.name)" class="input-area__file__icon"></FileIcon>
          <div class="input-area__file__name">{{ file.name }}</div>
          <img @click="deleteFile(index)"
               :src="CloseTag"
               class="input-area__file__close"
               alt="关闭"
          />
        </div>
      </div>
      <div class="input-area__input-box">
        <el-input type="textarea"
                  ref="userInput"
                  v-model="form.question"
                  placeholder="输入您想问的问题"
                  class="textarea"
                  :class="{ 'no-upload': !hasRole('upload:file') }"
                  maxlength="10000"
                  resize="none"
                  autoHeight border="none"
                  :autosize="{ minRows: 1, maxRows: 9 }"
                  confirm-type="search"
                  @compositionstart="() => compositionInputStatus = true"
                  @compositionend="() => compositionInputStatus = false"
                  @keydown.enter.stop="keyDownEnter"
        ></el-input>
        <div v-if="hasRole('upload:file')" class="upload-button">
          <el-upload
            action="#"
            class="upload-demo"
            multiple
            accept=".txt,.docx,.csv,.xlsx,.pdf,.md,.html,.pptx"
            :show-file-list="false"
            :on-change="onChange"
            :disabled="uploadLoading"
            :auto-upload="false"
          >
            <img :src="Fujian" :class="{ loading: uploadLoading }" alt="">
          </el-upload>
        </div>
        <div class="send-button"
             :class="{
                'disabled':loading || !form.question,
                'has-stop': progressGlobal !== 'done'
              }"
        >
          <img v-show="progressGlobal !== 'done'" @click="stopResponse" class="send-button--stop"
               :src="stopSvg"
               alt=""
          >
          <img v-show="progressGlobal === 'done'" @click="sendMessageChat()" class="send-button--send"
               :src="sendImg" alt=""
          >
        </div>
      </div>
    </div>
    <el-drawer
      v-model="drawer"
      direction="ltr"
      title="历史记录"
      size="70%"
    >
      <ChatList @select="() => drawer = false" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineEmits,
  defineProps,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch
} from 'vue'
import { ElInput, ElMessage, ElDrawer, type UploadFile } from 'element-plus'
import ChatList from '@/package/views/chat-list.vue'
import FileIcon from './file-icon.vue'
import { marked } from 'marked'
import ChatAnswer from './components/chat-answer.vue'
import { getSuffix, guid } from '@/utils/index.ts'
import { getChatApi, getChatInitWelcome, getPaginationRecords, uploadFile } from '@/api/api'

import sendImg from '@/assets/send.png'
import Fujian from '@/assets/fujian.png'
import stopSvg from '@/assets/icons/svg/stop.svg'
import CloseTag from '@/assets/close-tag.png'

import { useChat, useChatConfig } from '@/stores/userChat.ts'
import { streamFetch } from '@/utils/chat-fetch.ts'
import { AnswerTypeEnum, type ChatType, SseResponseEventEnum } from '@/type/chat'
import ChatQuestion from '@/package/views/components/chat-question.vue'

function formatMarkdown(value: string) {
  return marked.parse(value)
}

const props = defineProps<{
  showBack: boolean
}>()

const { appConfig, hasRole } = useChatConfig()

const showBack = computed(() => props.showBack)

const emits = defineEmits(['back'])

const {
  loading,
  activeChatId,
  message,
  setLoading,
  updateNewQuestion,
  newChat,
  currentChatTitle,
  reAskQuestion,
  deleteChatDataItem
} = useChat()

const needUpdateParentChatListTitle = ref(false)

const userInput = ref()
const loadingChat = ref(false)
const uploadLoading = ref(false)
const answerStartRender = ref(false)
const reasoningAnswerDone = ref(false)
const progressGlobal = computed(() => {
  const item = message.value[message.value.length - 1]
  return item?.progress || 'done'
})
const compositionInputStatus = ref(false)
const form = reactive({
  question: ''
})
const fileList = ref<UploadFile[]>([])
const abortController = ref<null | AbortController>(null)

const answerWindowRef = ref<HTMLElement>()
const isAutoScroll = ref(true)


const drawer = ref<boolean>(false)

function viewDrawer() {
  drawer.value = true
}

function onBack() {
  emits('back')
}

function keyDownEnter(event: Event | KeyboardEvent) {
  if ('shiftKey' in event && event.shiftKey) return
  if (compositionInputStatus.value) return
  event.preventDefault()
  if (progressGlobal.value === 'outputting') {
    ElMessage.warning('请先停止上一轮对话')
    return
  }
  sendMessageChat()
}

async function sendMessageChat(defaultQuestionItem: ChatType.ChatMessageType | null = null) {
  if (
    loadingChat.value || loading.value
    || (!form.question && !defaultQuestionItem)
    || ['preThinking', 'outputting'].includes(progressGlobal.value)
  ) {
    return false
  }
  let [dataId, responseChatItemId] = [guid(), guid()]

  // const units = form.question.split('\t')
  // if (units.length !== 3) return ElMessage.warning('请按照格式输入：问题\t参数1\t参数2')
  // const [projectId, name, xydm] = units.map(item => item.trim())
  let messageItem: ChatType.ChatMessageType = {
    time: new Date().toISOString(),
    role: 'user',
    dataId,
    content: form.question,
    // content: xydm,
    progress: 'init'
  }
  if (fileList.value.length > 0) {
    const fileMessageList = fileList.value.map(x => {
      return { type: 'file_url', name: x.name, url: x.url }
    })
    messageItem = {
      time: new Date().toISOString(),
      role: 'user',
      dataId,
      content: [
        ...fileMessageList,
        { type: 'text', text: form.question }
      ]
    } as ChatType.ChatMessageType
    fileList.value = []
  }
  if (defaultQuestionItem) {
    const { responseChatItemId: responseDataId, ...question } = defaultQuestionItem
    messageItem = { ...question } as ChatType.ChatMessageType
    responseChatItemId = responseDataId
  }
  message.value.push(messageItem)
  const params = {
    chatId: activeChatId.value,
    responseChatItemId,
    // chatId: projectId,
    customUid: appConfig.customUid,// 自定义的用户 ID。在历史记录中，该条记录的使用者会显示为 xxxxxx
    // 替换为实际的请求参数
    // prompt: this.form.question,
    messages: [{ ...messageItem }],
    // model: 'deepseek-chat',
    // model: 'deepseek-ai/DeepSeek-V3',
    stream: true,
    // 是否返回中间值（模块状态，响应的完整结果等），stream 模式下会通过 event 进行区分，非 stream 模式结果保存在 responseData 中。
    detail: true,
    appId: appConfig.appId,
    appName: appConfig.appName
  }
  try {
    message.value.push({
      role: 'assistant',
      progress: 'connecting',
      responseText: '连接中',
      dataId: responseChatItemId,
      time: new Date().toISOString(),
      value: []
    })
    loadingChat.value = true
    answerStartRender.value = false
    reasoningAnswerDone.value = false
    form.question = ''
    isAutoScroll.value = true
    scrollToBottom()

    // 创建 AbortController 实例
    abortController.value = new AbortController()

    streamFetch({
      url: getChatApi(),
      data: params,
      onMessage,
      abortCtrl: abortController.value,
      apiKey: appConfig.apiKey
    }).catch((err) => {
      console.error(err)
      loadingChat.value = false
      abortController.value = null
      const lastItem: ChatType.ChatMessageType = message.value[message.value.length - 1]
      lastItem.responseText = ''
      lastItem.progress = 'done'
      if (!lastItem.value[0]?.html) {
        lastItem.html = `<span>${ err }</span>`
      }
      scrollToBottom()
      console.log('---Error---')
    })
  } catch (e) {

  }
}

let lastValidResponseType = ''

function onMessage(msg: ChatType.ResponseQueueItemType) {
  const lastItem: ChatType.ChatMessageType = message.value[message.value.length - 1]

  if (['fastAnswer', 'answer'].includes(msg.event)) {
    if (msg.reasoningText) {
      if (lastValidResponseType !== AnswerTypeEnum.reasoning) {
        removePreviousEmptyAnswer(AnswerTypeEnum.text)
        lastItem.value.push({
          type: AnswerTypeEnum.reasoning,
          [AnswerTypeEnum.reasoning]: {
            content: '',
            html: ''
          }
        })
      }
      lastValidResponseType = AnswerTypeEnum.reasoning

      lastItem.responseText = 'AI 对话'
      lastItem.progress = 'outputting'

      const lastReasoning = lastItem.value[lastItem.value.length - 1]
      lastReasoning.reasoning.content += (msg.reasoningText || '')
      lastReasoning.reasoning.html = formatMarkdown(lastReasoning.reasoning.content)

    } else if (msg.text) {
      if (lastValidResponseType !== AnswerTypeEnum.text) {
        removePreviousEmptyAnswer(AnswerTypeEnum.reasoning)
        lastItem.value.push({
          type: AnswerTypeEnum.text,
          text: {
            content: '',
            html: ''
          }
        })
      }
      lastValidResponseType = AnswerTypeEnum.text

      lastItem.responseText = 'AI 对话'
      lastItem.progress = 'outputting'

      const lastText = lastItem.value[lastItem.value.length - 1]
      lastText.text.content += (msg.text || '')
      lastText.text.html = formatMarkdown(lastText.text.content || '')
    }
  } else if (msg.event === SseResponseEventEnum.flowNodeStatus) {
    if (!lastValidResponseType) {
      lastItem.progress = 'preThinking'
    }
    lastValidResponseType = 'flowNodeStatus'
    let name = msg.name
    if (name === 'workflow:template.ai_chat') {
      name = 'AI 对话'
    }
    lastItem.responseText = name || ''
  } else if (msg.event === SseResponseEventEnum.done) {
    console.log('---DONE---', msg)
    loadingChat.value = false
    abortController.value = null
    lastItem.responseText = ''
    lastItem.progress = 'done'
    // getMessage(activeChatId.value)
    console.log('finally')
    updateNewQuestion(activeChatId.value)
  }
  scrollToBottom()
}

// 切换回答项目前，清空上一条空的回答
function removePreviousEmptyAnswer(type: AnswerTypeEnum) {
  const lastItem: ChatType.ChatMessageType = message.value[message.value.length - 1]
  // 如果上一条是 AI 的回答，且是空的，就删除
  if (
    lastItem.role === 'assistant'
    && lastItem.value.length > 0
    && lastItem.value[lastItem.value.length - 1].type === type
  ) {
    const lastItemValue = lastItem.value[lastItem.value.length - 1]
    // @ts-ignore
    if (!lastItemValue[type].html) {
      lastItem.value.pop()
    }
  }
}

function stopResponse() {
  if (!abortController.value) return
  abortController.value.abort()
  abortController.value = null
}

function checkSuffix(str: string) {
  const strRegex = /\.(txt|docx|csv|xlsx|pdf|md|html|pptx)$/
  return strRegex.test(str.toLowerCase())
}

function deleteFile(index: number) {
  fileList.value.splice(index, 1)
}

async function onChange(file: UploadFile) {
  if (!checkSuffix(file?.name)) {
    return ElMessage.warning('请选择以下类型的文件：txt、docx、csv、xlsx、pdf、md、html、pptx等')
  }
  const formData = new FormData()
  uploadLoading.value = true
  // @ts-ignore
  formData.append('file', file?.raw)
  const result = await uploadFile(formData)
  if (!result) {
    uploadLoading.value = false
    return false
  }
  fileList.value.push({
    name: result.data.yswjmc,
    url: result.data.wjfwurl
  } as UploadFile)
  uploadLoading.value = false
}

const scrollToBottom = () => {
  if (isAutoScroll.value) {
    nextTick(() => {
      if (answerWindowRef.value) {
        answerWindowRef.value.scrollTop = answerWindowRef.value.scrollHeight
      }
    })
  }
}

function updateFeedback(item: ChatType.ChatMessageType, params: {
  appId: string
  chatId: string
  dataId: string
  // 取消点赞时不填此参数
  userGoodFeedback?: string
  // 取消踩时不填此参数
  userBadFeedback?: string
}) {
  Reflect.deleteProperty(item, 'userGoodFeedback');
  Reflect.deleteProperty(item, 'userBadFeedback');
  if (params.userGoodFeedback) {
    item.userGoodFeedback = params.userGoodFeedback
  }
  if (params.userBadFeedback) {
    item.userBadFeedback = params.userBadFeedback
  }
}

const requestLoading = ref(false)

async function getMessage(chatId: string) {
  requestLoading.value = true
  const result: any = await getPaginationRecords({
    offset: 0,
    pageSize: 20,
    appId: appConfig.appId,
    chatId
  })
  requestLoading.value = false
  message.value = (result?.data?.list || []).map((item: ChatType.ChatMessageType) => {
    if (item.obj === 'AI') {
      const reasoningContentIndex = item.value.findIndex((x: any) => x.type === AnswerTypeEnum.reasoning)
      const resultItem: ChatType.ChatMessageType = {
        dataId: item.dataId,
        time: item.time,
        userGoodFeedback: item.userGoodFeedback || '',
        userBadFeedback: item.userBadFeedback || '',
        role: 'assistant',
        progress: 'done',
        value: item.value.filter((x: ChatType.ResponseAnswerItemType) => {
          return x.type === AnswerTypeEnum.text && x.text.content || x.type === AnswerTypeEnum.reasoning && x.reasoning.content
        }).map((x: ChatType.ResponseAnswerItemType) => {
          if (x.type === AnswerTypeEnum.text) {
            x.text.html = formatMarkdown(x.text.content) as string
          } else if (x.type === AnswerTypeEnum.reasoning) {
            x.hide = true
            x.reasoning.html = formatMarkdown(x.reasoning.content) as string
          }
          return x
        })
      }
      return resultItem
    } else {
      return {
        ...item,
        role: 'user',
        dataId: item.dataId,
        content: item.value.map((x: any) => {
          if (x.type === 'text') {
            return {
              type: x.type,
              text: x.text.content
            }
          } else if (x.type === 'file') {
            return {
              type: 'file_url',
              name: x.file.name,
              url: x.file.url
            }
          }
        })
      }
    }
  })
  needUpdateParentChatListTitle.value = message.value.length === 0
  if (message.value.length === 0) {
    setLoading(true)
    const result: any = await getChatInitWelcome(chatId)
    setLoading(false)
    if (result) {
      const welcomeText = result?.data?.app?.chatConfig?.welcomeText || ''
      if (welcomeText) {
        message.value.push({
          dataId: 'welcomeText',
          role: 'assistant',
          progress: 'done',
          responseText: '',
          time: new Date().toISOString(),
          type: 'welcome',
          value: [{
            type: 'text',
            text: {
              content: welcomeText,
              html: formatMarkdown(welcomeText) as string
            }
          }]
        } as ChatType.ChatMessageType)
      }
    }
  }
  scrollToBottom()
  // 自动聚焦
  nextTick(() => {
    userInput.value?.focus()
  })
}

async function handleReAskQuestion(item: ChatType.ChatMessageType) {
  const index = message.value.findIndex((x: any) => x.dataId === item.dataId)
  if (index < 0) return;
  // 先删除用户问答
  for (let i = message.value.length - 1; i > index - 1; i--) {
    if (message.value[i].role === 'user') {
      await handleDelete(message.value[i])
    }
  }
  // 再添加一个新的问答
  await sendMessageChat({
    role: 'user',
    dataId: guid(),
    responseChatItemId: guid(),
    time: new Date().toISOString(),
    content: JSON.parse(JSON.stringify(item.content)),
    progress: 'init'
  })
}

function handleDelete(item: ChatType.ChatMessageType) {
  try {
    return deleteChatDataItem(item)
  } catch (e) {
    console.error(e)
  }
}

watch(() => activeChatId?.value, (chatId) => {
  stopResponse()
  if (!chatId) {
    message.value = []
    return
  }
  getMessage(chatId)
}, { immediate: true })

function onScroll() {
  if (answerWindowRef.value) {
    const { scrollHeight, scrollTop, offsetHeight } = answerWindowRef.value
    isAutoScroll.value = scrollTop + offsetHeight + 2 >= scrollHeight
  }
}

onMounted(() => {
  answerWindowRef.value?.addEventListener('scroll', onScroll)
  scrollToBottom()
})

onUnmounted(() => {
  answerWindowRef.value?.removeEventListener('scroll', onScroll)
})
</script>

<style scoped lang="less">
@fontFamily: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
.deepseek {
  height: 100%;
  display: flex;
  flex-direction: column;
  --chat-answer-width: 90%;
  --chat-input-width: 80%;

  .chat-header {
    position: relative;
    height: 60px;
    padding: 0 20px;
    background-color: #FBFBFC;
    &__record {
      padding: 5px 10px;
      border-radius: 4px;
      background-color: #F0F4FF;
      font-size: calc(var(--font-base-size) + 0px);
      color: #3370FF;
    }
    &__chat-history {
      display: none;
      cursor: pointer;
    }
    &__app-name {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      top: 50%;
      color: #0D0E15;
      text-align: center;
      font-weight: bold;
      font-size: calc(var(--font-base-size) + 2px);
      display: none;
    }
    &__chat-title {
    }
    &__new-chat {
      display: none;
    }
  }

  .answer-box {
    //padding: 10px;
    overflow-y: auto;
    overflow-x: hidden;
    position: unset;
    height: 100%;
    .answer-content {
      max-width: 92%;
      margin-inline: auto;
    }
    .robot-bg {
      width: 33px;
      height: 33px;
      min-width: 33px;
    }

    .answer-item {
      width: 100%;
      min-height: 20px;
      padding: 12px;
      margin-top: 10px;
      word-break: break-all;
      position: relative;
      display: inline-block;
      background-color: #F7F8FA;
      color: #000;
      font-size: var(--font-base-size);
      border-radius: 0px 8px 8px;
      :deep(code) {
        white-space: normal;
        word-break: break-all;
      }
      &__reasoning {
        max-width: 100%;
        &__title {
          display: inline-block;
          padding: 5px 12px;
          border: 1px solid #EBEBEB;
          border-radius: 8px;
          background-color: white;
          cursor: pointer;
          user-select: none;
        }
        &__content {
          margin: 10px 0;
          max-width: 100%;
          padding: 10px;
          border-left: 2px solid #b3b3b3;
          height: auto;
          overflow: hidden;
          //font-style: italic;
          color: rgba(0, 0, 0, .6);
          //background-color: rgba(0, 0, 0, .09);
          //background-color: #FBFBFC;
          &.hide {
            height: 0;
            padding: 0;
          }
          :deep(p) {
            & + p {
              margin-top: 5px;
            }
          }
        }
      }
    }
  }
  .input-area {
    position: relative;
    margin: 5px auto 10px auto;
    width: var(--chat-input-width);
    max-width: 760px;
    //margin: 7px auto 0 auto;
    &__file-list {
      display: flex;
      align-items: center;
      overflow-y: visible;
      overflow-x: auto;
      padding-top: 10px;
      .input-area__file {
        display: inline-flex;
        align-items: center;
        padding: 10px 8px;
        position: relative;
        background-color: white;
        border-radius: 8px;
        font-size: var(--font-base-size);
        border: 1px solid rgba(0, 0, 0, 0.12);
        & + .input-area__file {
          margin-left: 10px;
        }
        &__name {
          text-wrap: nowrap;
        }
        &__icon {
          height: 19px;
          margin-right: 5px;
        }
        &__close {
          width: 19px;
          position: absolute;
          right: -10px;
          top: -10px;
          cursor: pointer;
          transition: transform .2s;
          //&:hover {
          //  transform: scale(1.1);
          //}
        }
      }
    }
    &-top-tag {
      width: calc(100% - 10px);
      margin-top: 7px;
      &__group {
        display: flex;
        align-items: center;
        font-family: @fontFamily;
        &__item {
          display: flex;
          align-items: center;
          padding: 6px 10px;
          background-color: #F0F7FF;
          border-radius: 15px;
          border: 1px solid #FFFFFF;
          color: #363638;
          font-size: var(--font-base-size);
          transition: all .3s;
          img {
            width: 15px;
            margin-right: 5px;
          }
          &.active {
            color: #4772e1;
            border-color: #4772e1;
          }
          & + .input-area-top-tag__group__item {
            margin-left: 5px;
          }
        }
      }
    }
    &__input-box {
      margin-top: 7px;
      position: relative;
      :deep(.textarea) {
        .el-textarea__inner {
          //min-height: 55px!important;
          background: transparent;
          box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 10px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          color: #363638;
          font-family: @fontFamily;
          padding: 20px 45px;

          .input-placeholder {
            font-size: 13px;
            font-family: @fontFamily;
          }
        }
        &.no-upload {
          .el-textarea__inner {
            padding-left: 20px;
          }
        }
      }
      .upload-button {
        position: absolute;
        bottom: 10px;
        left: 10px;
        opacity: 0.6;
        img {
          height: 30px;

          &.loading {
            animation: fadeIn 2s linear infinite;
          }
        }
      }
      .send-button {
        position: absolute;
        bottom: 13px;
        right: 10px;
        border-radius: 20px;
        line-height: 0;
        &.has-stop {
          bottom: 18px;
          right: 12px;
          animation: zoomAuto 1s linear infinite;
        }
        &--send {
          height: 35px;
        }
        &--stop {
          cursor: pointer;
          height: 25px;
        }
      }
      .disabled {
        opacity: 0.3;
      }
    }
  }
}
</style>
<style lang="less" scoped>
@media (min-width: 961px) {
  .deepseek {
    --avatar-size: 28px;
  }
}
</style>
<style lang="less" scoped>
@media (max-width: 960px) {
  .deepseek {
    --avatar-size: 22px;
    .chat-header {
      justify-content: space-between;
      &__record {
        display: none;
      }
      &__chat-history {
        display: initial;
      }
      &__app-name {
        display: initial;
      }
      &__chat-title {
        display: none;
      }
      &__new-chat {
        display: initial;
      }
    }
    .input-area {
      //width: var(--chat-input-width);
      width: calc(100% - 40px);
      margin: 0;
      padding: 5px 20px 30px 20px;
      max-width: unset;
      background-color: #F7F8FA;
      :deep(.textarea ) {
        .el-textarea__inner {
          background: white;
          box-shadow: none;
          border-color: transparent;
          padding: 10px 45px;
          font-size: var(--font-base-size);
        }
      }
      .upload-button {
        bottom: 3px;
        img {
          height: 25px;
        }
      }
      .send-button {
        bottom: 6px;
        &--send {
          height: 30px;
        }
        &.has-stop {
          bottom: 10px;
          //right: 12px;
          //animation: zoomAuto 1s linear infinite;
        }
      }
    }
  }
}
</style>
