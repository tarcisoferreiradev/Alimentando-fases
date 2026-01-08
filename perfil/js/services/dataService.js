import { getFirestore, getServerTimestamp, getArrayUnion, getArrayRemove, getIncrement } from '../config/firebase.js';

const db = getFirestore();

export const dataService = {
    async getUser(uid) {
        const doc = await db.collection('users').doc(uid).get();
        return doc.exists ? { ...doc.data(), uid: doc.id } : null;
    },

    async createUser(uid, userData) {
        return await db.collection('users').doc(uid).set(userData);
    },

    async updateUser(uid, data) {
        return await db.collection('users').doc(uid).set(data, { merge: true });
    },

    async getProfilePosts(uid) {
        return await db.collection('posts')
            .where('authorId', '==', uid)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
    },

    async createPost(postData) {
        const docRef = await db.collection('posts').add({
            ...postData,
            timestamp: getServerTimestamp(),
            likes: [],
            commentsCount: 0
        });
        await db.collection('users').doc(postData.authorId).update({
            postsCount: getIncrement(1)
        });
        return docRef;
    },

    async toggleFollow(myUid, targetUid, isFollowing) {
        const myRef = db.collection('users').doc(myUid);
        const targetRef = db.collection('users').doc(targetUid);
        
        if (isFollowing) {
            await myRef.update({ following: getArrayRemove(targetUid) });
            await targetRef.update({ followers: getArrayRemove(myUid) });
        } else {
            await myRef.update({ following: getArrayUnion(targetUid) });
            await targetRef.update({ followers: getArrayUnion(myUid) });
        }
    },

    async searchUsers(term) {
        return await db.collection('users')
            .orderBy('username')
            .startAt(term)
            .endAt(term + '\uf8ff')
            .limit(10)
            .get();
    }
};