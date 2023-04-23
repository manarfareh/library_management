import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {Book } from './digital-collections';
import {  forkJoin } from 'rxjs';
import { retry } from 'rxjs/operators';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class DigitalCollectionsService {
  private apiServerUrl = 'http://localhost:8081';

  constructor(private http: HttpClient){}
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public getbook(): Observable<Book[]> {
    const endpointUrls = [
      `${this.apiServerUrl}/Book/Digital-Article/all`,
      `${this.apiServerUrl}/Book/Digital-Exam/all`,
      `${this.apiServerUrl}/Book/Digital-Pfebook/all`
    ];

    const observables = endpointUrls.map(url => this.http.get<Book[]>(url));

    return forkJoin(observables).pipe(
      map(responses => responses.reduce((acc, curr) => [...acc, ...curr], []))
    );
  }
  public deleteBook(bookId: number): Observable<void> {
    const url = `${this.apiServerUrl}/Book/delete/${bookId}`;
    return this.http.delete<void>(url);
  }

  updateBook(book: Book): Observable<Book> {
    const url = `${this.apiServerUrl}/Book/update/${book.id}`;
    return this.http.put<Book>(url, book, this.httpOptions)
      .pipe(
        retry(3), // Retry up to 3 times if the request fails
        catchError(this.handleError) // Handle any errors that occur
      );
  }

  // Handle any errors that occur during HTTP requests
  private handleError(error: any) {
    console.error(error);
    return throwError('An error occurred. Please try again later.');
  }
  addBook(book: Book): Observable<any> {
    console.log('Book object:', book);
    if(book.book_type=="article")
    return this.http.post(`${this.apiServerUrl}/Book/addDigitalArtical`, book);
    else if (book.book_type=="pfebook")
    return this.http.post(`${this.apiServerUrl}/Book/addDigitalPfeBook`, book);
    else if (book.book_type=="exam")
    return this.http.post(`${this.apiServerUrl}/Book/addDigitalExam`, book);
    else 
    return this.http.post(`${this.apiServerUrl}/Book/addDigitalBook`, book);
  }

}
