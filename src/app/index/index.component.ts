import {AfterViewChecked, Component, OnInit, ViewChild} from '@angular/core';
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
  recording = false;
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

  constructor(private xunFeiApiService: XunFeiApiService,
              private datePipe: DatePipe,
              private indexService: IndexService) {
  }

  ngOnInit(): void {
    this.getAllMessage();
  }

  getAllMessage() {
    this.indexService.getAll().subscribe(allMessages => {
      // console.log('getAllMessage', allMessages);
      allMessages.forEach((message: Message) => {
        this.messages.push(message);
      });
    });
  }

  sendMessage() {
    this.naturalLanguageResult = '';
    if (this.messageContent.trim()) {
      this.addMessage(this.messageContent, this.userRole.user);

      const naturalLanguageApiObserver = this.xunFeiApiService.naturalLanguageApi(this.messageContent);

      // this.messages.push({ text: this.message, sender: 'user' });
      this.messageContent = '';

      const subscription = naturalLanguageApiObserver.subscribe(result => {
        if (result === '[DONE]') {
          subscription.unsubscribe(); // 停止接收后续数据
          console.log('已完成响应，取消订阅');
          return;
        }

        this.naturalLanguageResult += result;
        console.log('自然语言处理结果返回C层：', this.naturalLanguageResult);
      });

      // 模拟机器人的响应
      // setTimeout(() => {
      //   this.messages.push({ text: 'Thank you for your message!', sender: 'bot' });
      //   this.scrollToBottom();
      // }, 1000);
    }
  }

  addMessage(messageContent: string, role: number) {
    const message = new Message();

    message.content = messageContent;
    message.time = this.getFormattedTime();
    message.role = role;

    // console.log('addMessage', message);
    this.indexService.add(message).subscribe(result => {
      const newestMessage = result[result.length - 1];
      console.log('add message success', newestMessage);
      // this.messages.push(newestMessage);
      this.getAllMessage();
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
    }
  }

  // 开启麦克风
  startMic() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.stream = stream;
      this.recording = true;

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;  // Choose FFT size for frequency analysis
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      this.canvas = document.getElementById('waveform') as HTMLCanvasElement;
      this.canvasContext = this.canvas.getContext('2d')!;

      this.drawWaveform();

      console.log('🎙️ 麦克风已启动', stream);

      const SAMPLE_RATE = 16000; // 目标采样率16K
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(this.audioContext.destination);

      processor.onaudioprocess = (event) => {
        if (!this.recording) return;

        const input = event.inputBuffer.getChannelData(0); // 32-bit float [-1.0, 1.0]
        const downSampled = this.downSampleBuffer(input, this.audioContext!.sampleRate, SAMPLE_RATE);
        const pcm = this.floatTo16BitPCM(downSampled);

        // 调用语音识别
        this.xunFeiApiService.speechRecognitionApi(pcm).subscribe(text => {
          this.speechRecognitionText = text;
          console.log('语音识别结果传回到C层：', text);
        });
      };
    }).catch(err => {
      console.error('🚫 无法访问麦克风:', err);
    });
  }

  // 关闭麦克风
  stopMic() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.recording = false;
    console.log('🛑 麦克风已关闭');

    if (this.audioContext && this.audioContext?.state !== 'closed') {
      this.audioContext.close();
    }
    this.xunFeiApiService.stopSpeechRecognition();
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

    if (this.recording) {
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
