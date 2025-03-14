import axios from 'axios';
import { getHeader, getConfig } from "@/stores/config.ts";

export async function uploadFile(formData: FormData) {
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
    axios.post('/api/core/chat/getHistories', data, { headers: getHeader() }).then((response) => {
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
    axios.post('/api/core/chat/getPaginationRecords', data, { headers: getHeader() }).then((response) => {
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
    axios.post('/api/core/chat/getHistories', data, { headers: getHeader() }).then((response) => {
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
export async function delHistory(chatId: string) {
  return new Promise((resolve) => {
    const { appId } = getConfig()
    axios.delete(`/api/core/chat/delHistory?appId=${appId}&chatId=${chatId}`, { headers: getHeader() }).then((response) => {
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
    const { appId } = getConfig()
    axios.delete(`/api/core/chat/clearHistories?appId=${appId}`, { headers: getHeader() }).then((response) => {
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

