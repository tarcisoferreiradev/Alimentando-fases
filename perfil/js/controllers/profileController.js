import { dataService } from '../services/dataService.js';
import { getRoleBadgeHTML } from '../utils/badges.js';
import { getAuth } from '../config/firebase.js';

export class ProfileController {
    constructor() {
        this.myOriginalData = null;
        this.currentUserData = null;
        this.currentProfileUid = null;
        
        // Elementos DOM
        this.els = {
            username: document.getElementById('display-username'),
            realname: document.getElementById('display-realname'),
            bio: document.getElementById('display-bio'),
            pic: document.getElementById('profile-pic-main'),
            counts: {
                posts: document.getElementById('count-posts'),
                followers: document.getElementById('count-followers'),
                following: document.getElementById('count-following')
            },
            feedContainer: document.getElementById('feed-container'),
            btnFollow: document.getElementById('btn-follow')
        };
    }

    async loadProfile(uid) {
        this.currentProfileUid = uid;
        const data = await dataService.getUser(uid);
        
        if (!data) return console.error("Usuário não encontrado");
        this.currentUserData = data;
        
        // Se for o próprio usuário logado, salva referência
        const authUser = getAuth().currentUser;
        if (authUser && authUser.uid === uid) {
            this.myOriginalData = data;
        }

        this.renderHeader(data);
        this.loadFeed(uid);
        this.setupVisitorActions(authUser?.uid === uid);
    }

    renderHeader(data) {
        this.els.username.textContent = `@${data.username}`;
        this.els.realname.innerHTML = `${data.realname} ${getRoleBadgeHTML(data)}`;
        this.els.bio.textContent = data.bio || '';
        this.els.pic.src = data.photo || 'https://ui-avatars.com/api/?name=User';
        
        this.els.counts.posts.textContent = data.postsCount || 0;
        this.els.counts.followers.textContent = data.followers?.length || 0;
        this.els.counts.following.textContent = data.following?.length || 0;

        // Admin Mode
        const header = document.querySelector('.journey-header');
        if (data.role === 'admin_master') header.classList.add('admin-mode');
        else header.classList.remove('admin-mode');
    }

    async loadFeed(uid) {
        this.els.feedContainer.innerHTML = '<p style="text-align:center;">Carregando...</p>';
        const snapshot = await dataService.getProfilePosts(uid);
        
        this.els.feedContainer.innerHTML = '';
        if (snapshot.empty) {
            document.getElementById('empty-state-timeline').style.display = 'block';
            this.els.feedContainer.style.display = 'none';
            return;
        }

        document.getElementById('empty-state-timeline').style.display = 'none';
        this.els.feedContainer.style.display = 'grid';

        snapshot.forEach(doc => {
            const post = doc.data();
            const html = this.createPostHTML(post);
            this.els.feedContainer.insertAdjacentHTML('beforeend', html);
        });
    }

    createPostHTML(post) {
        let content = '';
        if (post.images && post.images.length > 0) {
            content = `<img src="${post.images[0]}" class="gallery-image">`;
        } else {
            content = `<div class="gallery-text-only"><p>${post.content.substring(0,50)}...</p></div>`;
        }
        return `
            <div class="gallery-item">
                ${content}
                <div class="gallery-overlay">
                    <i class="fa-solid fa-heart"></i> ${post.likes?.length || 0}
                </div>
            </div>
        `;
    }

    setupVisitorActions(isMe) {
        const myActions = document.getElementById('actions-row');
        const visitorActions = document.getElementById('visitor-actions');
        const fab = document.getElementById('btn-fab-post');

        if (isMe) {
            myActions.style.display = 'flex';
            visitorActions.style.display = 'none';
            fab.style.display = 'flex';
        } else {
            myActions.style.display = 'none';
            visitorActions.style.display = 'flex';
            fab.style.display = 'none';
            this.updateFollowButton();
        }
    }

    async handleFollow() {
        const myUid = getAuth().currentUser.uid;
        const targetUid = this.currentProfileUid;
        const amIFollowing = this.myOriginalData.following?.includes(targetUid);

        // UI Optimistic Update
        this.toggleFollowBtnState(!amIFollowing);

        try {
            await dataService.toggleFollow(myUid, targetUid, amIFollowing);
            // Atualiza dados locais
            if(amIFollowing) {
                this.myOriginalData.following = this.myOriginalData.following.filter(id => id !== targetUid);
            } else {
                if(!this.myOriginalData.following) this.myOriginalData.following = [];
                this.myOriginalData.following.push(targetUid);
            }
        } catch(e) {
            console.error(e);
            this.toggleFollowBtnState(amIFollowing); // Revert
        }
    }

    toggleFollowBtnState(isFollowing) {
        if (isFollowing) {
            this.els.btnFollow.classList.add('following');
            this.els.btnFollow.innerHTML = '<i class="fa-solid fa-check"></i> <span>Seguindo</span>';
        } else {
            this.els.btnFollow.classList.remove('following');
            this.els.btnFollow.innerHTML = '<i class="fa-solid fa-user-plus"></i> <span>Seguir</span>';
        }
    }

    updateFollowButton() {
        const myUid = getAuth().currentUser?.uid;
        if (!myUid || !this.myOriginalData) return;
        const isFollowing = this.myOriginalData.following?.includes(this.currentProfileUid);
        this.toggleFollowBtnState(isFollowing);
    }
}