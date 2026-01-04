export const escapeHtml = (text) => {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000; // Diferença em segundos

    // Lógica Instagram
    if (diff < 60) return 'Agora';
    if (diff < 3600) return `${Math.floor(diff/60)} min`;
    if (diff < 86400) return `${Math.floor(diff/3600)} h`;
    
    const days = Math.floor(diff/86400);
    if (days < 7) return `${days} d`;
    
    const weeks = Math.floor(days/7);
    return `${weeks} sem`;
};