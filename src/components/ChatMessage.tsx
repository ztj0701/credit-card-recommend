import React from 'react';
import { UserCircle2, Bot } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-4`}>
      <div className="flex-shrink-0">
        {isUser ? (
          <UserCircle2 className="w-8 h-8 text-blue-500" />
        ) : (
          <Bot className="w-8 h-8 text-green-500" />
        )}
      </div>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isUser
            ? 'bg-blue-500 text-white rounded-tr-none'
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span className="text-xs opacity-70 block mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}