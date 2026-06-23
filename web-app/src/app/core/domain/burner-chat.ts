import { Result } from '../design-system/result';

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'player' | 'team';
}

export class BurnerChat {
  private messages: ChatMessage[] = [];
  private idCounter = 0;

  public sendMessage(text: string): Result<ChatMessage> {
    if (!text || text.trim() === '') return Result.failure('Message cannot be empty');
    const msg: ChatMessage = { id: ++this.idCounter, text: text.trim(), sender: 'player' };
    this.messages.push(msg);
    return Result.success(msg);
  }

  public getMessages(): ChatMessage[] {
    return this.messages;
  }
}
