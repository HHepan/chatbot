import {AfterViewChecked, ChangeDetectorRef, Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {XunFeiApiService} from "../../services/xunfei-api.service";
import {Message} from "../../../app/entity/message";
import {DatePipe} from "@angular/common";
import {IndexService} from "../../services/index.service";

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements AfterViewChecked, OnInit {
  @ViewChild('chatBody') private chatBody: any;
  messageContent: string = '';
  messages: Message[] = [];
  mode: 'text' | 'audio' = 'text'; // Default to 'text' mode
  inConversation = false;
  stream: MediaStream | null = null;
  audioContext: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  dataArray: Uint8Array | null = null;
  canvas: HTMLCanvasElement | null = null;
  canvasContext: CanvasRenderingContext2D | null = null;

  speechRecognitionText = '';
  naturalLanguageResult = '';

  userRole = {
    robot: 0,
    user: 1
  }

  answerRunning = false;
  lastSpeechRecognitionTexts:string[] = [];

  constructor(private xunFeiApiService: XunFeiApiService,
              private datePipe: DatePipe,
              private indexService: IndexService,
              private ngZone: NgZone,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.messages = [];
    this.getAllMessage();
  }

  getAllMessage() {
    this.indexService.getAll().subscribe(allMessages => {
      allMessages.forEach((message: Message) => {
        this.messages.push(message);
      });
    });
  }

  sendMessage(messageContent: string) {
    this.naturalLanguageResult = '';
    if (messageContent.trim()) {
      this.addMessage(messageContent, this.userRole.user);

      const naturalLanguageApiObserver = this.xunFeiApiService.naturalLanguageApi(messageContent);

      this.messageContent = '';

      const subscription = naturalLanguageApiObserver.subscribe(result => {
        this.ngZone.run(() => {
          if (result === '[DONE]') {
            subscription.unsubscribe(); // 停止接收后续数据
            // console.log('已完成响应，取消订阅');
            this.answerRunning = false;
            this.addMessage(this.naturalLanguageResult, this.userRole.robot);
            this.speechRecognitionText = '';
            return;
          }
          this.answerRunning = true;
          this.naturalLanguageResult += result;

          // console.log('自然语言处理结果返回C层：', this.naturalLanguageResult);
        });
      });
    }
  }

  addMessage(messageContent: string, role: number) {
    const message = new Message();

    message.content = messageContent;
    message.time = this.getFormattedTime();
    message.role = role;

    this.indexService.add(message).subscribe(result => {
      const newestMessage = result[result.length - 1];
      // console.log('addMessage newestMessage', newestMessage);
      this.messages.push(newestMessage);
      if (this.mode === 'audio' && newestMessage.role === this.userRole.robot.toString()) {
        const speechSynthesisApiObserver = this.xunFeiApiService.speechSynthesisApi(newestMessage.content);

        const subscription = speechSynthesisApiObserver.subscribe(base64 => {
          // console.log('speechSynthesisApi result', base64);
          const audio = new Audio(`data:audio/wav;base64,${base64}`);
          console.log('audio play');
          audio.play();
          audio.addEventListener('ended', () => {
            console.log('播放完成');
            subscription.unsubscribe();
            if (this.mode === 'audio') {
              this.startMic();
            }
          });
        });
      }
    })
  }

  getFormattedTime(): string {
    const now = new Date();
    return this.datePipe.transform(now, 'yyyy-MM-dd HH:mm:ss') || '';
  }

  scrollToBottom() {
    try {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  // 在视图更新后调用滚动
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // 修改模式：文本/语音
  toggleMode(mode: 'text' | 'audio') {
    this.mode = mode;
    if (mode === 'text') {
      this.stopMic();
    } else if (mode === 'audio') {
      // this.startMic();
    }
  }

  getViewTime(msgTime: string | undefined): string {
    // @ts-ignore
    const msgDate = new Date(msgTime);
    const now = new Date();

    const pad = (n: number) => n.toString().padStart(2, '0');

    const msgYMD = `${msgDate.getFullYear()}-${pad(msgDate.getMonth() + 1)}-${pad(msgDate.getDate())}`;
    const nowYMD = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayYMD = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

    const timePart = `${pad(msgDate.getHours())}:${pad(msgDate.getMinutes())}:${pad(msgDate.getSeconds())}`;

    if (msgYMD === nowYMD) {
      return `今天 ${timePart}`;
    } else if (msgYMD === yesterdayYMD) {
      return `昨天 ${timePart}`;
    } else {
      return `${msgYMD} ${timePart}`;
    }
  }


  // 开启麦克风
  startMic() {
    this.lastSpeechRecognitionTexts = [];
    this.speechRecognitionText = '';
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.stream = stream;
      this.inConversation = true;

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      this.canvas = document.getElementById('waveform') as HTMLCanvasElement;
      this.canvasContext = this.canvas.getContext('2d')!;
      this.drawWaveform();

      console.log('🎙️ 麦克风已启动', stream);

      // 启动静音检测
      // this.monitorSilence(stream);

      const SAMPLE_RATE = 16000;
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(this.audioContext.destination);

      processor.onaudioprocess = (event) => {
        if (!this.inConversation) return;

        const input = event.inputBuffer.getChannelData(0);
        const downSampled = this.downSampleBuffer(input, this.audioContext!.sampleRate, SAMPLE_RATE);
        const pcm = this.floatTo16BitPCM(downSampled);

        let calledCheckRepeatedText = false;

        // 调用语音识别
        this.xunFeiApiService.speechRecognitionApi(pcm).subscribe(text => {
          this.speechRecognitionText = text;
          // console.log('语音识别结果传回到C层：', text);
          if (!calledCheckRepeatedText) {
            // ⬇️ 新增重复检测逻辑
            calledCheckRepeatedText = this.checkRepeatedText(text);
          }
        });
      };
    }).catch(err => {
      console.error('🚫 无法访问麦克风:', err);
    });
  }


  // 关闭麦克风
  stopMic() {
    this.stream?.getTracks().forEach(track => track.stop());

    if (this.audioContext && this.audioContext?.state !== 'closed') {
      this.audioContext.close();
      console.log('🛑 麦克风已关闭');
      if (this.speechRecognitionText !== '') {
        this.sendMessage(this.speechRecognitionText);
        this.speechRecognitionText = '';
      } else {
        this.inConversation = false;
      }
    }
    this.xunFeiApiService.stopSpeechRecognition();
  }

  // 检查语音识别文本是否重复，重复超过次数后自动停止
  checkRepeatedText(currentText: string): boolean {
    let result = false;
    const MAX_REPEAT = 30;

    // 只保留最新 30 条记录
    this.lastSpeechRecognitionTexts.push(currentText);
    if (this.lastSpeechRecognitionTexts.length > MAX_REPEAT) {
      this.lastSpeechRecognitionTexts.shift();
    }

    // 检查是否全部一样
    const allSame = this.lastSpeechRecognitionTexts.every(t => t === currentText);
    if (allSame && this.lastSpeechRecognitionTexts.length === MAX_REPEAT) {
      console.log('🛑 检测到连续重复文本，自动停止麦克风');
      this.stopMic();
      result = true;
    }
    return result;
  }

  // 检测静音
  monitorSilence(stream: MediaStream) {
    let silenceStartTime: number | null = null;
    const silenceThreshold = 0.01;
    const silenceDuration = 5000;

    const checkSilence = () => {
      this.analyser!.getByteTimeDomainData(this.dataArray!);
      const average = this.dataArray!.reduce((sum, val) => sum + Math.abs(val - 128), 0) / this.dataArray!.length;

      if (average < silenceThreshold * 128) {
        if (silenceStartTime === null) {
          silenceStartTime = Date.now();
        } else if (Date.now() - silenceStartTime > silenceDuration) {
          console.log('🤫 检测到持续静音，自动停止麦克风');
          this.stopMic();
          return;
        }
      } else {
        silenceStartTime = null;
      }

      if (this.inConversation) {
        requestAnimationFrame(checkSilence);
      }
    };

    requestAnimationFrame(checkSilence);
  }


  // 画出语音时的波形图
  drawWaveform() {
    if (!this.analyser || !this.canvasContext || !this.dataArray) return;

    this.canvasContext.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

    this.analyser.getByteTimeDomainData(this.dataArray);

    this.canvasContext.beginPath();
    const width = this.canvas!.width;
    const height = this.canvas!.height;
    const sliceWidth = width / this.dataArray.length;
    let x = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      const v = this.dataArray[i] / 128.0; // Normalize to [0, 1]
      const y = v * height / 2; // Scale to canvas height
      if (i === 0) {
        this.canvasContext.moveTo(x, y);
      } else {
        this.canvasContext.lineTo(x, y);
      }
      x += sliceWidth;
    }

    this.canvasContext.lineTo(this.canvas!.width, this.canvas!.height / 2);
    this.canvasContext.strokeStyle = '#56C596';
    this.canvasContext.lineWidth = 2;
    this.canvasContext.stroke();

    if (this.inConversation) {
      requestAnimationFrame(() => this.drawWaveform());
    }
  }

  // 转换录音文件的格式
  downSampleBuffer(buffer: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array {
    if (outputSampleRate === inputSampleRate) return buffer;
    const ratio = inputSampleRate / outputSampleRate;
    const length = Math.round(buffer.length / ratio);
    const result = new Float32Array(length);
    let offset = 0;
    for (let i = 0; i < result.length; i++) {
      const nextOffset = Math.round((i + 1) * ratio);
      let sum = 0;
      let count = 0;
      for (let j = offset; j < nextOffset && j < buffer.length; j++) {
        sum += buffer[j];
        count++;
      }
      result[i] = sum / count;
      offset = nextOffset;
    }
    return result;
  }

  // 转换录音文件的格式为pcm
  floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }
}
