import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { GameService } from '../../services/game.service';
import { ApiService } from '../../services/api.service';
import { Question } from '../../models/question.model';

@Component({
  standalone: true,
  selector: 'app-game-setup',
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.scss']
})
export class GameSetupComponent {
  playerName = '';
  selectedLanguage = '';
  selectedCategory = '';
  selectedSubcategory = '';
  error = '';
  isLoading = false;

  languages = [
    { code: 'Hindi', name: 'हिंदी (Hindi)' },
    { code: 'English', name: 'English' },
    { code: 'Tamil', name: 'தமிழ் (Tamil)' },
    { code: 'Telugu', name: 'తెలుగు (Telugu)' },
    { code: 'Marathi', name: 'मराठी (Marathi)' },
    { code: 'Bengali', name: 'বাংলা (Bengali)' },
    { code: 'Gujarati', name: 'ગુજરાતી (Gujarati)' },
    { code: 'Kannada', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'Malayalam', name: 'മലയാളം (Malayalam)' },
    { code: 'Punjabi', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'Odia', name: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'Assamese', name: 'অসমীয়া (Assamese)' },
    { code: 'Urdu', name: 'اردو (Urdu)' }
  ];

  categories = [
    { name: 'Technology', subcategories: ['Artificial Intelligence','Programming','Cybersecurity','Web Development'] },
    { name: 'Science', subcategories: ['Physics','Chemistry','Biology','Astronomy'] },
    { name: 'History', subcategories: ['Ancient History','Medieval History','Modern History','Indian History'] },
    { name: 'Geography', subcategories: ['World Geography','Indian Geography','Physical Geography','Climate'] },
    { name: 'Sports', subcategories: ['Cricket','Football','Olympics','Tennis'] },
    { name: 'Entertainment', subcategories: ['Bollywood','Hollywood','Music','Television'] },
    { name: 'General Knowledge', subcategories: ['Current Affairs','Politics','Economy','Culture'] },
    { name: 'Mathematics', subcategories: ['Algebra','Calculus','Geometry','Statistics'] },
    { name: 'Health', subcategories: ['Anatomy','Diseases','Nutrition','Fitness'] }
  ];

  subcategories: string[] = [];

  constructor(private router: Router, private game: GameService, private api: ApiService) {}

  onCatChange() {
    const c = this.categories.find(x => x.name === this.selectedCategory);
    this.subcategories = c ? c.subcategories : [];
    this.selectedSubcategory = '';
  }

  async startGame() {
    this.error = '';

    // Validation
    if (!this.playerName.trim()) {
      this.error = 'Please enter your name';
      return;
    }

    if (!this.selectedLanguage) {
      this.error = 'Please select a language';
      return;
    }

    if (!this.selectedCategory) {
      this.error = 'Please select a category';
      return;
    }

    if (!this.selectedSubcategory) {
      this.error = 'Please select a subcategory';
      return;
    }

    this.isLoading = true;

    this.api.generateQuestions(this.selectedLanguage, this.selectedCategory, this.selectedSubcategory)
      .subscribe({
        next: (qs) => {
          this.isLoading = false;

          if (!qs || qs.length < 15) {
            this.error = 'Failed to generate 15 questions. Please try again or choose another category.';
            return;
          }

          this.game.update({
            playerName: this.playerName.trim(),
            language: this.selectedLanguage,
            category: this.selectedCategory,
            subcategory: this.selectedSubcategory,
            questions: qs,
            currentQuestion: 0,
            score: 0
          });

          this.router.navigate(['/game']);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('API Error:', err);
          this.error = 'Network or API error. Please try again later.';
        }
      });
  }
}
