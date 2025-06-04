## 概述
本项目为河北工业大学-人工智能与数据科学学院-物联网工程专业-2025年毕业设计，题目为《**对话机器人系统设计与实现**》。

包含内容：

1. 文本对话模式
![1.png](src%2Fassets%2Fimages%2Freadme%2F1.png)
![2.png](src%2Fassets%2Fimages%2Freadme%2F2.png)

2. 语音对话模式
![3.png](src%2Fassets%2Fimages%2Freadme%2F3.png)
![4.png](src%2Fassets%2Fimages%2Freadme%2F4.png)
![5.png](src%2Fassets%2Fimages%2Freadme%2F5.png)

3. 自定义角色功能
![6.png](src%2Fassets%2Fimages%2Freadme%2F6.png)
![7.png](src%2Fassets%2Fimages%2Freadme%2F7.png)

## 开发与运行

详情请见项目( https://github.com/HHepan/angular-electron-typeorm-better-sqlite3 )的 README 描述。其中包括**环境准备**、**如何启动**、**如何打包**、**开发时如何查看数据库**等具体开发细节。

## 关于第三方
该项目的语音识别功能、语音合成功能、自然语言处理功能均依靠对接的科大讯飞 api 实现，具体如下：

语音识别：科大讯飞-语音听写（流式版），文档见 https://www.xfyun.cn/doc/asr/voicedictation/API.html 。

语音合成：科大讯飞-在线语音合成，文档见 https://www.xfyun.cn/doc/tts/online_tts/API.html 。

自然语言处理：科大讯飞-星火认知大模型-SparkMax，文档见 https://www.xfyun.cn/doc/spark/HTTP%E8%B0%83%E7%94%A8%E6%96%87%E6%A1%A3.html 。

因此，本项目需要先去到讯飞开放平台( https://console.xfyun.cn )，**创建应用**后申请相关的**鉴权信息**，具体见下图：
![8.png](src%2Fassets%2Fimages%2Freadme%2F8.png)
(该文件位置为chatbot/app/xunfei-api.config.ts)

## 待解决问题

开发环境下程序能够正常运行，但是打包后的应用程序运行时存在错误，目前尚未解决。
