import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Mic, MicOff, Send, FileAudio } from 'lucide-react';
import './CustomerVoiceAssistant.css';

const CustomerVoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);
  const [textInput, setTextInput] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const calculateRewardPoints = (total) => Math.floor(total / 150);

  const handleSaveOrder = () => {
    setOrderSaved(true);
    setShowCheckoutModal(false);
    setMessages(prev => [...prev, { type: 'bot', text: 'Order has been saved successfully.', messageType: 'system' }]);
  };

  const handleCheckout = () => {
    setShowCheckoutModal(false);
    setMessages(prev => [...prev, { type: 'bot', text: 'Proceeding to checkout. Please complete payment.', messageType: 'system' }]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await axios.post('/api/process-voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { text, order } = response.data;

      setMessages(prev => [...prev, { type: 'user', text: 'Voice message', messageType: 'voice' }]);
      setMessages(prev => [...prev, { type: 'bot', text: `Transcribed: "${text}"`, messageType: 'voice' }]);

      if (order && order.items.length > 0) {
        setCurrentOrder(order);
        setShowCheckoutModal(true);
        setMessages(prev => [...prev, {
          type: 'bot',
          text: `Order created with ${order.items.length} items. Total: ₹${order.total.toFixed(2)}`,
          messageType: 'system'
        }]);
      } else {
        setMessages(prev => [...prev, { type: 'bot', text: 'No items recognized in the voice message.', messageType: 'system' }]);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setMessages(prev => [...prev, { type: 'bot', text: 'Error processing voice message.', messageType: 'system' }]);
    }
  };

  const sendTextMessage = () => {
    if (!textInput.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text: textInput, messageType: 'text' }]);
    setTextInput('');
    setMessages(prev => [...prev, { type: 'bot', text: 'Thanks for your message. We are processing it.', messageType: 'text' }]);
  };

  return (
    <div className="customer-voice-assistant">
      {/* Promotion Banner */}
      <div className="promo-banner">
        <div className="promo-content">
          <h2>🎉 Special Offer!</h2>
          <p>Get 20% off on your first order using AI Voice Assistant</p>
          <span className="promo-code">Code: VOICEAI20</span>
        </div>
      </div>

      {/* Chat History Section */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>Previous Chat History</h3>
        <div className="chat-history-table">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Sender</th>
                <th>Message</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af' }}>No chat history yet</td>
                </tr>
              ) : (
                messages.map((message, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <span className={`badge badge-${message.messageType || 'text'}`}>
                        {message.messageType || 'text'}
                      </span>
                    </td>
                    <td>{message.type === 'user' ? 'You' : 'Bot'}</td>
                    <td>{message.text.substring(0, 50)}...</td>
                    <td>{new Date().toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input Controls */}
      <div className="card input-controls">
        <div className="control-section">
          <div className="button-group voice-buttons">
            <button
              className={`btn voice-btn ${isRecording ? 'btn-recording' : 'btn-primary'}`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              <span>{isRecording ? 'Recording' : 'Voice'}</span>
            </button>
            {isRecording && <span className="recording-indicator">● Recording...</span>}
          </div>

          <div className="button-group text-input-group">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              placeholder="Type your message here..."
              className="form-control"
            />
            <button
              className="btn btn-primary send-btn"
              onClick={sendTextMessage}
            >
              <Send size={18} />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Display Area */}
      <div className="card chat-area">
        <h3>Chat Conversation</h3>
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <FileAudio size={40} opacity={0.3} />
              <p>Start a conversation by speaking or typing</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`message message-${message.type} message-type-${message.messageType}`}
              >
                <div className="message-bubble">
                  <strong>{message.type === 'user' ? 'You' : 'Assistant'}:</strong>
                  <p>{message.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Current Order */}
      {currentOrder && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>Current Order</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {currentOrder.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
            Total: ₹{currentOrder.total.toFixed(2)}
          </div>
          <button className="btn btn-primary" onClick={() => setShowCheckoutModal(true)} style={{ marginTop: '1rem' }}>
            View Final Bill
          </button>
          {orderSaved && <p style={{ color: 'green', marginTop: '0.5rem' }}>✓ Order saved locally.</p>}
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && currentOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Final Bill & Reward Points</h3>
            <p><strong>Total:</strong> ₹{currentOrder.total.toFixed(2)}</p>
            <p><strong>Reward points earned:</strong> {calculateRewardPoints(currentOrder.total)} point(s)</p>
            <div className="modal-items">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '4px' }}>Item</th>
                    <th style={{ textAlign: 'right', padding: '4px' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '4px' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '4px' }}>{item.product}</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ padding: '4px', textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={() => setShowCheckoutModal(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handleSaveOrder}>
                Save Order
              </button>
              <button className="btn btn-success" onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerVoiceAssistant;
