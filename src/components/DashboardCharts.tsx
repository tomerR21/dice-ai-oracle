
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DiceResult, BetResult, MLAgentState } from '@/types/dice';
import { TrendingUp, Target, Zap, Award } from 'lucide-react';

interface DashboardChartsProps {
  rollHistory: DiceResult[];
  betHistory: BetResult[];
  agentState: MLAgentState;
}

export const DashboardCharts = ({ rollHistory, betHistory, agentState }: DashboardChartsProps) => {
  // Prepare data for charts
  const rollChartData = rollHistory.slice(-50).map((roll, index) => ({
    index: index + 1,
    roll: roll.roll,
    over50: roll.roll > 50 ? roll.roll : null,
    under50: roll.roll <= 50 ? roll.roll : null
  }));

  const balanceChartData = betHistory.map((bet, index) => ({
    bet: index + 1,
    balance: bet.newBalance,
    profit: bet.newBalance - (betHistory[0]?.newBalance || agentState.balance)
  }));

  // Calculate statistics
  const recentRolls = rollHistory.slice(-20);
  const overCount = recentRolls.filter(r => r.roll > 50).length;
  const underCount = recentRolls.filter(r => r.roll <= 50).length;
  
  const winRate = agentState.totalBets > 0 ? (agentState.wins / agentState.totalBets) * 100 : 0;
  const avgRoll = rollHistory.length > 0 ? rollHistory.reduce((sum, r) => sum + r.roll, 0) / rollHistory.length : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm font-medium text-slate-300">Win Rate</p>
                <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-slate-300">Accuracy</p>
                <p className="text-2xl font-bold text-white">{agentState.predictionAccuracy.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-slate-300">Current Streak</p>
                <p className={`text-2xl font-bold ${agentState.currentStreak > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {agentState.currentStreak > 0 ? '+' : ''}{agentState.currentStreak}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm font-medium text-slate-300">ROI</p>
                <p className={`text-2xl font-bold ${agentState.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {agentState.roi.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roll History Chart */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Dice Roll History (Last 50)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rollChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="index" stroke="#9CA3AF" />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="roll" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="over50" 
                  stroke="#10B981" 
                  strokeWidth={0}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="under50" 
                  stroke="#EF4444" 
                  strokeWidth={0}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Balance Over Time */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Balance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={balanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="bet" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Training Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-300">Total Bets:</span>
              <span className="text-white font-bold">{agentState.totalBets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Wins:</span>
              <span className="text-green-400 font-bold">{agentState.wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Losses:</span>
              <span className="text-red-400 font-bold">{agentState.losses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Longest Win Streak:</span>
              <span className="text-green-400 font-bold">{agentState.longestWinStreak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Longest Loss Streak:</span>
              <span className="text-red-400 font-bold">{agentState.longestLossStreak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Average Roll:</span>
              <span className="text-purple-400 font-bold">{avgRoll.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Roll Distribution (Last 20)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Under 50', count: underCount, fill: '#EF4444' },
                { name: 'Over 50', count: overCount, fill: '#10B981' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
