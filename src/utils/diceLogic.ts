
import CryptoJS from 'crypto-js';

export const generateDiceRoll = (serverSeed: string, clientSeed: string, nonce: number): number => {
  // Stake.com provably fair logic
  const combinedSeed = `${serverSeed}:${clientSeed}:${nonce}`;
  
  // Generate HMAC-SHA256 hash
  const hash = CryptoJS.HmacSHA256(combinedSeed, serverSeed).toString();
  
  // Convert first 8 characters of hash to decimal
  const hexSubstring = hash.substring(0, 8);
  const decimal = parseInt(hexSubstring, 16);
  
  // Normalize to 0.00-99.99 range
  const roll = (decimal / 0xFFFFFFFF) * 100;
  
  return Math.round(roll * 100) / 100;
};

export const calculatePayout = (winChance: number, won: boolean): number => {
  if (!won) return 0;
  const multiplier = (100 - 1) / winChance; // 1% house edge
  return multiplier;
};

export const generateRandomSeed = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

export const verifySeed = (serverSeed: string): boolean => {
  // Basic verification - in real implementation would check against revealed seed
  return serverSeed.length >= 64;
};
