import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
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
        <h4>Participants</h4>
        <div>Already Participants: {{ alreadyParticipants }}</div>
        <ul>
          <li>New Participants: {{ newParticipants() }}</li>
          <li>Total Participants: {{ totalParticipants() }}</li>
          <li>Remaining places: {{ remainingPlaces() }} </li>
        </ul>
      </main>
      <footer>
        <h4>New Bookings</h4>
        @if(remainingPlaces() > 0) {
          <label for="newParticipants">How many participants want a book?</label>
          <input
            type="number"
            [ngModel]="newParticipants()"
            (ngModelChange)="onNewParticipantsChange($event)"
            min="0"
            [max]="maxParticipants"
          />
        } @else {
          <span>Sorry, no more places available!</span>
          <button class="secondary outline" (click)="onNewParticipantsChange(0)">Reset</button>
        }
        <button [disabled]="canNotBook()" (click)="onBookClick()">Book now for {{ bookingAmount() | currency }}!</button>
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
  readonly activity: Activity = {
    name: 'Paddle surf',
    location: 'Lake Leman at Lausanne',
    price: 125,
    date: new Date(2025, 7, 15),
    minParticipants: 5,
    maxParticipants: 9,
    status: 'published',
    id: 1,
    slug: 'paddle-surf',
    duration: 2,
    userId: 1,
  };
  readonly alreadyParticipants = 3;
  readonly maxParticipants = this.activity.maxParticipants - this.alreadyParticipants;

  readonly totalParticipants = computed(() => this.alreadyParticipants + this.newParticipants());
  readonly remainingPlaces = computed(() => this.activity.maxParticipants - this.totalParticipants());

  readonly canNotBook = computed(() => this.booked() || this.newParticipants() === 0);
  readonly bookingAmount = computed(() => this.newParticipants() * this.activity.price);

  readonly newParticipants = signal(0);
  readonly booked = signal(false);

  constructor() {
    effect(() => {
      const totalParticipants = this.totalParticipants();
      const activity = this.activity;
      if (totalParticipants >= activity.maxParticipants) {
        activity.status = 'sold-out';
      } else if (totalParticipants >= activity.minParticipants) {
        activity.status = 'confirmed';
      } else {
        activity.status = 'published';
      }
    });
  }

  onNewParticipantsChange(newParticipants:number) {
    this.newParticipants.set(newParticipants);
  }

  onBookClick() {
    this.booked.set(true);
  }
}
