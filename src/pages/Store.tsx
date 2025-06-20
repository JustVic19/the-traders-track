
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, ArrowLeft, Crown, Palette, User, Coins } from 'lucide-react';

// Define types for the new tables since they're not in the generated types yet
interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'avatar' | 'theme' | 'cosmetic';
  item_key: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

interface UserPurchase {
  id: string;
  user_id: string;
  store_item_id: string;
  is_equipped: boolean;
  purchased_at: string;
}

type Profile = Tables<'profiles'>;

interface StoreItemWithPurchase extends StoreItem {
  userPurchase?: UserPurchase;
}

const Store = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [storeItems, setStoreItems] = useState<StoreItemWithPurchase[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchStoreData();
    } else if (!loading) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchStoreData = async () => {
    try {
      // Fetch store items using direct query with type assertion
      const { data: itemsData, error: itemsError } = await supabase
        .from('store_items' as any)
        .select('*')
        .eq('is_available', true)
        .order('price', { ascending: true });

      if (itemsError) {
        console.error('Store items error:', itemsError);
        throw itemsError;
      }

      // Fetch user purchases using direct query with type assertion
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('user_purchases' as any)
        .select('*')
        .eq('user_id', user?.id);

      if (purchasesError) {
        console.error('User purchases error:', purchasesError);
        throw purchasesError;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Combine items with purchase status
      const itemsWithPurchases = (itemsData as StoreItem[] || []).map((item: StoreItem) => ({
        ...item,
        userPurchase: (purchasesData as UserPurchase[] || []).find(p => p.store_item_id === item.id)
      }));

      setStoreItems(itemsWithPurchases);
      setProfile(profileData);
    } catch (error: any) {
      console.error('Error fetching store data:', error);
      toast({
        title: "Error",
        description: "Failed to load store data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseItem = async (item: StoreItemWithPurchase) => {
    if (!profile || profile.alpha_coins < item.price) {
      toast({
        title: "Insufficient Alpha Coins",
        description: `You need ${item.price} Alpha Coins to purchase this item`,
        variant: "destructive",
      });
      return;
    }

    setPurchasing(item.id);

    try {
      // Start transaction-like operations
      // 1. Deduct Alpha Coins from user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ alpha_coins: profile.alpha_coins - item.price })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // 2. Add purchase record using direct insert
      const { error: purchaseError } = await supabase
        .from('user_purchases' as any)
        .insert({
          user_id: user?.id,
          store_item_id: item.id,
          is_equipped: false
        });

      if (purchaseError) throw purchaseError;

      toast({
        title: "Purchase Successful!",
        description: `You've purchased ${item.name} for ${item.price} Alpha Coins`,
      });

      // Refresh data
      fetchStoreData();
    } catch (error: any) {
      console.error('Error purchasing item:', error);
      toast({
        title: "Purchase Failed",
        description: "Something went wrong with your purchase",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'avatar':
        return <User className="w-5 h-5" />;
      case 'theme':
        return <Palette className="w-5 h-5" />;
      case 'cosmetic':
        return <Crown className="w-5 h-5" />;
      default:
        return <ShoppingCart className="w-5 h-5" />;
    }
  };

  const renderStoreItem = (item: StoreItemWithPurchase) => {
    const isPurchased = !!item.userPurchase;
    const canAfford = profile && profile.alpha_coins >= item.price;

    return (
      <Card key={item.id} className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-blue-400">
                {getCategoryIcon(item.category)}
              </div>
              <div>
                <CardTitle className="text-white text-sm">{item.name}</CardTitle>
                <CardDescription className="text-gray-400 text-xs">
                  {item.description}
                </CardDescription>
              </div>
            </div>
            <Badge variant={isPurchased ? "default" : "secondary"} className="text-xs">
              {item.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-yellow-500">
                <Coins className="w-4 h-4" />
                <span className="font-bold">{item.price}</span>
              </div>
              {isPurchased && (
                <Badge className="bg-green-600 text-white">
                  Owned
                </Badge>
              )}
            </div>
            
            {!isPurchased && (
              <Button
                onClick={() => purchaseItem(item)}
                disabled={!canAfford || purchasing === item.id}
                className={`w-full ${
                  canAfford 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                size="sm"
              >
                {purchasing === item.id ? (
                  "Purchasing..."
                ) : canAfford ? (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase
                  </>
                ) : (
                  "Insufficient Coins"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-white">Loading store...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const avatarItems = storeItems.filter(item => item.category === 'avatar');
  const themeItems = storeItems.filter(item => item.category === 'theme');
  const cosmeticItems = storeItems.filter(item => item.category === 'cosmetic');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Alpha Store</h1>
                <p className="text-gray-400 text-sm">Purchase cosmetic items with Alpha Coins</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-lg">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="text-white font-bold">{profile?.alpha_coins || 0}</span>
            <span className="text-gray-400 text-sm">Alpha Coins</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="avatar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger value="avatar" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
              <User className="w-4 h-4 mr-2" />
              Avatar ({avatarItems.length})
            </TabsTrigger>
            <TabsTrigger value="themes" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
              <Palette className="w-4 h-4 mr-2" />
              Themes ({themeItems.length})
            </TabsTrigger>
            <TabsTrigger value="cosmetics" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
              <Crown className="w-4 h-4 mr-2" />
              Cosmetics ({cosmeticItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="avatar" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {avatarItems.length > 0 ? (
                avatarItems.map(renderStoreItem)
              ) : (
                <Card className="bg-gray-800 border-gray-700 col-span-full">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center text-gray-400">
                      <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No avatar items available</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="themes" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {themeItems.length > 0 ? (
                themeItems.map(renderStoreItem)
              ) : (
                <Card className="bg-gray-800 border-gray-700 col-span-full">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center text-gray-400">
                      <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No theme items available</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="cosmetics" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cosmeticItems.length > 0 ? (
                cosmeticItems.map(renderStoreItem)
              ) : (
                <Card className="bg-gray-800 border-gray-700 col-span-full">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center text-gray-400">
                      <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No cosmetic items available</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Store;
