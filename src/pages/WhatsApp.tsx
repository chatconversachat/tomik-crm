import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Send, Paperclip, Smile, Bot } from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';
import { toast } from '@/hooks/use-toast';

const mockConversations = [
  {
    id: 1,
    name: 'João Silva',
    phone: '(11) 98765-4321',
    lastMessage: 'Oi, gostaria de saber mais sobre os produtos',
    time: '10:30',
    unread: 2,
    instance: 'Principal',
  },
  {
    id: 2,
    name: 'Maria Santos',
    phone: '(21) 99876-5432',
    lastMessage: 'Obrigada pelo atendimento!',
    time: '09:15',
    unread: 0,
    instance: 'Vendas',
  },
  {
    id: 3,
    name: 'Pedro Oliveira',
    phone: '(31) 97654-3210',
    lastMessage: 'Quando posso agendar?',
    time: 'Ontem',
    unread: 1,
    instance: 'Suporte',
  },
];

type Message = {
  id: number;
  sender: 'cliente' | 'ia' | 'agente';
  content: string;
  time: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    sender: 'cliente',
    content: 'Oi, gostaria de saber mais sobre os produtos',
    time: '10:28',
  },
];

export default function WhatsApp() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const { streamChat, isLoading, setIsLoading } = useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Validação de input
    if (message.trim().length < 2) {
      toast({
        title: "Mensagem muito curta",
        description: "Digite pelo menos 2 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (message.trim().length > 1000) {
      toast({
        title: "Mensagem muito longa",
        description: "Limite de 1000 caracteres",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'cliente',
      content: message.trim(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    let aiResponse = '';
    const aiMessageId = messages.length + 2;

    try {
      const recentMessages = messages.slice(-10);
      
      await streamChat({
        messages: [
          ...recentMessages.map(m => ({ 
            role: m.sender === 'cliente' ? 'user' : 'assistant' as 'user' | 'assistant', 
            content: m.content 
          })),
          { role: 'user', content: message.trim() }
        ],
        onDelta: (chunk) => {
          aiResponse += chunk;
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.id === aiMessageId) {
              return prev.map(m => 
                m.id === aiMessageId 
                  ? { ...m, content: aiResponse }
                  : m
              );
            }
            return [...prev, {
              id: aiMessageId,
              sender: 'ia' as const,
              content: aiResponse,
              time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            }];
          });
        },
        onDone: () => {
          setIsLoading(false);
        },
        onError: (error) => {
          setIsLoading(false);
          toast({
            title: "Erro ao enviar mensagem",
            description: error,
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Conversations List */}
      <div className="w-96 border-r border-border bg-card">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-foreground mb-4">WhatsApp</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar conversas..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-140px)]">
          {mockConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b cursor-pointer transition-colors ${
                selectedConversation.id === conversation.id
                  ? 'bg-muted/50'
                  : 'hover:bg-muted/30'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {conversation.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {conversation.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-xs">
                      {conversation.instance}
                    </Badge>
                    {conversation.unread > 0 && (
                      <Badge className="bg-primary text-primary-foreground">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Chat Header */}
        <div className="p-4 border-b bg-card">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {selectedConversation.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {selectedConversation.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedConversation.phone}
              </p>
            </div>
            <Badge className="bg-success text-success-foreground">
              Online
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'cliente' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-md px-4 py-2 rounded-2xl ${
                  msg.sender === 'cliente'
                    ? 'bg-card border'
                    : msg.sender === 'ia'
                    ? 'bg-gradient-to-r from-accent to-primary text-white'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {msg.sender === 'ia' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="w-4 h-4" />
                    <span className="text-xs font-semibold">Assistente IA</span>
                  </div>
                )}
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'cliente' ? 'text-muted-foreground' : 'text-white/70'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-card">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Smile className="w-5 h-5" />
            </Button>
            <Input
              type="text"
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
