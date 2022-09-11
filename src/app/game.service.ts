import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, take, tap, withLatestFrom } from 'rxjs';

type APIResponse = {
  word: string;
};

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private readonly hangManLives = [
    "frame1",
    "frame2",
    "frame3",
    "frame4",
    "head",
    "torso",
    "leftArm",
    "rightArm",
    "leftLeg",
    "rightLeg",
  ];


  readonly highscore$: BehaviorSubject<number> = new BehaviorSubject<number>(Number(localStorage.getItem("highscore")) || 0);
  readonly playerLives$: BehaviorSubject<string[]> = new BehaviorSubject(Array());
  readonly word$ = new BehaviorSubject("");
  readonly foundLetters$: BehaviorSubject<string[]> = new BehaviorSubject(Array());
  readonly renderWord$ = this.foundLetters$
    .pipe(
      map(foundLetters => this.word$.getValue()
        .split("")
        .map((letter) => (foundLetters.find((l) => l === letter) ? letter : "_"))
        .join(" ")
      )
    );
  readonly livesLeft$ = this.playerLives$.pipe(map(lives => this.hangManLives.length - lives.length));
  readonly wonGame$ = this.renderWord$.pipe(map(rw => rw.length > 0 && rw.includes("_") === false));
  readonly score$: BehaviorSubject<number> = new BehaviorSubject(0);
  private usedCharacters = new Array<string>();

  constructor(private readonly http: HttpClient) {}

  startNewGame(): void {
    this.fetchWord()
    .pipe(take(1), withLatestFrom(this.livesLeft$.pipe(take(1))))
    .subscribe(([word, lives]) => {
      if(lives < 1) {
        if(this.score$.getValue() > this.highscore$.getValue()) {
          localStorage.setItem("highscore", this.score$.getValue().toString());
          this.highscore$.next(this.score$.getValue());
        }
        this.score$.next(0);
      }
      this.word$.next(word);
      this.playerLives$.next([]);
      this.foundLetters$.next([]);
      this.usedCharacters = [];
    });
  }

  fetchWord(): Observable<string> {
    return this.http.get<APIResponse>("https://api.api-ninjas.com/v1/randomword")
      .pipe(map(res => res.word.toLowerCase()));
  }

  addFoundLetter(letter: string): void {
    if(this.usedCharacters.includes(letter)) return;
    this.usedCharacters.push(letter);
    this.foundLetters$.next([...this.foundLetters$.value, letter]);
    this.score$.next(this.score$.value + this.foundLetters$.value.length);
  }

  addNotFoundLetter(letter: string): void {
    if(this.usedCharacters.includes(letter)) return;
    this.usedCharacters.push(letter);
    const livesUsed = this.playerLives$.getValue().length + 1;
    this.playerLives$.next(this.hangManLives.filter((_, index) => index < livesUsed));
  }

  private clearFoundLetters() {
    this.foundLetters$.next([]);
  }
}
