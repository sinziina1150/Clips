import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnInit, OnDestroy {
  isDragover = false;
  file: File | null = null;
  nextStep = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! Your Clip is being uploaded';
  inSubmission = false;
  percentage = 0;
  showPercentage = false;
  user: firebase.User | null = null;
  title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  task?: AngularFireUploadTask;
  uploadForm = new FormGroup({
    title: this.title,
  });
  ffmapeg:any
  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private Clipservices: ClipService,
    private router:Router,
    public ffmpegServices:FfmpegService
  ) {
    auth.user.subscribe((user) => (this.user = user));
    this.ffmpegServices.init()
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.task?.cancel();
  }

  storeFile($event: Event) {
    this.isDragover = false;
    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;
    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  uploadFile() {
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your Clip is being uploaded';
    this.inSubmission = true;
    this.showPercentage = true;
    this.uploadForm.disable();
    const cilpFileName = uuid();
    const clipsPath = `clips/${cilpFileName}.mp4`;
    this.task = this.storage.upload(clipsPath, this.file);
    const clipRef = this.storage.ref(clipsPath);

    this.task.percentageChanges().subscribe((progress) => {
      this.percentage = (progress as number) / 100;
    });

    this.task
      .snapshotChanges()
      .pipe(
        last(),
        switchMap(() => clipRef.getDownloadURL())
      )
      .subscribe({
        next: async (url) => {
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value as string,
            fileName: `${cilpFileName}.mp4`,
            url: url as string,
            timestamp:firebase.firestore.FieldValue.serverTimestamp()
          };
          
          const clipDocRef = await this.Clipservices.createClip(clip);
          console.log(clip);
          setTimeout(() => {
            this.router.navigate([
              'clip',clipDocRef.id
            ])
          }, 1000);

          this.alertColor = 'green';
          this.alertMsg =
            'Success! Your cilp is now ready to shart with thw world';
          this.showPercentage = false;
        },
        error: (error) => {
          this.uploadForm.enable();
          this.alertColor = 'red';
          this.alertMsg = 'Upload Faild! please try again later.';
          this.inSubmission = true;
          this.showPercentage = false;
          console.error(error);
        },
      });
  }
}
