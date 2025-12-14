import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { GameService } from '../../services/game.service';
import { GameState } from '../../models/question.model';

@Component({
  standalone: true,
  selector: 'app-result',
  imports: [NgIf],
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  state!: GameState;
  prize = '₹ 0';
  showCongrats = false;

  constructor(private router: Router, private gs: GameService) {}

  ngOnInit() {
    this.state = this.gs.value;

    // Redirect if state or playerName is missing
    if (!this.state || !this.state.playerName) {
      this.router.navigate(['/']);
      return;
    }

    const s = this.state.score;

    // Set prize based on score
    if (s > 0 && s <= 15) {
      this.prize = this.gs.prizeLadder[s - 1];
      this.showCongrats = true;
    }

    // Play victory sound effect if score is high
    if (s >= 10) {
      this.playVictorySound();
    }
  }

  calculateAccuracy(): number {
    if (!this.state || !this.state.questions) {
      return 0;
    }
    const total = this.state.questions.length;
    const score = this.state.score;
    return Math.round((score / total) * 100);
  }

  playVictorySound() {
    // Optional: Add victory sound effect
    try {
      const audio = new Audio('assets/audio/victory.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore if audio fails to play
      });
    } catch (e) {
      // Ignore audio errors
    }
  }

  playAgain() {
    this.gs.reset();
    this.router.navigate(['/setup']);
  }

  home() {
    this.gs.reset();
    this.router.navigate(['/']);
  }
}
