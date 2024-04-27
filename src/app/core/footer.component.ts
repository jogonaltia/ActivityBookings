import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'lab-footer',
  standalone: true,
  imports: [],
  template: `
    <footer>
      <nav>
        <span>
          <a [href]="author.homepage" target="_blank"> © {{year}} {{author.name}} </a>
        </span> 
        <span>
          @if(cookiesAccepted()) {
            <span> Cookies accepted </span>
          } @else {
            <button (click)="onCookiesAccepted()" class="secondary outline">Accept Cookies</button>  
          }
        </span>
      </nav>
    </footer>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  readonly author = {
    name: 'Jonatan Gonzalez',
    homepage: 'https://www.altia.es/'
  };

  readonly year = new Date().getFullYear();

  cookiesAccepted = signal(false);

  onCookiesAccepted() {
    console.log('Cookies accepted');
    this.cookiesAccepted.set(true);
  }
}
