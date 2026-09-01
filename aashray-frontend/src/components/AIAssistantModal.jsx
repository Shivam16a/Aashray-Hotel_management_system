// src/components/AIAssistantModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { askAashrayAI } from '../services/api';
import aashrayLogo from '../assets/Aasray.svg';

const AIAssistantModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your **Aashray Concierge AI**. Ask me anything about our luxury sanctuaries, pricing, amenities, or the villa booking process!'
    }
  ]);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    const userText = inputMsg.trim();
    if (!userText || loading) return;

    const updatedMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(updatedMessages);
    setInputMsg('');
    setLoading(true);

    try {
      const res = await askAashrayAI({ message: userText });
      if (res.data && res.data.success) {
        setMessages([...updatedMessages, { sender: 'assistant', text: res.data.reply }]);
      } else {
        setMessages([...updatedMessages, { sender: 'assistant', text: 'Sorry, I could not process your query right now.' }]);
      }
    } catch (err) {
      setMessages([
        ...updatedMessages,
        { sender: 'assistant', text: 'I am the dedicated Aashray AI Concierge. Please ask queries related only to the Aashray portal or villa booking processes.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInputMsg(prompt);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="ai-floating-trigger position-fixed bottom-0 end-0 m-2 m-sm-3 m-md-4" style={{ zIndex: 1050 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-lightning rounded-pill shadow-lg px-3 py-2 d-flex align-items-center gap-2 border border-info"
          style={{ 
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.45)',
            transition: 'all 0.25s ease'
          }}
          aria-label="Toggle AI Concierge"
        >
          <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-wand-magic-sparkles'} text-dark fs-6 fs-md-5`}></i>
          <span className="fw-bold text-dark d-none d-sm-inline small">
            {isOpen ? 'Close Concierge' : 'Aashray AI Concierge'}
          </span>
        </button>
      </div>

      {/* Responsive Chat Window */}
      {isOpen && (
        <div className="ai-chat-window position-fixed cyber-card p-0 d-flex flex-column shadow-lg border border-info border-opacity-50">
          
          {/* Header */}
          <div className="p-3 bg-dark bg-opacity-95 border-bottom border-secondary border-opacity-50 d-flex align-items-center justify-content-between flex-shrink-0">
            <div className="d-flex align-items-center gap-2">
              <img src={aashrayLogo} alt="Logo" style={{ width: '28px', height: '28px' }} />
              <div>
                <h6 className="fw-bold text-white mb-0" style={{ fontSize: '13px', letterSpacing: '0.5px' }}>
                  AASHRAY AI CONCIERGE
                </h6>
                <span className="text-cyan-glow" style={{ fontSize: '10px' }}>
                  <i className="fa-solid fa-circle-dot me-1 text-success"></i>Stay & Booking Guide
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="btn btn-sm btn-outline-secondary border-0 rounded-circle text-subtext"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark fs-6"></i>
            </button>
          </div>

          {/* Quick Guidance Horizontal Scroll Strip */}
          <div className="p-2 bg-dark bg-opacity-60 border-bottom border-secondary border-opacity-25 d-flex gap-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none', whiteSpace: 'nowrap' }}>
            <button 
              onClick={() => handleQuickPrompt("What is the process of booking a villa from Aashray portal?")}
              className="btn btn-sm btn-action py-1 px-2 text-subtext rounded-pill"
              style={{ fontSize: '11px' }}
            >
              Villa Booking Process
            </button>
            <button 
              onClick={() => handleQuickPrompt("What are the cancellation policies?")}
              className="btn btn-sm btn-action py-1 px-2 text-subtext rounded-pill"
              style={{ fontSize: '11px' }}
            >
              Cancellation Policy
            </button>
            <button 
              onClick={() => handleQuickPrompt("Show available luxury stays in Goa and Manali")}
              className="btn btn-sm btn-action py-1 px-2 text-subtext rounded-pill"
              style={{ fontSize: '11px' }}
            >
              Explore Destinations
            </button>
          </div>

          {/* Message History Feed */}
          <div className="p-3 flex-grow-1 overflow-y-auto d-flex flex-column gap-3" style={{ fontSize: '13px' }}>
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div 
                  className={`p-3 rounded-3 ${
                    msg.sender === 'user' 
                      ? 'bg-info text-dark fw-semibold' 
                      : 'bg-dark bg-opacity-90 text-white border border-secondary border-opacity-50'
                  }`}
                  style={{ 
                    maxWidth: '88%', 
                    lineHeight: '1.45', 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    boxShadow: msg.sender === 'user' ? '0 0 12px rgba(0, 240, 255, 0.3)' : 'none'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="d-flex justify-content-start">
                <div className="p-2 p-sm-3 rounded-3 bg-dark text-cyan-glow border border-secondary border-opacity-50 small d-flex align-items-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Consulting Aashray Concierge...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input Form */}
          <form onSubmit={handleSend} className="p-2 bg-dark bg-opacity-95 border-top border-secondary border-opacity-50 d-flex gap-2 flex-shrink-0">
            <input
              type="text"
              className="form-control cyber-input py-2 px-3"
              placeholder="Ask about villas, bookings, policies..."
              style={{ fontSize: '13px' }}
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={loading || !inputMsg.trim()} 
              className="btn btn-lightning px-3"
              aria-label="Send"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>

        </div>
      )}
    </>
  );
};

export default AIAssistantModal;