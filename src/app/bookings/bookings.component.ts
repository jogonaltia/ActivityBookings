import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Activity } from '../domain/activity.type';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { ActivityTitlePipe } from "./activity-title.pipe";
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'lab-bookings',
    standalone: true,
    imports: [CurrencyPipe, DatePipe, UpperCasePipe, ActivityTitlePipe, FormsModule],
    template: `
    <article>
      <header>
        <h2>{{ activity | activityTitle }}</h2>
        <div [class]="activity.status">
          <span>{{ activity.location }}</span>
          <span>{{ activity.price | currency }}</span>
          <span>{{ activity.date | date:'dd-MMM-yyyy' }}</span>
          <span>{{ activity.status | uppercase }}</span>
        </div>
      </header>
      <main>
        <div>Already Participants: {{ currentParticipants }}</div>
        <div>New Participants: {{ newParticipants() }}</div>
      </main>
      <footer>
        <h4>New Bookings</h4>
        <label for="newParticipants">How many participants want a book?</label>
        <input
          type="number"
          [ngModel]="newParticipants()"
          (ngModelChange)="onNewParticipantsChange($event)"
        />
        <button [disabled]="booked()" (click)="onBookClick()">Book now!</button>
        {{ booked() ? 'Booked!' : '' }}
      </footer>
    </article>
  `,
    styles: `
      .draft {
        color: violet;
        font-style: italic;
      }
      .published {
        color: limegreen;
      }
      .confirmed {
        color: green;
      }
      .sold_out {
        color: green;
        font-style: italic;
      }
      .done {
        color: orange;
        font-style: italic;
      }
      .cancelled {
        color: red;
        font-style: italic;
      }`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingsComponent {
  activity: Activity = {
    name: 'Paddle surf',
    location: 'Lake Leman at Lausanne',
    price: 100,
    date: new Date(2025, 7, 15),
    minParticipants: 4,
    maxParticipants: 10,
    status: 'published',
    id: 1,
    slug: 'paddle-surf',
    duration: 2,
    userId: 1,
  };
  currentParticipants = 3;

  newParticipants = signal(0);
  booked = signal(false);

  onNewParticipantsChange(newParticipants:number) {
    this.newParticipants.set(newParticipants);
  }

  onBookClick() {
    this.booked.set(true);
  }
}
