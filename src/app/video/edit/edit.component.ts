import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import IClip from 'src/app/models/cilp.model';
import { ModalService } from 'src/app/services/modal.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { validate } from 'uuid';
import { ClipService } from 'src/app/services/clip.service';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null;
  clipID = new FormControl('');
  title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  editForm = new FormGroup({
    title: this.title,
    id: this.clipID,
  });

  @Output() update = new EventEmitter();
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! Updating clip';
  inSubmission = false;
  constructor(private modal: ModalService, private clipSerivce: ClipService) {}

  ngOnInit(): void {
    this.modal.register('editClip');
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip');
  }

  ngOnChanges(): void {
    if (!this.activeClip) {
      return;
    }
    this.showAlert = false;
    this.clipID.setValue(this.activeClip.docID as string);
    this.title.setValue(this.activeClip.title);
  }

  async submit() {
    if (!this.activeClip) {
      return;
    }
    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Updating clip';

    try {
      await this.clipSerivce.updateClip(
        this.clipID.value as string,
        this.title.value as string
      );
    } catch (error) {
      this.inSubmission = false;
      this.alertColor = 'red';
      this.alertMsg = 'Something went wrong. Try agin later';
    }

    this.activeClip.title = this.title.value as string;
    this.update.emit(this.activeClip);
    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMsg = 'Success!';
  }
}
