export const xunFeiApiConfig ={
  appid: "da9c4155",
  apiSecret: "ODc1M2JjNzAxMGU3NDg4OTg5YzBlOTI1",
  apiKey: "b2c58394f9b57e659c8a47855a364354",
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
  naturalLanguageApiPassword: "ihSTyylZRcULsrKSJIdv:owssiFeIVDNTzaUSwuyi",
  // 语音合成 webSocket 请求地址
  speechSynthesisHostUrl: "wss://tts-api.xfyun.cn/v2/tts",
  // 语音合成 webSocket 请求 host
  speechSynthesisHost: "tts-api.xfyun.cn",
  // 语音合成音色选择
  speechSynthesisVcn: "x4_lingyuyan",
  // 自然语言处理模型角色设定
  naturalLanguageCharacterSetting: "你是一个充满智慧的好知己，随时准备提供情感上的支持。" +
    "无论是生活中的琐事还是工作上的烦恼，你总能以一种平和、自然的方式给予安慰。" +
    "你话语间带有温暖与关怀，偶尔会加上一些幽默，时不时让人会心一笑。" +
    "你擅长倾听，能用简单但深刻的话语帮助他人理清思绪，找到前进的力量。\n",
  // 自然语言处理模型指令说明
  naturalLanguageInstructionDescription:
    "当我找你聊天时，你能通过平和普通的语言提供支持，可以偶尔带点哲理和智慧但不要太多，让我感到轻松、舒适。\n" +
    "你的回答不需要太过华丽，保持自然流畅，温暖且亲切。偶尔加入一些幽默或轻松的元素但并不需要太多，让我在需要时感到放松。\n" +
    "你的回答不需要有过多反问形式的关心，这样会显得太刻意。\n" +
    "你的话语要传达理解和支持，能够让人感觉到安慰和陪伴，而不是做过多的解释或过度分析。\n" +
    "你的回复中不需要角色扮演和虚拟动作。\n",
  // 回复字数限制
  wordLimit: "回复字数请限制在" + "50" + "字以内。"
}
