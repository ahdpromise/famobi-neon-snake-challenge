export interface GameActions {
  startNewGame(): Promise<void>;
  startAtLevel(level: number): Promise<void>;
  restartLevel(): Promise<void>;
  goToNextLevel(): Promise<void>;
  togglePlayerPause(): Promise<void>;
  quitToMenu(): Promise<void>;
}