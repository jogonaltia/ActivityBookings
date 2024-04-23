import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lab-header',
  standalone: true,
  imports: [],
  template: `
    <header>
      <nav>
        <a href=""> Activity Bookings </a>
      </nav>
    </header>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

}
