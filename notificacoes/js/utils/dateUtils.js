/**
 * Utility: Date Formatting
 * Responsabilidade: Transformação de timestamps brutos em strings amigáveis (Human Readable).
 */

export const DateUtils = {
    /**
     * Calcula o tempo relativo (ex: "5 min", "2 h").
     * @param {Object} firestoreTimestamp - Objeto Timestamp do Firestore.
     * @returns {string} String formatada de tempo decorrido.
     */
    getTimeAgo: (firestoreTimestamp) => {
        if (!firestoreTimestamp) return '';
        
        const date = firestoreTimestamp.toDate();
        const diffInSeconds = (new Date() - date) / 1000;

        if (diffInSeconds < 60) return 'Agora mesmo';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`;
        return `${Math.floor(diffInSeconds / 86400)} d`;
    },

    /**
     * Sanitização básica para prevenção de XSS em renders de HTML bruto.
     * @param {string} str 
     * @returns {string} String sanitizada.
     */
    escapeHtml: (str) => {
        if (!str) return '';
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
};