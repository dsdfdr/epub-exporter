export enum EventType {
  DetectBooks = 'DetectBooks',
  SetBooks = 'SetBooks',
}

type Callback = (data?: object) => void;

interface Message {
  type: EventType;
  data?: object;
}

interface Listeners {
  type: EventType;
  callback: Callback;
}

export default class EventHandler {
  private listeners: Listeners[] = [];

  constructor(private chrome = window.chrome) {
    this.bindListeners();
  }

  sendToExtension(type: EventType, data?: object) {
    this.chrome.runtime.sendMessage({ type, data });
  }

  sendToActiveTab(type: EventType, data?: object) {
    this.chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      this.chrome.tabs.sendMessage(tabs[0].id, { type, data });
    });
  }

  subscribe(type: EventType, callback: Callback) {
    this.listeners.push({ type, callback });
  }

  private bindListeners() {
    this.chrome.runtime.onMessage.addListener((message: Message) => {
      const { type, data } = message;

      this.listeners.forEach(listener => {
        if (listener.type === type) {
          listener.callback(data);
        }
      });
    });
  }
}
