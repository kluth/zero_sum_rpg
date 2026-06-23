import { BurnerChat } from './burner-chat';

describe('Burner Chat Domain', () => {
  let chat: BurnerChat;

  beforeEach(() => {
    chat = new BurnerChat();
  });

  it('should send a valid message', () => {
    const result = chat.sendMessage('Cover me, going in.');
    expect(result.isSuccess).toBeTrue();
    expect(chat.getMessages().length).toBe(1);
    expect(chat.getMessages()[0].text).toBe('Cover me, going in.');
  });

  it('should not send an empty message', () => {
    const result = chat.sendMessage('   ');
    expect(result.isFailure).toBeTrue();
    expect(chat.getMessages().length).toBe(0);
  });
});
