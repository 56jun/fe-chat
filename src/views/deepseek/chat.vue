<template>
  <div class="deepseek">
    <div class="chat-header flex align-center">
      <span>新对话</span>
      <div class="flex align-center chat-header__record" style="margin-left: 10px;line-height: 0" type="primary">
        <el-icon><Clock /></el-icon>
        <span>&nbsp;{{ message.length }}条记录</span>
      </div>
    </div>
    <div ref="answerBoxRef" class="answer-box">
      <div class="answer-content">
        <template v-for="(item, index) in message">
          <div v-if="item.role === 'user'" style="display: flex; justify-content: flex-end">
            <!--            智能问答-->
            <div v-if="Array.isArray(item.content)" class="question-item">
              <template v-for="itemChat in item.content">
                <div v-if="itemChat.type === 'file_url'" class="question-item__file">
                  <FileIcon :surffix="getSuffix(itemChat.name)"
                            class="question-item__file--icon"></FileIcon>
                  <div class="question-item__file--name u-line-1">{{ itemChat.name }}</div>
                </div>
                <div v-if="itemChat.type === 'text'" @click="copyText(itemChat.text)"
                     class="question-item__text select-text">{{ itemChat.text }}
                </div>
              </template>
            </div>
            <!--            纯文本-->
            <div v-else class="question-item select-text" @click="copyText(item.content)">
              {{ item.content }}
            </div>
          </div>

          <div v-if="item.role === 'assistant'" class="answer-content__assistant">
            <div class="flex align-center">
              <img src="../../assets/robot-icon.png" class="robot-bg" alt="icon"/>
              <div v-if="['preThinking', 'outputing'].includes(item.progress)"
                   style="display: flex; justify-content: flex-start; align-items: center;margin-left: 10px">
                <el-icon class="is-loading" style="font-size: 22px">
                  <Loading/>
                </el-icon>
                <span>&nbsp;{{ item.responseText || '思考中' }}...</span>
              </div>
              <div v-else class="answer-content__assistant__config-bar">
                <el-icon @click="copyText((item.content as string) || item.html)"><CopyDocument /></el-icon>
              </div>
            </div>
            <div v-if="item.progress !== 'preThinking'" class="answer-item" :id="'answerBox' + index">
              <div v-if="item.reasoning_content" class="answer-item__reasoning">
                <div class="answer-item__reasoning__title" @click="() => item.hide = !item.hide">
                  <span>&nbsp;&nbsp;思考过程&nbsp;&nbsp;</span>
                  <el-icon><ArrowDown v-show="item.hide" /><ArrowUp v-show="!item.hide" /></el-icon>
                </div>
                <div class="answer-item__reasoning__content" :class="{ 'hide': item.hide }" v-html="item.reasoning_content"></div>
              </div>
              <div v-if="item.html" v-html="item.html" class="markdown-body select-text"></div>
              <div v-else>&nbsp;</div>
            </div>
          </div>
        </template>
      </div>
      <div ref="bottomLineRef"></div>
    </div>
    <div class="input-area">
      <div v-if="fileList.length" class="input-area__file-list">
        <div v-for="(file, index) in fileList" class="input-area__file">
          <FileIcon :surffix="getSuffix(file.name)" class="input-area__file__icon"></FileIcon>
          <div class="input-area__file__name">{{ file.name }}</div>
          <img @click="deleteFile(index)" :src="CloseTag" class="input-area__file__close"
               alt="关闭">
        </div>
      </div>
      <div class="input-area__input-box">
        <el-input type="textarea"
                  v-model="form.question"
                  placeholder="输入您想问的问题"
                  class="textarea"
                  maxlength="10000"
                  resize="none"
                  autoHeight border="none"
                  :autosize="true"
                  confirm-type="search"
                  @compositionstart="() => compositionInputStatus = true"
                  @compositionend="() => compositionInputStatus = false"
                  @keydown.enter.stop="keyDownEnter"
        ></el-input>
        <div class="AI-button">
          <el-upload
            action="#"
            class="upload-demo"
            multiple
            accept=".txt,.docx,.csv,.xlsx,.pdf,.md,.html,.pptx"
            :show-file-list="false"
            :before-upload="onChange"
            :disabled="uploadLoading"
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
          <img v-show="progressGlobal !== 'done'" @click="stopResponse" class="send-button--stop" :src="stopSvg"
               alt="">
          <img v-show="progressGlobal === 'done'" @click="sendMessageChat" class="send-button--send"
               :src="sendImg" alt="">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, watch, inject, computed } from "vue";
