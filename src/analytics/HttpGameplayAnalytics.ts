import type {
  GameplayAnalytics,
  GameplaySession
} from './GameplayAnalytics';

export class HttpGameplayAnalytics implements GameplayAnalytics {
  constructor(
    private readonly endpoint =
      'http://localhost:3000/analytics/sessions'
  ) {}

  async recordSession(
    session: GameplaySession
  ): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(session)
    });

    if (!response.ok) {
      throw new Error(
        `Analytics request failed with status ${response.status}`
      );
    }
  }
}