import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { User, ChatMessage, Doctor, Patient } from '../types';
import { EmptyMessagesIcon } from './icons/EmptyMessagesIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { AlertIcon } from './icons/AlertIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { getInitials, getInitialsColor, getInitialsAvatarClasses } from '../utils/avatarUtils';
import { useRealTimeChat } from '../hooks/useRealTimeChatV2';
import { RealTimeStatus, TypingIndicator, MessageStatus } from './RealTimeComponents';

type Contact = Doctor | Patient;

interface MessagesProps {
  currentUser: User;
  contacts: Contact[];
  messages: ChatMessage[]; // This will be ignored in favor of real-time messages
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>) => void; // This will be ignored
  onMarkMessagesAsRead: (contactId: string) => void; // This will be ignored
  preselectedContactId: string | null;
  clearPreselectedContact: () => void;
  onNavigateToBilling: () => void;
}

const Messages: React.FC<MessagesProps> = ({ 
    currentUser, 
    contacts, 
    messages: _messages, 
    onSendMessage: _onSendMessage, 
    onMarkMessagesAsRead: _onMarkMessagesAsRead,
    preselectedContactId, 
    clearPreselectedContact,
    onNavigateToBilling
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPatient = currentUser.role === 'patient';
  const patientData = isPatient ? (currentUser as Patient) : null;
  const hasCredits = patientData ? patientData.urgentCredits > 0 : false;
  
  // Real-time chat hook
  const realTimeChat = useRealTimeChat({
    currentUserId: currentUser.id,
    selectedContactId: selectedContactId || undefined
  });
  
  const {
    messages,
    unreadCount,
    isConnected,
    typingUsers,
    pendingMessages,
    sendMessage: sendRealTimeMessage,
    markConversationAsRead
  } = realTimeChat;
  
  // Get messages for the current conversation
  const currentConversationMessages = selectedContactId 
    ? realTimeChat.getConversationMessages(selectedContactId)
    : [];

  const sortedContacts = useMemo(() => {
    if (currentUser.role !== 'doctor') return contacts;
    
    const getUnreadInfo = (contactId: string) => {
        const unreadMessages = messages.filter(m => m.senderId === contactId && m.recipientId === currentUser.id && !m.isRead);
        const hasUrgent = unreadMessages.some(m => m.isUrgent);
        return { count: unreadMessages.length, hasUrgent };
    };

    return [...contacts].sort((a, b) => {
        const aInfo = getUnreadInfo(a.id);
        const bInfo = getUnreadInfo(b.id);

        if (aInfo.hasUrgent && !bInfo.hasUrgent) return -1;
        if (!aInfo.hasUrgent && bInfo.hasUrgent) return 1;
        if (aInfo.count > 0 && bInfo.count === 0) return -1;
        if (aInfo.count === 0 && bInfo.count > 0) return 1;
        return a.name.localeCompare(b.name);
    });
  }, [contacts, messages, currentUser.id, currentUser.role]);
  
  useEffect(() => {
    if (preselectedContactId) {
      setSelectedContactId(preselectedContactId);
      markConversationAsRead(preselectedContactId);
      clearPreselectedContact();
    } else if (sortedContacts.length > 0 && !selectedContactId) {
      // On desktop, pre-select the first contact. On mobile, show the list.
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        const firstContactId = sortedContacts[0].id;
        setSelectedContactId(firstContactId);
        markConversationAsRead(firstContactId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedContactId, clearPreselectedContact, sortedContacts]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end',
        inline: 'nearest'
      });
    }
  }, []);

  // Auto-scroll when new messages arrive or conversation changes
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [currentConversationMessages.length, selectedContactId, scrollToBottom]);

  const handleSelectContact = (contactId: string) => {
      setSelectedContactId(contactId);
      markConversationAsRead(contactId);
  }
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedContactId) return;

    if (isPatient && isUrgent && !hasCredits) {
      alert("You don't have any urgent credits left.");
      return;
    }

    sendRealTimeMessage(selectedContactId, input, isUrgent);
    setInput('');
    setIsUrgent(false);
  };

  const handleToggleUrgent = () => {
    if (isPatient && patientData) {
        if (!hasCredits && !isUrgent) {
          return;
        }
        if(patientData.urgentCredits === 1 && !isUrgent) {
            setShowCreditWarning(true);
            setTimeout(() => setShowCreditWarning(false), 5000);
        }
    }
    setIsUrgent(prev => !prev);
  };

  const getAvatarSrc = (contact: Contact) => {
    // No longer use external images - this function is deprecated
    // We now use initials avatars only
    return null;
  };

  // Create initials avatar component
  const InitialsAvatar = ({ contact, size = 'md' }: { contact: Contact; size?: 'sm' | 'md' | 'lg' }) => {
    const initials = getInitials(contact.name, contact.email);
    const colorClass = getInitialsColor(contact.name, contact.email);
    const sizeClasses = getInitialsAvatarClasses(size);
    
    return (
      <div className={`${sizeClasses} ${colorClass}`}>
        <span className="text-white font-medium">
          {initials}
        </span>
      </div>
    );
  };

  const selectedContact = contacts.find(d => d.id === selectedContactId);
  
  const cannotTurnOnUrgent = isPatient && !hasCredits && !isUrgent;

  return (
    <div className="flex h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
      {/* Contact List Panel */}
      <div className={`w-full md:w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col ${selectedContactId ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Conversations</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {sortedContacts.map(contact => {
               const unreadMessages = messages.filter(m => m.senderId === contact.id && m.recipientId === currentUser.id && !m.isRead);
               const hasUnreadUrgent = unreadMessages.some(m => m.isUrgent);
              return (
                  <li key={contact.id}>
                  <button 
                      onClick={() => handleSelectContact(contact.id)}
                      className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedContactId === contact.id ? 'bg-indigo-50 dark:bg-slate-700' : ''}`}
                  >
                      <div className="relative flex-shrink-0">
                          <InitialsAvatar contact={contact} size="md" />
                          {hasUnreadUrgent && <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800"></span>}
                      </div>
                      <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-sm">{contact.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{(contact as Doctor).specialty || (contact as Patient).condition}</p>
                      </div>
                      {unreadMessages.length > 0 && !hasUnreadUrgent && (
                          <span className="bg-indigo-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center flex-shrink-0">
                              {unreadMessages.length > 9 ? '9+' : unreadMessages.length}
                          </span>
                      )}
                  </button>
                  </li>
              )
            })}
          </ul>
        </div>
      </div>
      
      {/* Chat Panel */}
      <div className={`w-full md:w-2/3 flex flex-col ${selectedContactId ? 'flex' : 'hidden md:flex'}`}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center space-x-3 flex-shrink-0">
              <button onClick={() => setSelectedContactId(null)} className="md:hidden p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <ArrowLeftIcon className="h-5 w-5 text-slate-600 dark:text-slate-300"/>
              </button>
              <InitialsAvatar contact={selectedContact} size="md" />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">{selectedContact.name}</h3>
                <div className="flex items-center space-x-2">
                  {typingUsers.has(selectedContact.id) ? (
                    <TypingIndicator 
                      isTyping={true} 
                      userName={selectedContact.name}
                    />
                  ) : (
                    <RealTimeStatus 
                      isConnected={isConnected}
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 min-h-0">
              <div className="p-3">
                <div className="space-y-3">
                  {currentConversationMessages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-lg text-sm break-words ${
                        msg.senderId === currentUser.id
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm shadow-sm border border-slate-200 dark:border-slate-600'
                      } ${msg.isUrgent ? 'ring-2 ring-red-500' : ''} ${
                        pendingMessages.has(msg.id) ? 'opacity-70' : ''
                      }`}>
                        {msg.isUrgent && <div className="font-bold text-xs text-red-200 dark:text-red-300 flex items-center mb-1"><AlertIcon className="h-3 w-3 mr-1"/>URGENT</div>}
                        {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                      </div>
                       <div className="text-xs text-slate-400 mt-1 px-1 flex items-center">
                          {msg.senderId === currentUser.id && (
                              <MessageStatus 
                                isRead={msg.isRead}
                                timestamp={msg.timestamp}
                                isUrgent={msg.isUrgent}
                              />
                          )}
                          {msg.senderId !== currentUser.id && (
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                          {pendingMessages.has(msg.id) && (
                            <span className="ml-2 text-xs text-slate-500">Sending...</span>
                          )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
            
            {/* Message Input Area */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
               {showCreditWarning && (
                <div className="absolute bottom-full left-4 right-4 mb-2 p-3 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-sm rounded-md shadow-lg flex items-center justify-between animate-pulse">
                    <span>You are about to use your last urgent credit.</span>
                    <button 
                        onClick={onNavigateToBilling}
                        className="ml-4 px-3 py-1 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-600 text-xs flex-shrink-0"
                    >
                        Purchase More
                    </button>
                </div>
               )}
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                 <div className="relative group flex-shrink-0">
                    <button
                        type="button"
                        onClick={handleToggleUrgent}
                        disabled={cannotTurnOnUrgent}
                        className={`p-2 rounded-full transition-colors ${isUrgent ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        aria-label="Toggle urgent message"
                    >
                        <AlertIcon className="h-4 w-4" />
                    </button>
                    {isPatient && (
                      <span className="absolute -top-1 -right-1 text-xs bg-sky-500 text-white font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white dark:border-slate-800">
                        {patientData?.urgentCredits}
                      </span>
                    )}
                    {cannotTurnOnUrgent && (
                      <div className="absolute bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          You have no urgent credits. Please purchase more from the Billing page.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800"></div>
                      </div>
                    )}
                 </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    // Trigger typing indicator
                    if (selectedContactId && realTimeChat.startTyping) {
                      realTimeChat.startTyping(selectedContactId);
                    }
                  }}
                  onBlur={() => {
                    // Stop typing when losing focus
                    if (selectedContactId && realTimeChat.stopTyping) {
                      realTimeChat.stopTyping(selectedContactId);
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-indigo-600 text-white p-2 rounded-full font-semibold hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors flex-shrink-0"
                >
                  <PaperAirplaneIcon className="h-4 w-4"/>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8">
            <EmptyMessagesIcon className="h-20 w-20 text-slate-400 dark:text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Select a Conversation</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choose a contact from the list to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;