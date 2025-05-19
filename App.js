import React, { useState } from 'react';

function App() {
  const [event, setEvent] = useState('');
  const [feedback, setFeedback] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseData(null);
    setToast({ message: '', type: '' });

    try {
      const res = await fetch('http://127.0.0.1:5000/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, feedback }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Server error');
      }

      const data = await res.json();
      setResponseData(data);
      setToast({ message: 'Feedback submitted successfully 🎉', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const Toast = ({ message, type }) =>
    message && (
      <div style={{
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'error' ? '#f44336' : '#4caf50',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        fontWeight: '600',
        zIndex: 1000
      }}>
        {message}
      </div>
    );

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.heading}>🎓 Smart Feedback System</h1>
        <p style={styles.subHeading}>Let us know your thoughts on the event!</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Input
            label="📌 Event Name"
            value={event}
            onChange={e => setEvent(e.target.value)}
            placeholder="e.g. Hackathon 2025"
            required
          />

          <Input
            label="💬 Feedback"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Your experience..."
            type="textarea"
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              background: loading
                ? 'linear-gradient(to right, #999, #ccc)'
                : 'linear-gradient(to right, #43cea2, #185a9d)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Submitting...' : '🚀 Submit Feedback'}
          </button>
        </form>

        {loading && (
          <div style={styles.skeleton}>
            <p style={styles.skeletonText}>Analyzing your sentiment...</p>
          </div>
        )}

        {responseData && (
          <div style={{
            ...styles.resultBox,
            borderLeft: `6px solid ${
              responseData.sentiment.includes("Positive")
                ? '#4caf50'
                : responseData.sentiment.includes("Negative")
                  ? '#f44336'
                  : '#ff9800'
            }`,
          }}>
            <h3 style={styles.resultHeading}>🔍 Analysis Result</h3>
            <p><strong>📅 Event:</strong> {responseData.event}</p>
            <p><strong>📝 Feedback:</strong> {responseData.feedback}</p>
            <p><strong>📊 Sentiment:</strong>{" "}
              <span style={{
                color: responseData.sentiment.includes("Positive") ? "#388e3c" :
                  responseData.sentiment.includes("Negative") ? "#d32f2f" : "#f57c00",
                fontWeight: "bold"
              }}>{responseData.sentiment}</span>
            </p>
            <p><strong>🎯 Polarity Score:</strong> {responseData.polarity.toFixed(2)}</p>
          </div>
        )}
      </div>

      <Toast message={toast.message} type={toast.type} />

      {/* Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 600px) {
          .card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

// Reusable Input Component
const Input = ({ label, value, onChange, placeholder, type = 'text', required }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <label style={styles.label}>{label}</label>
    {type === 'textarea' ? (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.textarea}
        required={required}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.input}
        required={required}
      />
    )}
  </div>
);

// Styles
const styles = {
  wrapper: {
    minHeight: '100vh',
    padding: '40px 20px',
    background: 'linear-gradient(to bottom right, #0f2027, #203a43, #2c5364)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '620px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '40px',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
    color: '#fff',
    animation: 'fadeIn 0.6s ease-in-out',
  },
  heading: {
    textAlign: 'center',
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#ffffff',
  },
  subHeading: {
    textAlign: 'center',
    fontSize: '1rem',
    marginBottom: '30px',
    color: '#e0e0e0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  label: {
    fontWeight: '600',
    marginBottom: '6px',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: 'none',
    background: '#ffffffdd',
    color: '#333',
    fontSize: '1rem',
    outline: 'none',
  },
  textarea: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: 'none',
    background: '#ffffffdd',
    color: '#333',
    fontSize: '1rem',
    resize: 'vertical',
    minHeight: '100px',
    outline: 'none',
  },
  button: {
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    color: '#fff',
    transition: '0.2s ease',
  },
  resultBox: {
    marginTop: '30px',
    background: '#ffffffee',
    color: '#333',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'fadeIn 0.6s ease',
  },
  resultHeading: {
    marginBottom: '10px',
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#2c5364',
  },
  skeleton: {
    marginTop: '20px',
    padding: '20px',
    borderRadius: '12px',
    background: '#ffffff33',
    textAlign: 'center',
  },
  skeletonText: {
    color: '#eee',
    fontStyle: 'italic',
  }
};

export default App;
