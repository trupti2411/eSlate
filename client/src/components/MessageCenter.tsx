import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Users } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role: string;
  };
  receiver?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role: string;
  };
}

export default function MessageCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          // Invalidate messages query to fetch new messages
          queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        console.log("WebSocket disconnected");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  // Get potential contacts based on user role
  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/students"],
    enabled: !!user && (user.role === 'tutor' || user.role === 'parent'),
  });

  // Get messages with selected contact
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", selectedContact],
    enabled: !!selectedContact,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { receiverId: string; content: string }) => {
      const response = await apiRequest("POST", "/api/messages", messageData);
      return await response.json();
    },
    onSuccess: (newMessage) => {
      setMessageContent("");
      // Send via WebSocket for real-time updates
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(newMessage));
      }
      // Invalidate messages query to refresh
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContact] });
      toast({
        title: "Success",
        description: "Message sent successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!selectedContact || !messageContent.trim()) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedContact,
      content: messageContent.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return (
      <Card className="eink-card">
        <CardContent className="p-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-black mb-2">Login Required</h3>
          <p className="text-gray-600">Please log in to access messages.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Contact List */}
      <Card className="eink-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contactsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 border border-gray-200 rounded animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : contacts && contacts.length > 0 ? (
            <div className="space-y-2">
              {contacts.map((contact: any) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.userId)}
                  className={`w-full p-3 text-left border-2 rounded transition-colors ${
                    selectedContact === contact.userId
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold">
                    {contact.user?.firstName} {contact.user?.lastName}
                  </div>
                  <div className="text-sm opacity-75">
                    {contact.user?.email}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">No contacts available</p>
            </div>
          )}
          
          {/* Connection Status */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-600">
                {wsConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Area */}
      <div className="md:col-span-2">
        <Card className="eink-card h-96">
          {selectedContact ? (
            <>
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg">Messages</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-start">
                          <div className="bg-gray-200 p-3 rounded max-w-xs animate-pulse">
                            <div className="h-3 bg-gray-300 rounded mb-1"></div>
                            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages && messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((message: Message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === user.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs p-3 rounded border-2 ${
                              message.senderId === user.id
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-black'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">No messages yet</p>
                        <p className="text-xs text-gray-500">Start a conversation</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 border-2 border-black"
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || sendMessageMutation.isPending}
                      className="eink-button-primary"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-black mb-2">Select a Contact</h3>
                <p className="text-gray-600">Choose someone to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
