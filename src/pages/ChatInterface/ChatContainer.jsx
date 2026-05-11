import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Chat from './components/Chat';
import ProviderSelector from './components/Sidebar/ProviderSelector';
import SessionList from './components/Sidebar/SessionList';
import MobileHeader from './components/MobileHeader';
import View from "../../components/layout/View";
import { useChatState } from './hooks/useChatState';
import { useChatActions } from './hooks/useChatActions';
import { getModelDisplayName } from './utils/modelUtils';
import './styles/index.css';
import './styles/mobile.css';

const ChatContainer = () => {
  const { chatId } = useParams();
  const chatState = useChatState();
  const chatActions = useChatActions(chatState, chatState.actions);
  
  const modelDisplayName = useMemo(() => 
    getModelDisplayName(chatState.providers, chatState.selectedModel)
  , [chatState.providers, chatState.selectedModel]);

  useEffect(() => {
    chatActions.fetchProviders();
    chatActions.fetchSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  useEffect(() => {
    if (chatId && chatState.providers.length > 0) {
      chatActions.loadSession(chatId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, chatState.providers.length]);
  
  const isMenuOpen = chatState.activeDropdown === 'menu';
  return (
    <View>
    <div className={`chat-container ${isMenuOpen ? 'sidebar-mobile-open' : ''}`}>
      <div className="chat-mobile-header-wrapper">
        <MobileHeader
          modelName={modelDisplayName}
          onRefresh={() => chatActions.loadSession(chatState.sessionId)}
          modelList={chatState.providers.find(p => p.id === chatState.providerId)?.aiModels || []}
          selectedModel={chatState.selectedModel}
          onSelectModel={(model) => chatState.actions.setModel(model.name)}
          activeDropdown={chatState.activeDropdown}
          setActiveDropdown={chatState.actions.setDropdown}
        />
      </div>
      <div className="chat-sidebar">
        <ProviderSelector
          onCreateChat={chatActions.createChat}
          providers={chatState.providers}
          selectedProviderId={chatState.providerId}
          onSelectProvider={chatActions.selectProvider}
          onSelectModel={chatState.actions.setModel}
        />

        <SessionList
          providers={chatState.providers}
          chatSessions={chatState.chatSessions}
          sessionId={chatState.sessionId}
          selectedModel={chatState.selectedModel}
          onLoadSession={chatActions.loadSession}
          onDeleteSession={chatActions.deleteSession}
        />
      </div>

      <Chat
        sessionId={chatState.sessionId}
        messages={chatState.messages}
        setMessages={chatState.actions.setMessages}
        providers={chatState.providers}
        providerId={chatState.providerId}
        selectedModel={chatState.selectedModel}
        setSelectedModel={chatState.actions.setModel}
        createConversation={chatActions.createConversation}
      />
    </div>
    </View>
  );
};

export default ChatContainer;
