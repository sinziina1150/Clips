import { Injectable } from '@angular/core';
import { createFFmpeg } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  isReady = false;

  public ffmpeg: any;

  constructor() {
    this.ffmpeg.createFFmpeg({log:true})
  }

  async init() {
    if (this.isReady) {
      return;
    }

    await this.ffmpeg.load();
    this.isReady = true;
  }
}