import { ElInput, ElMessage } from "element-plus";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import FileIcon from "./file-icon.vue";
import axios from "axios";
import { marked } from 'marked'

import { copyDomText, throttle } from "@/utils/config";
import { getPaginationRecords, uploadFile } from "@/api/api.ts";

import sendImg from "@/assets/send.png";
import Fujian from "@/assets/fujian.png";
import stopSvg from "@/assets/svg/stop.svg";
import CloseTag from "@/assets/close-tag.png";

import { getConfig } from "@/stores/config.ts";
import { useChat } from "@/stores/userChat.ts";
import { streamFetch } from "@/utils/chat-fetch.ts";

const { activeChatId, message } = useChat()
const { appId } = getConfig()

const getChatList = inject('getChatList')
const needUpdateParentChatListTitle = ref(false)

// const DEEPSEEK_API_KEY = 'fastgpt-tjw7kzL5oePDz8sSZTMZ0HAXEtCyT59dHDgXImhMMXBxy0AW9aAcDVqYj'; // 替换为你的 DeepSeek API 密钥
const DEEPSEEK_API_URL = '/api'; // 替换为 DeepSeek 的 API 地址

const toDealwith: {
  index: number
  task: string
  reasonContent: string
  reasonIndex: number
  reset: () => void
} = window.toDealwith = {
  index: 0,
  task: '',
  reasonContent: '',
  reasonIndex: 0,
  reset() {
    this.index = 0
    this.task = ''
    this.reasonContent = ''
    this.reasonIndex = 0
  }
}

const bottomLineRef = ref()
const answerBoxRef = ref()
const loading = ref(false)
const uploadLoading = ref(false)
const answerStartRender = ref(false)
const reasoningAnswerDone = ref(false)
const customUid = ref('SongFei')
const progressGlobal = computed(() => {
  const item = message.value[message.value.length - 1]
  return item?.progress || 'done'
})
const dataCache = ref<any[]>([])
const compositionInputStatus = ref(false)
const form = reactive({
  question: '',
})
// const message = window.message = ref<ChatMessageType[]>([])
const messages = ref<ChatMessageType[]>([])
const fileList = ref<(File | {name: string, url: string})[]>([])
// const responseText = ref('')
const isAutoScroll = ref(true)
const abortController = ref<null | AbortController>(null)

function onScroll() {
  // @ts-ignore
  const { scrollHeight, scrollTop, offsetHeight } = document.querySelector('.answer-box') as Element
  isAutoScroll.value = scrollTop + offsetHeight + 10 >= scrollHeight;
}

function keyDownEnter(event: Event | KeyboardEvent) {
  if ("shiftKey" in event && event.shiftKey) return;
  if (compositionInputStatus.value) return;
  event.preventDefault();
  if (progressGlobal.value === 'outputing') {
    ElMessage.warning('请先停止上一轮对话')
    return
  }
  sendMessageChat();
}

async function sendMessageChat() {
  if (loading.value || !form.question || ['preThinking', 'outputing'].includes(progressGlobal.value)) {
    return false;
  }
  const url = DEEPSEEK_API_URL + '/v1/chat/completions';

  const { apiKey, ...configParams } = getConfig() || {}

  let messageItem: ChatMessageType = { role: 'user', content: form.question }
  if (fileList.value.length > 0) {
    const fileMessageList = fileList.value.map(x => {
      // @ts-ignore
      return { type: 'file_url', name: x.name, url: x.url }
    })
    messageItem = {
      role: 'user',
      content: [
        ...fileMessageList,
        { type: 'text', text: form.question },
      ]
    } as ChatMessageType
    fileList.value = []
  }
  message.value.push(messageItem);
  messages.value = [{ ...messageItem }]
  dataCache.value = [];
  let dataResponseTimes = 0;
  toDealwith.reset()
  const params = {
    chatId: activeChatId.value,
    customUid: customUid.value,// 自定义的用户 ID。在历史记录中，该条记录的使用者会显示为 xxxxxx
    // 替换为实际的请求参数
    // prompt: this.form.question,
    messages: [{ ...messageItem }],
    // model: 'deepseek-chat',
    // model: 'deepseek-ai/DeepSeek-V3',
    stream: true,
    detail: false,// 是否返回中间值（模块状态，响应的完整结果等），stream 模式下会通过 event 进行区分，非 stream 模式结果保存在 responseData 中。
    // 聊天输入框上面的tab切换内容部分
    ...configParams,
  };
  try {
    message.value.push({
      role: 'assistant',
      content: '',
      html: '',
      reasoning: '',
      reasoning_content: '',
      progress: 'preThinking',
      hide: false
    });
    loading.value = true;
    answerStartRender.value = false;
    reasoningAnswerDone.value = false;
    form.question = '';
    isAutoScroll.value = true;
    scrollToBottom()

    let currentStepName = 'answer'

    // 创建 AbortController 实例
    abortController.value = new AbortController();

    streamFetch({
      url,
      data: params,
      onMessage,
      abortCtrl: abortController.value,
      apiKey
    }).catch((err) => {
      console.error(err)
    })
  } catch (e) {

  }
}

