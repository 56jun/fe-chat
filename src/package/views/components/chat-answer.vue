<template>
  <div class="answer-content__assistant">
    <div class="flex align-center">
      <img src="../../../assets/robot-icon.png" class="robot-bg chat-avatar" alt="icon" />
      <div v-if="isAnsweringItem"
           style="display: flex; justify-content: flex-start; align-items: center;margin-left: 10px;color: #4A7AEB;font-weight: bold;"
      >
        <el-icon class="is-loading" style="font-size: 22px">
          <Loading />
        </el-icon>
        <span>&nbsp;{{ item.responseText || '思考中' }}...</span>
      </div>
      <ul v-else class="chat-reset-style chat__config-bar">
        <li v-if="item.type !== 'welcome'">
          <simple-tooltip content="复制">
            <el-icon @click="copyText()"><CopyDocument /></el-icon>
          </simple-tooltip>
        </li>
        <!--    播放音频    -->
        <li v-if="hasRole('chat:voice:play')">
          <simple-tooltip v-if="activeAudioDataId !== item.dataId" content="朗读内容">
            <svg-icon @click="playAudio" icon-class="voice"></svg-icon>
          </simple-tooltip>
          <simple-tooltip v-else content="停止">
            <span @click="cancelAudio()" class="flex align-center" style="height: 16px;overflow-y: hidden;">
              <svg-icon icon-class="stop-voice" color="red"></svg-icon>
              <img src="@/assets/icons/speaking.gif" alt="" height="25" style="margin-left: 5px;">
            </span>
          </simple-tooltip>
        </li>
        <!--    点赞 -->
        <li @click="likeOrDislike('Y')"
            v-if="hasRole('chat:like') && !item.userBadFeedback && item.type !== 'welcome'"
            class="success"
            :class="{ 'active': item.userGoodFeedback }"
            :style="{ cursor: loading ? 'progress' : 'pointer' }"
        >
          <!--<LikeSvgIcon />-->
          <svg-icon icon-class="like"></svg-icon>
        </li>
        <!--    点踩    -->
        <li @click="likeOrDislike('N')"
            v-if="hasRole('chat:dislike') && !item.userGoodFeedback && item.type !== 'welcome'"
            class="danger"
            :class="{ 'active': item.userBadFeedback }"
            :style="{ cursor: loading ? 'progress' : 'pointer' }"
        >
          <svg-icon icon-class="like" style="transform: rotateX(180deg)"></svg-icon>
        </li>
      </ul>
      <div v-if="item.type !== 'welcome' && !isAnsweringItem" class="timer">{{ timer }}</div>
    </div>
    <div v-if="!['connecting', 'preThinking'].includes(item.progress)" class="answer-item">
      <div v-for="(responseItem, responseIndex) in item.value" :key="`${responseIndex}`">
        <div v-if="responseItem.type === AnswerTypeEnum.reasoning && responseItem.reasoning.html"
             class="answer-item__reasoning"
        >
          <div class="answer-item__reasoning__title"
               @click="() => { responseItem.hide = !responseItem.hide }"
          >
            <span>思考过程&nbsp;</span>
            <el-icon>
              <ArrowDown v-show="responseItem.hide" />
              <ArrowUp v-show="!responseItem.hide" />
            </el-icon>
          </div>
          <div class="answer-item__reasoning__content"
               :class="{
                  'hide': responseItem.hide,
                  'answering': responseIndex === (item.value.length - 1) && item.progress !== 'done'
               }"
               v-html="responseItem.reasoning?.html"
          ></div>
        </div>
        <div v-else-if="responseItem.type === AnswerTypeEnum.text && responseItem.text?.html"
             v-html="responseItem.text?.html"
             class="markdown-body select-text"
             :class="{ 'answering': responseIndex === (item.value.length - 1) && item.progress !== 'done' }"
        ></div>
        <div v-else>&nbsp;</div>
        <div v-if="responseIndex < item.value.length - 1"
             class="answer-item__comment--split"
             style="border-bottom: 1px dashed #B7B7BB;"
        ></div>
        <div class="answer-item__comment">
          <span v-if="item.userGoodFeedback === 'Y'" class="flex align-center">
            <el-icon size="18" style="margin-right: 5px;"><CircleCheck /></el-icon>问题已解决
          </span>
          <span v-else-if="item.userGoodFeedback === 'N'" class="flex align-center">
            <el-icon size="18" color="#ff8536" style="margin-right: 5px;"><Warning /></el-icon>问题未解决
          </span>
        </div>
      </div>
      <el-icon @click="copyText" class="bottom-copy-btn" title="复制"><CopyDocument /></el-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import { type ChatType, AnswerTypeEnum } from "@/type/chat.ts";
import SvgIcon from "@/components/SvgIcon/index.vue";
import { updateUserFeedback } from "@/api/api.ts";
import { formatTime2shortText, copyDomText } from "@/utils/index.ts";
import { useChatConfig, useChat } from "@/stores/userChat.ts";
import SimpleTooltip from '@/package/views/components/simple-tooltip.vue'
import { activeAudioDataId, playAudioByText, cancelAudio } from '@/utils/voice.ts'

