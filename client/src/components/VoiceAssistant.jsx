import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Mic, MicOff, Send } from 'lucide-react';

const VoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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

      setMessages(prev => [...prev, { type: 'user', text: 'Voice message processed' }]);
      setMessages(prev => [...prev, { type: 'bot', text: `Transcribed: "${text}"` }]);

      if (order && order.items.length > 0) {
        setCurrentOrder(order);
        setMessages(prev => [...prev, {
          type: 'bot',
          text: `Order created with ${order.items.length} items. Total: $${order.total.toFixed(2)}`
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
    // For now, just add to messages. Could extend to process text orders
    setMessages(prev => [...prev, { type: 'user', text }]);
    setMessages(prev => [...prev, { type: 'bot', text: 'Text processing not implemented yet.' }]);
  };

  return (
    <div>
      <h1>Voice Assistant</h1>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className={`btn ${isRecording ? 'btn-secondary' : 'btn-primary'}`}
            onClick={isRecording ? stopRecording : startRecording}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          <span style={{ color: isRecording ? '#ef4444' : '#6b7280' }}>
            {isRecording ? 'Recording...' : 'Click to record voice order'}
          </span>
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
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;