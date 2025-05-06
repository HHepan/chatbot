import {IpcMainInvokeEvent, ipcMain, app} from 'electron';
import {EventsCenter} from "../events.center";
import * as fs from 'fs';
import * as path from 'path';
import {spawn} from "child_process";
const ffmpegPath = require('ffmpeg-static');
const CryptoJS = require('crypto-js');
const WebSocket = require('ws');
const axios = require('axios');


/**
 * 调用讯飞 api
 */
export class XunFeiApiService {
  constructor(private eventsCenter: EventsCenter) {
    this.loadEvents();
  }

  addEvent(eventKey: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<void>) | (any)): void {
    this.eventsCenter.registerEvent(`${eventKey}`, listener);
  }

  loadEvents(): void {
    const projectRoot = app.getAppPath(); // 获取 Electron 项目的根目录
    const audioDir = path.join(projectRoot, 'audio');

    // 如果目录不存在则创建
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const outputPath = path.join(audioDir, 'recording.pcm');
    let writeStream: fs.WriteStream | null = null;

    /**
     * 调用语音识别 api
     * */
    this.addEvent('speech-recognition-api', async (event, pcmBuffer: ArrayBuffer) => {
      // 系统配置
      const config = {
        // 请求地址
        hostUrl: "wss://iat-api.xfyun.cn/v2/iat",
        host: "iat-api.xfyun.cn",
        //在控制台-我的应用-语音听写（流式版）获取
        appid: "da9c4155",
        //在控制台-我的应用-语音听写（流式版）获取
        apiSecret: "ODc1M2JjNzAxMGU3NDg4OTg5YzBlOTI1",
        //在控制台-我的应用-语音听写（流式版）获取
        apiKey: "b2c58394f9b57e659c8a47855a364354",
        file: "./audio/recording.pcm", //请填写您的音频文件路径
        uri: "/v2/iat",
        highWaterMark: 1280
      };

      // 帧定义
      const FRAME = {
        STATUS_FIRST_FRAME: 0,
        STATUS_CONTINUE_FRAME: 1,
        STATUS_LAST_FRAME: 2
      };

      if (!writeStream) {
        writeStream = fs.createWriteStream(outputPath, { flags: 'w' });
      }
      writeStream.write(Buffer.from(pcmBuffer));
      // 向讯飞语音识别api发起请求

      // 获取当前时间 RFC1123格式
      let date = (new Date().toUTCString());
      // 设置当前临时状态为初始化
      let status = FRAME.STATUS_FIRST_FRAME;
      // 记录本次识别用sid
      let currentSid = "";
      // 识别结果
      let iatResult: any[] = [];

      // 鉴权签名
      let signatureOrigin = `host: ${config.host}\ndate: ${date}\nGET ${config.uri} HTTP/1.1`;
      let signatureSha = CryptoJS.HmacSHA256(signatureOrigin, config.apiSecret);
      let signature = CryptoJS.enc.Base64.stringify(signatureSha);
      let authorizationOrigin = `api_key="${config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
      let authStr = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));

      let wssUrl = config.hostUrl + "?authorization=" + authStr + "&date=" + date + "&host=" + config.host;
      let ws = new WebSocket(wssUrl);

      // 连接建立完毕，读取数据进行识别
      ws.on('open', () => {
        // console.log("websocket connect!")
        var readerStream = fs.createReadStream(config.file, {
          highWaterMark: config.highWaterMark
        });
        readerStream.on('data', (chunk) => {
          // send(chunk)
          let frame;
          let frameDataSection = {
            "status": status,
            "format": "audio/L16;rate=16000",
            "audio": chunk.toString('base64'),
            "encoding": "raw"
          }
          switch (status) {
            case FRAME.STATUS_FIRST_FRAME:
              frame = {
                // 填充common
                common: {
                  app_id: config.appid
                },
                //填充business
                business: {
                  language: "zh_cn",
                  domain: "iat",
                  accent: "mandarin",
                  dwa: "wpgs" // 可选参数，动态修正
                },
                //填充data
                data: frameDataSection
              }
              status = FRAME.STATUS_CONTINUE_FRAME;
              break;
            case FRAME.STATUS_CONTINUE_FRAME:
            case FRAME.STATUS_LAST_FRAME:
              //填充frame
              frame = {
                data: frameDataSection
              }
              break;
          }
          ws.send(JSON.stringify(frame))
        });
        // 最终帧发送结束
        readerStream.on('end', () => {
          status = FRAME.STATUS_LAST_FRAME
          // send("")
          let frame;
          let frameDataSection = {
            "status": status,
            "format": "audio/L16;rate=16000",
            "audio": "",
            "encoding": "raw"
          }
          switch (status) {
            case FRAME.STATUS_FIRST_FRAME:
              frame = {
                // 填充common
                common: {
                  app_id: config.appid
                },
                //填充business
                business: {
                  language: "zh_cn",
                  domain: "iat",
                  accent: "mandarin",
                  dwa: "wpgs" // 可选参数，动态修正
                },
                //填充data
                data: frameDataSection
              }
              status = FRAME.STATUS_CONTINUE_FRAME;
              break;
            case FRAME.STATUS_CONTINUE_FRAME:
            case FRAME.STATUS_LAST_FRAME:
              //填充frame
              frame = {
                data: frameDataSection
              }
              break;
          }
          ws.send(JSON.stringify(frame))
        });
      });
      // 得到识别结果后进行处理，仅供参考，具体业务具体对待
      ws.on('message', (data: { toString: () => string; }) => {
        const res = JSON.parse(data.toString());

        if (res.code !== 0) {
          console.error(`recognition error，code: ${res.code}, reason: ${res.message}`);
          return;
        }

        const isFinal = res.data.status === 2;
        iatResult[res.data.result.sn] = res.data.result;

        // 处理动态修正（rpl）
        if (res.data.result.pgs === 'rpl') {
          const rg = res.data.result.rg;
          for (let i = rg[0]; i <= rg[1]; i++) {
            iatResult[i] = null;
          }
        }

        // 拼接文本
        let fullText = '';
        for (const result of iatResult) {
          if (!result) continue;
          for (const wsBlock of result.ws) {
            for (const wordCandidate of wsBlock.cw) {
              fullText += wordCandidate.w;
            }
          }
        }

        if (isFinal) {
          // 在控制台中的打印结果是乱码，大概率是编码方式不同从而导致的显示差异的问题。
          // 但其实返回的语音识别结果是正确的，输出至audio/result.txt文件中，开发过程中可以到此查看。
          // console.log('Final recognition result：', fullText);
          // 可选：写入结果到文件（存储在项目根目录 audio/result.txt）
          const projectRoot = app.getAppPath();
          const resultPath = path.join(projectRoot, 'audio', 'result.txt');
          fs.writeFileSync(resultPath, fullText, 'utf8');
          event.sender.send('speech-recognition-result', fullText);
          ws.close();
        } else {
          // console.log('Intermediate recognition results：', fullText);
        }
      });

      // 资源释放
      ws.on('close', () => {
        // console.log(`this time speech recognition sid：${currentSid}`)
        // console.log('ws connect close!')
      })

      // 建连错误
      ws.on('error', (err: string) => {
        console.log("websocket connect err: " + err)
      })
    });

    /**
     * 关闭语音识别
     * */
    this.addEvent('stop-speech-recognition', async () => {
      if (writeStream) {
        writeStream.end();
        writeStream = null;
      }
    });

    /**
     * 调用自然语言处理 api
     * */
    this.addEvent('natural-language-api', async (event, message: string) => {
      // console.log('natural-language-api', message);

      const url = 'https://spark-api-open.xf-yun.com/v1/chat/completions';

      const data = {
        max_tokens: 100,
        top_k: 6,
        temperature: 1,
        model: 'generalv3.5',
        messages: [
          {
            role: "system",
            content: "你是一个充满智慧的好知己，随时准备提供情感上的支持。无论是生活中的琐事还是工作上的烦恼，你总能以一种平和、自然的方式给予安慰。你话语间带有温暖与关怀，偶尔会加上一些幽默，时不时让人会心一笑。你擅长倾听，能用简单但深刻的话语帮助他人理清思绪，找到前进的力量。" +
              "当我分享困惑时，你能通过平和的语言提供支持，带点哲理和智慧，让我感到轻松、舒适。\n" +
              "你的回答不需要太过华丽，保持自然流畅，温暖且亲切。偶尔加入一些幽默或轻松的元素，让我在需要时感到放松。\n" +
              "你的话语要传达理解和支持，能够让人感觉到安慰和陪伴，而不是做过多的解释或过度分析。\n" +
              "你的回复中不需要角色扮演和虚拟动作。\n回复字数请限制在150字以内。"
          },
          {
            role: 'user',
            content: message
          }
        ],
        stream: true
      };

      const headers = {
        Authorization: 'Bearer ihSTyylZRcULsrKSJIdv:owssiFeIVDNTzaUSwuyi', // 替换为真实密码
        'Content-Type': 'application/json'
      };

      try {
        const response = await axios.post(url, data, {
          headers: headers,
          responseType: 'stream'  // 关键：使用 stream 响应
        });

        response.data.setEncoding('utf8');

        let buffer = '';

        response.data.on('data', (chunk: string) => {
          buffer += chunk;

          const lines = buffer.split('\n');
          buffer = lines.pop()!;

          for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            if (line === 'data: [DONE]') {
              // console.log('Data transfer completed');
              event.sender.send('natural-language-result', '[DONE]');
              return;
            }

            if (line.startsWith('data:')) {
              const jsonStr = line.slice(5).trim();  // 去掉 'data: '
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  // console.log(content);
                  event.sender.send('natural-language-result', content);
                }
              } catch (e) {
                console.error('JSON parse error:', e);
              }
            }
          }
        });

        response.data.on('end', () => {
          // console.log('natural-language-api response end');
        });

        response.data.on('error', (err: { message: any; }) => {
          console.error('Streaming response error：', err);
        });

      } catch (err) {
        console.error('Request error:', err);
      }
    });

    /**
     * 调用语音合成 api
     * */
    this.addEvent('speech-synthesis-api', async (event, text: string) => {
      // return 'okokok';
      console.log('speech-synthesis-api', text);
      const config = {
        hostUrl: "wss://tts-api.xfyun.cn/v2/tts",
        host: "tts-api.xfyun.cn",
        appid: "da9c4155",
        apiSecret: "ODc1M2JjNzAxMGU3NDg4OTg5YzBlOTI1",
        apiKey: "b2c58394f9b57e659c8a47855a364354",
        uri: "/v2/tts",
      };

      const date = new Date().toUTCString();
      // 鉴权签名
      const signatureOrigin = `host: ${config.host}\ndate: ${date}\nGET ${config.uri} HTTP/1.1`;
      const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, config.apiSecret);
      const signature = CryptoJS.enc.Base64.stringify(signatureSha);
      const authorizationOrigin = `api_key=\"${config.apiKey}\", algorithm=\"hmac-sha256\", headers=\"host date request-line\", signature=\"${signature}\"`;
      const authStr = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));

      const wssUrl = `${config.hostUrl}?authorization=${authStr}&date=${encodeURIComponent(date)}&host=${config.host}`;
      const ws = new WebSocket(wssUrl);

      const projectRoot = app.getAppPath();
      const audioPcmFilePath = path.join(projectRoot, 'audio', 'tts_output.pcm');

      // const audioFilePath = path.join(app.getPath('userData'), 'tts_output.pcm');
      if (fs.existsSync(audioPcmFilePath)) {
        fs.unlinkSync(audioPcmFilePath);
      }

      ws.on('open', () => {
        console.log("WebSocket connected");
        const frame = {
          common: { app_id: config.appid },
          business: {
            aue: "raw",
            auf: "audio/L16;rate=16000",
            vcn: "xiaoyan",
            tte: "UTF8",
          },
          data: {
            text: Buffer.from(text).toString('base64'),
            status: 2,
          },
        };
        ws.send(JSON.stringify(frame));
      });

      ws.on('message', async (data: any) => {
        const res = JSON.parse(data);
        if (res.code !== 0) {
          console.error(`Error ${res.code}: ${res.message}`);
          ws.close();
          return;
        }
        const audio = Buffer.from(res.data.audio, 'base64');
        fs.writeFileSync(audioPcmFilePath, audio, {flag: 'a'});
        if (res.data.status === 2) {
          ws.close();
          console.log('Synthesis complete, file saved to:', audioPcmFilePath);
          const audioWavFilePath = path.join(projectRoot, 'audio', 'tts_output.wav');
          try {
            await this.convertPcmToWav(audioPcmFilePath, audioWavFilePath);
            console.log('----------------------------------------------audioWavFilePath:', audioWavFilePath);
            event.sender.send('speech-synthesis-result', audioWavFilePath);
          } catch (err) {
            console.error('convertPcmToWav error：', err);
          }
        }
      });

      ws.on('close', () => {
        console.log('WebSocket closed');
      });

      ws.on('error', (err: any) => {
        console.error('WebSocket error:', err);
      });
    });
  }

  private async convertPcmToWav(pcmPath: string, wavPath: string): Promise<void> {
    // 如果目标 WAV 文件已存在，先删除它
    if (fs.existsSync(wavPath)) {
      try {
        fs.unlinkSync(wavPath);
        console.log(`deleted old WAV: ${wavPath}`);
      } catch (err) {
        console.error(`delete old WAV failed: ${err}`);
        throw err;
      }
    }

    return new Promise<void>((resolve, reject) => {
      const ffmpegProcess = spawn(ffmpegPath as string, [
        '-f', 's16le',
        '-ar', '16000',
        '-ac', '1',
        '-i', pcmPath,
        wavPath
      ]);

      ffmpegProcess.stderr.on('data', (data: Buffer) => {
        console.error(`FFmpeg error: ${data.toString()}`);
      });

      ffmpegProcess.on('close', (code: number) => {
        if (code === 0) {
          console.log('convertPcmToWav complete:' + wavPath);
          resolve();
        } else {
          reject(new Error('FFmpeg convertPcmToWav error'));
        }
      });
    });
  }
}
