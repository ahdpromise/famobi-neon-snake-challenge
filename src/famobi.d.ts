import type { FamobiGameInterface } from './integrations/FamobiIntegration';

declare global {
  interface Window {
    GameInterface: FamobiGameInterface;
  }
}

export {};