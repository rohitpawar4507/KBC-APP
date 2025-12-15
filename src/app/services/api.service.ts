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
      'Accept-Language': 'en-US,en;q=0.9',
      'Authorization': `Bearer ${this.key}`,
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Origin': 'https://satyajeet-jagtap.github.io',
      'Referer': 'https://satyajeet-jagtap.github.io/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
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
