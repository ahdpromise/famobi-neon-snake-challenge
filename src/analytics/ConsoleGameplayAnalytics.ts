import type {
  GameplayAnalytics,
  GameplaySession
} from './GameplayAnalytics';

export class ConsoleGameplayAnalytics
  implements GameplayAnalytics
{
  async recordSession(
    session: GameplaySession
  ): Promise<void> {
    console.log(
      '[GameplayAnalytics] Session recorded:',
      session
    );
  }
}