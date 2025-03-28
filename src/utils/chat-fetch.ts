import moment from 'moment';
// refer to https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source'
import { type ChatType, SseResponseEventEnum } from "@/type/chat";

const formatTime2YMDHMW = (): string => {
  return moment().format('YYYY-MM-DD HH:mm:ss');
};
const getErrText = (error: any, defaultMessage: string): string => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return defaultMessage;
};

enum TeamErrEnum {
  notUser = 'notUser',
  teamOverSize = 'teamOverSize',
  unAuthTeam = 'unAuthTeam',
  teamMemberOverSize = 'teamMemberOverSize',
  aiPointsNotEnough = 'aiPointsNotEnough',
  datasetSizeNotEnough = 'datasetSizeNotEnough',
  datasetAmountNotEnough = 'datasetAmountNotEnough',
  appAmountNotEnough = 'appAmountNotEnough',
  pluginAmountNotEnough = 'pluginAmountNotEnough',
  websiteSyncNotEnough = 'websiteSyncNotEnough',
  reRankNotEnough = 'reRankNotEnough',
  groupNameEmpty = 'groupNameEmpty',
  groupNameDuplicate = 'groupNameDuplicate',
  groupNotExist = 'groupNotExist',
  orgMemberNotExist = 'orgMemberNotExist',
  orgMemberDuplicated = 'orgMemberDuplicated',
  orgNotExist = 'orgNotExist',
  orgParentNotExist = 'orgParentNotExist',
  cannotMoveToSubPath = 'cannotMoveToSubPath',
  cannotModifyRootOrg = 'cannotModifyRootOrg',
  cannotDeleteNonEmptyOrg = 'cannotDeleteNonEmptyOrg',
  cannotDeleteDefaultGroup = 'cannotDeleteDefaultGroup',
  userNotActive = 'userNotActive'
}

enum DispatchNodeResponseKeyEnum {
  nodeResponse = 'nodeResponse'
}

type StreamFetchProps = {
  url?: string;
  apiKey: string;
  data: Record<string, any>;
  onMessage: (message: any) => void;
  abortCtrl: AbortController;
};

type StreamResponseType = {
  responseText: string;
  [DispatchNodeResponseKeyEnum.nodeResponse]: any[];
};


const getWebReqUrl = (url: string = '') => {
  if (!url) return '/';
  // @ts-ignore
  const baseUrl = import.meta.VITE_BASE_URL || '';
  if (!baseUrl) return url;

  if (!url.startsWith('/') || url.startsWith(baseUrl)) return url;
  return `${baseUrl}${url}`;
};

class FatalError extends Error {}

