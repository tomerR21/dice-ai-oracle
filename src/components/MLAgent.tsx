
import { useState, useEffect, useCallback } from 'react';
import { MLAgentConfig, MLAgentState, LearningData, BetResult } from '@/types/dice';
import { generateDiceRoll, calculatePayout } from '@/utils/diceLogic';

interface MLAgentProps {
  config: MLAgentConfig;
  serverSeed: string;
  clientSeed: string;
  onStateUpdate: (state: MLAgentState) => void;
  onBetResult: (result: BetResult) => void;
  isActive: boolean;
}

export const MLAgent = ({ config, serverSeed, clientSeed, onStateUpdate, onBetResult, isActive }: MLAgentProps) => {
  const [state, setState] = useState<MLAgentState>({
    balance: config.startingBalance,
    totalBets: 0,
    wins: 0,
    losses: 0,
    predictionAccuracy: 0,
    confidence: 50,
    currentStrategy: 'Learning patterns...',
    longestWinStreak: 0,
    longestLossStreak: 0,
    currentStreak: 0,
    roi: 0,
    isTraining: false,
    learningData: []
  });

  const [nonce, setNonce] = useState(1);

  // Simple ML algorithm - learns from patterns in roll history
  const makePrediction = useCallback((learningData: LearningData[]): { prediction: 'over' | 'under', target: number, confidence: number } => {
    if (learningData.length < 10) {
      // Random prediction when not enough data
      return {
        prediction: Math.random() > 0.5 ? 'over' : 'under',
        target: 50,
        confidence: Math.random() * 30 + 40
      };
    }

    // Analyze recent patterns
    const recentRolls = learningData.slice(-20).map(d => d.roll);
    const averageRoll = recentRolls.reduce((sum, roll) => sum + roll, 0) / recentRolls.length;
    
    // Count recent over/under outcomes
    const recentOver = recentRolls.filter(roll => roll > 50).length;
    const recentUnder = recentRolls.filter(roll => roll <= 50).length;
    
    // Adaptive target based on win chance configuration
    const baseTarget = config.winChanceTarget > 50 ? 100 - config.winChanceTarget : config.winChanceTarget;
    
    // Bias towards the less frequent outcome (gambler's fallacy simulation)
    const prediction = recentOver > recentUnder ? 'under' : 'over';
    const target = prediction === 'over' ? baseTarget : 100 - baseTarget;
    
    // Confidence based on pattern strength and recent accuracy
    const recentAccuracy = learningData.slice(-10).filter(d => d.correct).length / Math.min(10, learningData.length);
    const confidence = Math.min(95, Math.max(30, recentAccuracy * 100 + Math.random() * 20));

    return { prediction, target, confidence };
  }, [config.winChanceTarget]);

  const executeBet = useCallback(() => {
    if (!isActive || state.balance < config.wagerSize) return;

    const prediction = makePrediction(state.learningData);
    const roll = generateDiceRoll(serverSeed, clientSeed, nonce);
    
    const won = (prediction.prediction === 'over' && roll > prediction.target) ||
                 (prediction.prediction === 'under' && roll < prediction.target);
    
    const winChance = prediction.prediction === 'over' ? 100 - prediction.target : prediction.target;
    const payout = won ? calculatePayout(winChance, true) * config.wagerSize : 0;
    const newBalance = state.balance - config.wagerSize + payout;

    const learningPoint: LearningData = {
      roll,
      prediction: prediction.prediction,
      target: prediction.target,
      correct: won,
      confidence: prediction.confidence,
      timestamp: Date.now()
    };

    const betResult: BetResult = {
      roll,
      prediction: prediction.prediction,
      target: prediction.target,
      won,
      payout: payout - config.wagerSize,
      newBalance
    };

    setState(prevState => {
      const newLearningData = [...prevState.learningData, learningPoint].slice(-1000); // Keep last 1000 rolls
      const newWins = prevState.wins + (won ? 1 : 0);
      const newLosses = prevState.losses + (won ? 0 : 1);
      const newTotalBets = prevState.totalBets + 1;
      
      const newCurrentStreak = won ? 
        (prevState.currentStreak > 0 ? prevState.currentStreak + 1 : 1) :
        (prevState.currentStreak < 0 ? prevState.currentStreak - 1 : -1);
      
      const newLongestWinStreak = won && newCurrentStreak > prevState.longestWinStreak ? 
        newCurrentStreak : prevState.longestWinStreak;
      const newLongestLossStreak = !won && Math.abs(newCurrentStreak) > prevState.longestLossStreak ? 
        Math.abs(newCurrentStreak) : prevState.longestLossStreak;

      const accuracy = newTotalBets > 0 ? (newWins / newTotalBets) * 100 : 0;
      const roi = ((newBalance - config.startingBalance) / config.startingBalance) * 100;

      const strategy = `${prediction.prediction.toUpperCase()} ${prediction.target.toFixed(1)} (${prediction.confidence.toFixed(0)}% conf)`;

      const newState = {
        ...prevState,
        balance: newBalance,
        totalBets: newTotalBets,
        wins: newWins,
        losses: newLosses,
        predictionAccuracy: accuracy,
        confidence: prediction.confidence,
        currentStrategy: strategy,
        longestWinStreak: newLongestWinStreak,
        longestLossStreak: newLongestLossStreak,
        currentStreak: newCurrentStreak,
        roi,
        learningData: newLearningData
      };

      onStateUpdate(newState);
      return newState;
    });

    onBetResult(betResult);
    setNonce(prev => prev + 1);
  }, [state, config, serverSeed, clientSeed, nonce, isActive, makePrediction, onStateUpdate, onBetResult]);

  // Training loop
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (state.balance >= config.wagerSize && 
          (config.profitGoal === 0 || state.balance < config.startingBalance + config.profitGoal) &&
          (config.maxLoss === 0 || state.balance > config.startingBalance - config.maxLoss)) {
        executeBet();
      }
    }, 1000 / config.trainingSpeed);

    return () => clearInterval(interval);
  }, [isActive, state.balance, config, executeBet]);

  return null; // This is a headless component
};
