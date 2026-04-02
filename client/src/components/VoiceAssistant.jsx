import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Mic, MicOff, Send } from 'lucide-react';

const VoiceAssistant = () => {
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
    setMessages(prev => [...prev, { type: 'bot', text: 'Order has been saved successfully.' }]);
  };

  const handleCheckout = () => {
    setShowCheckoutModal(false);
    setMessages(prev => [...prev, { type: 'bot', text: 'Proceeding to checkout. Please complete payment.' }]);
    // Here you can add real checkout flow, e.g. navigate to /checkout if exists.
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

      setMessages(prev => [...prev, { type: 'user', text: 'Voice message processed', messageType: 'voice' }]);
      setMessages(prev => [...prev, { type: 'bot', text: `Transcribed: "${text}"`, messageType: 'voice' }]);

      if (order && order.items.length > 0) {
        setCurrentOrder(order);
        setShowCheckoutModal(true);
        setMessages(prev => [...prev, {
          type: 'bot',
          text: `Order created with ${order.items.length} items. Total: ₹${order.total.toFixed(2)}`
        }]);
      } else {
        setMessages(prev => [...prev, { type: 'bot', text: 'No items recognized in the voice message.' }]);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setMessages(prev => [...prev, { type: 'bot', text: 'Error processing voice message.' }]);
    }
  };

  const sendTextMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text, messageType: 'text' }]);
    setTextInput('');
    setMessages(prev => [...prev, { type: 'bot', text: 'Text processing not implemented yet.', messageType: 'text' }]);
  };

  return (
    <div>
      <h1>Voice Assistant</h1>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Previous Chat History</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Sender</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{message.messageType || (message.type === 'user' ? 'voice' : 'bot')}</td>
                  <td>{message.type === 'user' ? 'You' : 'Assistant'}</td>
                  <td>{message.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className={`btn ${isRecording ? 'btn-secondary' : 'btn-primary'}`}
              onClick={isRecording ? stopRecording : startRecording}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <span style={{ color: isRecording ? '#ef4444' : '#6b7280' }}>
              {isRecording ? 'Recording...' : 'Voice'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your message here"
              className="form-control"
              style={{ flex: 1, minWidth: '200px' }}
            />
            <button
              className="btn btn-primary"
              onClick={() => sendTextMessage(textInput)}
            >
              <Send size={16} /> Send
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ height: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
        <h3>Chat</h3>
        <div style={{ marginTop: '1rem' }}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                marginBottom: '0.5rem',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                backgroundColor: message.type === 'user' ? '#dbeafe' : '#f3f4f6',
                alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <strong>{message.type === 'user' ? 'You' : 'Assistant'}:</strong> {message.text}
            </div>
          ))}
        </div>
      </div>

      {showCheckoutModal && currentOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '480px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
          }}>
            <h3>Final Bill & Reward Points</h3>
            <p><strong>Total:</strong> ₹{currentOrder.total.toFixed(2)}</p>
            <p><strong>Reward points earned:</strong> {calculateRewardPoints(currentOrder.total)} point(s)</p>
            <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '6px', padding: '0.5rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowCheckoutModal(false)} style={{ padding: '0.5rem 1rem' }}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handleSaveOrder} style={{ padding: '0.5rem 1rem' }}>
                Save the order
              </button>
              <button className="btn btn-success" onClick={handleCheckout} style={{ padding: '0.5rem 1rem' }}>
                Check out
              </button>
            </div>
          </div>
        </div>
      )}

      {currentOrder && (
        <div className="card">
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
                  <td>${item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
            Total: ${currentOrder.total.toFixed(2)}
          </div>
          <button className="btn btn-primary" onClick={() => setShowCheckoutModal(true)} style={{ marginTop: '1rem' }}>
            View Final Bill
          </button>
          {orderSaved && <p style={{ color: 'green', marginTop: '0.5rem' }}>Order saved locally.</p>}
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;