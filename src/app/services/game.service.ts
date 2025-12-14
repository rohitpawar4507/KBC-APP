import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameState, Lifelines } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private initialLifelines: Lifelines = {
    fiftyFifty: true, askAudience: true, askExpert: true,
    flipQuestion: true, extraTime: true, doubleChance: true
  };

  private state$ = new BehaviorSubject<GameState>({
    playerName: '',
    language: '',
    category: '',
    subcategory: '',
    currentQuestion: 0,
    score: 0,
    lifelines: { ...this.initialLifelines },
    questions: []
  });

  stateObs = this.state$.asObservable();

  get value() { return this.state$.value; }

  update(partial: Partial<GameState>) {
    this.state$.next({ ...this.state$.value, ...partial });
  }

  reset() {
    this.state$.next({
      playerName: '',
      language: '',
      category: '',
      subcategory: '',
      currentQuestion: 0,
      score: 0,
      lifelines: { ...this.initialLifelines },
      questions: []
    });
  }

  useLifeline(name: keyof Lifelines) {
    const s = { ...this.state$.value };
    s.lifelines[name] = false;
    this.state$.next(s);
  }

  get prizeLadder() {
    return [
      '₹ 1,000','₹ 2,000','₹ 3,000','₹ 5,000','₹ 10,000','₹ 20,000','₹ 40,000','₹ 80,000','₹ 1,60,000','₹ 3,20,000','₹ 6,40,000','₹ 12,50,000','₹ 25,00,000','₹ 50,00,000','₹ 7,00,00,000'
    ];
  }
}
