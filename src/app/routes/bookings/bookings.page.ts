import { Component, computed, effect, input, signal } from '@angular/core';
import { NULL_ACTIVITY } from '../../domain/activity.type';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ACTIVITIES } from '../../domain/activities.data';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, UpperCasePipe, FormsModule],
  template: `
    @if(activity(); as activity) {
      <article>
        <header>
          <h2>{{ activity.name }}</h2>
          <div [class]="activity.status">
            <span>{{ activity.location }}</span>
            <span>{{ activity.price | currency }}</span>
            <span>{{ activity.date | date:'dd-MMM-yyyy' }}</span>
            <span>{{ activity.status | uppercase }}</span>
          </div>
        </header>
        <main>
          <h4>Participants</h4>
          <div>Already Participants: {{ alreadyParticipants() }}</div>
          <div>Max Participants: {{ activity.maxParticipants }}</div>
          <ul>
            <li>New Participants: {{ newParticipants() }}</li>
            <li>Total Participants: {{ totalParticipants() }}</li>
            <li>Remaining places: {{ remainingPlaces() }} </li>
          </ul>
          <div>
            @for(participant of participants(); track participant.id) {
              <span>{{ participant.id }}</span>
            } @empty {
              <span>No participants yet</span>
            }
          </div>
        </main>
        <footer>
          @if (isBookable()) {
            <h4>New Bookings</h4>
              @if(remainingPlaces() > 0) {
                <label for="newParticipants">How many participants want a book?</label>
                <input
                  type="number"
                  [ngModel]="newParticipants()"
                  (ngModelChange)="onNewParticipantsChange($event)"
                  min="0"
                  [max]="maxParticipants()"
                />
              } @else {
                <div>
                  <button class="secondary outline" (click)="onNewParticipantsChange(0)">
                    Reset
                  </button>
                  <span>No more places availables</span>
                </div>
              }
              <button [disabled]="booked() || newParticipants() === 0" (click)="onBookClick()">
                Book {{ newParticipants() }} places now for {{ bookingAmount() | currency }}!
              </button>
              <div>{{ bookedMessage() }}</div>
          }
        </footer>
      </article>
    }
  `,
})
export default class BookingsPage {
  slug = input<string>();
  activity = computed(() => ACTIVITIES.find((a) => a.slug === this.slug()) || NULL_ACTIVITY);

  alreadyParticipants = computed(() => Math.floor(Math.random() * this.activity().maxParticipants));
  maxParticipants = computed(() => this.activity().maxParticipants - this.alreadyParticipants());
  isBookable = computed(() => ['published', 'confirmed'].includes(this.activity().status));

  newParticipants = signal(0);
  booked = signal(false);
  participants = signal<{ id:number }[]>([]);

  totalParticipants = computed(() => this.alreadyParticipants() + this.newParticipants());
  remainingPlaces = computed(() => this.activity().maxParticipants - this.totalParticipants());
  bookingAmount = computed(() => this.newParticipants() * this.activity().price);

  bookedMessage = computed(() => {
    if(this.booked()) return `Booked USD ${this.bookingAmount()}`;
    return '';
  });

  constructor() {
    effect(
      () => {
        this.participants.update((participants) => {
          participants.splice(0, participants.length);
          for( let i = 0; i < this.totalParticipants(); i++) {
            participants.push({ id: participants.length + 1});
          }
          return participants;
        });
      },
      {
        allowSignalWrites: true,
      }
    );
    effect(() => {
      if(!this.isBookable()) {
        return;
      }
      const totalParticipants = this.totalParticipants();
      const activity = this.activity();
      let newStatus = activity.status;
      if (totalParticipants >= activity.maxParticipants) {
        newStatus = 'sold-out';
      } else if (totalParticipants >= activity.minParticipants) {
        newStatus = 'confirmed';
      } else {
        newStatus = 'published';
      }
      activity.status = newStatus;
    });
  }

  onNewParticipantsChange(newParticipants: number) {
    if(newParticipants>this.maxParticipants()) {
      newParticipants = this.maxParticipants();
    }
    this.newParticipants.set(newParticipants);
  }

  onBookClick() {
    this.booked.set(true);
  }
}
