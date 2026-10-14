import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Clock, 
  ArrowRight, 
  CornerDownLeft, 
  Cpu, 
  Terminal, 
  Lock 
} from 'lucide-react';
import { executeAntigravityQuery } from '../services/antigravityAgentService';

export default function AntigravityAgentModal({ 
  isOpen, 
  onClose, 
  onNavigateToTab, 
  onStartChat, 
  onOpenHallmark, 
  onShowToast 
}) {
  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'agent',
      tokens: [
        'Namaste! I am the **FindCo Antigravity Agent**, an intelligent autonomous companion concierge.',
        '\n\nAsk me to find verified buddies in your city, calculate escrow deposits, check availability, or audit any companion’s cryptographic Hallmark Trust Seal.'
      ],
      thoughts: [],
      toolCalls: [],
      uiCard: null
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showThoughtsIndex, setShowThoughtsIndex] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating]);

  if (!isOpen) return null;

  const handleSendPrompt = async (promptText) => {
    const text = (promptText || inputValue).trim();
    if (!text || isGenerating) return;

    setInputValue('');

    const userMsgId = `user_${Date.now()}`;
    const agentMsgId = `agent_${Date.now()}`;

    // Add user message & empty agent placeholder
    setMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'user', text },
      { id: agentMsgId, sender: 'agent', tokens: [], thoughts: [], toolCalls: [], uiCard: null }
    ]);

    setIsGenerating(true);

    try {
      const generator = executeAntigravityQuery(text);

      for await (const chunk of generator) {
        setMessages(prev => prev.map(m => {
          if (m.id === agentMsgId) {
            if (chunk.type === 'thought') {
              return { ...m, thoughts: [...m.thoughts, chunk.text] };
            }
            if (chunk.type === 'tool_call') {
              return { ...m, toolCalls: [...m.toolCalls, chunk] };
            }
            if (chunk.type === 'token') {
              return { ...m, tokens: [...m.tokens, chunk.text] };
            }
            if (chunk.type === 'ui_card') {
              return { ...m, uiCard: chunk };
            }
          }
          return m;
        }));
      }
    } catch (err) {
      console.error('[Antigravity Agent Error]:', err);
      setMessages(prev => prev.map(m => {
        if (m.id === agentMsgId) {
          return {
            ...m,
            tokens: [...m.tokens, 'An error occurred while executing the Antigravity agent loop. Please try again.']
          };
        }
        return m;
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleThoughts = (msgId) => {
    setShowThoughtsIndex(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const quickPrompts = [
    '☕ Find coffee buddy in Bengaluru under ₹500',
    '🏋️ Need a gym spotter in Indiranagar 7 AM',
    '🛡️ Audit Priya Sharma\'s Hallmark Trust Seal',
    '⚡ Book 2-hour hangout with Arjun Mehta'
  ];

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2300,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--text-main, #0f172a)',
          width: '100%',
          maxWidth: 680,
          height: '85vh',
          borderRadius: 24,
          border: '1px solid var(--border-subtle, #e2e8f0)',
          boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Antigravity Agent Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '18px 24px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #ff5e5b 0%, #ff8b7b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(255, 94, 91, 0.4)'
            }}>
              <Bot size={24} color="#ffffff" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  FindCo Antigravity Concierge
                </h3>
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  padding: '2px 8px',
                  borderRadius: 20,
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}>
                  SDK Runtime v1.2
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Autonomous companion matching, escrow locks & Hallmark audits
              </div>
            </div>
          </div>

          <button
            type="button"
            id="antigravity-close-btn"
            aria-label="Close Concierge Modal"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Stream Scroll Area */}
        <div style={{
          flex: 1,
          padding: '20px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          background: 'var(--bg-main, #f8fafc)'
        }}>
          {messages.map((msg, index) => (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {msg.sender === 'user' ? (
                <div style={{
                  background: 'var(--color-primary, #ff5e5b)',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '16px 16px 4px 16px',
                  maxWidth: '80%',
                  fontSize: '0.88rem',
                  lineHeight: 1.45,
                  boxShadow: '0 2px 8px rgba(255, 94, 91, 0.25)'
                }}>
                  {msg.text}
                </div>
              ) : (
                <div style={{ maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  
                  {/* Antigravity Thought Reasoning Collapsible */}
                  {msg.thoughts && msg.thoughts.length > 0 && (
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.04)',
                      border: '1px solid rgba(15, 23, 42, 0.08)',
                      borderRadius: 10,
                      overflow: 'hidden',
                      fontSize: '0.74rem'
                    }}>
                      <button
                        type="button"
                        onClick={() => toggleThoughts(msg.id)}
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'none',
                          border: 'none',
                          color: '#475569',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Cpu size={13} color="#6366f1" />
                          Antigravity Reasoning Stream ({msg.thoughts.length} steps)
                        </span>
                        {showThoughtsIndex[msg.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {showThoughtsIndex[msg.id] && (
                        <div style={{
                          padding: '8px 12px',
                          background: 'rgba(15, 23, 42, 0.06)',
                          borderTop: '1px solid rgba(15, 23, 42, 0.05)',
                          color: '#334155',
                          fontFamily: 'monospace',
                          lineHeight: 1.4,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4
                        }}>
                          {msg.thoughts.map((t, i) => (
                            <div key={i} style={{ display: 'flex', gap: 6 }}>
                              <span style={{ color: '#6366f1' }}>›</span>
                              <span>{t}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tool Call Badges */}
                  {msg.toolCalls && msg.toolCalls.map((tc, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#e0e7ff',
                        color: '#3730a3',
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        alignSelf: 'flex-start'
                      }}
                    >
                      <Terminal size={12} />
                      Tool Executed: {tc.tool}
                    </div>
                  ))}

                  {/* Conversational Text Response */}
                  <div style={{
                    background: 'var(--bg-card, #ffffff)',
                    color: 'var(--text-main, #0f172a)',
                    border: '1px solid var(--border-subtle, #e2e8f0)',
                    padding: '14px 18px',
                    borderRadius: '16px 16px 16px 4px',
                    fontSize: '0.88rem',
                    lineHeight: 1.55,
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
                  }}>
                    {msg.tokens.length === 0 && isGenerating ? (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="dot-pulse" />
                        Generating response...
                      </span>
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {msg.tokens.join('')}
                      </div>
                    )}
                  </div>

                  {/* Interactive UI Card Attachments */}
                  {msg.uiCard && (
                    <div style={{ marginTop: 4 }}>
                      
                      {/* 1. Companion List Matches */}
                      {msg.uiCard.cardType === 'companion_list' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                          {msg.uiCard.data.map((companion) => (
                            <div 
                              key={companion.id}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 14,
                                padding: '12px 14px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                              }}
                            >
                              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <img 
                                  src={companion.avatar} 
                                  alt={companion.name} 
                                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {companion.name}
                                    <CheckCircle2 size={13} color="#059669" />
                                  </div>
                                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                    {companion.city} • ₹{companion.hourlyRate}/hr
                                  </div>
                                </div>
                              </div>

                              <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.3 }}>
                                {companion.services[0]}
                              </div>

                              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onOpenHallmark(companion);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: '#f1f5f9',
                                    color: '#334155',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 4
                                  }}
                                >
                                  <Award size={12} color="#059669" />
                                  Hallmark
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onStartChat(companion);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: 'var(--color-primary, #ff5e5b)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Chat & Hire
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 2. Hallmark Audit Card */}
                      {msg.uiCard.cardType === 'hallmark_summary' && (
                        <div style={{
                          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
                          color: '#ffffff',
                          borderRadius: 14,
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: '0 6px 20px rgba(6, 78, 59, 0.25)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Award size={28} color="#fef08a" />
                            <div>
                              <div style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: 700 }}>
                                {msg.uiCard.data.hallmarkId}
                              </div>
                              <div style={{ fontSize: '0.94rem', fontWeight: 800 }}>
                                {msg.uiCard.data.tier} Cleared
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenHallmark(msg.uiCard.data);
                            }}
                            style={{
                              background: '#fef08a',
                              color: '#064e3b',
                              border: 'none',
                              borderRadius: 8,
                              padding: '6px 12px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            View Full Dossier
                          </button>
                        </div>
                      )}

                      {/* 3. Booking Confirmation Card */}
                      {msg.uiCard.cardType === 'booking_confirmation' && (
                        <div style={{
                          background: '#ecfdf5',
                          border: '1px solid #10b981',
                          borderRadius: 14,
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 800 }}>
                              ESCROW LOCKED • PIN: {msg.uiCard.data.handshakePin}
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#064e3b' }}>
                              {msg.uiCard.data.title}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#065f46' }}>
                              {msg.uiCard.data.dateTime} • Total ₹{msg.uiCard.data.amount}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onNavigateToTab('dashboard');
                            }}
                            className="btn-primary"
                            style={{
                              padding: '6px 14px',
                              fontSize: '0.78rem'
                            }}
                          >
                            Open Dashboard
                          </button>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div style={{
          padding: '8px 20px',
          background: 'var(--bg-card, #ffffff)',
          borderTop: '1px solid var(--border-subtle, #e2e8f0)',
          display: 'flex',
          gap: 8,
          overflowX: 'auto'
        }}>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isGenerating}
              onClick={() => handleSendPrompt(qp)}
              style={{
                whiteSpace: 'nowrap',
                padding: '5px 12px',
                fontSize: '0.74rem',
                fontWeight: 600,
                borderRadius: 20,
                border: '1px solid var(--border-subtle, #e2e8f0)',
                background: 'var(--bg-elevated, #f8fafc)',
                color: 'var(--text-secondary, #475569)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '14px 20px',
          background: 'var(--bg-card, #ffffff)',
          borderTop: '1px solid var(--border-subtle, #e2e8f0)',
          display: 'flex',
          gap: 10,
          alignItems: 'center'
        }}>
          <input 
            type="text"
            placeholder="Ask Antigravity: 'Find coffee buddy in Bengaluru under ₹500'..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendPrompt();
            }}
            disabled={isGenerating}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid var(--border-subtle, #cbd5e1)',
              background: 'var(--bg-elevated, #f8fafc)',
              color: 'var(--text-main, #0f172a)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />

          <button
            type="button"
            onClick={() => handleSendPrompt()}
            disabled={!inputValue.trim() || isGenerating}
            className="btn-primary"
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.86rem',
              opacity: !inputValue.trim() || isGenerating ? 0.6 : 1
            }}
          >
            <Send size={15} />
            Run
          </button>
        </div>

      </div>
    </div>
  );
}
