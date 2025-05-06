import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatDateFormats,
  NativeDateAdapter,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { formatDate } from '@angular/common';

export const PICK_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input', // custom identifier for the format method
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

export class PickDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: unknown): string {
    if (displayFormat === 'input') {
      // Customize your date format here
      return formatDate(date, 'MMM-yyyy', this.locale);
    } else {
      return date.toDateString();
    }
  }
}
@Component({
  selector: 'avnon-date-range',
  templateUrl: './avnon-date-range.component.html',
  styleUrl: './avnon-date-range.component.scss',
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS },
  ],
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvnonDateRangeComponent implements OnInit, OnChanges {
  form!: FormGroup;

  @Input() placeholder?: string;
  @Input() value?: Date | any;
  @Input() min!: Date | any;
  @Input() max!: Date | any;
  @Output() monthChange = new EventEmitter<Date>();

  cd = inject(ChangeDetectorRef);

  constructor(private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('en-US'); // Or 'en-US'
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      month: new FormControl(this.value ? this.value : new Date()),
    });
    this.cd.markForCheck();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && this.form) {
      this.form.controls['month'].setValue(this.value);
      this.cd.markForCheck();
    }
  }

  get displayedMonth(): string {
    const value = new Date(this.form.value.month!);
    console.log(
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
      }).format(value)
    );
    return value
      ? new Intl.DateTimeFormat('en-US', {
          month: 'long',
          year: 'numeric',
        }).format(value)
      : '';
  }

  chosenMonthHandler(normalizedMonth: any, datepicker: any) {
    console.log(normalizedMonth);
    const ctrl = this.form.get('month');
    const date = new Date(
      normalizedMonth.getFullYear(),
      normalizedMonth.getMonth(),
      1
    );
    ctrl?.setValue(date);
    this.monthChange.emit(date);
    datepicker.close();
  }

  // Prevent day change from input manually
  noop(event: any): void {
    event.preventDefault();
    event.stopPropagation();
  }

  // setMonthAndYear(
  //   normalizedMonthAndYear: any,
  //   datepicker: MatDatepicker<any>
  // ) {
  //   console.log(normalizedMonthAndYear);
  //   console.log(this.date.value);
  //   const ctrlValue = this.date.value ?? new Date();
  //   ctrlValue.setMonth(normalizedMonthAndYear.getMonth());
  //   ctrlValue.setFullYear(normalizedMonthAndYear.getFullYear());
  //   this.date.setValue(ctrlValue);
  //   datepicker.close();
  // }
}
