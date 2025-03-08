import React, { useState, useEffect } from "react";
import { FaMicrophone, FaPaperclip, FaPaperPlane, FaTrash } from "react-icons/fa";

// OpenAI API Configuration
const OPENAI_API_KEY = "your-api-key"; // Replace with your API key

const HomePage = () => {
    const [messages, setMessages] = useState([
        { text: "Hello! How can I assist you today?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    
    // Web Speech API for voice input
    const recognition = window.SpeechRecognition || window.webkitSpeechRecognition ? 
        new (window.SpeechRecognition || window.webkitSpeechRecognition)() : null;

    useEffect(() => {
        if (recognition) {
            recognition.continuous = false;
            recognition.lang = "en-US";
            recognition.onresult = (event) => {
                setInput(event.results[0][0].transcript);
            };
            recognition.onerror = (event) => console.error("Speech Recognition Error:", event.error);
        }
    }, []);

    // Function to handle sending a message
    const sendMessage = async (messageText) => {
        if (!messageText.trim()) return;

        setMessages([...messages, { text: messageText, sender: "user" }]);
        setInput("");

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: messageText }]
                })
            });

            const data = await response.json();
            const botReply = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand.";

            setMessages((prevMessages) => [...prevMessages, { text: botReply, sender: "bot" }]);
        } catch (error) {
            console.error("Error fetching AI response:", error);
        }
    };

    // Function to handle voice input
    const handleVoiceInput = () => {
        if (!recognition) return alert("Voice input not supported in this browser.");
        setIsListening(true);
        recognition.start();
        recognition.onend = () => setIsListening(false);
    };

    // Function to clear the chat
    const clearChat = () => setMessages([]);

    // Pre-set conversation starters
    const quickReplies = ["I feel anxious", "I need relaxation", "Give me motivation", "Help me sleep"];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-teal-400 p-4">
            <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl p-6">
                {/* Header */}
                <header className="text-4xl font-bold text-gray-800 text-center">
                    <h1>MindEase Chatbot</h1>
                    <p className="text-lg text-gray-600 mt-2">Your AI-powered stress management assistant</p>
                </header>

                {/* Quick Replies */}
                <div className="quick-replies flex flex-wrap gap-3 my-4 justify-center">
                    {quickReplies.map((text, index) => (
                        <button
                            key={index}
                            className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition"
                            onClick={() => sendMessage(text)}
                        >
                            {text}
                        </button>
                    ))}
                </div>

                {/* Chatbox */}
                <main className="chatbox w-full h-[60vh] bg-gray-100 shadow-inner rounded-lg p-5 overflow-y-auto border border-gray-300">
                    {messages.length === 0 ? (
                        <p className="text-gray-500 text-lg text-center">Chat cleared. Start a new conversation!</p>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-2`}>
                                <p className={`p-3 rounded-xl max-w-xs md:max-w-md ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                                    {msg.text}
                                </p>
                            </div>
                        ))
                    )}
                </main>

                {/* Clear Chat Button */}
                <div className="flex justify-center mt-4">
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2 hover:bg-red-600 transition"
                        onClick={clearChat}
                    >
                        <FaTrash /> Clear Chat
                    </button>
                </div>

                {/* Input Area */}
                <div className="input-area flex w-full mt-4 items-center bg-white rounded-full shadow-lg p-2 border border-gray-300">
                    {/* Voice Input Button */}
                    <button 
                        className={`p-3 rounded-full mx-2 transition ${isListening ? "bg-red-400" : "bg-gray-300 hover:bg-gray-400"}`}
                        onClick={handleVoiceInput}
                    >
                        <FaMicrophone className="text-gray-700" />
                    </button>

                    {/* Text Input */}
                    <input
                        type="text"
                        className="flex-1 p-3 border-none focus:outline-none text-lg"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage(input)}
                    />

                    {/* File Upload */}
                    <label className="p-3 bg-gray-300 hover:bg-gray-400 transition cursor-pointer mx-2 rounded-full">
                        <FaPaperclip className="text-gray-700" />
                        <input type="file" className="hidden" />
                    </label>

                    {/* Send Button */}
                    <button
                        className="p-3 bg-blue-500 text-white rounded-full mx-2 hover:bg-blue-600 transition"
                        onClick={() => sendMessage(input)}
                    >
                        <FaPaperPlane />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
