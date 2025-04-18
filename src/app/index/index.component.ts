import {AfterViewChecked, Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements AfterViewChecked {
  @ViewChild('chatBody') private chatBody: any;
  message: string = '';
  messages: { text: string, sender: string }[] = [
    { text: 'Hello, how can I assist you today?', sender: 'bot' }
  ];
  mode: 'text' | 'audio' = 'text'; // Default to 'text' mode

  sendMessage() {
    console.log('Sending message');
    if (this.message.trim()) {
      this.messages.push({ text: this.message, sender: 'user' });
      this.message = '';

      // 模拟机器人的响应
      setTimeout(() => {
        this.messages.push({ text: 'Thank you for your message!', sender: 'bot' });
        this.scrollToBottom();
      }, 1000);
    }
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

  toggleMode(mode: 'text' | 'audio') {
    this.mode = mode;
  }


  /*----------------------------------------------------------------------------------------------*/
  recording = false;
  stream: MediaStream | null = null;
  audioContext: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  dataArray: Uint8Array | null = null;
  canvas: HTMLCanvasElement | null = null;
  canvasContext: CanvasRenderingContext2D | null = null;

  startMic() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.stream = stream;
        this.recording = true;

        // Initialize the AudioContext and AnalyserNode
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;  // Choose FFT size for frequency analysis
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        // Create a MediaStreamAudioSourceNode
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);

        // Set up the canvas for waveform drawing
        this.canvas = document.getElementById('waveform') as HTMLCanvasElement;
        this.canvasContext = this.canvas.getContext('2d')!;

        // Start the drawing loop
        this.drawWaveform();

        console.log('🎙️ 麦克风已启动', stream);
      })
      .catch(err => {
        console.error('🚫 无法访问麦克风:', err);
      });
  }

  stopMic() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.recording = false;
    console.log('🛑 麦克风已关闭');

    // Stop the audio context and waveform drawing
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  // Function to draw waveform continuously
  drawWaveform() {
    if (!this.analyser || !this.canvasContext || !this.dataArray) return;

    // Clear the previous frame
    this.canvasContext.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

    // Get the frequency data from the analyser
    this.analyser.getByteTimeDomainData(this.dataArray);

    // Draw the waveform
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

    // Continuously draw every 16ms (60 FPS)
    if (this.recording) {
      requestAnimationFrame(() => this.drawWaveform());
    }
  }
}
