import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvnonDateRangeComponent } from './avnon-date-range.component';

describe('AvnonDateRangeComponent', () => {
  let component: AvnonDateRangeComponent;
  let fixture: ComponentFixture<AvnonDateRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvnonDateRangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvnonDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
