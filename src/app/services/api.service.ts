import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Question } from '../models/question.model';
import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private url = 'https://openrouter.ai/api/v1/chat/completions';
  // Encrypted token - DO NOT modify
  private encryptedKey = 'U2FsdGVkX19xMGJZ7vK8f6YyN3dL9mR2wQ5tH8jA4vC1sE6pX0oU3iT7kF9nG2bY4lM8cV5zW1rJ6hP3xD0qS4gN7eA9fK2mL8vT5wR1uI6yB3oC==';
  private secret = 'KBC_SECRET_KEY_2024'; // Keep this secret

  constructor(private http: HttpClient) {}

  // Decrypt the token before use
  private decryptToken(): string {
    const bytes = CryptoJS.AES.decrypt(this.encryptedKey, this.secret);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  generateQuestions(language: string, category: string, subcategory: string): Observable<Question[]> {
    const decryptedKey = this.decryptToken();

    const headers = new HttpHeaders({
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Authorization': `Bearer ${decryptedKey}`,
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
