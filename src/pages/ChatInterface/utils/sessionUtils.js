export const formatSessionTitle = (session, index) => ({
  ...session,
  displayTitle: `Đoạn chat ${index + 1}`
});

export const formatSessions = (sessions) =>
  (sessions || []).map(formatSessionTitle);

export const countSessionsByModel = (sessions, model) =>
  sessions.filter(s => (s.model || '') === model).length;

export const formatMessageHistory = (messages, providers) =>
  (messages || [])
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(msg => {
      const model = providers.flatMap(p => p.aiModels || []).find(m => m.id === msg.modelId);
      return {
        ...msg,
        modelName: model?.displayName || msg.modelName || 'Không rõ'
      };
    });