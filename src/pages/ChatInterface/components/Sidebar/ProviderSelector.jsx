import React from 'react';
import { getModelIcon } from '../../utils/constants';

const ProviderSelector = ({
  onCreateChat,
  providers = [],
  selectedProviderId,
  onSelectProvider,
  onSelectModel
}) => {
  const activeProvider = providers.find(p => p.id === selectedProviderId);

  return (
    <>
      <div className="new-chat-btn" onClick={() => onCreateChat()}>
        <img
          src={getModelIcon(activeProvider?.name || 'OpenAI')}
          alt="Model Icon"
          style={{ width: 24, height: 24, marginRight: 8 }}
        />
        + Tạo đoạn chat
      </div>
      <div className="sidebar-section">
        {providers.map((provider) => {
          const isActive = provider.id === selectedProviderId;
          return (
            <button
              key={provider.id}
              className={`sidebar-item ai-button ${isActive ? 'active' : ''}`}
              onClick={() => {
                onSelectProvider(provider.id);
                const firstModel = provider.aiModels?.[0];
                if (firstModel) onSelectModel(firstModel.name);
              }}
            >
              <img
                src={getModelIcon(provider.name)}
                alt={provider.name}
                width="24"
                height="24"
                style={{ marginRight: 8 }}
              />
              <span>{provider.name}</span>
            </button>
          );
        })}
      </div>
      <div className="sidebar-divider" />
    </>
  );
};

export default ProviderSelector;
