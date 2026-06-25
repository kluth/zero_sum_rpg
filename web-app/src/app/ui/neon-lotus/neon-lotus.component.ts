import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedService, FeedMessage } from '../../services/feed.service';
import { Subscription } from 'rxjs';

interface HologramItem {
  id: string;
  name: string;
  price: number;
  rarity: string;
}

@Component({
  selector: 'app-neon-lotus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './neon-lotus.component.html',
  styleUrls: ['./neon-lotus.component.scss']
})
export class NeonLotusComponent implements OnInit, OnDestroy {
  vipMessages: FeedMessage[] = [];
  exclusiveItems: HologramItem[] = [
    { id: 'nl-1', name: 'Neural Lace Mk IV', price: 25000, rarity: 'Legendary' },
    { id: 'nl-2', name: 'Quantum Bypass Key', price: 8500, rarity: 'Epic' },
    { id: 'nl-3', name: 'Synthetic Memory Engram', price: 120000, rarity: 'Mythic' }
  ];
  private sub?: Subscription;

  constructor(private feedService: FeedService) {}

  ngOnInit(): void {
    this.sub = this.feedService.streamMessages().subscribe(msg => {
      if (msg.network === 'neon-lotus') {
        this.vipMessages.unshift(msg);
        if (this.vipMessages.length > 10) this.vipMessages.pop();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
