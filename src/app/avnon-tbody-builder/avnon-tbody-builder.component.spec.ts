import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvnonTbodyBuilderComponent } from './avnon-tbody-builder.component';

describe('AvnonTbodyBuilderComponent', () => {
  let component: AvnonTbodyBuilderComponent;
  let fixture: ComponentFixture<AvnonTbodyBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvnonTbodyBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvnonTbodyBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
