
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TradeData {
  symbol: string;
  trade_type: 'buy' | 'sell';
  quantity: number;
  entry_price: number;
  exit_price?: number;
  entry_date: string;
  exit_date?: string;
  notes?: string;
}

export const useSecureTrades = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTrades = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
      toast.error('Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const validateAndCreateTrade = async (tradeData: TradeData) => {
    if (!user) {
      toast.error('User not authenticated');
      return null;
    }

    try {
      // Convert TradeData to JSONB format expected by the function
      const tradeDataJsonb = {
        symbol: tradeData.symbol,
        trade_type: tradeData.trade_type,
        quantity: tradeData.quantity,
        entry_price: tradeData.entry_price,
        exit_price: tradeData.exit_price || null,
        entry_date: tradeData.entry_date,
        exit_date: tradeData.exit_date || null,
        notes: tradeData.notes || null
      };

      // First, validate the trade data server-side
      const { data: validationResult, error: validationError } = await supabase.rpc('validate_and_process_trade', {
        trade_data: tradeDataJsonb
      });

      if (validationError) throw validationError;

      const validation = validationResult as { success: boolean; error?: string; validated_trade?: any };
      
      if (!validation.success) {
        toast.error(validation.error || 'Invalid trade data');
        return null;
      }

      // If validation passes, create the trade
      const { data, error } = await supabase
        .from('trades')
        .insert([validation.validated_trade])
        .select()
        .single();

      if (error) throw error;

      // Grant focus points for the trade
      if (data) {
        try {
          await supabase.rpc('analyze_trade_and_grant_xp', {
            user_profile_id: user.id,
            trade_notes: data.notes,
            trade_profit_loss: data.profit_loss,
            trade_type: data.trade_type
          });
        } catch (xpError) {
          console.error('Error granting XP:', xpError);
          // Don't fail the trade creation for XP errors
        }
      }

      toast.success('Trade created successfully');
      await fetchTrades(); // Refresh trades
      return data;
    } catch (error) {
      console.error('Error creating trade:', error);
      toast.error('Failed to create trade');
      return null;
    }
  };

  const updateTrade = async (tradeId: string, updates: Partial<TradeData>) => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    try {
      // Validate updates server-side if needed
      if (Object.keys(updates).length === 0) {
        toast.error('No updates provided');
        return false;
      }

      const { data, error } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', tradeId)
        .eq('user_id', user.id) // Ensure user can only update their own trades
        .select()
        .single();

      if (error) throw error;

      toast.success('Trade updated successfully');
      await fetchTrades(); // Refresh trades
      return true;
    } catch (error) {
      console.error('Error updating trade:', error);
      toast.error('Failed to update trade');
      return false;
    }
  };

  const deleteTrade = async (tradeId: string) => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId)
        .eq('user_id', user.id); // Ensure user can only delete their own trades

      if (error) throw error;

      toast.success('Trade deleted successfully');
      await fetchTrades(); // Refresh trades
      return true;
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast.error('Failed to delete trade');
      return false;
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [user]);

  return {
    trades,
    loading,
    createTrade: validateAndCreateTrade,
    updateTrade,
    deleteTrade,
    refetch: fetchTrades
  };
};
