export interface MessageSource {
  id?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface MessageFeedbackSignal {
  thumbType: string; // 'THUMB_UP' | 'THUMB_DOWN'
  [key: string]: any;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  type?: string; // 'USER' | 'AI'
  timestamp?: Date | string;
  thumbSignals?: MessageFeedbackSignal[];
  sources?: MessageSource[];
  metadata?: Record<string, any>;
  workflowProgresses?: any[];
  [key: string]: any;
}

export interface Thread {
  id: string;
  title?: string;
  messages: Message[];
  updatedAt?: Date | string;
}
