import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    github: '',
    email: '',
    topic: 'contribution',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" style={{
      maxWidth: '800px',
      margin: '100px auto 0 auto',
      padding: '0 24px',
      position: 'relative'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="glow-badge" style={{ marginBottom: '12px' }}>Get In Touch</span>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
          Connect with Surfclaw Developers
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto', fontSize: '0.95rem' }}>
          Have ideas, bug reports, or partnership proposals? Get in touch with the core development team.
        </p>
      </div>

      <div className="glass-panel" style={{
        padding: '40px',
        border: '1px solid rgba(0, 240, 255, 0.1)',
        boxShadow: '0 8px 32px 0 rgba(0, 240, 255, 0.02)'
      }}>
        {submitted ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-green)',
              border: '2px solid var(--accent-green)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 700 }}>Message Sent Successfully</h3>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Thank you for reaching out. The developer community team will review your inquiry and get back to you shortly.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="btn btn-secondary"
              style={{ marginTop: '16px', padding: '10px 24px' }}
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="grid-container grid-2col" style={{ gap: '20px' }}>
              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: '#04060a',
                    color: '#fff',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="John Doe"
                />
              </div>

              {/* GitHub Handle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>GitHub Username</label>
                <input
                  type="text"
                  required
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: '#04060a',
                    color: '#fff',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="surfclaw"
                />
              </div>
            </div>

            {/* Email & Topic */}
            <div className="grid-container grid-2col" style={{ gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: '#04060a',
                    color: '#fff',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="john@example.com"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Inquiry Topic</label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: '#04060a',
                    color: '#fff',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="contribution">Open-Source Contribution</option>
                  <option value="feedback">SapParser / Core Feedback</option>
                  <option value="partnership">Multi-Network DePIN Expansion</option>
                  <option value="other">General Inquiry</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Message</label>
              <textarea
                rows="4"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: '#04060a',
                  color: '#fff',
                  outline: 'none',
                  resize: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Type your message details here..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                justifyContent: 'center',
                marginTop: '10px'
              }}
            >
              <span>Submit Message</span>
              <Send size={16} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
