import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedService, FeedMessage } from '../../services/feed.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ocgf',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ocgf.component.html',
  styleUrls: ['./ocgf.component.scss']
})
export class OcgfComponent implements OnInit, OnDestroy {
  feedItems: FeedMessage[] = [];
  citizenId: string = 'CTZ-492-811';
  showAlert: boolean = false;
  alertMessage: string = '';
  private sub?: Subscription;

  constructor(private feedService: FeedService) {}

  ngOnInit(): void {
    this.sub = this.feedService.streamMessages().subscribe(msg => {
      if (msg.network === 'ocgf') {
        if (msg.metadata?.isAlert) {
          this.triggerAlert(msg.content);
        } else {
          this.feedItems.unshift(msg);
          if (this.feedItems.length > 20) this.feedItems.pop();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private triggerAlert(message: string) {
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }
}
