import { db, serverTimestamp, increment, arrayUnion, arrayRemove } from '../config/firebase.proxy.js';

export class InteractionService {
    constructor() {
        this.collection = db().collection('posts');
    }

    async getComments(postId) {
        try {
            const snapshot = await this.collection.doc(postId).collection('comments')
                .orderBy('timestamp', 'asc')
                .get();
            
            // Para cada comentário, busca as respostas (sub-coleção)
            const commentsWithReplies = await Promise.all(snapshot.docs.map(async doc => {
                const commentData = doc.data();
                const repliesSnap = await doc.ref.collection('replies').orderBy('timestamp', 'asc').get();
                const replies = repliesSnap.docs.map(rd => ({ id: rd.id, ...rd.data() }));
                
                return { 
                    id: doc.id, 
                    ...commentData,
                    replies: replies // Anexa as respostas ao objeto do comentário
                };
            }));

            return commentsWithReplies;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async addComment(postId, user, text, image = null) {
        if (!user) throw new Error("Usuário não autenticado");
        const payload = {
            authorId: user.uid,
            authorName: user.displayName || 'Usuário',
            authorPhoto: user.photoURL,
            text: text,
            image: image,
            likes: [],
            timestamp: serverTimestamp()
        };
        const ref = await this.collection.doc(postId).collection('comments').add(payload);
        await this.collection.doc(postId).update({ commentsCount: increment(1) });
        return { id: ref.id, ...payload };
    }

    // ADICIONAR RESPOSTA (SUB-COLEÇÃO)
    async addReply(postId, commentId, user, text, image = null) {
        if (!user) throw new Error("Usuário não autenticado");
        const payload = {
            authorId: user.uid,
            authorName: user.displayName || 'Usuário',
            authorPhoto: user.photoURL,
            text: text,
            image: image,
            timestamp: serverTimestamp()
        };
        // Salva dentro de comments -> replies
        await this.collection.doc(postId).collection('comments').doc(commentId).collection('replies').add(payload);
        
        // Atualiza contador global do post
        await this.collection.doc(postId).update({ commentsCount: increment(1) });
    }

    async deleteComment(postId, commentId) {
        // Primeiro deleta as respostas (opcional, mas bom pra limpar)
        const replies = await this.collection.doc(postId).collection('comments').doc(commentId).collection('replies').get();
        replies.forEach(doc => doc.ref.delete());

        await this.collection.doc(postId).collection('comments').doc(commentId).delete();
        await this.collection.doc(postId).update({ commentsCount: increment(-1 - replies.size) });
    }

    async deleteReply(postId, commentId, replyId) {
        await this.collection.doc(postId).collection('comments').doc(commentId).collection('replies').doc(replyId).delete();
        await this.collection.doc(postId).update({ commentsCount: increment(-1) });
    }

    async toggleCommentLike(postId, commentId, userId, isLiking) {
        const commentRef = this.collection.doc(postId).collection('comments').doc(commentId);
        const operation = isLiking ? arrayUnion(userId) : arrayRemove(userId);
        await commentRef.update({ likes: operation });
    }
}