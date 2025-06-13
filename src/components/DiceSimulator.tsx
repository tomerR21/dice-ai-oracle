
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MLAgent } from './MLAgent';
import { DashboardCharts } from './DashboardCharts';
import { generateDiceRoll, generateRandomSeed } from '@/utils/diceLogic';
import { MLAgentConfig, MLAgentState, DiceResult, BetResult } from '@/types/dice';
import { Dices, Bot, Settings, Play, Pause } from 'lucide-react';

export const DiceSimulator = () => {
  const [serverSeed, setServerSeed] = useState(generateRandomSeed());
  const [clientSeed, setClientSeed] = useState(generateRandomSeed());
  const [nonce, setNonce] = useState(1);
  const [revealedSeed, setRevealedSeed] = useState('');
  const [isAgentActive, setIsAgentActive] = useState(false);
  
  const [agentConfig, setAgentConfig] = useState<MLAgentConfig>({
    startingBalance: 1000,
    wagerSize: 10,
    profitGoal: 100,
    maxLoss: 500,
    winChanceTarget: 67,
    trainingSpeed: 2
  });

  const [agentState, setAgentState] = useState<MLAgentState>({
    balance: 1000,
    totalBets: 0,
    wins: 0,
    losses: 0,
    predictionAccuracy: 0,
    confidence: 50,
    currentStrategy: 'Ready to learn...',
    longestWinStreak: 0,
    longestLossStreak: 0,
    currentStreak: 0,
    roi: 0,
    isTraining: false,
    learningData: []
  });

  const [rollHistory, setRollHistory] = useState<DiceResult[]>([]);
  const [betHistory, setBetHistory] = useState<BetResult[]>([]);

  const handleManualRoll = () => {
    const roll = generateDiceRoll(serverSeed, clientSeed, nonce);
    const result: DiceResult = {
      roll,
      serverSeed,
      clientSeed,
      nonce,
      timestamp: Date.now()
    };
    
    setRollHistory(prev => [...prev, result].slice(-50));
    setNonce(prev => prev + 1);
  };

  const handleBetResult = (result: BetResult) => {
    setBetHistory(prev => [...prev, result].slice(-100));
    
    const rollResult: DiceResult = {
      roll: result.roll,
      serverSeed,
      clientSeed,
      nonce,
      timestamp: Date.now()
    };
    
    setRollHistory(prev => [...prev, rollResult].slice(-50));
  };

  const resetAgent = () => {
    setIsAgentActive(false);
    setAgentState({
      balance: agentConfig.startingBalance,
      totalBets: 0,
      wins: 0,
      losses: 0,
      predictionAccuracy: 0,
      confidence: 50,
      currentStrategy: 'Ready to learn...',
      longestWinStreak: 0,
      longestLossStreak: 0,
      currentStreak: 0,
      roi: 0,
      isTraining: false,
      learningData: []
    });
    setBetHistory([]);
    setRollHistory([]);
    setNonce(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Dices className="text-purple-400" />
            Advanced Dice ML Simulator
          </h1>
          <p className="text-slate-300">Provably Fair • Machine Learning • Real-time Analytics</p>
        </div>

        {/* Status Bar */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Badge variant={isAgentActive ? "default" : "secondary"} className="flex items-center gap-1">
                  <Bot size={14} />
                  {isAgentActive ? 'Training Active' : 'Agent Idle'}
                </Badge>
                <span className="text-sm text-slate-300">
                  Balance: <span className="text-green-400 font-mono">${agentState.balance.toFixed(2)}</span>
                </span>
                <span className="text-sm text-slate-300">
                  ROI: <span className={`font-mono ${agentState.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {agentState.roi.toFixed(2)}%
                  </span>
                </span>
              </div>
              <div className="text-sm text-slate-400">
                Confidence: {agentState.confidence.toFixed(0)}% | Strategy: {agentState.currentStrategy}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="simulator" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="simulator">Simulator</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="simulator" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Provably Fair Controls */}
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Provably Fair Seeds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Server Seed</Label>
                    <Input 
                      value={serverSeed}
                      onChange={(e) => setServerSeed(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Client Seed</Label>
                    <Input 
                      value={clientSeed}
                      onChange={(e) => setClientSeed(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Nonce</Label>
                      <Input 
                        type="number"
                        value={nonce}
                        readOnly
                        className="bg-slate-700 border-slate-600 text-white font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Last Roll</Label>
                      <div className="h-10 bg-slate-700 border border-slate-600 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {rollHistory.length > 0 ? rollHistory[rollHistory.length - 1].roll.toFixed(2) : '--'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleManualRoll} className="flex-1">
                      Manual Roll
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setServerSeed(generateRandomSeed());
                        setClientSeed(generateRandomSeed());
                        setNonce(1);
                      }}
                    >
                      New Seeds
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* ML Agent Control */}
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bot className="text-purple-400" />
                    ML Agent Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Balance</Label>
                      <div className="text-2xl font-bold text-green-400">
                        ${agentState.balance.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Total Bets</Label>
                      <div className="text-2xl font-bold text-white">
                        {agentState.totalBets}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Win Rate</Label>
                      <div className="text-xl font-bold text-blue-400">
                        {agentState.totalBets > 0 ? ((agentState.wins / agentState.totalBets) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Accuracy</Label>
                      <div className="text-xl font-bold text-purple-400">
                        {agentState.predictionAccuracy.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Agent Training</Label>
                    <Switch 
                      checked={isAgentActive}
                      onCheckedChange={setIsAgentActive}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setIsAgentActive(!isAgentActive)}
                      className="flex-1"
                      variant={isAgentActive ? "destructive" : "default"}
                    >
                      {isAgentActive ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Stop Training
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Training
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetAgent}>
                      Reset Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
            <DashboardCharts 
              rollHistory={rollHistory}
              betHistory={betHistory}
              agentState={agentState}
            />
          </TabsContent>

          <TabsContent value="config">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="text-purple-400" />
                  ML Agent Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Starting Balance ($)</Label>
                    <Input 
                      type="number"
                      value={agentConfig.startingBalance}
                      onChange={(e) => setAgentConfig(prev => ({...prev, startingBalance: Number(e.target.value)}))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Wager Size ($)</Label>
                    <Input 
                      type="number"
                      value={agentConfig.wagerSize}
                      onChange={(e) => setAgentConfig(prev => ({...prev, wagerSize: Number(e.target.value)}))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Profit Goal ($)</Label>
                    <Input 
                      type="number"
                      value={agentConfig.profitGoal}
                      onChange={(e) => setAgentConfig(prev => ({...prev, profitGoal: Number(e.target.value)}))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Max Loss ($)</Label>
                    <Input 
                      type="number"
                      value={agentConfig.maxLoss}
                      onChange={(e) => setAgentConfig(prev => ({...prev, maxLoss: Number(e.target.value)}))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Win Chance Target (%)</Label>
                    <Input 
                      type="number"
                      min="1"
                      max="98"
                      value={agentConfig.winChanceTarget}
                      onChange={(e) => setAgentConfig(prev => ({...prev, winChanceTarget: Number(e.target.value)}))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Training Speed (bets/sec)</Label>
                    <Input 
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={agentConfig.trainingSpeed}
                      onChange={(e) => setAgentConfig(prev => ({...prev, trainingSpeed: Number(e.target.value)}))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ML Agent Component */}
        <MLAgent 
          config={agentConfig}
          serverSeed={serverSeed}
          clientSeed={clientSeed}
          onStateUpdate={setAgentState}
          onBetResult={handleBetResult}
          isActive={isAgentActive}
        />
      </div>
    </div>
  );
};
