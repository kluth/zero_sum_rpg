import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryScanner, Item } from '../../core/domain/inventory-scanner';
import { BurnerChat, ChatMessage } from '../../core/domain/burner-chat';
import { DesignSystemConfig } from '../../core/design-system/design-tokens';

@Component({
  selector: 'app-player-uplink',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-uplink.component.html',
  styleUrls: ['./player-uplink.component.css'],
  host: {
    '[style.display]': '"block"',
    '[style.width]': '"100vw"',
    '[style.height]': '"100dvh"',
    '[style.overflow]': '"hidden"'
  }
})
export class PlayerUplinkComponent implements OnInit {
  public scanner = new InventoryScanner();
  public chat = new BurnerChat();

  public scanInput: string = '';
  public chatInput: string = '';
  public errorMsg: string | null = null;

  public paperWhiteColor = '#fff';
  public coolGrayColor = '#bdc3c7';
  public inkColor = '#1a1a1a';
  public offWhiteColor = '#f8f9fa';

  ngOnInit() {
    this.paperWhiteColor = DesignSystemConfig.getColor('PaperWhite').getValue() || '#fff';
    this.coolGrayColor = DesignSystemConfig.getColor('CoolGray').getValue() || '#ccc';
    this.inkColor = DesignSystemConfig.getColor('Ink').getValue() || '#000';
    this.offWhiteColor = DesignSystemConfig.getColor('OffWhite').getValue() || '#eee';
  }

  public getItems(): Item[] {
    return this.scanner.getItems();
  }

  public getMessages(): ChatMessage[] {
    return this.chat.getMessages();
  }

  public onScan() {
    this.errorMsg = null;
    const result = this.scanner.scanItem(this.scanInput);
    if (result.isFailure) {
      this.errorMsg = result.getError();
    } else {
      this.scanInput = '';
    }
  }

  public onSendChat() {
    this.errorMsg = null;
    const result = this.chat.sendMessage(this.chatInput);
    if (result.isFailure) {
      this.errorMsg = result.getError();
    } else {
      this.chatInput = '';
    }
  }
}
