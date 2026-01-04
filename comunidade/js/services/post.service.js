import { db, arrayUnion, arrayRemove, serverTimestamp } from '../config/firebase.proxy.js';

export class PostService {
    constructor() {
        this.collection = db().collection('posts');
    }

    // --- LEITURA ---
    async getFeed(limit = 50) {
        try {
            const snapshot = await this.collection
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("PostService [getFeed]:", error);
            throw error;
        }
    }

    // --- ESCRITA ---
    async createPost(user, text, images = []) {
        if (!user) throw new Error("Usuário não autenticado.");

        const payload = {
            authorId: user.uid,
            authorName: user.displayName || user.realname || 'Usuário',
            authorPhoto: user.photoURL,
            content: text,
            images: images, 
            image: images.length > 0 ? images[0] : null,
            likes: [],
            commentsCount: 0,
            timestamp: serverTimestamp()
        };

        return await this.collection.add(payload);
    }

    // --- INTERAÇÃO ---
    async toggleLike(postId, userId, isLiking) {
        const ref = this.collection.doc(postId);
        const operation = isLiking ? arrayUnion(userId) : arrayRemove(userId);
        await ref.update({ likes: operation });
    }

    // --- DELETAR E EDITAR (NOVO) ---
    async deletePost(postId) {
        return await this.collection.doc(postId).delete();
    }

    async updatePost(postId, newContent) {
        return await this.collection.doc(postId).update({
            content: newContent
        });
    }
}