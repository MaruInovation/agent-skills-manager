// 保存上下文
const conversationHistory = new Map<string, any[]>();

function getMessages(conversationId: string) {
    return conversationHistory.get(conversationId) || [];
}

function setMessages(conversationId: string, messages: any[]) {
    conversationHistory.set(conversationId, messages);
}

export const conversationRepository = {
    getMessages,
    setMessages,
};
