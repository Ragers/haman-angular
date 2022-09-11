import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GameService } from '../game.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gfxDisplay') canvas!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;

  private readonly destroy$: Subject<void> = new Subject();

  private readonly hangMan: any = {
    frame1: () => this.draw(0, 150, 150, 150),
    frame2: () => this.draw(10, 0, 10, 600),
    frame3: () => this.draw(0, 5, 70, 5),
    frame4: () => this.draw(60, 5, 60, 15),
    head: () => (
      this.context.beginPath(),
      this.context.arc(60, 25, 10, 0, Math.PI * 2, true),
      this.context.strokeStyle = "white",
      this.context.stroke()
      ),
      torso: () => this.draw(60, 36, 60, 70),
      rightArm: () => this.draw(60, 46, 100, 50),
      leftArm: () => this.draw(60, 46, 20, 50),
      rightLeg: () => this.draw(60, 70, 100, 100),
      leftLeg: () => this.draw(60, 70, 20, 100),
    };

  constructor(private readonly gameService: GameService) {
    this.gameService.playerLives$
      .pipe(takeUntil(this.destroy$))
      .subscribe((lives: string[]) => {
        lives.forEach((frame) => this.hangMan[frame]());
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    this.context = this.canvas?.nativeElement?.getContext("2d")!;
  }

  private draw ($pathFromx: number, $pathFromy: number, $pathTox: number, $pathToy: number) {
    this.context.moveTo($pathFromx, $pathFromy);
    this.context.lineTo($pathTox, $pathToy);
    this.context.strokeStyle = "white";
    this.context.stroke();
  }

}
