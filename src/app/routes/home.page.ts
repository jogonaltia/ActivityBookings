import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Activity } from '../domain/activity.type';

@Component({
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <article>
      <header>
        <h2>Activities</h2>
      </header>
      <main>
        @for (activity of activities(); track activity.id) {
          <div>
            <span>
              <a [routerLink]="['/bookings', activity.slug]">{{ activity.name }}</a>
            </span>
            <span>{{ activity.location }}</span>
            <span>{{ activity.price | currency }}</span>
            <span>{{ activity.date | date:'dd-MMM-yyyy' }}</span>
          </div>
        }
      </main>
    </article>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class HomePage {
  #title = inject(Title);
  #meta = inject(Meta);

  #apiUrl = 'http://localhost:3000/activities';

  #httpClient$: HttpClient = inject(HttpClient);
  activities = signal<Activity[]>([]);

  constructor(){
    this.#title.setTitle('Activities to book');
    this.#meta.updateTag({ name: 'description', content: 'Book your favourite activities' });

    this.#httpClient$.get<Activity[]>(this.#apiUrl).subscribe((result) => {
      this.activities.set(result);
    });
  }
}
