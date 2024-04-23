import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header.component';
import { FooterComponent } from './core/footer.component';

@Component({
  selector: 'lab-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <lab-header/>
    <p>Angular works!</p>

    <router-outlet />
    <lab-footer/>
  `,
  styles: [],
})
export class AppComponent {
  title = 'ActivityBookings';
}
