import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ACTIVITIES } from '../../domain/activities.data';
import { Meta, Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Booking } from '../../domain/booking.type';
import { Activity } from '../../domain/activity.type';

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
  #http$ = inject(HttpClient);
  #activitiesUrl = 'http://localhost:3000/activities';
  #bookingsUrl = 'http://localhost:3000/bookings';

  #title = inject(Title);
  #meta = inject(Meta);

  slug = input<string>();
  activity = computed(() => ACTIVITIES[3]);

  alreadyParticipants = computed(() => 0);
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
    effect(() => {
      const activity = this.activity();
      this.#title.setTitle(activity.name);
      const description = `${activity.name} in ${activity.location} on ${activity.date} for ${activity.price}`;
      this.#meta.updateTag({ name: 'description', content: description})
    });
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

    const newBooking: Booking = {
      id: 0,
      userId: 0,
      activityId: this.activity().id,
      date: new Date(),
      participants: this.newParticipants(),
      payment: {
        method: 'creditCard',
        amount: this.bookingAmount(),
        status: 'pending',
      },
    };

    this.#http$.post(this.#bookingsUrl, newBooking).subscribe({
      next: (result) => {
        console.log(result);
        this.#updateActivityStatus();
      },
      error: (error) => {
        console.error('Error creating booking', error);
      },
    });
  }

  #updateActivityStatus() {
    const activityUrl = `${this.#activitiesUrl}/${this.activity().id}`;
    this.#http$.put<Activity>(activityUrl, this.activity()).subscribe({
      next: () => console.log('Activity status updated'),
      error: (error) => console.error('Error updating activity', error),
    });

  }

}
