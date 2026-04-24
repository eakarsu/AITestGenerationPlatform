import React from 'react';
import { FaRobot, FaClock, FaCoins, FaCheckCircle, FaBrain } from 'react-icons/fa';
import '../styles/AIResponse.css';

function AIResponseDisplay({ result, loading }) {
  if (loading) {
    return (
      <div className="ai-response-container loading">
        <div className="ai-loading">
          <div className="ai-loading-icon">
            <FaBrain className="pulse" />
          </div>
          <h3>AI is analyzing...</h3>
          <p>Processing your request with Claude AI</p>
          <div className="loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const formatContent = (content) => {
    if (!content) return '';
    // Convert markdown-style headers
    let formatted = content
      .replace(/^### (.*$)/gm, '<h4 class="ai-h4">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 class="ai-h3">$1</h3>')
      .replace(/^# (.*$)/gm, '<h2 class="ai-h2">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="ai-code-block"><code>$2</code></pre>')
      .replace(/`(.*?)`/g, '<code class="ai-inline-code">$1</code>')
      .replace(/^- (.*$)/gm, '<li class="ai-list-item">$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ai-list-item-num">$2</li>')
      .replace(/\n\n/g, '</p><p class="ai-paragraph">')
      .replace(/\n/g, '<br/>');
    return formatted;
  };

  return (
    <div className="ai-response-container">
      <div className="ai-response-header">
        <div className="ai-response-title">
          <FaRobot className="ai-icon" />
          <h3>AI Analysis Result</h3>
        </div>
        <div className="ai-response-meta">
          {result.usage && (
            <>
              <span className="meta-chip">
                <FaCoins /> {result.usage.totalTokens || 0} tokens
              </span>
            </>
          )}
          <span className="meta-chip">
            <FaClock /> {result.generatedAt ? new Date(result.generatedAt).toLocaleString() : 'Just now'}
          </span>
          <span className="meta-chip success">
            <FaCheckCircle /> {result.model || 'Claude AI'}
          </span>
        </div>
      </div>

      <div className="ai-response-body">
        <div
          className="ai-content"
          dangerouslySetInnerHTML={{ __html: formatContent(result.content) }}
        />
      </div>
    </div>
  );
}

export default AIResponseDisplay;