export const streamFetch = async ({ url = '/api/v1/chat/completions', data, apiKey, onMessage, abortCtrl }: StreamFetchProps): Promise<StreamResponseType | undefined> => {
  const timeoutId = setTimeout(() => {
    abortCtrl.abort('Time out');
  }, 60000);
  let responseText = '';
  let responseQueue: ChatType.ResponseQueueItemType[] = [];
  let errMsg: string | undefined;
  let responseData: any[] = [];
  let finished = false;

  const finish = () => {
    if (errMsg !== undefined) {
      return failedFinish();
    }
    return {
      responseText,
      responseData
    };
  };

  const failedFinish = (err?: any) => {
    finished = true;
    // throw new Error(getErrText(err, errMsg ?? '响应过程出现异常~'));
    throw new Error(err);
  };

  const isAnswerEvent = (event: SseResponseEventEnum) =>
    event === SseResponseEventEnum.answer || event === SseResponseEventEnum.fastAnswer;

  const animateResponseText = () => {
    if (abortCtrl.signal.aborted) {
      responseQueue.forEach((item) => {
        onMessage(item);
        if (isAnswerEvent(item.event) && item.text) {
          responseText += item.text;
        }
      });
      onMessage({
        event: SseResponseEventEnum.done,
        text: '请求已取消'
      });
      return finish();
    }

    if (responseQueue.length > 0) {
      const fetchCount = Math.max(1, Math.round(responseQueue.length / 30));
      for (let i = 0; i < fetchCount; i++) {
        const item = responseQueue[i];
        onMessage(item);
        if (isAnswerEvent(item.event) && item.text) {
          responseText += item.text;
        }
      }

      responseQueue = responseQueue.slice(fetchCount);
    }

    if (finished && responseQueue.length === 0) {
      return finish();
    }

    requestAnimationFrame(animateResponseText);
  };

  animateResponseText();

  const pushDataToQueue = (data: ChatType.ResponseQueueItemType) => {
    responseQueue.push(data);
    if (document.hidden) {
      animateResponseText();
    }
  };

  try {
    const variables = data?.variables || {};
    variables.cTime = formatTime2YMDHMW();

    const requestData = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ apiKey }`, // 替换为实际的 API 密钥
      },
      signal: abortCtrl.signal,
      body: JSON.stringify({
        ...data,
        variables,
        detail: true,
        stream: true
      }),
    };

    // send request
    await fetchEventSource(getWebReqUrl(url), {
      ...requestData,
      async onopen(res) {
        clearTimeout(timeoutId);
        const contentType = res.headers.get('content-type');

        // not stream
        if (contentType?.startsWith('text/plain')) {
          return failedFinish(await res.clone().text());
        }

        // failed stream
        if (
          !res.ok ||
          !res.headers.get('content-type')?.startsWith(EventStreamContentType) ||
          res.status !== 200
        ) {
          try {
            failedFinish(await res.clone().json());
          } catch {
            const errText = await res.clone().text();
            if (!errText.startsWith('event: error')) {
              failedFinish();
            }
          }
        }
      },
      onmessage({ event, data }) {
        if (data === '[DONE]') {
          pushDataToQueue({
            event: SseResponseEventEnum.done,
            text: ''
          })
          return;
        }

        // parse text to json
        const parseJson = (() => {
          try {
            return JSON.parse(data);
          } catch (error) {
            return {};
          }
        })();
        // console.log(parseJson, event);
        if (event === SseResponseEventEnum.answer) {
          const reasoningText = parseJson.choices?.[0]?.delta?.reasoning_content || '';
          pushDataToQueue({
            event,
            reasoningText
          });

          const text = parseJson.choices?.[0]?.delta?.content || '';
          for (const item of text) {
            pushDataToQueue({
              event,
              text: item
            });
          }
        } else if (event === SseResponseEventEnum.fastAnswer) {
          const reasoningText = parseJson.choices?.[0]?.delta?.reasoning_content || '';
          pushDataToQueue({
            event,
            reasoningText
          });

          const text = parseJson.choices?.[0]?.delta?.content || '';
          pushDataToQueue({
            event,
            text
          });
        } else if (
          event === SseResponseEventEnum.toolCall ||
          event === SseResponseEventEnum.toolParams ||
          event === SseResponseEventEnum.toolResponse
        ) {
          pushDataToQueue({
            event,
            ...parseJson
          });
        } else if (event === SseResponseEventEnum.flowNodeStatus) {
          onMessage({
            event,
            ...parseJson
          });
        } else if (event === SseResponseEventEnum.flowResponses && Array.isArray(parseJson)) {
          responseData = parseJson;
        } else if (event === SseResponseEventEnum.updateVariables) {
          onMessage({
            event,
            variables: parseJson
          });
        } else if (event === SseResponseEventEnum.interactive) {
          pushDataToQueue({
            event,
            ...parseJson
          });
        } else if (event === SseResponseEventEnum.error) {
          if (parseJson.statusText === TeamErrEnum.aiPointsNotEnough) {
            // useSystemStore.getState().setNotSufficientModalType(TeamErrEnum.aiPointsNotEnough);
          }
          errMsg = getErrText(parseJson, '流响应错误');
        }
      },
      onclose() {
        finished = true;
      },
      onerror(err) {
        console.error(err.toString());
        if (err instanceof FatalError) {
          throw err;
        }
        clearTimeout(timeoutId);
        failedFinish(getErrText(err, '请求失败'));
      },
      openWhenHidden: true
    });
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (abortCtrl.signal.aborted) {
      finished = true;
      return {nodeResponse: [], responseText: ''};
    }

    failedFinish(err);
  }
};
