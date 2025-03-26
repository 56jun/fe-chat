// import FormData from 'form-data';
import md5 from 'js-md5'

/**
 * 获取app移动端h5集成签名
 * sign(请求签名)计算规则
 * （1）拼接字符串key + "&" + timestamp + "&" + secret。
 * （2）md5  (上面拼接的字符串)  得到最终签名sign。
 * 签名计算：String sign = md5(key + "&" + timestamp + "&" + secret)
 * */
export const getSign = () => {
  const { url, key, secret } = {
    url: 'https://zhgx.aihfgx.com/api/zhgx/moduleInvoke/userInfo',
    key: '3DMF81XDXI5B2P8EQOZZ8D5Z3EJO8HBQ',
    secret: 'fl5MViRcHrqyeVePPsc66DURss'
  }
  const timestamp = +new Date();
  const str = key + '&' + timestamp + '&' + secret

  const formData = new FormData()
  // @ts-ignore
  formData.append('sign', md5(str))
  formData.append('key', key)
  formData.append('timestamp', `${ timestamp }`)
  // @ts-ignore
  const params = new URLSearchParams(formData)
  return {
    url: url,
    formData: params.toString(),// sign=111&key=222&timestamp=1741418996087
  }
}

// todo 暂时放在前端项目存储，后期通过标识符，让服务端做切换
const MAPPING = {
  // 智能督办查询
  todo: {
    apiKey: 'fastgpt-gwibm68OVMH4b3LznnFOla2QuqE173iNWlUrEZM2ZUNm95ruKK7US0as',
    params: {
      appId: '67b05c9dc1e6e49ceb55aab6',
      appName: '公文助手',
    }
  },
}

// 获取公共部分配置
export const getAppInfo = () => {
  return MAPPING['todo'] || null
}


// 定义防抖函数
export const debounce = function (fn: Function, wait: number, immediate: boolean) {
  // 自由变量，debounce执行完成被释放，time也不会被释放
  let time: any = null;
  // 返回一个闭包，接受参数
  return function (...args: any[]) {
    // 保存闭包被调用时的this
    // @ts-ignore
    const this_ = this;
    // 清除上一次的定时器
    if (time) {
      clearTimeout(time);
    }
    // 配置开关
    if (immediate) {
      const action = !time;
      // time没置空前因为time存在，所以fn不会执行
      time = setTimeout(function () {
        fn.apply(this_, args);
        // 每隔wait时间将time置为空
        time = null;
      }, wait);
      if (action) {
        fn.apply(this_, args);
      }
    } else {
      // 不再是直接执行fn，在内部传递参数
      time = setTimeout(function () {
        // 通过apply修改fn的this
        fn.apply(this_, args);
      }, wait);
    }
  }
};

export function throttle(fn: Function, wait: number) {
  let callback = fn;
  let timerId: number;

  // 是否是第一次执行
  let firstInvoke = true;

  function throttled() {
    // @ts-ignore
    let context = this as any;
    let args = arguments;

    // 如果是第一次触发，直接执行
    if (firstInvoke) {
      callback.apply(context, args);
      firstInvoke = false;
      return ;
    }

    // 如果定时器已存在，直接返回。
    if (timerId) {
      return ;
    }

    timerId = setTimeout(function() {
      // 注意这里 将 clearTimeout 放到 内部来执行了
      clearTimeout(timerId);
      timerId = 0;

      callback.apply(context, args);
    }, wait);
  }

  // 返回一个闭包
  return throttled;
}

export function copyDomText(val: string) {
  // 获取需要复制的元素以及元素内的文本内容
  const text = val;
  // 添加一个input元素放置需要的文本内容
  const input = document.createElement("input");
  input.value = text;
  document.body.appendChild(input);
  // 选中并复制文本到剪切板
  input.select();
  document.execCommand("copy");
  // 移除input元素
  document.body.removeChild(input);
  return true;
}
