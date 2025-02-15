import { Component } from '@angular/core';
import { BoardComponent } from './components/board/board.component';
import { BoardStore } from './store/board.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BoardComponent],
  template: `
    <app-board></app-board>
  `,
  providers: [BoardStore]

})
export class AppComponent {}
