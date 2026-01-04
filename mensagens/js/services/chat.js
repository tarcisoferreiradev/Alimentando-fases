import { db, firebase } from './firebase.js';

export const ChatService = {
    // ... (Mantenha listenToConversations e listenToMessages iguais) ...
    listenToConversations(uid, callback) {
        return db.collection('chats').where('participants', 'array-contains', uid).orderBy('lastMessageTimestamp', 'desc').onSnapshot(callback);
    },
    listenToMessages(chatId, callback) {
        return db.collection('chats').doc(chatId).collection('messages').orderBy('timestamp', 'asc').onSnapshot(callback);
    },
    listenToChatStatus(chatId, callback) {
        return db.collection('chats').doc(chatId).onSnapshot(callback);
    },

    // Envio de Texto
    async sendMessage(chatId, senderId, text, replyTo = null) {
        const payload = {
            text, type: 'text', senderId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            replyTo: replyTo // Salva o objeto da resposta se houver
        };
        
        await db.collection('chats').doc(chatId).collection('messages').add(payload);
        
        await db.collection('chats').doc(chatId).update({
            lastMessage: text,
            lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessageBy: senderId,
            read: false,
            [`typing.${senderId}`]: false 
        });
    },

    // Envio de Imagem/Sticker
    async sendImageMessage(chatId, senderId, imageUrl, type = 'image') {
        const payload = {
            image: imageUrl, type: type, senderId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('chats').doc(chatId).collection('messages').add(payload);
        await db.collection('chats').doc(chatId).update({
            lastMessage: type === 'sticker' ? '📷 Figurinha' : '📷 Foto',
            lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessageBy: senderId,
            read: false
        });
    },

    // Deletar Mensagem
    async deleteMessage(chatId, messageId) {
        return db.collection('chats').doc(chatId).collection('messages').doc(messageId).delete();
    },

    // Reagir a Mensagem
    async reactToMessage(chatId, messageId, reactionEmoji) {
        return db.collection('chats').doc(chatId).collection('messages').doc(messageId).update({
            reaction: reactionEmoji
        });
    },

    setTypingStatus(chatId, uid, isTyping) {
        const updateData = {}; updateData[`typing.${uid}`] = isTyping;
        return db.collection('chats').doc(chatId).set(updateData, { merge: true });
    },

    markAsRead(chatId) {
        return db.collection('chats').doc(chatId).update({ read: true });
    }
};