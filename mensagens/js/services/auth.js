import { db, auth, firebase } from './firebase.js';

export const AuthService = {
    onAuthStateChanged(callback) {
        return auth.onAuthStateChanged(async (user) => {
            if (user) {
                let userData = { uid: user.uid, ...user };
                try {
                    const doc = await db.collection('users').doc(user.uid).get();
                    if (doc.exists) {
                        userData = { ...userData, ...doc.data() };
                    }
                } catch (e) { console.warn("Erro profile", e); }
                callback(userData);
            } else {
                callback(null);
            }
        });
    },

    // --- NOVA FUNÇÃO: Busca dados de um usuário pelo ID ---
    async getUserProfile(uid) {
        try {
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error("Erro ao buscar usuário:", error);
            return null;
        }
    },

    updatePresence(uid) {
        if(!uid) return;
        return db.collection('users').doc(uid).update({
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(()=>{});
    },

    listenToPartnerPresence(uid, callback) {
        return db.collection('users').doc(uid).onSnapshot(doc => {
            if(doc.exists) callback(doc.data());
        });
    }
};