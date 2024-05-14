import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ModelSignal, input, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Activity } from '../../domain/activity.type';

@Component({
  selector: 'lab-activity',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div>
      <span>
        <input
          type="checkbox"
          name=""
          class="seconday outline"
          (click)="toggleFavorite(activity().slug)"
        />
      </span>
      <span>
        <a [routerLink]="['/bookings', activity().slug]">{{ activity().name }}</a>
      </span>
      <span>{{ activity().location }}</span>
      <span>{{ activity().price | currency }}</span>
      <span>{{ activity().date | date:'dd-MMM-yyyy' }}</span>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityComponent {
  activity = input.required<Activity>();

  favorites: ModelSignal<string[]> = model<string[]>([]);

  toggleFavorite(slug: string): void {
    this.favorites.update((favorites) => {
      if(favorites.includes(slug)) {
        return favorites.filter((favorite) => favorite !== slug);
      }
      return favorites.concat(slug);
    });
  }
}
