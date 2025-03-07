import React from "react";

const HomePage = () => {
    return (
        <div className="homepage-container flex flex-col items-center justify-center h-screen bg-blue-50 text-center;}" >
            <header className="header text-4xl font-bold text-gray-800;">
                <h1>MindEase Chatbot</h1>
                <p className="text-lg text-gray-600 mt-2;">Your AI-powered mental health companion</p>
            </header>
            <main className="content">
                <p className="text-md text-gray-700 mt-4;">Talk to our chatbot to relieve stress, gain insights, and feel better.</p>
                <button className="chat-button mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition;">Start Chat</button>
            </main>
        </div>
    );
};

export default HomePage;
