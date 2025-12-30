
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getAIStudyResponseStream } from '../lib/api';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ICONS } from '../constants';
import { GenerateContentResponse } from '@google/genai';

const StudyHelperPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const stream = await getAIStudyResponseStream(messages, input);
      setMessages((prev) => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === 'model') {
            const updatedMessages = [...prev];
            updatedMessages[prev.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + chunkText,
            };
            return updatedMessages;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto chat-scrollbar pr-4 -mr-4 mb-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0 flex items-center justify-center">
                    <ICONS.bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
                <div
                  className={`max-w-lg px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                    <ICONS.user className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                )}
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0 flex items-center justify-center">
                  <ICONS.bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-none">
                  <Spinner size="sm" color="border-gray-500" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-grow"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? <Spinner /> : <ICONS.send className="w-5 h-5" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudyHelperPage;
