
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface GuildChatProps {
  guildId: string;
}

const GuildChat = ({ guildId }: GuildChatProps) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch guild messages
  const { data: messages, refetch } = useQuery({
    queryKey: ['guildMessages', guildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guild_messages')
        .select(`
          id,
          message,
          created_at,
          user_id,
          profiles (
            username
          )
        `)
        .eq('guild_id', guildId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      return data;
    },
    refetchInterval: 3000, // Refetch every 3 seconds for real-time feel
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user?.id || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('guild_messages')
        .insert({
          guild_id: guildId,
          user_id: user.id,
          message: message.trim(),
        });

      if (error) throw error;

      setMessage('');
      // Force immediate refetch
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-white">Guild Chat</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {msg.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-semibold text-sm">
                      {msg.profiles?.username || `User ${msg.user_id.slice(0, 8)}`}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm break-words">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Be the first to say hello!</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="bg-gray-700 border-gray-600 text-white flex-1"
            maxLength={500}
            disabled={sending}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!message.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GuildChat;
