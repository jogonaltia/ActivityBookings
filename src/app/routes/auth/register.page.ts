import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <p>register works!</p>
    <a routerLink="/auth/login">Login</a>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class RegisterPage {

}
