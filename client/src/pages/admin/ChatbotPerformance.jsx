import React, { useState } from 'react';
import { BarChart3, TrendingUp, MessageCircle, AlertCircle } from 'lucide-react';

const ChatbotPerformance = () => {
  const [performance, setPerformance] = useState({
    totalConversations: 1254,
    successRate: 87.5,
    avgResponseTime: 2.3,
    customerSatisfaction: 4.2,
    errorRate: 2.1
  });

  const metrics = [
    { label: 'Total Conversations', value: performance.totalConversations, icon: MessageCircle, color: '#3b82f6' },
    { label: 'Success Rate', value: `${performance.successRate}%`, icon: TrendingUp, color: '#10b981' },
    { label: 'Avg Response Time', value: `${performance.avgResponseTime}s`, icon: BarChart3, color: '#f59e0b' },
    { label: 'Customer Satisfaction', value: `${performance.customerSatisfaction}/5`, icon: MessageCircle, color: '#8b5cf6' },
  ];

  return (
    <div>
      <h1>Chatbot Performance Monitor</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="card" style={{ borderLeft: `4px solid ${metric.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>{metric.label}</p>
                  <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem' }}>{metric.value}</h3>
                </div>
                <Icon size={40} color={metric.color} opacity={0.2} style={{ strokeWidth: 1 }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Performance Alerts</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '5px', display: 'flex', gap: '1rem' }}>
            <AlertCircle color="#ef4444" />
            <div>
              <strong>High Error Rate Detected</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>Error rate exceeds 2% threshold. Check system logs.</p>
            </div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '5px', display: 'flex', gap: '1rem' }}>
            <AlertCircle color="#f59e0b" />
            <div>
              <strong>Response Time Increasing</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>Average response time trending upward. Consider optimization.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Daily Performance Trend</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Conversations</th>
              <th>Success Rate</th>
              <th>Avg Response Time</th>
              <th>Satisfaction</th>
            </tr>
          </thead>
          <tbody>
            {['Dec 28', 'Dec 29', 'Dec 30', 'Dec 31', 'Jan 1'].map((date) => (
              <tr key={date}>
                <td>{date}</td>
                <td>{Math.floor(Math.random() * 200) + 100}</td>
                <td>{(Math.random() * 20 + 80).toFixed(1)}%</td>
                <td>{(Math.random() * 2 + 1.5).toFixed(2)}s</td>
                <td>{(Math.random() * 1 + 3.5).toFixed(1)}/5</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChatbotPerformance;
