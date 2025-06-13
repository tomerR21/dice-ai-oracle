
export interface DiceResult {
  roll: number;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  timestamp: number;
}

export interface MLAgentConfig {
  startingBalance: number;
  wagerSize: number;
  profitGoal: number;
  maxLoss: number;
  winChanceTarget: number;
  trainingSpeed: number;
}

export interface MLAgentState {
  balance: number;
  totalBets: number;
  wins: number;
  losses: number;
  predictionAccuracy: number;
  confidence: number;
  currentStrategy: string;
  longestWinStreak: number;
  longestLossStreak: number;
  currentStreak: number;
  roi: number;
  isTraining: boolean;
  learningData: LearningData[];
}

export interface LearningData {
  roll: number;
  prediction: 'over' | 'under';
  target: number;
  correct: boolean;
  confidence: number;
  timestamp: number;
}

export interface BetResult {
  roll: number;
  prediction: 'over' | 'under';
  target: number;
  won: boolean;
  payout: number;
  newBalance: number;
}
