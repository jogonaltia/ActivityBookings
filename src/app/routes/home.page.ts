import { ChangeDetectionStrategy, Component, Signal, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Activity } from '../domain/activity.type';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ActivityComponent } from './home/activity.component';

@Component({
  standalone: true,
  imports: [ActivityComponent],
  template: `
    <article>
      <header>
        <h2>Activities</h2>
      </header>
      <main>
        @for (activity of activities(); track activity.id) {
          <lab-activity [activity]="activity" />
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
  activities: Signal<Activity[]> = toSignal(
    this.#httpClient$.get<Activity[]>(this.#apiUrl).pipe(catchError(() => of([]))),
    { initialValue: []}
  );

  constructor(){
    this.#title.setTitle('Activities to book');
    this.#meta.updateTag({ name: 'description', content: 'Book your favourite activities' });
  }
}
