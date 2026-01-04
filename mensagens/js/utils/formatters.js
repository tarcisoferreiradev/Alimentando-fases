export const Formatters = {
    // Formata hora (Ex: 14:30)
    dateToTime(date) {
        if (!date) return '';
        // Garante que é um objeto Date, mesmo vindo do Firestore (Timestamp)
        const d = date.toDate ? date.toDate() : new Date(date);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    },

    // Formata "Visto por último"
    lastSeen(date) {
        if (!date) return '';
        const now = new Date();
        const d = date.toDate ? date.toDate() : new Date(date);
        const yesterday = new Date(now); 
        yesterday.setDate(now.getDate() - 1);

        const h = d.getHours().toString().padStart(2, '0');
        const m = d.getMinutes().toString().padStart(2, '0');

        // Verifica se é hoje
        if (d.toDateString() === now.toDateString()) return `Visto hoje às ${h}:${m}`;
        // Verifica se foi ontem
        if (d.toDateString() === yesterday.toDateString()) return `Visto ontem às ${h}:${m}`;
        
        // Data completa
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        return `Visto em ${day}/${month} às ${h}:${m}`;
    }
};