function onMessage(msg: ResponseQueueItemType) {
  const lastItem: ChatMessageType = message.value[message.value.length - 1]

  if (['fastAnswer', 'answer'].includes(msg.event)) {
    if (msg.reasoningText) {
      lastItem.responseText = 'AI 对话'
      lastItem.progress = 'outputing'
      lastItem.reasoning += (msg.reasoningText || '')
      lastItem.reasoning_content = marked.parse(lastItem.reasoning)
    } else if(msg.text) {
      lastItem.responseText = 'AI 对话'
      lastItem.progress = 'outputing'
      lastItem.content += (msg.text || '')
      lastItem.html = marked.parse(lastItem.content || '')
    }
    if (isAutoScroll.value) {
      scrollToBottom()
    }
  } else if (msg.event === 'flowNodeStatus') {
    lastItem.progress = 'preThinking'
    let name = msg.name
    if (name === "workflow:template.ai_chat") {
      name = 'AI 对话'
    }
    lastItem.responseText = name || ''
  } else if (msg.event === 'done') {
    console.log('---DONE---', msg)
    loading.value = false;
    abortController.value = null;
    lastItem.responseText = ''
    lastItem.progress = 'done'
    console.log('finally');
  }
}

function getNextIndex() {
  let step = 1
  const extraText = toDealwith.task.slice(toDealwith.index)
  if (
    extraText.startsWith('<') &&
    (/^[A-Za-z]+$/.test(extraText.slice(1, 2)) || extraText.slice(1, 2) === '/')
  ) {
    while (!extraText.slice(0, step).endsWith('>') && step < 40) {
      step++
    }
  } else if (extraText.startsWith('\n')) {
    step = 2
  }
  return step
}

let reasonTimer:number = 0;
function renderReasonResponse() {
  const observeItem = message.value[message.value.length - 1]
  if (!reasonTimer) {
    reasonTimer = setInterval(() => {
      if (toDealwith.reasonIndex < toDealwith.reasonContent.length) {
        const step = getNextIndex()
        observeItem.reasoning_content = toDealwith.reasonContent.slice(0, toDealwith.reasonIndex + step)
        toDealwith.reasonIndex += step
        if (isAutoScroll.value) {
          scrollToBottom()
        }
      } else {
        clearInterval(reasonTimer)
        reasonTimer = 0
        renderResponse()
      }
    }, 25)
  }
}

let answerTimer:number = 0;
function renderResponse() {
  const observeItem = message.value[message.value.length - 1]
  if (!answerTimer) {
    answerTimer = setInterval(() => {
      answerStartRender.value = true
      if (toDealwith.index < toDealwith.task.length) {
        const step = getNextIndex()
        observeItem.html = toDealwith.task.slice(0, toDealwith.index + step)
        toDealwith.index += step
        if (isAutoScroll.value) {
          scrollToBottom()
        }
      } else {
        clearInterval(answerTimer)
        answerTimer = 0
      }
    }, 35)
  }
}

function stopResponse() {
  if (!abortController.value) return;
  abortController.value.abort()
  abortController.value = null;
}

function checkSuffix(str: string) {
  const strRegex = /\.(txt|docx|csv|xlsx|pdf|md|html|pptx)$/;
  return strRegex.test(str.toLowerCase());
}

function getSuffix(str = '') {
  return str.match(/\.(txt|docx|csv|xlsx|pdf|md|html|pptx)$/)?.[1]
}

function deleteFile(index: number) {
  fileList.value.splice(index, 1)
}

async function onChange(file: File) {
  if (!checkSuffix(file?.name)) {
    return ElMessage.warning('请选择以下类型的文件：txt、docx、csv、xlsx、pdf、md、html、pptx等')
  }
  const formData = new FormData();
  uploadLoading.value = true
  formData.append('file', file)
  const result: any = await uploadFile(formData)
  uploadLoading.value = false
  if (!result) {
    return;
  }
  fileList.value.push({
    name: result.data.yswjmc,
    url: result.data.wjfwurl
  })
}

