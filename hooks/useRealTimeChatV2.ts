import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatService } from '../services/chatService';
import { ChatMessage } from '../types';

export interface UseRealTimeChatOptions {
  currentUserId: string;
  selectedContactId?: string;
  onNewMessage?: (message: ChatMessage) => void;
  onMessageRead?: (messageId: string) => void;
}

export function useRealTimeChat({
  currentUserId,
  selectedContactId,
  onNewMessage,
  onMessageRead
}: UseRealTimeChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [pendingMessages, setPendingMessages] = useState<Set<string>>(new Set());
  
  const messageChannelRef = useRef<any>(null);
  const typingChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      console.log('Loading messages for user:', currentUserId);
      const allMessages = await ChatService.getAllConversations(currentUserId);
      setMessages(allMessages);
      
      // Update unread count
      const unread = await ChatService.getUnreadMessageCount(currentUserId);
      setUnreadCount(unread);
      console.log('Loaded messages:', allMessages.length, 'Unread:', unread);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [currentUserId]);

  // Send a message with real-time broadcast
  const sendMessage = useCallback(async (
    recipientId: string, 
    text: string, 
    isUrgent: boolean = false
  ): Promise<ChatMessage> => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    
    try {
      console.log('Sending message to:', recipientId, 'Text:', text);
      
      // Add optimistic message immediately
      const optimisticMessage: ChatMessage = {
        id: tempId,
        senderId: currentUserId,
        recipientId,
        text,
        audioUrl: null,
        timestamp: new Date().toISOString(),
        isRead: false,
        isUrgent,
        fileUrl: undefined,
        fileName: undefined,
        fileType: undefined,
        fileSize: undefined,
        mimeType: undefined
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setPendingMessages(prev => new Set([...prev, tempId]));
      
      // Send message to database
      const newMessage = await ChatService.sendMessage(currentUserId, recipientId, text, isUrgent);
      
      // Replace optimistic message with real message
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? newMessage : msg
      ));
      setPendingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
      
      // Stop typing since we're sending a message
      if (typingChannelRef.current && selectedContactId) {
        await ChatService.broadcastTyping(recipientId, false, currentUserId);
      }
      
      console.log('Message sent successfully:', newMessage);
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove failed optimistic message
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setPendingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
      
      throw error;
    }
  }, [currentUserId, selectedContactId]);

  // Mark messages as read
  const markConversationAsRead = useCallback(async (contactId: string) => {
    try {
      await ChatService.markMessagesAsRead(currentUserId, contactId);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.senderId === contactId && msg.recipientId === currentUserId
          ? { ...msg, isRead: true }
          : msg
      ));
      
      // Update unread count
      const unread = await ChatService.getUnreadMessageCount(currentUserId);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [currentUserId]);

  // Start typing indicator with debouncing
  const startTyping = useCallback(async (recipientId: string) => {
    if (!typingChannelRef.current) return;
    
    try {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Broadcast typing status
      await ChatService.broadcastTyping(recipientId, true, currentUserId);
      console.log('Broadcasting typing to:', recipientId);
      
      // Auto-stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(async () => {
        await ChatService.broadcastTyping(recipientId, false, currentUserId);
        console.log('Auto-stopped typing to:', recipientId);
      }, 3000);
    } catch (error) {
      console.error('Error broadcasting typing:', error);
    }
  }, [currentUserId]);

  // Stop typing indicator
  const stopTyping = useCallback(async (recipientId?: string) => {
    if (!typingChannelRef.current || !recipientId) return;
    
    try {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      await ChatService.broadcastTyping(recipientId, false, currentUserId);
      console.log('Stopped typing to:', recipientId);
    } catch (error) {
      console.error('Error stopping typing:', error);
    }
  }, [currentUserId]);

  // Get conversation messages for selected contact
  const getConversationMessages = useCallback((contactId?: string) => {
    if (!contactId) return [];
    
    return messages
      .filter(msg => 
        (msg.senderId === currentUserId && msg.recipientId === contactId) ||
        (msg.senderId === contactId && msg.recipientId === currentUserId)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, currentUserId]);

  // Setup real-time message subscription
  useEffect(() => {
    console.log('Setting up real-time subscriptions for user:', currentUserId);
    
    const setupMessageSubscription = () => {
      if (messageChannelRef.current) {
        messageChannelRef.current.unsubscribe();
      }
      
      messageChannelRef.current = ChatService.subscribeToMessages(currentUserId, (newMessage) => {
        console.log('New real-time message received:', newMessage);
        
        // Add new message to state (avoid duplicates)
        setMessages(prev => {
          const exists = prev.find(msg => msg.id === newMessage.id);
          if (exists) {
            console.log('Message already exists, skipping duplicate');
            return prev;
          }
          
          const updated = [...prev, newMessage];
          console.log('Updated messages state with new message, total messages:', updated.length);
          return updated;
        });
        
        // Update unread count only if not from current user
        if (newMessage.senderId !== currentUserId) {
          setUnreadCount(prev => prev + 1);
        }
        
        // Call callback if provided
        if (onNewMessage) {
          onNewMessage(newMessage);
        }
        
        // Auto-mark as read if the conversation is currently open
        if (selectedContactId === newMessage.senderId) {
          setTimeout(() => {
            markConversationAsRead(newMessage.senderId).catch(console.error);
          }, 1000);
        }
      });
      
      setIsConnected(true);
      console.log('Message subscription established');
    };

    const setupTypingSubscription = () => {
      if (typingChannelRef.current) {
        typingChannelRef.current.unsubscribe();
      }
      
      typingChannelRef.current = ChatService.subscribeToTyping(currentUserId, (data) => {
        console.log('Typing event received:', data);
        
        const { userId, isTyping: userIsTyping, conversationId } = data;
        
        // Don't process typing events from self
        if (userId === currentUserId) {
          return;
        }
        
        // Update typing users
        setTypingUsers(prev => {
          const newTypingUsers = new Set(prev);
          if (userIsTyping) {
            newTypingUsers.add(userId);
            console.log('User started typing:', userId);
          } else {
            newTypingUsers.delete(userId);
            console.log('User stopped typing:', userId);
          }
          return newTypingUsers;
        });
        
        // Auto-clear typing after 5 seconds as fallback
        if (userIsTyping) {
          setTimeout(() => {
            setTypingUsers(prev => {
              const newTypingUsers = new Set(prev);
              newTypingUsers.delete(userId);
              return newTypingUsers;
            });
          }, 5000);
        }
      });
      
      console.log('Typing subscription established');
    };

    setupMessageSubscription();
    setupTypingSubscription();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      if (messageChannelRef.current) {
        messageChannelRef.current.unsubscribe();
        messageChannelRef.current = null;
      }
      if (typingChannelRef.current) {
        typingChannelRef.current.unsubscribe();
        typingChannelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [currentUserId]); // Removed selectedContactId from deps to prevent unnecessary re-subscriptions

  // Load initial messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Auto-mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedContactId) {
      // Small delay to allow UI to update first
      const timer = setTimeout(() => {
        markConversationAsRead(selectedContactId).catch(console.error);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [selectedContactId, markConversationAsRead]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Manually add a message to the state (for file uploads)
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => {
      const exists = prev.find(msg => msg.id === message.id);
      if (exists) {
        console.log('Message already exists, skipping duplicate');
        return prev;
      }
      
      const updated = [...prev, message];
      console.log('Manually added message to state, total messages:', updated.length);
      return updated;
    });
  }, []);

  return {
    // State
    messages,
    isConnected,
    unreadCount,
    isTyping,
    typingUsers,
    pendingMessages,
    
    // Actions
    sendMessage,
    markConversationAsRead,
    startTyping,
    stopTyping,
    loadMessages,
    getConversationMessages,
    addMessage,
    
    // Computed values
    conversationMessages: getConversationMessages(selectedContactId)
  };
}