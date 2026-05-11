import { useReducer, useCallback } from 'react';

const initialState = {
  messages: [],
  sessionId: '',
  chatSessions: [],
  selectedModel: null,
  providerId: null,
  providers: [],
  activeDropdown: null,
  isLoading: false,
  error: null
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROVIDERS':
      return { ...state, providers: action.payload };
    case 'SET_PROVIDER':
      return { ...state, providerId: action.payload };
    case 'SET_SESSION':
      return { ...state, sessionId: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: Array.isArray(action.payload) ? action.payload : [] };
    case 'UPDATE_MESSAGES':
      const updater = action.payload;
      const newMessages = typeof updater === 'function' ? updater(state.messages || []) : updater;
      return { ...state, messages: Array.isArray(newMessages) ? newMessages : [] };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...(state.messages || []), action.payload] };
    case 'UPDATE_LAST_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((msg, index) =>
          index === state.messages.length - 1 ? { ...msg, ...action.payload } : msg
        )
      };
    case 'SET_SESSIONS':
      return { ...state, chatSessions: action.payload };
    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload };
    case 'SET_DROPDOWN':
      return { ...state, activeDropdown: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_CHAT':
      return {
        ...state,
        sessionId: '',
        messages: [],
        activeDropdown: null
      };
    default:
      return state;
  }
};

export const useChatState = () => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const actions = {
    setProviders: useCallback((providers) => 
      dispatch({ type: 'SET_PROVIDERS', payload: providers }), []),
    setProvider: useCallback((id) => 
      dispatch({ type: 'SET_PROVIDER', payload: id }), []),
    setSession: useCallback((id) => 
      dispatch({ type: 'SET_SESSION', payload: id }), []),
    setMessages: useCallback((messages) => 
      dispatch({ type: 'UPDATE_MESSAGES', payload: messages }), []),
    addMessage: useCallback((message) => 
      dispatch({ type: 'ADD_MESSAGE', payload: message }), []),
    updateLastMessage: useCallback((updates) => 
      dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: updates }), []),
    setSessions: useCallback((sessions) => 
      dispatch({ type: 'SET_SESSIONS', payload: sessions }), []),
    setModel: useCallback((model) => 
      dispatch({ type: 'SET_MODEL', payload: model }), []),
    setDropdown: useCallback((dropdown) => 
      dispatch({ type: 'SET_DROPDOWN', payload: dropdown }), []),
    setLoading: useCallback((loading) => 
      dispatch({ type: 'SET_LOADING', payload: loading }), []),
    setError: useCallback((error) => 
      dispatch({ type: 'SET_ERROR', payload: error }), []),
    resetChat: useCallback(() => 
      dispatch({ type: 'RESET_CHAT' }), [])
  };

  return { ...state, actions };
};