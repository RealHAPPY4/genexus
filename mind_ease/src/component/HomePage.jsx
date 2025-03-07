import React, { useState } from "react";
import { FaMicrophone, FaPaperclip, FaSearch } from "react-icons/fa";

const HomePage = () => {
    const [messages, setMessages] = useState([
        { text: "Hello! How can I assist you today?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");

    const sendMessage = () => {
        if (input.trim() === "") return;
        
        setMessages([...messages, { text: input, sender: "user" }]);
        setInput("");

        setTimeout(() => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: "I'm here to help!", sender: "bot" }
            ]);
        }, 1000);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setMessages([...messages, { text: `Uploaded: ${file.name}`, sender: "user" }]);
        }
    };

    return (
        <div className="homepage-container flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
            <header className="header text-4xl font-bold text-gray-800 mb-4">
                <h1>MindEase Chatbot</h1>
                <p className="text-lg text-gray-600 mt-2">Your AI-powered assistant</p>
            </header>
            <main className="chatbox w-96 h-96 bg-white shadow-lg rounded-lg flex flex-col p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                        <p className={`p-2 rounded-lg inline-block ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                            {msg.text}
                        </p>
                    </div>
                ))}
            </main>
            <div className="input-area flex w-96 mt-4 items-center">
                <button className="p-2 bg-gray-300 rounded-l-lg hover:bg-gray-400 transition">
                    <FaMicrophone />
                </button>
                <input
                    type="text"
                    className="flex-1 p-2 border focus:outline-none"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="p-2 bg-gray-300 hover:bg-gray-400 transition">
                    <FaSearch />
                </button>
                <label className="p-2 bg-gray-300 hover:bg-gray-400 transition cursor-pointer">
                    <FaPaperclip />
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
                <button
                    className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition"
                    onClick={sendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default HomePage;
