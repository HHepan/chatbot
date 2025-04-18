import {AfterViewChecked, Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements AfterViewChecked {
  @ViewChild('chatBody') private chatBody: any;
  message: string = 'message1';
  messages: { text: string, sender: string }[] = [
    { text: 'Hello, how can I assist you today?', sender: 'bot' }
  ];

  sendMessage() {
    console.log('Sending message');
    if (this.message.trim()) {
      this.messages.push({ text: this.message, sender: 'user' });
      this.message = this.message + '1';

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
}
