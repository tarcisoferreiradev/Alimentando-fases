/**
 * Service Layer: Notification Data Management
 * Responsabilidade: Abstração de chamadas ao Firestore, encapsulamento de queries e gerenciamento de estado remoto.
 * Padrão: Singleton / Module Pattern.
 */

import { db } from '../config/firebaseConfig.js'; // Assumindo exportação centralizada

export const NotificationService = {
    /**
     * Inicializa um listener em tempo real (Observer) para notificações do usuário.
     * @param {string} userId - UID do usuário autenticado.
     * @param {function} onUpdate - Callback executado a cada snapshot do Firestore.
     * @param {function} onError - Tratamento de exceções na conexão.
     * @returns {function} Unsubscribe method para prevenção de memory leaks.
     */
    subscribeToNotifications: (userId, onUpdate, onError) => {
        return db.collection('notifications')
            .where('recipientId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot(
                (snapshot) => {
                    const notifications = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    onUpdate(notifications);
                },
                (error) => {
                    console.error('[NotificationService] Stream Error:', error);
                    if (onError) onError(error);
                }
            );
    },

    /**
     * Atualiza o status de leitura de uma notificação específica.
     * Operação atômica de escrita.
     * @param {string} notificationId 
     */
    markAsRead: async (notificationId) => {
        try {
            await db.collection('notifications').doc(notificationId).update({ read: true });
        } catch (error) {
            console.error(`[NotificationService] Falha ao atualizar ID ${notificationId}:`, error);
            throw error; // Propagação para tratamento na UI se necessário
        }
    },

    /**
     * Batch Update: Marca todas as notificações pendentes como lidas.
     * Utiliza Firestore Batch Writes para garantir atomicidade e performance.
     * @param {string} userId 
     */
    markAllAsRead: async (userId) => {
        const batch = db.batch();
        const snapshot = await db.collection('notifications')
            .where('recipientId', '==', userId)
            .where('read', '==', false)
            .get();

        if (snapshot.empty) return;

        snapshot.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });

        await batch.commit();
    }
};