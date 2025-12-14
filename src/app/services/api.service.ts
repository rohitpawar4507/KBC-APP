import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Question } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private url = 'https://openrouter.ai/api/v1/chat/completions';
  private key = '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';

  constructor(private http: HttpClient) {}

  generateQuestions(language: string, category: string, subcategory: string): Observable<Question[]> {
    const headers = new HttpHeaders({
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.key}`
    });

    const prompt = `Generate 15 multiple-choice questions in a JSON array. First 5 easy, next 5 medium, last 5 difficult.
Each question: {"id":1,"question":"...","answer":[{"text":"opt1","correct":false},...]}
Language = ${language}
Category = ${category}
Subcategory = ${subcategory}
Return ONLY a pure JSON array.`;

    const body = { model: 'meta-llama/llama-3.3-70b-instruct', messages: [{ role: 'user', content: prompt }], temperature: 0.7 };

    return this.http.post<any>(this.url, body, { headers }).pipe(
      map(resp => {
        const content = resp?.choices?.[0]?.message?.content ?? resp?.choices?.[0]?.text ?? '';
        const m = content.match(/\[[\s\S]*\]/);
        const json = m ? m[0] : content;
        try { return JSON.parse(json) as Question[]; }
        catch (e) { console.error('parse error', e, content); return []; }
      }),
      catchError(err => { console.error(err); return of([] as Question[]); })
    );
  }
}
