
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus } from 'lucide-react';

interface TradeModalProps {
  onTradeCreated: () => void;
}

const TradeModal = ({ onTradeCreated }: TradeModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    trade_type: '',
    quantity: '',
    entry_price: '',
    exit_price: '',
    entry_date: '',
    exit_date: '',
    notes: '',
    is_open: true
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Calculate profit/loss if both prices are provided and trade is closed
      let profit_loss = null;
      if (!formData.is_open && formData.exit_price && formData.entry_price) {
        const entryPrice = parseFloat(formData.entry_price);
        const exitPrice = parseFloat(formData.exit_price);
        const quantity = parseFloat(formData.quantity);
        
        if (formData.trade_type === 'buy') {
          profit_loss = (exitPrice - entryPrice) * quantity;
        } else {
          profit_loss = (entryPrice - exitPrice) * quantity;
        }
      }

      const tradeData = {
        user_id: user.id,
        symbol: formData.symbol.toUpperCase(),
        trade_type: formData.trade_type,
        quantity: parseFloat(formData.quantity),
        entry_price: parseFloat(formData.entry_price),
        exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
        entry_date: formData.entry_date,
        exit_date: formData.exit_date || null,
        notes: formData.notes || null,
        is_open: formData.is_open,
        profit_loss
      };

      const { error } = await supabase
        .from('trades')
        .insert([tradeData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trade logged successfully!",
      });

      // Reset form
      setFormData({
        symbol: '',
        trade_type: '',
        quantity: '',
        entry_price: '',
        exit_price: '',
        entry_date: '',
        exit_date: '',
        notes: '',
        is_open: true
      });

      setOpen(false);
      onTradeCreated();

    } catch (error: any) {
      console.error('Error creating trade:', error);
      toast({
        title: "Error",
        description: "Failed to log trade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Log New Trade
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Log New Trade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="symbol" className="text-gray-300">Asset Symbol *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value)}
                placeholder="e.g., AAPL, TSLA"
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="trade_type" className="text-gray-300">Direction *</Label>
              <Select value={formData.trade_type} onValueChange={(value) => handleInputChange('trade_type', value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="buy" className="text-white hover:bg-gray-600">Buy (Long)</SelectItem>
                  <SelectItem value="sell" className="text-white hover:bg-gray-600">Sell (Short)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity" className="text-gray-300">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="0.00"
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="entry_price" className="text-gray-300">Entry Price *</Label>
              <Input
                id="entry_price"
                type="number"
                step="0.01"
                value={formData.entry_price}
                onChange={(e) => handleInputChange('entry_price', e.target.value)}
                placeholder="0.00"
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entry_date" className="text-gray-300">Entry Date *</Label>
              <Input
                id="entry_date"
                type="datetime-local"
                value={formData.entry_date}
                onChange={(e) => handleInputChange('entry_date', e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Trade Status</Label>
              <Select 
                value={formData.is_open ? 'open' : 'closed'} 
                onValueChange={(value) => handleInputChange('is_open', value === 'open')}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="open" className="text-white hover:bg-gray-600">Open</SelectItem>
                  <SelectItem value="closed" className="text-white hover:bg-gray-600">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!formData.is_open && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exit_price" className="text-gray-300">Exit Price</Label>
                <Input
                  id="exit_price"
                  type="number"
                  step="0.01"
                  value={formData.exit_price}
                  onChange={(e) => handleInputChange('exit_price', e.target.value)}
                  placeholder="0.00"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="exit_date" className="text-gray-300">Exit Date</Label>
                <Input
                  id="exit_date"
                  type="datetime-local"
                  value={formData.exit_date}
                  onChange={(e) => handleInputChange('exit_date', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes" className="text-gray-300">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Trade notes, strategy, tags..."
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Saving...' : 'Log Trade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TradeModal;
