import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.scss']
})
export class ButtonsComponent {

  readonly characters = "abcdefghijklmnopqrstuvwxyz".split("");

  constructor(private readonly gameService: GameService) { }

  open(letter: string, $event: Event) {
    $event.preventDefault();
    const button = $event.target! as HTMLButtonElement;
    button.setAttribute("disabled", "disabled");
    if (this.gameService.word$.getValue().includes(letter)) {
      this.gameService.addFoundLetter(letter);
    } else {
      this.gameService.addNotFoundLetter(letter);
    }
  }
}
