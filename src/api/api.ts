import axios from 'axios';

import { useAppConfig } from "@/stores/userChat.ts";




function getHeader() {
  const { appConfig } = useAppConfig()
  return {
    Authorization: `Bearer ${appConfig.apiKey}`
  }
}

export function getChatApi() {
  const { appConfig } = useAppConfig()
  return  appConfig.baseURL + '/api/v1/chat/completions';
}

// todo 上传文件
export async function uploadFile(formData: FormData): Promise<{ data: { yswjmc: string, wjfwurl: string } } | false> {
  return new Promise((resolve) => {
    axios.post('https://zhgx.aihfgx.com/api/zhgx/jcpz/wjgl/uploadFileToSever', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then((response) => {
      if (response.data.code === 200) {
        resolve(response.data)
      } else {
        resolve(false)
      }
    }).catch(err => {
      console.error(err)
      resolve(false)
    })
  })
}

export async function getHistories(data: Object) {
  return new Promise((resolve) => {
    const { appConfig } = useAppConfig()
    axios.post(appConfig.baseURL + '/api/core/chat/getHistories', data, { headers: getHeader() }).then((response) => {
      if (response.data.code === 200) {
        resolve(response.data)
      } else {
        resolve(false)
      }
    }).catch(err => {
      console.error(err)
      resolve(false)
    })
  })
}

// 获取分页历史记录
export async function getPaginationRecords(data: {
  "offset": number,
  "pageSize": number,
  "appId": string,
  "chatId": string,
}) {
  return new Promise((resolve) => {
    const { appConfig } = useAppConfig()
    axios.post(appConfig.baseURL + '/api/core/chat/getPaginationRecords', data, { headers: getHeader() }).then((response) => {
      if (response.data.code === 200) {
        resolve(response.data)
      } else {
        resolve(false)
      }
    }).catch(err => {
      console.error(err)
      resolve(false)
    })
  })
}

// 修改对话标题
export async function updateHistory(data: Object) {
  return new Promise((resolve) => {
    const { appConfig } = useAppConfig()
    axios.post(appConfig.baseURL + '/api/core/chat/getHistories', data, { headers: getHeader() }).then((response) => {
      if (response.data.code === 200) {
        resolve(response.data)
      } else {
        resolve(false)
      }
    }).catch(err => {
      console.error(err)
      resolve(false)
    })
  })
}

// 点赞/取消点赞、踩/取消踩
export async function updateUserFeedback(data: {
  appId: string
  chatId: string
  dataId: string
  // 取消点赞时不填此参数
  userGoodFeedback?: string
  // 取消踩时不填此参数
  userBadFeedback?: string
}) {
  return new Promise((resolve) => {
    const { appConfig } = useAppConfig()
    axios.post(appConfig.baseURL + '/api/core/chat/feedback/updateUserFeedback', data, { headers: getHeader() }).then((response) => {
      if (response.data.code === 200) {
        resolve(response.data)
      } else {
        resolve(false)
      }
    }).catch(err => {
      console.error(err)
      resolve(false)
    })
  })
}

// 删除当前对话
export async function delHistory(chatId: string) {
  return new Promise((resolve) => {
    const { appConfig } = useAppConfig()
    axios.delete(appConfig.baseURL + `/api/core/chat/delHistory?appId=${appConfig.appId}&chatId=${chatId}`, { headers: getHeader() }).then((response) => {
      if (response.data.code === 200) {
        resolve(response.data)
      } else {
        resolve(false)
      }
    }).catch(err => {
      console.error(err)
      resolve(false)
    })
  })
}

// 清空历史记录
export async function clearHistories() {
  return new Promise((resolve) => {
    const { appConfig } = useAppConfig()
    axios.delete(appConfig.baseURL + `/api/core/chat/clearHistories?appId=${appConfig.appId}`, { headers: getHeader() }).then((response) => {
      if (response.data.code === 200) {
        resolve(response.data)
      } else {
        resolve(false)
      }
    }).catch(err => {
      console.error(err)
      resolve(false)
    })
  })
}

