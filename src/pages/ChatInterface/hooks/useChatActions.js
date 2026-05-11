import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatService } from '../../../services/ChatService';
import { formatSessions, countSessionsByModel, formatMessageHistory } from '../utils/sessionUtils';
import { findModelById } from '../utils/modelUtils';
import { CHAT_CONFIG } from '../config/chatConfig';

export const useChatActions = (state, actions) => {
  const navigate = useNavigate();

  const fetchProviders = useCallback(async () => {
    try {
      const data = await ChatService.fetchProviders();
      actions.setProviders(data);
      if (!state.providerId && data.length > 0) {
        const provider = data[0];
        actions.setProvider(provider.id);
        actions.setModel(provider.aiModels?.[0]?.name || null);
      }
    } catch (err) {
      console.error('[fetchProviders]', err);
      actions.setError(err.message);
    }
  }, [state.providerId, actions]);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await ChatService.fetchSessions();
      const sessions = formatSessions(data.sessions);
      actions.setSessions(sessions);
    } catch (err) {
      console.error('[fetchSessions]', err);
      actions.setError(err.message);
    }
  }, [actions]);

  const createConversation = useCallback(async () => {
    try {
      const res = await ChatService.createNewSession(state.providerId);
      actions.setSession(res.sessionId);
      fetchSessions();
      return res.sessionId;
    } catch (err) {
      console.error(CHAT_CONFIG.ERROR_MESSAGES.CONVERSATION_CREATE_FAILED, err);
      actions.setError(CHAT_CONFIG.ERROR_MESSAGES.CONVERSATION_CREATE_FAILED);
    }
  }, [state.providerId, actions, fetchSessions]);

  const createChat = useCallback(async (customModel, customProviderId) => {
    const modelToUse = customModel || state.selectedModel;
    const providerToUse = customProviderId || state.providerId;

    const count = countSessionsByModel(state.chatSessions, modelToUse);
    if (count >= CHAT_CONFIG.MAX_SESSIONS_PER_MODEL) {
      const message = CHAT_CONFIG.ERROR_MESSAGES.SESSION_LIMIT
        .replace('{limit}', CHAT_CONFIG.MAX_SESSIONS_PER_MODEL)
        .replace('{model}', modelToUse);
      alert(`⚠️ ${message}`);
      return;
    }

    try {
      const res = await ChatService.createNewSession(providerToUse);
      actions.setSession(res.sessionId);
      actions.setModel(modelToUse);
      actions.setProvider(providerToUse);
      actions.setMessages([{
        role: 'assistant',
        content: CHAT_CONFIG.DEFAULT_MESSAGES.NEW_CONVERSATION,
        modelName: modelToUse,
        createdAt: new Date().toISOString()
      }]);
      navigate(`/GenerativeAIChat/${res.sessionId}`);
      fetchSessions();
    } catch (err) {
      console.error(CHAT_CONFIG.ERROR_MESSAGES.SESSION_CREATE_FAILED, err);
      actions.setError(CHAT_CONFIG.ERROR_MESSAGES.SESSION_CREATE_FAILED);
    }
  }, [state.selectedModel, state.providerId, state.chatSessions, actions, navigate, fetchSessions]);

  const deleteSession = useCallback(async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đoạn chat này?')) return;
    
    try {
      await ChatService.deleteSession(id);
      const updated = state.chatSessions.filter(s => s.id !== id);
      actions.setSessions(updated);
      if (id === state.sessionId) {
        actions.resetChat();
        navigate('/GenerativeAIChat');
      }
    } catch (err) {
      alert(CHAT_CONFIG.ERROR_MESSAGES.SESSION_DELETE_FAILED);
      actions.setError(CHAT_CONFIG.ERROR_MESSAGES.SESSION_DELETE_FAILED);
    }
  }, [state.chatSessions, state.sessionId, actions, navigate]);

  const loadSession = useCallback(async (id) => {
    actions.setSession(id);
    navigate(`/GenerativeAIChat/${id}`);
    
    try {
      const data = await ChatService.fetchHistory(id);
      const modelObj = findModelById(state.providers, data.modelId);
      const modelName = modelObj?.name || null;
      const pid = modelObj?.providerId || data.providerId;

      actions.setProvider(pid);
      actions.setModel(modelName);
      
      const formattedMessages = formatMessageHistory(data.messages, state.providers);
      actions.setMessages(formattedMessages);
    } catch (err) {
      const errorMessage = {
        role: 'assistant',
        content: CHAT_CONFIG.ERROR_MESSAGES.SESSION_LOAD_FAILED,
        createdAt: new Date().toISOString(),
        modelName: state.selectedModel
      };
      actions.setMessages([errorMessage]);
      actions.setError(CHAT_CONFIG.ERROR_MESSAGES.SESSION_LOAD_FAILED);
    }
  }, [state.providers, state.selectedModel, actions, navigate]);

  const selectProvider = useCallback((newProviderId) => {
    actions.setProvider(newProviderId);
    actions.resetChat();
    navigate('/GenerativeAIChat');
  }, [actions, navigate]);

  return {
    fetchProviders,
    fetchSessions,
    createConversation,
    createChat,
    deleteSession,
    loadSession,
    selectProvider
  };
};