const scrollToBottom = throttle((noSmooth = false) => {
  // bottomLineRef.value.scrollTop = 0
  bottomLineRef.value?.scrollIntoView({
    behavior: !noSmooth ? 'smooth' : 'instant',
    block: 'end',
  })
}, 25)

function copyText(text: string | undefined) {
  if (!text) return;
  if (copyDomText(text)) {
    ElMessage.success("已复制到剪贴板");
  }
}

watch(() => activeChatId?.value, async (val) => {
  if (!val) {
    message.value = []
    return;
  }
  const result: any = await getPaginationRecords({
    offset: 0,
    pageSize: 20,
    appId: appId,
    chatId: val,
  })
  message.value = (result?.data?.list || []).map((item: any) => {
    if (item.obj === 'AI') {
      const contentIndex = item.value.findIndex((x: any) => x.type === 'text')
      const reasoningContentIndex = item.value.findIndex((x: any) => x.type === 'reasoning')
      let content = item.value[contentIndex].text.content
      // if (content.startsWith('```markdown')) {
      //   content = content.replace(/```markdown/g, '');
      //   toDealwith.index = 0
      // }
      const resultItem: ChatMessageType = {
        role: 'assistant',
        content: content,
        html: marked.parse(content) as string,
        hide: false,
      }
      if (reasoningContentIndex > -1) {
        const reasonContent = item.value[reasoningContentIndex].reasoning.content
        resultItem.reasoning = reasonContent
        resultItem.reasoning_content = marked.parse(reasonContent)
      }
      return resultItem
    } else {
      return {
        role: 'user',
        content: item.value.map((x: any) => {
          if (x.type === 'text') {
            return {
              type: x.type,
              text: x.text.content,
            }
          } else if(x.type === 'file') {
            return {
              type: 'file_url',
              name: x.file.name,
              url: x.file.url,
            }
          }
        }),
      }
    }
  })
  needUpdateParentChatListTitle.value = message.value.length === 0
  scrollToBottom(true)
}, { immediate: true })


onMounted(() => {
  // message.value.push({ role: 'assistant', html: '您好，我是高新区任务督办小助手，可以精准查询项目进展情况，也可以做一些统计分析，欢迎向我提问！' } as ChatMessageType);
  (document.querySelector('.answer-box') as Element).addEventListener('scroll', onScroll);
  nextTick(scrollToBottom)
})

onUnmounted(() => {
  (document.querySelector('.answer-box') as Element).removeEventListener('scroll', onScroll);
})
</script>

<style scoped lang="less">
@fontFamily: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';


.deepseek {
  //width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .chat-header {
    height: 60px;
    padding-left: 20px;
    background-color: #FBFBFC;
    &__record {
      padding: 5px 10px;
      border-radius: 4px;
      background-color: #F0F4FF;
      color: #3370FF;
    }
  }

  .answer-box {
    padding: 10px 0 0 10px;
    overflow: auto;
    position: unset;
    height: 0;
    flex: 1 0 0;

    .answer-content {
      &__assistant {
        max-width: calc(100% - 180px);
        padding: 12px;
        margin-left: 7px;
        margin-bottom: 10px;
        &__config-bar {
          margin-left: 10px;
          display: flex;
          align-items: center;
          padding: 5px 10px;
          border-radius: 6px;
          border: 1px solid #EBEBEB;
          i {
            cursor: pointer;
            &:hover {
              color: #2D7CFF;
            }
          }
        }
      }
    }


    .question-item {
      max-width: calc(100% - 50px);
      border: 1px solid #f3f6fb;
      min-height: 20px;
      padding: 8px 15px;
      word-break: break-all;
      position: relative;
      display: inline-block;
      font-size: 14px;
      margin-right: 10px;
      margin-bottom: 10px;
      background: #2D7CFF;
      border-radius: 10px 2px 10px 10px;
      color: #fff;

      &__text {
        display: block;
        margin-top: 5px;
      }

      &__file {
        display: inline-flex;
        align-items: center;
        padding: 2px 4px;
        background-color: white;
        border-radius: 5px;
        color: #3b2300;
        margin: 2px;
        font-size: 12px;

        &--icon {
          width: 14px;
        }

        &--name {
          margin-left: 5px;
        }
      }
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
      font-size: 14px;
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
    width: 760px;
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
        font-size: 13px;
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
          &:hover {
            transform: scale(1.1);
          }
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
          font-size: 13px;
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

      :deep(.textarea ) {
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

      }

      .AI-button {
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
