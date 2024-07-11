import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private events: { [key: string]: { name: string; startTime: string; endTime: string }[] } = {
    '2024-07-11': [
      { name: 'Reunión', startTime: '10:00', endTime: '11:00' },
      { name: 'Almuerzo', startTime: '13:00', endTime: '14:00' },
    ],
    '2024-07-12': [{ name: 'Cita médica', startTime: '09:00', endTime: '10:00' }],
  };

  getEvents(date: string): { name: string; startTime: string; endTime: string }[] {
    return this.events[date] || [];
  }

  addEvent(date: string, event: { name: string; startTime: string; endTime: string }): void {
    if (!this.events[date]) {
      this.events[date] = [];
    }
    this.events[date].push(event);
  }
}
