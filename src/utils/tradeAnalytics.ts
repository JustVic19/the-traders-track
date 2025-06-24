
import { Tables } from '@/integrations/supabase/types';

type Trade = Tables<'trades'>;

export interface TradeStatistics {
  consecutiveWins: number;
  consecutiveLosses: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  recoveryFactor: number;
  sharpeRatio: number;
  calmarRatio: number;
  expectancy: number;
}

export interface MonthlyPerformance {
  month: string;
  year: number;
  pnl: number;
  trades: number;
  winRate: number;
  profitFactor: number;
}

export interface WeeklyPerformance {
  week: string;
  pnl: number;
  trades: number;
  winRate: number;
}

export class TradeAnalytics {
  private trades: Trade[];
  
  constructor(trades: Trade[]) {
    this.trades = trades.filter(t => !t.is_open && t.profit_loss !== null);
  }

  // Calculate advanced statistics
  calculateAdvancedStats(): TradeStatistics {
    if (!this.trades.length) {
      return {
        consecutiveWins: 0,
        consecutiveLosses: 0,
        maxConsecutiveWins: 0,
        maxConsecutiveLosses: 0,
        maxDrawdown: 0,
        maxDrawdownPercent: 0,
        recoveryFactor: 0,
        sharpeRatio: 0,
        calmarRatio: 0,
        expectancy: 0,
      };
    }

    const sortedTrades = this.trades.sort((a, b) => 
      new Date(a.exit_date || '').getTime() - new Date(b.exit_date || '').getTime()
    );

    // Calculate consecutive wins/losses
    const consecutiveStats = this.calculateConsecutiveStats(sortedTrades);
    
    // Calculate drawdown
    const drawdownStats = this.calculateDrawdown(sortedTrades);
    
    // Calculate advanced ratios
    const ratios = this.calculateRatios(sortedTrades);

    return {
      ...consecutiveStats,
      ...drawdownStats,
      ...ratios,
    };
  }

  private calculateConsecutiveStats(trades: Trade[]) {
    let consecutiveWins = 0;
    let consecutiveLosses = 0;
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    trades.forEach(trade => {
      const pnl = trade.profit_loss || 0;
      
      if (pnl > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
      } else if (pnl < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
      }
    });

    consecutiveWins = currentWinStreak;
    consecutiveLosses = currentLossStreak;

    return {
      consecutiveWins,
      consecutiveLosses,
      maxConsecutiveWins,
      maxConsecutiveLosses,
    };
  }

  private calculateDrawdown(trades: Trade[]) {
    let runningBalance = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;

    trades.forEach(trade => {
      runningBalance += trade.profit_loss || 0;
      peak = Math.max(peak, runningBalance);
      
      const drawdown = peak - runningBalance;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
      
      if (peak > 0) {
        const drawdownPercent = (drawdown / peak) * 100;
        maxDrawdownPercent = Math.max(maxDrawdownPercent, drawdownPercent);
      }
    });

    return { maxDrawdown, maxDrawdownPercent };
  }

  private calculateRatios(trades: Trade[]) {
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
    const winningTrades = trades.filter(t => (t.profit_loss || 0) > 0);
    const losingTrades = trades.filter(t => (t.profit_loss || 0) < 0);
    
    // Recovery Factor
    const maxDrawdown = this.calculateDrawdown(trades).maxDrawdown;
    const recoveryFactor = maxDrawdown > 0 ? totalPnL / maxDrawdown : 0;

    // Expectancy (average profit per trade)
    const expectancy = trades.length > 0 ? totalPnL / trades.length : 0;

    // Simple approximation of Sharpe ratio (would need risk-free rate for accurate calculation)
    const returns = trades.map(t => t.profit_loss || 0);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    // Calmar Ratio (annual return / max drawdown)
    const maxDrawdownPercent = this.calculateDrawdown(trades).maxDrawdownPercent;
    const calmarRatio = maxDrawdownPercent > 0 ? (totalPnL * 100) / maxDrawdownPercent : 0;

    return {
      recoveryFactor,
      sharpeRatio,
      calmarRatio,
      expectancy,
    };
  }

  // Calculate monthly performance breakdown
  calculateMonthlyPerformance(): MonthlyPerformance[] {
    const monthlyMap = new Map<string, Trade[]>();

    this.trades.forEach(trade => {
      if (trade.exit_date) {
        const date = new Date(trade.exit_date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, []);
        }
        monthlyMap.get(key)!.push(trade);
      }
    });

    return Array.from(monthlyMap.entries()).map(([monthKey, trades]) => {
      const [year, month] = monthKey.split('-');
      const pnl = trades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
      const winningTrades = trades.filter(t => (t.profit_loss || 0) > 0);
      const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
      
      const grossProfit = winningTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
      const grossLoss = Math.abs(trades.filter(t => (t.profit_loss || 0) < 0)
        .reduce((sum, trade) => sum + (trade.profit_loss || 0), 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 999 : 0);

      return {
        month: new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        }),
        year: parseInt(year),
        pnl,
        trades: trades.length,
        winRate,
        profitFactor,
      };
    }).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return new Date(a.month).getMonth() - new Date(b.month).getMonth();
    });
  }

  // Calculate weekly performance for calendar heatmap
  calculateWeeklyPerformance(): WeeklyPerformance[] {
    const weeklyMap = new Map<string, Trade[]>();

    this.trades.forEach(trade => {
      if (trade.exit_date) {
        const date = new Date(trade.exit_date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyMap.has(weekKey)) {
          weeklyMap.set(weekKey, []);
        }
        weeklyMap.get(weekKey)!.push(trade);
      }
    });

    return Array.from(weeklyMap.entries()).map(([weekKey, trades]) => {
      const pnl = trades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
      const winningTrades = trades.filter(t => (t.profit_loss || 0) > 0);
      const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

      return {
        week: weekKey,
        pnl,
        trades: trades.length,
        winRate,
      };
    }).sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());
  }

  // Get performance summary for different time periods
  getPerformanceSummary(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentTrades = this.trades.filter(trade => 
      trade.exit_date && new Date(trade.exit_date) >= cutoffDate
    );

    if (!recentTrades.length) {
      return {
        totalPnL: 0,
        tradeCount: 0,
        winRate: 0,
        avgDaily: 0,
        bestDay: 0,
        worstDay: 0,
      };
    }

    const totalPnL = recentTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
    const winningTrades = recentTrades.filter(t => (t.profit_loss || 0) > 0);
    const winRate = (winningTrades.length / recentTrades.length) * 100;
    const avgDaily = totalPnL / days;

    // Calculate best and worst days
    const dailyPnL = new Map<string, number>();
    recentTrades.forEach(trade => {
      if (trade.exit_date) {
        const day = trade.exit_date.split('T')[0];
        dailyPnL.set(day, (dailyPnL.get(day) || 0) + (trade.profit_loss || 0));
      }
    });

    const dailyValues = Array.from(dailyPnL.values());
    const bestDay = dailyValues.length > 0 ? Math.max(...dailyValues) : 0;
    const worstDay = dailyValues.length > 0 ? Math.min(...dailyValues) : 0;

    return {
      totalPnL,
      tradeCount: recentTrades.length,
      winRate,
      avgDaily,
      bestDay,
      worstDay,
    };
  }
}
