import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
import { combineLatest, forkJoin } from 'rxjs';

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
  screenshots: string[] = [];
  selectedScreenshot = '';
  screenshotTask?: AngularFireUploadTask;

  user: firebase.User | null = null;
  title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  task?: AngularFireUploadTask;
  uploadForm = new FormGroup({
    title: this.title,
  });
  ffmapeg: any;
  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private Clipservices: ClipService,
    private router: Router,
    public ffmpegServices: FfmpegService
  ) {
    auth.user.subscribe((user) => (this.user = user));
    this.ffmpegServices.init();
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.task?.cancel();
  }

  async storeFile($event: Event) {
    if (this.ffmpegServices.isRunning) {
      return;
    }
    this.isDragover = false;
    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;
    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }
    this.screenshots = await this.ffmpegServices.getScreenshots(this.file);
    this.selectedScreenshot = this.selectedScreenshot[0];
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  async uploadFile() {
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your Clip is being uploaded';
    this.inSubmission = true;
    this.showPercentage = true;
    this.uploadForm.disable();
    const cilpFileName = uuid();
    const clipsPath = `clips/${cilpFileName}.mp4`;
    const screenBlob = await this.ffmpegServices.blobFromURL(
      this.selectedScreenshot
    );
    const screenshotPath = `screenshots/${cilpFileName}.png`;
    this.task = this.storage.upload(clipsPath, this.file);
    const clipRef = this.storage.ref(clipsPath);
    const screenshotRef = this.storage.ref(screenshotPath)
    this.screenshotTask = this.storage.upload(screenshotPath, screenBlob);
    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, scrennshotProgress] = progress;
      if (!clipProgress || !scrennshotProgress) {
        return;
      }
      const total = clipProgress + scrennshotProgress;
      this.percentage = (total as number) / 200;
    });
    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() => forkJoin([clipRef.getDownloadURL(),screenshotRef.getDownloadURL()]))
      )
      .subscribe({
        next: async (urls) => {
          const [clipURL,screenshotURL] = urls
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value as string,
            fileName: `${cilpFileName}.mp4`,
            url:clipURL,
            screenshotURL,
            screenshotFileName:`${cilpFileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };
          const clipDocRef = await this.Clipservices.createClip(clip);
          console.log(clip);
          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id]);
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
