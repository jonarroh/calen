import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from './event.service';
import { format, getDaysInMonth, getDay, startOfMonth, addDays, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  month: string;
  year: number;
  daysInMonth: Date[] = [];
  showModal: boolean = false;
  eventName: string = '';
  eventStartTime: string = '';
  eventEndTime: string = '';
  eventDate: string = '';
  selectedDate: Date | null = null;

  constructor(private eventService: EventService) {
    const today = new Date();
    this.month = format(today, 'LLLL', { locale: es });
    this.year = today.getFullYear();
    this.generateCalendar();
  }

  generateCalendar() {
    this.daysInMonth = [];
    const date = new Date(this.year, this.getMonthNumber(this.month), 1);
    const firstDay = getDay(startOfMonth(date));
    const lastDay = getDaysInMonth(date);

    for (let i = 0; i < firstDay; i++) {
      this.daysInMonth.push(addDays(startOfMonth(date), i - firstDay));
    }

    for (let i = 1; i <= lastDay; i++) {
      this.daysInMonth.push(new Date(this.year, this.getMonthNumber(this.month), i));
    }

    for (let i = lastDay + 1; i <= 42 - this.daysInMonth.length; i++) {
      this.daysInMonth.push(addDays(date, i - lastDay));
    }
  }

  getMonthName(month: number): string {
    return format(new Date(this.year, month), 'LLLL', { locale: es });
  }

  getMonthNumber(month: string): number {
    const date = new Date(this.year, 0);
    return Array.from({ length: 12 }, (_, i) => format(addMonths(date, i), 'LLLL', { locale: es })).indexOf(month);
  }

  prevMonth() {
    const date = subMonths(new Date(this.year, this.getMonthNumber(this.month), 1), 1);
    this.month = this.getMonthName(date.getMonth());
    this.year = date.getFullYear();
    this.generateCalendar();
  }

  nextMonth() {
    const date = addMonths(new Date(this.year, this.getMonthNumber(this.month), 1), 1);
    this.month = this.getMonthName(date.getMonth());
    this.year = date.getFullYear();
    this.generateCalendar();
  }

  getEvents(date: Date) {
    const dateString = this.formatDate(date);
    return this.eventService.getEvents(dateString);
  }

  formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  openModal(date: Date | null) {
    if (date) {
      this.selectedDate = date;
      this.eventDate = this.formatDate(date);
    } else {
      this.selectedDate = null;
      this.eventDate = '';
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.eventName = '';
    this.eventStartTime = '';
    this.eventEndTime = '';
    this.eventDate = '';
    this.selectedDate = null;
  }

  saveEvent() {
    const now = new Date();
    const selectedDateTime = new Date(`${this.eventDate}T${this.eventStartTime}`);
    const tenMinutesBefore = new Date(selectedDateTime.getTime() - 10 * 60000);

    if (selectedDateTime < now) {
      alert('No puedes agregar un evento en el pasado.');
      return;
    }

    if (now > tenMinutesBefore) {
      alert('Debes agregar el evento al menos 10 minutos antes de la hora de inicio.');
      return;
    }

    const events = this.getEvents(new Date(this.eventDate));
    const conflict = events.some((event: any) => 
      event.startTime <= this.eventStartTime && event.endTime >= this.eventStartTime
    );

    if (conflict) {
      alert('Ya hay un evento en esa hora.');
      return;
    }

    const event = {
      name: this.eventName,
      startTime: this.eventStartTime,
      endTime: this.eventEndTime
    };

    this.eventService.addEvent(this.eventDate, event);
    this.closeModal();
  }
}
