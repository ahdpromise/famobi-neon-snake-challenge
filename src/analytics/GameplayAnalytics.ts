export type GameplayResult =
  | 'completed'
  | 'failed'
  | 'left';

export interface GameplaySession {
  sessionId: string;
  level: number;
  startedAt: number;
  endedAt: number;
  result: GameplayResult;
  score: number;
  progress: number;
  durationMs: number;
}

export interface GameplayAnalytics {
  recordSession(session: GameplaySession): Promise<void>;
}