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
import { MessageCircle, Send, Users, ShieldAlert } from "lucide-react";

interface Contact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string;
  label: string;
  chatEnabled?: boolean;
}

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

  const { data: contacts, isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/messaging/contacts"],
    enabled: !!user,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", selectedContact],
    enabled: !!selectedContact,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { receiverId: string; content: string }) => {
      const response = await apiRequest("POST", "/api/messages", messageData);
      return await response.json();
    },
    onSuccess: (newMessage) => {
      setMessageContent("");
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(newMessage));
      }
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContact] });
      toast({
        title: "Sent",
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedContactInfo = contacts?.find(c => c.id === selectedContact);
  const isChatDisabled = selectedContactInfo?.chatEnabled === false;

  if (!user) {
    return (
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Login Required</h3>
          <p className="text-slate-500">Please log in to access messages.</p>
        </CardContent>
      </Card>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'tutor': return 'from-teal-400 to-emerald-500';
      case 'support': return 'from-violet-400 to-purple-500';
      case 'student': return 'from-blue-400 to-indigo-500';
      case 'parent': return 'from-amber-400 to-orange-500';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'tutor': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'support': return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'student': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'parent': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="border border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center text-slate-700">
            <Users className="h-4 w-4 mr-2 text-slate-500" />
            Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {contactsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 border border-slate-100 rounded-xl animate-pulse">
                  <div className="h-4 bg-slate-100 rounded mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : contacts && contacts.length > 0 ? (
            <div className="space-y-1.5">
              {contacts.map((contact: Contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    if (contact.chatEnabled !== false) {
                      setSelectedContact(contact.id);
                    }
                  }}
                  disabled={contact.chatEnabled === false}
                  className={`w-full p-3 text-left rounded-xl transition-all ${
                    contact.chatEnabled === false
                      ? 'bg-slate-50 opacity-60 cursor-not-allowed border border-slate-100'
                      : selectedContact === contact.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${getRoleColor(contact.role)} text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm`}>
                      {contact.firstName?.[0]}{contact.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge className={`text-[10px] px-1.5 py-0 border font-medium ${
                          selectedContact === contact.id && contact.chatEnabled !== false
                            ? 'bg-white/20 text-white border-white/30'
                            : getRoleBadgeStyle(contact.role)
                        }`}>
                          {contact.label}
                        </Badge>
                      </div>
                    </div>
                    {contact.chatEnabled === false && (
                      <ShieldAlert className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">No contacts available</p>
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-slate-300'}`}></div>
              <span className="text-xs text-slate-500">
                {wsConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        <Card className="border border-slate-200 shadow-sm bg-white h-[500px] flex flex-col">
          {selectedContact ? (
            <>
              <CardHeader className="border-b border-slate-100 py-3 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {selectedContactInfo && (
                    <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${getRoleColor(selectedContactInfo.role)} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                      {selectedContactInfo.firstName?.[0]}{selectedContactInfo.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-sm text-slate-800">
                      {selectedContactInfo ? `${selectedContactInfo.firstName} ${selectedContactInfo.lastName}` : 'Messages'}
                    </CardTitle>
                    {selectedContactInfo && (
                      <p className="text-xs text-slate-500">{selectedContactInfo.label}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <div className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-start">
                          <div className="bg-slate-100 p-3 rounded-2xl max-w-xs animate-pulse">
                            <div className="h-3 bg-slate-200 rounded mb-1 w-32"></div>
                            <div className="h-3 bg-slate-200 rounded w-20"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages && (messages as Message[]).length > 0 ? (
                    <div className="space-y-3">
                      {(messages as Message[]).map((message: Message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === user.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[75%] p-3 rounded-2xl ${
                              message.senderId === user.id
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className={`text-[10px] mt-1 ${message.senderId === user.id ? 'text-blue-200' : 'text-slate-400'}`}>
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm text-slate-500">No messages yet</p>
                        <p className="text-xs text-slate-400 mt-1">Start a conversation</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                {isChatDisabled ? (
                  <div className="border-t border-slate-100 p-4">
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                      <p className="text-xs text-amber-700">This contact is not available for chat. Please contact the coaching centre directly.</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-100 p-4 flex-shrink-0">
                    <div className="flex space-x-2">
                      <Input
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-blue-400"
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageContent.trim() || sendMessageMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Select a Contact</h3>
                <p className="text-slate-400 text-sm">Choose someone to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
