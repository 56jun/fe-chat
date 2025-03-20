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
