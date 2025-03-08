import React, { useState } from "react";
import { FaMicrophone, FaPaperPlane } from "react-icons/fa";

const HomePage = () => {
    const [messages, setMessages] = useState([
        { text: "Hello! How are you feeling today?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessage = { text: input, sender: "user" };
        setMessages([...messages, newMessage]);
        setInput("");

        try {
            const response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });
            const data = await response.json();
            setMessages([...messages, newMessage, { text: data.reply, sender: "bot" }]);
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-teal-200 p-4">
            <h1 className="text-2xl font-bold text-gray-800">MindEase Chatbot</h1>
            <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-4 h-[60vh] overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} my-2`}>
                        <div className={`p-3 rounded-lg shadow-md ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"} max-w-xs`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>
            <div className="w-full max-w-4xl flex items-center bg-white shadow-lg rounded-full p-3 mt-4">
                <button onClick={startListening} className={`text-gray-600 text-xl ${isListening ? "animate-pulse" : ""}`}>
                    <FaMicrophone />
                </button>
                <input
                    type="text"
                    className="flex-grow px-4 py-2 outline-none"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button onClick={sendMessage} className="text-blue-500 text-xl ml-2">
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
};

export default HomePage;
