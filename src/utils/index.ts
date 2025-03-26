import moment from "moment";

/**
 * 使用moment计算时间距离现在的时间
 * 1、如果在当天，就显示时+分
 * 2、如果在当天，就显示时+分
 * 3、如果在昨天，就显示昨天+时+分
 * 4、如果在今年，就显示月+日
 * */
export function formatTime2shortText(time: number) {
  const now = new Date().getTime()
  const diff = now - (new Date(time)).getTime()
  if (diff < 1000 * 60 * 60 * 24) {
    return moment(time).format('HH:mm')
  }
  if (diff < 1000 * 60 * 60 * 24 * 2) {
    return '昨天'
  }
  return moment(time).format('MM-DD')
}

/**
 * 生成uuid
 * @param {Number} len uuid的长度
 * @param {Boolean} firstU 将返回的首字母置为"u"
 * @param {Nubmer} radix 生成uuid的基数(意味着返回的字符串都是这个基数),2-二进制,8-八进制,10-十进制,16-十六进制
 */
export function guid(len = 32, firstU = true, radix = 62) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const uuid = []

  if (len) {
    // 如果指定uuid长度,只是取随机的字符,0|x为位运算,能去掉x的小数位,返回整数位
    for (let i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
  } else {
    let r
    // rfc4122标准要求返回的uuid中,某些位为固定的字符
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'

    for (let i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r]
      }
    }
  }
  // 移除第一个字符,并用u替代,因为第一个字符为数值时,该guuid不能用作id或者class
  if (firstU) {
    uuid.shift()
    return `u${ uuid.join('') }`
  }
  return uuid.join('')
}

