import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedService, FeedMessage } from '../../services/feed.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-whispernet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whispernet.component.html',
  styleUrls: ['./whispernet.component.scss']
})
export class WhispernetComponent implements OnInit, OnDestroy {
  messages: FeedMessage[] = [];
  timerText: string = '00:00:00';
  private sub?: Subscription;
  private timerInterval?: any;

  constructor(private feedService: FeedService) {}

  ngOnInit(): void {
    this.sub = this.feedService.streamMessages().subscribe(msg => {
      if (msg.network === 'whispernet') {
        this.messages.push(msg);
        if (this.messages.length > 50) this.messages.shift();
      }
    });

    this.startTimer();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private startTimer() {
    let seconds = 0;
    this.timerInterval = setInterval(() => {
      seconds++;
      const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      this.timerText = `${h}:${m}:${s}`;
    }, 1000);
  }
}
