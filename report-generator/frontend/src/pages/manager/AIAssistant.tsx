import React, { useState } from 'react';
import Layout from '../../components/Layout';

const AIAssistant: React.FC = () => {
    const [messages, setMessages] = useState([
        { text: 'Hello! I\'m your AI Assistant. How can I help you today?', sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        setMessages([...messages, { text: input, sender: 'user' }]);
        setInput('');
        setLoading(true);

        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                text: 'I\'m currently in development. I\'ll be able to answer questions about team reports soon!',
                sender: 'ai'
            }]);
            setLoading(false);
        }, 1500);
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">🤖 AI Assistant</h1>

                <div className="bg-white shadow-md rounded-lg h-[500px] flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'user'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <p className="text-sm text-gray-500">Thinking...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about team activity..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-500 text-center">
                    💡 Try asking: "What did the team work on last week?" or "Show me open blockers"
                </div>
            </div>
        </Layout>
    );
};

export default AIAssistant;