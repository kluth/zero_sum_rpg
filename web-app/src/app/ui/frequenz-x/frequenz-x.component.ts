import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedService, FeedMessage } from '../../services/feed.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-frequenz-x',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './frequenz-x.component.html',
  styleUrls: ['./frequenz-x.component.scss']
})
export class FrequenzXComponent implements OnInit, OnDestroy {
  messages: FeedMessage[] = [];
  isHijacked: boolean = true;
  private sub?: Subscription;

  constructor(private feedService: FeedService) {}

  ngOnInit(): void {
    this.sub = this.feedService.streamMessages().subscribe(msg => {
      if (msg.network === 'frequenz-x') {
        this.messages.push(msg);
        if (this.messages.length > 30) this.messages.shift();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
