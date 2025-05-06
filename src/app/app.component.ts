import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AvnonDateRangeComponent } from './avnon-date-range/avnon-date-range.component';
import * as DateFns from 'date-fns';
import { Period } from './models/period.model';
import { DatePipe } from '@angular/common';
import { IncomeCategories } from './models/income.model';
import { AvnonTbodyBuilderComponent } from './avnon-tbody-builder/avnon-tbody-builder.component';

@Component({
  selector: 'app-root',
  imports: [
    MatToolbarModule,
    DatePipe,

    AvnonDateRangeComponent,
    AvnonTbodyBuilderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  period!: Period;
  monthCols!: string[];
  incomeCategories: IncomeCategories[] = [
    {
      name: 'General Income',
      totals: {},
      subCategories: [
        { name: 'General Income' },
        { name: 'Enter to add Sub' }
      ],
    },
  ];

  totals: any = {
    income: {},
    expenses: {},
  };

  balanceByMonth: any = {};

  constructor() {
    this.period = {
      from: DateFns.startOfYear(new Date()),
      to: DateFns.endOfYear(new Date()),
    };
    this.computeMonthCols();
  }
  ngOnInit(): void {}
  ngOnDestroy(): void {}
  ngAfterViewInit(): void {
    document.getElementById('Income-cat0-sub0')?.focus();
  }

  monthChange(month: Date, key: string) {
    console.log(month);
    switch (key) {
      case 'from':
        this.period.from = month;
        if (this.period.to && month > this.period.to) {
          this.period.to = null;
        }
        break;

      case 'to':
        this.period.to = month;
        break;

      default:
        break;
    }

    console.log(this.period);
    this.computeMonthCols();
  }

  computeMonthCols() {
    if (this.period.from && this.period.to) {
      this.monthCols = DateFns.eachMonthOfInterval({
        start: this.period.from,
        end: this.period.to,
      }).map((m) => DateFns.format(m, 'MMM yyyy'));
    }
  }

  updateBuilder(event: AvnonTbodyBuilderComponent) {
    console.log(event);
    if (event.title === 'Income') {
      this.totals.income = event.totals;
    }

    if (event.title === 'Expenses') {
      this.totals.expenses = event.totals;
    }

    this.balanceByMonth = this.monthCols.reduce(
      (acc: any, month, index: number) => {
        const profit =
          (this.totals.income[month] || 0) - (this.totals.expenses[month] || 0);
        const openingBalance =
          index === 0 ? 0 : acc[this.monthCols[index - 1]]?.closingBalance;
        acc[month] = {
          profit: profit,
          openingBalance: openingBalance,
          closingBalance: profit + openingBalance,
        };
        return acc;
      },
      {}
    );
    // console.log(this.monthCols);
    // console.log(this.balanceByMonth);
  }
}
