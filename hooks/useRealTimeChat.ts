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
  
  const subscriptionRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      const allMessages = await ChatService.getAllConversations(currentUserId);
      setMessages(allMessages);
      
      // Update unread count
      const unread = await ChatService.getUnreadMessageCount(currentUserId);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [currentUserId]);

  // Send a message
  const sendMessage = useCallback(async (
    recipientId: string, 
    text: string, 
    isUrgent: boolean = false
  ): Promise<ChatMessage> => {
    try {
      const newMessage = await ChatService.sendMessage(currentUserId, recipientId, text, isUrgent);
      
      // Add to local state immediately for optimistic updates
      setMessages(prev => [...prev, newMessage]);
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [currentUserId]);

  // Mark messages as read
  const markConversationAsRead = useCallback(async (otherUserId: string) => {
    try {
      await ChatService.markConversationAsRead(currentUserId, otherUserId);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.senderId === otherUserId && msg.recipientId === currentUserId && !msg.isRead
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

  // Start typing indicator
  const startTyping = useCallback((recipientId: string) => {
    // Send typing indicator to recipient
    // Note: This would require a separate typing_indicators table or real-time channel
    setIsTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  }, []);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

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

  // Setup real-time subscription
  useEffect(() => {
    let subscription: any;

    const setupRealTimeSubscription = async () => {
      try {
        // Subscribe to new messages
        subscription = ChatService.subscribeToMessages(currentUserId, (newMessage) => {
          console.log('New real-time message received:', newMessage);
          
          // Add new message to state
          setMessages(prev => {
            // Check if message already exists (prevent duplicates)
            const exists = prev.find(msg => msg.id === newMessage.id);
            if (exists) return prev;
            
            return [...prev, newMessage];
          });
          
          // Update unread count
          setUnreadCount(prev => prev + 1);
          
          // Call callback if provided
          if (onNewMessage) {
            onNewMessage(newMessage);
          }
          
          // Auto-mark as read if the conversation is currently open
          if (selectedContactId === newMessage.senderId) {
            setTimeout(() => {
              markConversationAsRead(newMessage.senderId);
            }, 1000); // Small delay to show the message first
          }
        });
        
        setIsConnected(true);
        console.log('Real-time chat subscription established');
        
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
        setIsConnected(false);
      }
    };

    setupRealTimeSubscription();
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      setIsConnected(false);
      console.log('Real-time chat subscription cleaned up');
    };
  }, [currentUserId, selectedContactId, onNewMessage, markConversationAsRead]);

  // Load initial messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Auto-mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedContactId) {
      markConversationAsRead(selectedContactId);
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

  return {
    // State
    messages,
    isConnected,
    unreadCount,
    isTyping,
    typingUsers,
    
    // Actions
    sendMessage,
    markConversationAsRead,
    startTyping,
    stopTyping,
    loadMessages,
    getConversationMessages,
    
    // Computed values
    conversationMessages: getConversationMessages(selectedContactId)
  };
}