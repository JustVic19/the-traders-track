
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Shirt, Sparkles, Package } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type StoreItem = Tables<'store_items'>;
type UserInventoryItem = Tables<'user_inventory'> & {
  store_items: StoreItem;
};

interface AvatarInventoryProps {
  inventory: UserInventoryItem[];
  onEquipItem: (item: StoreItem) => void;
  loading?: boolean;
}

const AvatarInventory: React.FC<AvatarInventoryProps> = ({
  inventory,
  onEquipItem,
  loading = false
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'avatar':
        return <Crown className="w-4 h-4" />;
      case 'theme':
        return <Shirt className="w-4 h-4" />;
      case 'cosmetic':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'avatar':
        return 'text-yellow-400 border-yellow-400';
      case 'theme':
        return 'text-blue-400 border-blue-400';
      case 'cosmetic':
        return 'text-purple-400 border-purple-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  const getItemsByCategory = (category: string) => {
    return inventory.filter(item => item.store_items.category === category);
  };

  const categories = [
    { key: 'avatar', label: 'Hats', icon: <Crown className="w-4 h-4" /> },
    { key: 'theme', label: 'Outfits', icon: <Shirt className="w-4 h-4" /> },
    { key: 'cosmetic', label: 'Auras', icon: <Sparkles className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading inventory...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Your Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="avatar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            {categories.map(category => (
              <TabsTrigger 
                key={category.key}
                value={category.key} 
                className="flex items-center gap-2 data-[state=active]:bg-gray-600"
              >
                {category.icon}
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category.key} value={category.key} className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {getItemsByCategory(category.key).length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                    <p className="text-gray-400">No {category.label.toLowerCase()} owned</p>
                    <p className="text-sm text-gray-500">Visit the store to purchase items</p>
                  </div>
                ) : (
                  getItemsByCategory(category.key).map(item => (
                    <Card key={item.id} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white text-sm">{item.store_items.name}</h4>
                          {getCategoryIcon(item.store_items.category)}
                        </div>
                        
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                          {item.store_items.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getCategoryColor(item.store_items.category)}`}
                          >
                            {item.store_items.category}
                          </Badge>
                          
                          <Button
                            size="sm"
                            variant={item.is_equipped ? "secondary" : "default"}
                            onClick={() => onEquipItem(item.store_items)}
                            disabled={item.is_equipped}
                            className="h-7 px-3 text-xs"
                          >
                            {item.is_equipped ? 'Equipped' : 'Equip'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AvatarInventory;
