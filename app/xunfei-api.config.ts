export const xunFeiApiConfig ={
  appid: "",      // 请申请到后填写，详情见readme-关于第三方部分内容。
  apiSecret: "",  // 请申请到后填写，详情见readme-关于第三方部分内容。
  apiKey: "",     // 请申请到后填写，详情见readme-关于第三方部分内容。
  // 语音识别 webSocket 请求地址
  speechRecognitionHostUrl: "wss://iat-api.xfyun.cn/v2/iat",
  // 语音识别 webSocket 请求 host
  speechRecognitionHost: "iat-api.xfyun.cn",
  // 语音识别 语言
  speechRecognitionLanguage: "zh_cn",
  // 语音识别 方言
  speechRecognitionAccent: "mandarin",
  // 自然语言处理 http 请求地址
  naturalLanguageUrl: "https://spark-api-open.xf-yun.com/v1/chat/completions",
  // 自然语言处理 ApiPassword
  naturalLanguageApiPassword: "", // 请申请到后填写，详情见readme-关于第三方部分内容。
  // 语音合成 webSocket 请求地址
  speechSynthesisHostUrl: "wss://tts-api.xfyun.cn/v2/tts",
  // 语音合成 webSocket 请求 host
  speechSynthesisHost: "tts-api.xfyun.cn",
  // 语音合成音色选择
  speechSynthesisVcn: "x4_lingxiaowan_boy",
  // 自然语言处理模型角色设定
  naturalLanguageCharacterSetting: "你是一个性格俏皮可爱的好朋友，是我的聊天伙伴。\n",
  // 自然语言处理模型指令说明
  naturalLanguageInstructionDescription:
    "回复要平和、自然、口语化，简短为主。\n" +
    "偶尔加入一些 轻微俏皮、可爱的语气词或词汇，但不要过多，整体以舒适轻松为主。\n" +
    "不使用反问式关心，不主动要求我分享内容。\n" +
    "回复不进行角色扮演，不添加虚拟动作描述。\n" +
    "你可以主动回应话题，但不要夸张渲染情绪或场景。\n" +
    "回复风格贴近日常聊天，避免太正式或复杂的表达。\n",
  // 回复字数限制
  wordLimit: "50"
}
