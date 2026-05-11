import React from 'react';
import { MdDelete } from 'react-icons/md';
import { getModelIcon } from '../../utils/constants';
const SessionList = ({
    providers,
    chatSessions = [],
    sessionId,
    selectedModel,
    onLoadSession,
    onDeleteSession,
}) => {

    return (
        <>
            {providers.map((provider) => {

                const sessions = chatSessions.filter(
                    (s) => s.provider === provider.slug
                );
                if (sessions.length === 0) return null;

                return (
                    <div key={provider.slug} className="sidebar-section">
                        <div className="sidebar-subheader">{provider.slug.toUpperCase()}</div>
                        {sessions.map((s, idx) => {
                            const isActive = s.id === sessionId;
                            return (
                                <div
                                    key={s.id}
                                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                                >
                                    <span
                                        onClick={() => onLoadSession(s.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexGrow: 1,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <img
                                            src={getModelIcon(provider.slug)}
                                            alt={`${provider.slug}-icon`}
                                            style={{ width: 18, height: 18, marginRight: 6 }}
                                        />
                                        {`Đoạn chat ${idx + 1}`}
                                    </span>
                                    <span
                                        className="delete-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteSession(s.id);
                                        }}
                                        title="Xóa đoạn chat"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <MdDelete />
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </>
    );
};

export default SessionList;
