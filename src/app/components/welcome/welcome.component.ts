import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-welcome',
  imports: [NgIf],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent
  implements OnInit, AfterViewInit, OnDestroy {

  showVideo = true;
  audio: HTMLAudioElement | null = null;

  @ViewChild('introVideo')
  introVideo!: ElementRef<HTMLVideoElement>;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.audio = new Audio('assets/audio/intro-theme.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.25;
    this.audio.play().catch(() => {});
  }

  ngAfterViewInit(): void {
    const video = this.introVideo?.nativeElement;
    if (!video) return;

    video.muted = true;
    video.play().catch(() => {
      // If browser blocks autoplay → skip intro
      this.showVideo = false;
    });
  }

  onVideoEnded(): void {
    this.stopMedia();
    this.showVideo = false;
  }

  skipIntro(): void {
    this.stopMedia();
    this.showVideo = false;
  }

  start(): void {
    this.router.navigate(['/setup']);
  }

  ngOnDestroy(): void {
    this.stopMedia();
  }
  
  enableSound(): void {
  const video = this.introVideo.nativeElement;
  video.muted = false;
  video.volume = 1;
}

  private stopMedia(): void {
    if (this.introVideo?.nativeElement) {
      this.introVideo.nativeElement.pause();
    }

    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }
}