const props = defineProps<{
  item: ChatType.ChatMessageType
}>()

const { loading, activeChatId, setLoading, getAnswerText } = useChat()


const isAnsweringItem = computed(() => {
  return ['connecting', 'preThinking', 'outputting'].includes(props.item.progress)
})

function replaceThink(str: string) {
  return str.replace(/<(\/?)think>/g, '')
}

function playAudio(events: Event) {
  // @ts-ignore
  events?.target?.blur();
  let text = getAnswerText(props.item)
  if (!text) return;
  text = replaceThink(text)?.trim()
  playAudioByText({ text, dataId: props.item.dataId })
}

const timer = computed(() => {
  return formatTime2shortText(props.item.time)
})

const { appConfig, hasRole } = useChatConfig()
const emits = defineEmits(['updateFeedback'])

function copyText() {
  const text = getAnswerText(props.item)
  if (!text) return;
  if (copyDomText(text)) {
    ElMessage.success("已复制到剪贴板");
  }
}

async function likeOrDislike(type: 'Y' | 'N') {
  if (loading.value) return;
  const params: {
    appId: string
    chatId: string
    dataId: string
    // 取消点赞时不填此参数
    userGoodFeedback?: string
    // 取消踩时不填此参数
    userBadFeedback?: string
  } = {
    appId: appConfig.appId,
    chatId: activeChatId.value,
    dataId: props.item.dataId,
    // // 取消点赞时不填此参数
    // userGoodFeedback: undefined,
    // // 取消踩时不填此参数
    // userBadFeedback: undefined,
  }
  if (type === 'Y' && !props.item.userGoodFeedback) {
    params.userGoodFeedback = 'yes'
  }
  if (type === 'N' && !props.item.userBadFeedback) {
    const feedback = await open()
    if (!feedback) return;
    params.userBadFeedback = feedback
  }
  setLoading(true)
  const result = await updateUserFeedback(params)
  setLoading(false)
  if (!result) return;
  emits('updateFeedback', params)
}

const open = (): Promise<string | false> => {
  return new Promise(resolve => {
    // 结果反馈
    ElMessageBox.prompt('', '结果反馈', {
      confirmButtonText: '提交反馈',
      cancelButtonText: '关闭',
      // inputPattern:,
      inputErrorMessage: 'Invalid Email',
    })
      .then(({ value }) => {
        resolve(value as string)
      })
      .catch(() => {
        resolve(false)
      })
  })
}

</script>
<style scoped lang="less">
.answer-content__assistant {
  position: relative;
  margin-bottom: 20px;
  .robot-bg {
    width: var(--avatar-size);
    height: var(--avatar-size);
  }
  .answer-item {
    //width: 100%;
    min-height: 20px;
    padding: 12px 12px 0;
    margin-top: 10px;
    word-break: break-all;
    position: relative;
    display: inline-block;
    background-color: #F7F8FA;
    color: #000;
    font-size: var(--font-base-size);
    border-radius: 0 8px 8px;
    .markdown-body {
      * {
        word-break: break-word;
      }
      :deep(p:nth-child(1)) {
        margin-top: 0;
      }
    }
    .answering > :nth-last-child(1) {
      &::after {
        display: inline-block;
        content: "";
        width: 3px;
        height: 14px;
        transform: translate(4px, 2px) scaleY(1.3);
        background-color: #2b5fd9;
        animation: Markdown_blink__bDVIw .6s infinite;
      }
    }
    :deep(code) {
      white-space: normal;
      word-break: break-all;
    }
    &__comment {
      color: #78787C;
      margin-top: 10px;
      text-align: right;
      &--split {
        margin-top: 10px;
      }
      span {
        & + span {
          margin-left: 13px;
        }
      }
    }
    &__reasoning {
      max-width: 100%;
      padding-top: 10px;
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
  .timer {
    margin-left: 10px;
    display: none;
  }
  .bottom-copy-btn {
    position: absolute;
    left: 0;
    bottom: -18px;
    font-size: 18px;
    cursor: pointer;
    display: none;
    color: #8a95a7;
  }
}
.success {
  &.active {
    background-color: #12B76A;
    color: #fff;
  }
}
.danger {
  &.active {
    background-color: rgb(252, 150, 99);
    color: #fff;
  }
}
@keyframes Markdown_blink__bDVIw {
    0%, to {
      opacity: 0
    }

    50% {
      opacity: 1
    }
  }
</style>

<style scoped lang="less">
@media (min-width: 961px) {
  .answer-content__assistant {
    &:hover {
      .answer-item {
      }
      .timer {
        display: initial;
      }
      .bottom-copy-btn {
        display: initial;
      }
    }
  }
}
</style>
<style lang="less" scoped>
@media (max-width: 960px) {
  .answer-content__assistant {
    .bottom-copy-btn {
      display: initial;
    }
  }
}
</style>
