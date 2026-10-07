import type { GameController } from '../application/GameController';
import type { GameActions } from './GameActions';

export type FamobiGameEndReason = 'complete' | 'fail' | 'quit';

type FamobiScoreType = 'live' | 'total' | 'level' | 'stage';

export interface FamobiGameInterface {
  gameReady(isPlayerReady?: boolean): void;

  gameStart(level?: number): Promise<void>;

  gamePause(): Promise<void>;

  gameResume(): Promise<void>;

  gameEnd(reason: FamobiGameEndReason): Promise<void>;

  gameFinished(): Promise<void>;

  sendScore(
    score: number,
    params?: {
      type?: FamobiScoreType;
      level?: number;
      stage?: number;
    }
  ): void;

  sendProgress(progress: number): void;

  onPauseStateChange(
    callback: (isPaused: boolean) => void
  ): void;

  onMuteStateChange(
    callback: (isMuted: boolean) => void
  ): void;

  isMuted(): boolean;
}

export class FamobiIntegration implements GameActions {
  private readonly unsubscribe: Array<() => void> = [];

  constructor(
    private readonly controller: GameController,
    private readonly gameInterface: FamobiGameInterface
  ) {}

  connect(): void {
    this.unsubscribe.push(
      this.controller.events.on('ready', () => {
        this.gameInterface.gameReady();
      })
    );

    this.unsubscribe.push(
      this.controller.events.on(
        'scoreChanged',
        ({ level, score }) => {
          this.gameInterface.sendScore(score, {
            type: 'level',
            level
          });
        }
      )
    );

    this.unsubscribe.push(
      this.controller.events.on(
        'progressChanged',
        ({ progress }) => {
          this.gameInterface.sendProgress(progress);
        }
      )
    );

    this.unsubscribe.push(
      this.controller.events.on(
        'runEnded',
        ({ reason }) => {
          if (reason === 'quit') {
            return;
          }

          void this.endAutomaticRun(reason);
        }
      )
    );

    this.gameInterface.onPauseStateChange((isPaused) => {
      this.controller.setSystemPaused(isPaused);
    });

    this.gameInterface.onMuteStateChange((isMuted) => {
      this.controller.setSystemMuted(isMuted);
    });

    this.controller.setSystemMuted(
      this.gameInterface.isMuted()
    );
  }

  async startNewGame(): Promise<void> {
    try {
      await this.gameInterface.gameStart(1);
      this.controller.startNewGame();
    } catch (error: unknown) {
      this.logError('gameStart', error);
    }
  }

  async startAtLevel(level: number): Promise<void> {
    try {
      await this.gameInterface.gameStart(level);
      this.controller.startAtLevel(level);
    } catch (error: unknown) {
      this.logError('gameStart', error);
    }
  }

  async restartLevel(): Promise<void> {
    const level = this.controller.getSnapshot().level;

    try {
      await this.gameInterface.gameStart(level);
      this.controller.restartLevel();
    } catch (error: unknown) {
      this.logError('gameStart', error);
    }
  }

  async goToNextLevel(): Promise<void> {
    const nextLevel =
      this.controller.getSnapshot().level + 1;

    try {
      await this.gameInterface.gameStart(nextLevel);
      this.controller.goToNextLevel();
    } catch (error: unknown) {
      this.logError('gameStart', error);
    }
  }

  async togglePlayerPause(): Promise<void> {
    const snapshot = this.controller.getSnapshot();

    if (snapshot.phase === 'playing') {
      try {
        await this.gameInterface.gamePause();
        this.controller.togglePlayerPause();
      } catch (error: unknown) {
        this.logError('gamePause', error);
      }

      return;
    }

    if (
      snapshot.phase === 'paused' &&
      snapshot.pauseSource === 'player'
    ) {
      try {
        await this.gameInterface.gameResume();
        this.controller.togglePlayerPause();
      } catch (error: unknown) {
        this.logError('gameResume', error);
      }
    }
  }

  async quitToMenu(): Promise<void> {
    const snapshot = this.controller.getSnapshot();

    if (
      snapshot.phase !== 'playing' &&
      snapshot.phase !== 'paused'
    ) {
      this.controller.quitToMenu();
      return;
    }

    try {
      await this.gameInterface.gameEnd('quit');
      this.controller.quitToMenu();
    } catch (error: unknown) {
      this.logError('gameEnd', error);
    }
  }

  dispose(): void {
    for (const unsubscribe of this.unsubscribe) {
      unsubscribe();
    }

    this.unsubscribe.length = 0;
  }

  private async endAutomaticRun(
    reason: 'complete' | 'fail'
  ): Promise<void> {
    try {
      await this.gameInterface.gameEnd(reason);

      if (
        reason === 'complete' &&
        this.controller.getSnapshot().phase === 'finished'
      ) {
        await this.gameInterface.gameFinished();
      }
    } catch (error: unknown) {
      this.logError('gameEnd', error);
    }
  }

  private logError(
    operation: string,
    error: unknown
  ): void {
    console.error(
      `[FamobiIntegration] ${operation} failed:`,
      error
    );
  }
}