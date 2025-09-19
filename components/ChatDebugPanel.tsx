import React from 'react';
import { useRealTimeChat } from '../hooks/useRealTimeChatV2';

interface ChatDebugPanelProps {
  currentUserId: string;
  selectedContactId?: string;
}

export const ChatDebugPanel: React.FC<ChatDebugPanelProps> = ({ 
  currentUserId, 
  selectedContactId 
}) => {
  const {
    messages,
    isConnected,
    unreadCount,
    typingUsers,
    pendingMessages
  } = useRealTimeChat({
    currentUserId,
    selectedContactId
  });

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono max-w-xs z-50">
      <h3 className="text-yellow-400 font-bold mb-2">Real-Time Chat Debug</h3>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Connected:</span>
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? 'YES' : 'NO'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Messages:</span>
          <span className="text-blue-400">{messages.length}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Unread:</span>
          <span className="text-orange-400">{unreadCount}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Pending:</span>
          <span className="text-purple-400">{pendingMessages.size}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Typing Users:</span>
          <span className="text-cyan-400">{typingUsers.size}</span>
        </div>
        
        {selectedContactId && (
          <div className="flex justify-between">
            <span>Selected:</span>
            <span className="text-pink-400">{selectedContactId.slice(0, 8)}...</span>
          </div>
        )}
        
        {typingUsers.size > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-cyan-400">Currently Typing:</div>
            {Array.from(typingUsers).map(userId => (
              <div key={userId} className="text-cyan-200 ml-2">
                {userId.slice(0, 8)}...
              </div>
            ))}
          </div>
        )}
        
        {pendingMessages.size > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-purple-400">Sending Messages:</div>
            {Array.from(pendingMessages).map(msgId => (
              <div key={msgId} className="text-purple-200 ml-2">
                {msgId.slice(0, 12)}...
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};