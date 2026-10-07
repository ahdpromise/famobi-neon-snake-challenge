import type { GameController } from '../application/GameController';
import type { RunEndReason } from '../application/gameEvents';
import type {
  GameplayAnalytics,
  GameplayResult,
  GameplaySession
} from './GameplayAnalytics';

const resultFromReason = (
  reason: RunEndReason
): GameplayResult => {
  switch (reason) {
    case 'complete':
      return 'completed';

    case 'fail':
      return 'failed';

    case 'quit':
      return 'left';
  }
};

export class GameplayAnalyticsTracker {
  private readonly unsubscribe: Array<() => void> = [];
  private activeSession:
    | {
        sessionId: string;
        level: number;
        startedAt: number;
      }
    | null = null;

  constructor(
    private readonly controller: GameController,
    private readonly analytics: GameplayAnalytics
  ) {}

  connect(): void {
    this.unsubscribe.push(
      this.controller.events.on(
        'runStarted',
        ({ level, occurredAt }) => {
          this.activeSession = {
            sessionId: crypto.randomUUID(),
            level,
            startedAt: occurredAt
          };
        }
      )
    );

    this.unsubscribe.push(
      this.controller.events.on(
        'runEnded',
        ({
          level,
          score,
          progress,
          reason,
          durationMs,
          occurredAt
        }) => {
          const session = this.activeSession;

          if (!session) {
            return;
          }

          const gameplaySession: GameplaySession = {
            sessionId: session.sessionId,
            level,
            startedAt: session.startedAt,
            endedAt: occurredAt,
            result: resultFromReason(reason),
            score,
            progress,
            durationMs
          };

          this.activeSession = null;

          void this.analytics
            .recordSession(gameplaySession)
            .catch((error: unknown) => {
              console.error(
                '[GameplayAnalytics] Failed to record session:',
                error
              );
            });
        }
      )
    );
  }

  dispose(): void {
    for (const unsubscribe of this.unsubscribe) {
      unsubscribe();
    }

    this.unsubscribe.length = 0;
    this.activeSession = null;
  }
}