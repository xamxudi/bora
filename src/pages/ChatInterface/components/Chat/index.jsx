import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineLoading } from 'react-icons/ai';
import { ChatService } from '../../../../services/ChatService';
import MessageContent from '../Message/MessageContent';
import { processStreamingContent } from '../../utils/messageUtils';
import { CHAT_CONFIG } from '../../config/chatConfig';
import { useMessage } from '../../../../contexts/MessageContext';
import '../../styles/index.css';
import '../../styles/mobile.css';

const Chat = ({
  sessionId,
  messages,
  setMessages,
  providers,
  providerId,
  selectedModel,
  setSelectedModel,
  createConversation
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const botContentRef = useRef('');
  const messagesEndRef = useRef(null);
  const activeModelList = useMemo(() => {
    const activeProvider = providers?.find(p => p.id === providerId);
    return activeProvider?.aiModels || [];
  }, [providers, providerId]);
  const navigate = useNavigate();
  const notiMessage = useMessage();

  useEffect(() => {
    if (!selectedModel && activeModelList.length > 0) {
      const defaultModel = activeModelList[0];
      setSelectedModel(defaultModel.name);
      setSelectedModelId(defaultModel.id);
    }
  }, [selectedModel, activeModelList, setSelectedModel]);

  useEffect(() => {
    if (selectedModel && activeModelList.length > 0) {
      const match = activeModelList.find(m => m.name.toLowerCase() === selectedModel.toLowerCase());
      if (match) setSelectedModelId(match.id);
    }
  }, [selectedModel, activeModelList]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const selectedModelDisplayName = useMemo(() =>
    activeModelList.find(m => m.name.toLowerCase() === selectedModel?.toLowerCase())?.displayName ||
    selectedModel ||
    activeModelList[0]?.displayName || 'Vui lòng chọn đoạn chat hoặc tạo mới'
  , [activeModelList, selectedModel]);

  const createAndSend = async () => {
    sessionId = await createConversation();
    await sendMessage();
    navigate(`/GenerativeAIChat/${sessionId}`);
  }
  const sendMessage = async () => {
    if (!input.trim() || !sessionId || !selectedModelId) return;

    const userMessage = {
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
      modelName: selectedModelDisplayName,
    };

    setMessages(prev => [...(prev || []), userMessage]);
    setInput('');
    setIsLoading(true);
    botContentRef.current = '';
    const assistantId = Date.now();

    try {
      await ChatService.sendMessageStream({
        message: userMessage.content,
        chatId: sessionId,
        modelId: selectedModelId,
        onData: (chunk) => {
          botContentRef.current += chunk;
          const processedContent = processStreamingContent(botContentRef.current);

          setMessages(prev => {
            const prevArray = prev || [];
            const last = prevArray[prevArray.length - 1];
            const assistantMessage = {
              id: assistantId,
              role: 'assistant',
              content: processedContent,
              isStreaming: true,
              createdAt: new Date().toISOString(),
              modelName: selectedModelDisplayName,
            };
            if (last?.role === 'assistant' && last?.id === assistantId) {
              return [...prevArray.slice(0, -1), assistantMessage];
            } else {
              return [...prevArray, assistantMessage];
            }
          });
        },
      });

      setMessages(prev => {
        const prevArray = prev || [];
        const last = prevArray[prevArray.length - 1];
        if (last?.role === 'assistant' && last?.id === assistantId) {
          return [...prevArray.slice(0, -1), {
            ...last,
            isStreaming: false,
          }];
        }
        return prevArray;
      });

    } catch (ex) {
      notiMessage.error(ex.message ?? CHAT_CONFIG.ERROR_MESSAGES.CONNECTION_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if(sessionId)
          sendMessage();
        else
          createAndSend();
    }
  };

  const renderMessageContent = (msg) => <MessageContent content={msg.content} />;
  return (
    <div className="chat-main">
      {activeModelList.length > 0 && (
        <div className="model-select-box">
          <label htmlFor="model-select">Model:</label>
          <select
            id="model-select"
            value={selectedModelId || ''}
            onChange={(e) => {
              const modelId = parseInt(e.target.value);
              setSelectedModelId(modelId);
              const modelObj = activeModelList.find(m => m.id === modelId);
              if (modelObj) setSelectedModel(modelObj.name);
            }}
          >
            {activeModelList.map(model => (
              <option key={model.id} value={model.id}>
                {model.displayName || model.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!sessionId ? (
        <div className="chat-welcome">
          <h1>{selectedModelDisplayName}</h1>
        </div>
      ) : (
        <div className="chat-messages">
          {(messages || []).map((msg, i) => (
            <div key={msg.id || i} className={`chat-message ${msg.role === 'user' ? 'user' : 'gpt'}`}>
              <div className="message-role">{msg.role === 'user' ? 'You' : 'AI'}</div>
              <div className="message-text">
                {renderMessageContent(msg)}
                {msg.isStreaming && (
                  <span className="streaming-indicator">
                    <AiOutlineLoading className="spin" size={12} style={{ opacity: 0.5 }} />
                  </span>
                )}
              </div>
              <div className="message-meta">
                {msg.createdAt && (
                  <span className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], CHAT_CONFIG.MESSAGE_TIMESTAMP_FORMAT)}
                  </span>
                )}
                {msg.modelName && (
                  <span className="message-model"> | Model: {msg.modelName}</span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="chat-input-container">
        <div className="chat-input-box">
          <textarea
            className="chat-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Tin nhắn ChatAI"
            disabled={isLoading}
          />
          <button
            className="chat-send-button"
            onClick={sessionId ? sendMessage : createAndSend}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <AiOutlineLoading className="spin" size={24} />
            ) : (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M7 11L12 6L17 11M12 18V7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
        <div className="chat-disclaimer">
          {CHAT_CONFIG.DEFAULT_MESSAGES.CHAT_DISCLAIMER}
          <br />
          <strong>Model đang dùng:</strong> {selectedModelDisplayName}
        </div>

      </div>
    </div>
  );
};

export default Chat;