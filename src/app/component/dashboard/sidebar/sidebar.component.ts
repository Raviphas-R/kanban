import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-dashboard-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  onclick(event: Event) {
    document
      .querySelector('.sidebar__icons.active')
      ?.classList.remove('active');
    const target = event.target as HTMLElement;
    if (target.matches('.sidebar__icons i, .sidebar__icons p')) {
      target.parentElement?.classList.add('active');
      return;
    }
    target.classList.add('active');
  }
}
