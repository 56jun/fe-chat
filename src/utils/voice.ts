'use client'

import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useChatConfig } from '@/stores/userChat.ts'

const splitMarker = 'SPLIT_MARKER'
const contentType = 'audio/mpeg'

// AppTTSConfigType.ts
type AppTTSConfigType = {
  type: TTSTypeEnum;
  model?: string;
  voice?: string;
  speed?: number;
};

// TTSTypeEnum.ts
enum TTSTypeEnum {
  none = 'none',
  model = 'model',
  web = 'web'
}

const ttsConfig = reactive<AppTTSConfigType>({
  type: TTSTypeEnum.web
})

export const activeAudioDataId = ref('')

function setActiveAudioDataId(dataId: string) {
  console.log('changeData--', dataId)
  activeAudioDataId.value = dataId
}

// 添加 MediaSource 支持检测函数
const isMediaSourceSupported = () => {
  return typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported?.(contentType)
}
const audioRef = ref<HTMLAudioElement | null>(null)
const audioLoading = ref(false)
const audioPlaying = ref(false)
const audioController = ref(new AbortController())

const hasAudio = computed(() => {
  if (typeof window === 'undefined') return false
  if (ttsConfig?.type === TTSTypeEnum.none) return false
  if (ttsConfig?.type === TTSTypeEnum.model) return true
  const voices = window?.speechSynthesis?.getVoices?.() || []
  return !!voices.find((item) => item.lang === 'zh-CN' || item.lang === 'zh')
})

const getAudioStream = async (input: string) => {
  if (!input) return Promise.reject('Text is empty')

  audioLoading.value = true
  audioController.value = new AbortController()

  try {

    const { appConfig } = useChatConfig()
    const response = await fetch(appConfig.baseURL + '/api/core/chat/item/getSpeech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: audioController.value.signal,
      body: JSON.stringify({
        appId: appConfig.appId,
        ttsConfig: { type: 'model' },
        input: input.trim()
      })
    })

    if (!response.body || !response.ok) {
      const data = await response.json()
      return Promise.reject(data)
    }
    return response.body
  } finally {
    audioLoading.value = false
  }
}

const playWebAudio = (text: string, dataId: string) => {
  window?.speechSynthesis?.cancel()
  const msg = new SpeechSynthesisUtterance(text)
  console.log('playWebAudio1', msg)
  msg.volume = 0.5
  // msg.rate = 1.2
  const voices = window?.speechSynthesis?.getVoices?.() || []
  const voice = voices.find((item) => item.lang === 'zh-CN')
  console.log('playWebAudio2', voice)
  if (voice) {
    setActiveAudioDataId(dataId)

    let watcher = watch(() => audioPlaying.value, (val) => {
      console.log('playWebAudio3', val)
      if (!val) {
        setActiveAudioDataId('')
        cancelAudio()
        watcher?.()
      }
    })

    msg.onstart = () => {
      console.log('playWebAudio onstart', true)
      audioPlaying.value = true
    }
    msg.onend = () => {
      console.log('playWebAudio onend', false)
      audioPlaying.value = false
    }
    msg.voice = voice
    window.speechSynthesis?.speak(msg)
  }
}

export const cancelAudio = () => {
  try {
    window.speechSynthesis?.cancel()
    if (!audioController.value.signal.aborted) {
      audioController.value.abort()
    }
  } catch (error) {}
  if (audioRef.value) {
    console.log('cancelAudio audioRef.value.pause()')
    audioRef.value.pause()
    audioRef.value.src = ''
  }
  audioPlaying.value = false
}

export const playAudioByText = async ({ text, buffer, dataId }: {
  text: string;
  dataId: string;
  buffer?: Uint8Array
}) => {
  const playAudioBuffer = (buffer: Uint8Array) => {
    if (!audioRef.value) return
    const audioUrl = URL.createObjectURL(new Blob([buffer], { type: contentType }))
    audioRef.value.src = audioUrl
    audioRef.value.play()
  }

  try {
    cancelAudio()
    if (ttsConfig?.type === TTSTypeEnum.model) {
      if (buffer) {
        playAudioBuffer(buffer)
        return { buffer }
      }

      const audioBuffer = await readAudioStream(await getAudioStream(text))
      return { buffer: audioBuffer }
    } else {
      setTimeout(() => {
        playWebAudio(text, dataId)
      }, 10)
      return {}
    }
  } catch (error) {
    // toast({
    //   status: 'error',
    //   title: getErrText(error, t('common:core.chat.Audio Speech Error'))
    // });
    throw error
  }
}

const readAudioStream = async (stream: ReadableStream<Uint8Array>) => {
  if (!audioRef.value) return

  if (!isMediaSourceSupported()) {
    const reader = stream.getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    const fullBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
    let offset = 0
    for (const chunk of chunks) {
      fullBuffer.set(chunk, offset)
      offset += chunk.length
    }
    return fullBuffer
  }

  const ms = new MediaSource()
  const url = URL.createObjectURL(ms)
  audioRef.value.src = url
  audioRef.value.play()

  const u8Arr: Uint8Array = new Uint8Array()
  return new Promise<Uint8Array>(async (resolve, reject) => {
    await new Promise((resolve) => {
      ms.onsourceopen = resolve
    })
    const sourceBuffer = ms.addSourceBuffer(contentType)
    const reader = stream.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done || audioRef.value?.paused) {
          resolve(u8Arr)
          if (sourceBuffer.updating) {
            await new Promise((resolve) => (sourceBuffer.onupdateend = resolve))
          }
          ms.endOfStream()
          return
        }

        u8Arr.set(value, u8Arr.length)
        await new Promise((resolve) => {
          sourceBuffer.onupdateend = resolve
          sourceBuffer.appendBuffer(value.buffer as any)
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}
