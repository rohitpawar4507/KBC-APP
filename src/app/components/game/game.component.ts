import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { GameService } from '../../services/game.service';
import { ApiService } from '../../services/api.service';
import { Question, Answer, GameState } from '../../models/question.model';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-game',
  imports: [NgIf, NgFor],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  state!: GameState;
  current!: Question;
  displayed: Answer[] = [];
  timer = 45;
  timerId: any;
  selected: Answer | null = null;
  showResult = false;
  isCorrect = false;
  showAudience = false;
  audienceData: { option: string; percentage: number }[] = [];
  private sub!: Subscription;

  // Audio files
  correctAudio = new Audio('assets/audio/CorrectAnswer.mp3');
  wrongAudio = new Audio('assets/audio/wrongAnswer.mp3');
  lifelineAudio = new Audio('assets/audio/tickSound.mp3');
  timerAudio = new Audio('assets/audio/Timer.mp3');
  timerFastAudio = new Audio('assets/audio/TimerFast.mp3'); // Use separate file if you have it

  constructor(
    private router: Router,
    private gs: GameService,
    private api: ApiService
  ) {
    // Set audio volumes
    this.correctAudio.volume = 0.5;
    this.wrongAudio.volume = 0.5;
    this.lifelineAudio.volume = 0.3;
    this.timerAudio.volume = 0.2;
    this.timerFastAudio.volume = 0.3;
  }

  ngOnInit() {
    this.sub = this.gs.stateObs.subscribe(s => {
      this.state = s;
      if (s.questions.length && s.currentQuestion < s.questions.length) {
        this.current = s.questions[s.currentQuestion];
        this.displayed = [...this.current.answer];
        this.resetTimer();
      } else {
        if (s.questions.length === 0) this.router.navigate(['/setup']);
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    this.clearTimer();
    this.stopAllAudio();
  }

  resetTimer() {
    this.clearTimer();
    this.timer = 45;

    // Start normal ticking sound
    this.timerAudio.loop = true;
    this.timerAudio.currentTime = 0;
    this.timerAudio.play().catch(() => {});

    this.timerId = setInterval(() => {
      this.timer--;

      // Switch to fast tick in last 10 seconds
      if (this.timer === 10) {
        this.timerAudio.pause();
        this.timerFastAudio.loop = true;
        this.timerFastAudio.currentTime = 0;
        this.timerFastAudio.play().catch(() => {});
      }

      if (this.timer <= 0) this.timeUp();
    }, 1000);
  }

  clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    this.timerAudio.pause();
    this.timerAudio.currentTime = 0;

    this.timerFastAudio.pause();
    this.timerFastAudio.currentTime = 0;
  }

  stopAllAudio() {
    [this.correctAudio, this.wrongAudio, this.lifelineAudio, this.timerAudio, this.timerFastAudio]
      .forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
  }

  timeUp() {
    this.clearTimer();
    this.wrongAudio.play().catch(() => {});
    setTimeout(() => {
      alert('Time up! Game over');
      this.router.navigate(['/result']);
    }, 100);
  }

  pick(a: Answer) {
    if (!this.state || !this.current || this.selected) return;

    this.selected = a;
    this.clearTimer();

    setTimeout(() => this.revealAnswer(), 800);
  }

  revealAnswer() {
    if (!this.selected) return;

    this.showResult = true;
    this.isCorrect = this.selected.correct;

    if (this.isCorrect) {
      this.correctAudio.play().catch(() => {});
      setTimeout(() => this.nextQ(), 1500);
    } else {
      this.wrongAudio.play().catch(() => {});
      setTimeout(() => this.router.navigate(['/result']), 1500);
    }
  }

  nextQ() {
    const next = this.state.currentQuestion + 1;

    // Reset state for next question
    this.selected = null;
    this.showResult = false;
    this.showAudience = false;
    this.audienceData = [];

    this.gs.update({ currentQuestion: next, score: next });

    if (next >= this.state.questions.length) {
      this.router.navigate(['/result']);
    }
  }

  // Lifeline: 50:50
  useFifty() {
    if (!this.state.lifelines.fiftyFifty) return;

    this.gs.useLifeline('fiftyFifty');
    this.lifelineAudio.play().catch(() => {});

    const wrong = this.displayed.filter(x => !x.correct);
    const remove = wrong.slice(0, 2);
    this.displayed = this.displayed.filter(x => !remove.includes(x));
  }

  // Lifeline: Ask Audience
  askAudience() {
    if (!this.state.lifelines.askAudience) return;

    this.gs.useLifeline('askAudience');
    this.lifelineAudio.play().catch(() => {});

    this.audienceData = this.displayed.map(ans => ({
      option: ans.text,
      percentage: ans.correct
        ? Math.floor(Math.random() * 35) + 50
        : Math.floor(Math.random() * 30) + 3
    }));

    const total = this.audienceData.reduce((a, b) => a + b.percentage, 0);
    this.audienceData = this.audienceData.map(d => ({
      ...d,
      percentage: Math.round((d.percentage / total) * 100)
    }));

    this.showAudience = true;
  }

  closeAudiencePoll() {
    this.showAudience = false;
  }

  // Lifeline: Ask Expert (Google Search)
  askExpert() {
    if (!this.state.lifelines.askExpert) return;

    this.gs.useLifeline('askExpert');
    this.lifelineAudio.play().catch(() => {});

    const searchQuery = encodeURIComponent(this.current.question);
    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
  }

  // Lifeline: Flip Question
flipQ() {
  if (!this.state.lifelines.flipQuestion) return;

  this.gs.useLifeline('flipQuestion');
  this.lifelineAudio.play().catch(() => {});

  // Stop timer while fetching new question
  this.clearTimer();

  this.api.generateQuestions(
    this.state.language,
    this.state.category,
    this.state.subcategory
  ).subscribe({
    next: (qs) => {
      if (qs && qs.length) {
        // Replace current question
        const copy = [...this.state.questions];
        copy[this.state.currentQuestion] = qs[0];

        // Update state with new questions array
        this.gs.update({ questions: copy });

        // Reset for new question
        this.current = qs[0];
        this.displayed = [...qs[0].answer];
        this.selected = null;
        this.showResult = false;
        this.showAudience = false;
        this.audienceData = [];

        // Restart timer
        this.resetTimer();

        alert('Question flipped! New question loaded.');
      } else {
        alert('Flip failed. Please try again.');
        // Restart timer if flip fails
        this.resetTimer();
      }
    },
    error: () => {
      alert('Failed to flip question. Network error.');
      // Restart timer if error occurs
      this.resetTimer();
    }
  });
}


  // Lifeline: Extra 30 seconds
  extra30() {
    if (!this.state.lifelines.extraTime) return;

    this.gs.useLifeline('extraTime');
    this.lifelineAudio.play().catch(() => {});
    this.timer += 30;
  }

  // Lifeline: Double Chance
  doubleChance() {
    if (!this.state.lifelines.doubleChance) return;

    this.gs.useLifeline('doubleChance');
    this.lifelineAudio.play().catch(() => {});
    alert('Double chance activated! You can select one more option if your first choice is wrong.');
  }

  // Helper Methods
  getTimerColor(): string {
    if (this.timer > 30) return '#4ade80';
    if (this.timer > 15) return '#fbbf24';
    return '#ef4444';
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
  }

  getCurrentPrize(): string {
    if (!this.state || !this.gs.prizeLadder) return '₹ 0';

    const currentIndex = this.state.currentQuestion;
    if (currentIndex >= 0 && currentIndex < this.gs.prizeLadder.length) {
      return this.gs.prizeLadder[currentIndex];
    }
    return '₹ 0';
  }
}
