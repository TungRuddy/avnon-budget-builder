import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IncomeCategories } from '../models/income.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'avnon-tbody-builder',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    CommonModule,
  ],
  templateUrl: './avnon-tbody-builder.component.html',
  styleUrl: './avnon-tbody-builder.component.scss',
})
export class AvnonTbodyBuilderComponent implements OnInit, OnChanges {
  @Input() title?: string;
  @Input() monthCols: string[] = [];

  @Input() categories: IncomeCategories[] = [];

  @Input() totals: any = {};

  @Output() update = new EventEmitter<this>();

  inputAddCategory: string = '';

  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;

  contextMenuPosition = { x: '0px', y: '0px' };

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      if (changes['monthCols']) {
        this.buildIncomeCategories();
      }
    }
  }

  buildIncomeCategories() {
    this.categories = this.categories.map((cat) => {
      const subCategories = this.buildSubCategories(cat.subCategories);

      const totals = this.monthCols.reduce((acc: any, month) => {
        acc[month] = this.buildTotalByMonth(subCategories, month);
        return acc;
      }, {});

      return {
        ...cat,
        subCategories,
        totals,
      };
    });
    this.update.emit(this);
  }

  buildSubCategories(subCategories: any[]) {
    return subCategories.map((m) => {
      return {
        name: m.name,
        ...this.monthCols.reduce((acc: any, month) => {
          acc[month] = m[month] ? m[month] : 0;
          return acc;
        }, {}),
      };
    });
  }

  buildTotalByMonth(subCategories: any[], month: string) {
    return subCategories.reduce((acc2: any, subCat) => {
      acc2 += subCat[month] ? subCat[month] : 0;
      return acc2;
    }, 0);
  }

  computeIncomeTotals() {
    this.totals = this.monthCols.reduce((acc: any, month) => {
      acc[month] = this.categories.reduce((acc2: any, cat) => {
        acc2 += cat.totals[month] ? cat.totals[month] : 0;
        return acc2;
      }, 0);
      return acc;
    }, {});
    this.update.emit(this);
  }

  changeIncomeMonth(iCat: number, iSub: number, month: string, value: number) {
    this.categories[iCat].subCategories[iSub][month] = Number(value);
    this.categories[iCat].totals[month] = this.buildTotalByMonth(
      this.categories[iCat].subCategories,
      month
    );
    this.computeIncomeTotals();
  }

  addSubCat(iCat: number, iSub: number, name?: string) {
    this.categories[iCat].subCategories.splice(iSub + 1, 0, {
      name: name ?? '',
    });
    this.categories[iCat].subCategories = this.buildSubCategories(
      this.categories[iCat].subCategories
    );
    this.update.emit(this);
    setTimeout(() => {
      document
        .getElementById(`${this.title}-cat${iCat}-sub${iSub + 1}`)
        ?.focus();
    });
  }

  addIncomeCategory(nameCategory: string) {
    this.categories.push({
      name: nameCategory,
      subCategories: this.buildSubCategories([{ name: nameCategory }]),
      totals: {},
    });

    this.inputAddCategory = '';
    this.update.emit(this);
  }

  removeSubCat(iCat: number, iSub: number) {
    this.categories[iCat].subCategories.splice(iSub, 1);
    console.log(this.categories);
    if (this.categories[iCat].subCategories.length === 1) {
      this.categories[iCat].name = this.categories[iCat].subCategories[0].name;
    }
    this.buildIncomeCategories();
    this.computeIncomeTotals();
  }

  openContextMenu(
    event: MouseEvent,
    iCat: number,
    iSub: number,
    value: number
  ) {
    event.preventDefault();

    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { iCat: iCat, iSub: iSub, value: value };
    this.contextMenu.openMenu();
  }

  copyToAll(iCat: number, iSub: number, value: number) {
    this.monthCols.forEach((month) => {
      this.categories[iCat].subCategories[iSub][month] = Number(value);
      this.categories[iCat].totals[month] = this.buildTotalByMonth(
        this.categories[iCat].subCategories,
        month
      );
    });

    this.computeIncomeTotals();
  }

  onKey(event: KeyboardEvent) {
    const thiss = this;
    function processFocus(key: string) {
      const id = (event.target as HTMLInputElement).id;
      const arrKeys = id.split('-');
      // console.log(id, arrKeys);
      // console.log(thiss.categories);
      if (arrKeys.length === 4) {
        const iCat = Number(arrKeys[1].substring(3));
        const iSub = Number(arrKeys[2].substring(3));
        switch (key) {
          case 'ArrowLeft':
            if (thiss.monthCols.findIndex((m) => m === arrKeys[3]) === 0) {
              arrKeys.splice(3, 1);
            } else {
              arrKeys[3] =
                thiss.monthCols[
                  thiss.monthCols.findIndex((m) => m === arrKeys[3]) - 1
                ];
            }

            break;
          case 'ArrowRight':
            arrKeys[3] =
              thiss.monthCols[
                thiss.monthCols.findIndex((m) => m === arrKeys[3]) + 1
              ];
            break;
          case 'ArrowUp':
            if (thiss.categories[iCat].subCategories[iSub - 1]) {
              arrKeys[2] = 'sub' + String(iSub - 1);
            } else if (thiss.categories[iCat - 1]) {
              arrKeys[1] = 'cat' + String(iCat - 1);
              arrKeys[2] =
                'sub' +
                String(thiss.categories[iCat - 1].subCategories.length - 1);
            } else if (arrKeys[0] === 'Expenses') {
              if (document.getElementById('Income-cat0-sub0-' + arrKeys[3])) {
                arrKeys[0] = ''; // to remove focus function
                arrKeys[1] = '';
                const lastCatSub = document
                  .getElementById('Income-cat0-sub0-' + arrKeys[3])
                  ?.getAttribute('lastcatsub');
                document
                  .getElementById(`Income-${lastCatSub}-${arrKeys[3]}`)
                  ?.focus();
              }
            }
            break;
          case 'ArrowDown':
            if (thiss.categories[iCat].subCategories[iSub + 1]) {
              arrKeys[2] = 'sub' + String(iSub + 1);
            } else if (thiss.categories[iCat + 1]) {
              arrKeys[1] = 'cat' + String(iCat + 1);
              arrKeys[2] = 'sub0';
            } else if (arrKeys[0] === 'Income') {
              arrKeys[1] = '';
              document
                .getElementById(`Expenses-cat0-sub0-${arrKeys[3]}`)
                ?.focus();
            }
            break;
        }
      } else if (arrKeys.length === 3) {
        const iCat = Number(arrKeys[1].substring(3));
        const iSub = Number(arrKeys[2].substring(3));
        switch (key) {
          case 'ArrowRight':
            arrKeys.push(thiss.monthCols[0]);
            break;
          case 'ArrowUp':
            if (thiss.categories[iCat].subCategories[iSub - 1]) {
              arrKeys[2] = 'sub' + String(iSub - 1);
            } else if (iSub === 0 && thiss.categories[iCat - 1]) {
              arrKeys[1] = 'cat' + String(iCat - 1);
              arrKeys[2] =
                'sub' + String(thiss.categories[iCat - 1].subCategories.length);
            } else if (thiss.categories[iCat - 1]) {
              arrKeys[1] = 'cat' + String(iCat - 1);
              arrKeys[2] =
                'sub' +
                String(thiss.categories[iCat - 1].subCategories.length - 1);
            } else if (arrKeys[0] === 'Expenses') {
              arrKeys[0] = '';
              arrKeys[1] = '';
              document.getElementById(`Income-inputAddCategory`)?.focus();
            }
            break;
          case 'ArrowDown':
            if (thiss.categories[iCat].subCategories[iSub + 1]) {
              arrKeys[2] = 'sub' + String(iSub + 1);
            } else if (
              iSub ===
              thiss.categories[iCat].subCategories.length - 1
            ) {
              arrKeys[2] = 'sub' + String(iSub + 1);
            } else if (thiss.categories[iCat + 1]) {
              arrKeys[1] = 'cat' + String(iCat + 1);
              arrKeys[2] = 'sub0';
            } else {
              arrKeys[1] = '';
              arrKeys[2] = '';
              document
                .getElementById(`${thiss.title}-inputAddCategory`)
                ?.focus();
            }

            break;
        }
      } else {
        // length = 2
        switch (key) {
          case 'ArrowUp':
            if (
              thiss.categories[thiss.categories.length - 1] &&
              thiss.categories[thiss.categories.length - 1].subCategories.length
            ) {
              arrKeys[0] = String(thiss.title);
              arrKeys[1] = 'cat' + String(thiss.categories.length - 1);
              arrKeys.push(
                'sub' +
                  String(
                    thiss.categories[thiss.categories.length - 1].subCategories
                      .length
                  )
              );
            } else {
              if (arrKeys[0] === 'Expenses') {
                arrKeys[0] = 'Income';
              }
            }
            break;
          case 'ArrowDown':
            if (arrKeys[0] === 'Income') {
              if (document.getElementById(`Expenses-cat0-sub0`)) {
                arrKeys[0] = '';
                arrKeys[1] = '';
                document.getElementById(`Expenses-cat0-sub0`)?.focus();
              } else {
                arrKeys[0] = 'Expenses';
              }
            }
            break;
        }
      }

      if (document.getElementById(arrKeys.join('-'))) {
        document.getElementById(arrKeys.join('-'))?.focus();
      }
    }

    switch (event.key) {
      case 'ArrowLeft':
        processFocus(event.key);
        break;
      case 'ArrowRight':
        processFocus(event.key);
        break;
      case 'ArrowUp':
        processFocus(event.key);
        break;
      case 'ArrowDown':
        processFocus(event.key);
        break;
    }
  }
}
