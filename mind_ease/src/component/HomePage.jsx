import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaPaperPlane, FaUserCircle } from "react-icons/fa";

const HomePage = () => {
    const [messages, setMessages] = useState([
        { text: "Hello! How are you feeling today?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessage = { text: input, sender: "user" };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");

        try {
            const response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });
            const data = await response.json();
            setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
        } catch (error) {
            console.error("Error connecting to chatbot:", error);
        }
    };

    const startListening = () => {
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => setInput(event.results[0][0].transcript);
        recognition.start();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 to-indigo-300 p-4 relative">
            
            {/* Profile Section */}
            <div className="absolute top-4 right-6 flex items-center space-x-2 bg-white p-2 rounded-full shadow-md">
                <FaUserCircle className="text-3xl text-gray-700" />
                <span className="text-gray-700 font-semibold">User</span>
            </div>

            {/* Chat Title */}
            <h1 className="text-3xl font-bold text-white mb-4 shadow-lg">MindEase Chatbot</h1>

            {/* Chat Container */}
            <div className="w-full max-w-4xl bg-gradient-to-b from-white to-gray-100 shadow-2xl rounded-2xl p-5 h-[65vh] overflow-y-auto border border-gray-300">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} my-3`}>
                        <div 
                            className={`p-4 rounded-lg shadow-md text-lg transition-all duration-300 transform ${msg.sender === "user" 
                                ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white" 
                                : "bg-gradient-to-r from-teal-400 to-teal-600 text-white"} max-w-xs`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Modern Input Section */}
            <div className="w-full max-w-4xl flex items-center bg-white shadow-lg rounded-full p-3 mt-4 border border-gray-300 relative">
                <button 
                    onClick={startListening} 
                    className={`text-gray-600 text-2xl p-3 rounded-full transition-all duration-200 hover:bg-gray-200 ${isListening ? "animate-pulse" : ""} focus:outline-none`}
                >
                    <FaMicrophone />
                </button>

                <input
                    type="text"
                    className="flex-grow px-5 py-3 outline-none text-lg border-none rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />

                <button 
                    onClick={sendMessage} 
                    className="text-white text-2xl bg-gradient-to-r from-indigo-500 to-indigo-700 p-3 rounded-full ml-2 transition-all duration-200 hover:from-indigo-600 hover:to-indigo-800 active:scale-95 focus:outline-none shadow-md"
                >
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
};

export default HomePage;
