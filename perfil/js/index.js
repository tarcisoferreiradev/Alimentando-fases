// perfil/js/index.js

import { auth, db, firebase } from '../../firebase-config.js'; 
import { InteractionService } from '../../comunidade/js/services/interaction.service.js';
import { createCommentElement } from '../../comunidade/js/utils/dom-helpers.js';
import { getRoleBadgeHTML } from '../../sistema-cargos/cargos.js';

const OWNER_UID = "1Sfw2sVb7RVuKqCsNs2PUy8pIs33"; 

document.addEventListener('DOMContentLoaded', () => {
    
    const interactionService = new InteractionService();

    let myOriginalData = null;
    let currentProfileUid = null;
    let currentOpenPostId = null;
    let replyTarget = null;
    let commentImageBase64 = null;
    let tempProfileImage = null; 

    // Mapeamento
    const els = {
        username: document.getElementById('display-username'),
        realname: document.getElementById('display-realname'),
        bio: document.getElementById('display-bio'),
        picMain: document.getElementById('profile-pic-main'),
        picNav: document.getElementById('nav-avatar-img'),
        picMainContainer: document.querySelector('.journey-avatar-container'),
        
        counts: {
            posts: document.getElementById('count-posts'),
            followers: document.getElementById('count-followers'),
            following: document.getElementById('count-following')
        },
        statFollowers: document.getElementById('btn-view-followers'),
        statFollowing: document.getElementById('btn-view-following'),
        
        feedContainer: document.getElementById('feed-container'),
        emptyState: document.getElementById('empty-state-timeline'),
        
        // MODAL
        modal: document.getElementById('modal-post-detail'),
        leftContent: document.getElementById('inst-left-content'),
        commentsList: document.getElementById('inst-comments-list'),
        authorName: document.getElementById('inst-author-name'),
        authorPhoto: document.getElementById('inst-author-photo'),
        likesCount: document.getElementById('inst-likes-number'),
        btnCloseDetail: document.getElementById('btn-close-post-detail'),
        
        inputComment: document.getElementById('inst-comment-input'),
        btnSend: document.getElementById('inst-btn-send'),
        mainLikeBtn: document.getElementById('inst-main-like-btn'),
        btnToggleEmoji: document.getElementById('btn-toggle-emoji'),
        emojiContainer: document.getElementById('inst-emoji-picker-container'),
        btnGallery: document.getElementById('btn-comment-gallery'),
        inputGallery: document.getElementById('input-comment-file'),
        imgPreviewContainer: document.getElementById('comment-image-preview-container'),
        imgPreview: document.getElementById('comment-img-preview'),
        btnRemoveImg: document.getElementById('btn-remove-comment-img'),

        modalEdit: document.getElementById('edit-modal'),
        btnEdit: document.getElementById('btn-open-edit'),
        btnSaveEdit: document.getElementById('btn-save-changes'),
        btnCamera: document.getElementById('btn-trigger-file'),
        inputGlobalUpload: document.getElementById('file-upload'), 
        imgPreviewEdit: document.getElementById('modal-avatar-preview'),
        modalList: document.getElementById('list-modal'),
        modalListTitle: document.getElementById('list-modal-title'),
        modalListBody: document.getElementById('list-modal-body'),
        btnCloseList: document.getElementById('btn-close-list'),
        modalPost: document.getElementById('modal-new-post'),
        btnFab: document.getElementById('btn-fab-post'),
        btnSubmitPost: document.getElementById('btn-submit-post'),
        btnSair: document.getElementById('btn-sair-perfil') 
    };

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const doc = await db.collection('users').doc(user.uid).get();
                if (doc.exists) {
                    const userData = doc.data();
                    if (userData.isBanned) {
                        await auth.signOut();
                        window.location.href = '../login/index.html';
                        return;
                    }
                    currentProfileUid = user.uid;
                    myOriginalData = userData;
                    updateHeaderUI(userData);
                    loadFeed(user.uid);
                }
            } catch (err) { console.error("Erro perfil:", err); }
        } else {
            window.location.href = '../login/index.html';
        }
    });

    function isMasterUser(user) { return (user.role || user.authorRole) === 'admin_master'; }

    function updateHeaderUI(data) {
        if (!data) return;
        const isOwner = currentProfileUid === OWNER_UID;
        const isMaster = isMasterUser(data);

        const adminLink = document.getElementById('nav-item-admin');
        if (adminLink) adminLink.style.display = (isMaster || isOwner) ? 'block' : 'none';

        if(els.realname) {
            const nameHTML = isMaster ? `<span class="master-text-effect">${data.realname}</span>` : data.realname;
            els.realname.innerHTML = `${nameHTML} ${getRoleBadgeHTML(data)}`;
        }
        
        if(els.picMainContainer) {
            const badge = document.querySelector('.phase-badge');
            if(isMaster) {
                els.picMainContainer.classList.add('master-avatar-frame');
                if(badge) {
                    badge.classList.add('master-crown');
                    badge.innerHTML = '<i class="fa-solid fa-crown"></i>';
                }
            } else {
                els.picMainContainer.classList.remove('master-avatar-frame');
                if(badge) {
                    badge.classList.remove('master-crown');
                    badge.innerHTML = '<i class="fa-solid fa-seedling"></i>';
                }
            }
        }

        if(els.username) els.username.textContent = "@" + (data.username || "usuario");
        if(els.bio) els.bio.textContent = data.bio || "";
        const photo = data.photo || "https://ui-avatars.com/api/?name=User";
        if(els.picMain) els.picMain.src = photo;
        if(els.picNav) els.picNav.src = photo;

        if(els.counts.posts) els.counts.posts.textContent = data.postsCount || 0;
        if(els.counts.followers) els.counts.followers.textContent = data.followers ? data.followers.length : 0;
        if(els.counts.following) els.counts.following.textContent = data.following ? data.following.length : 0;

        if(els.statFollowers) els.statFollowers.onclick = () => openNetworkModal('Seguidores', data.followers || []);
        if(els.statFollowing) els.statFollowing.onclick = () => openNetworkModal('Seguindo', data.following || []);
    }

    async function openNetworkModal(title, uids) {
        if (!els.modalList) return;
        els.modalListTitle.textContent = title;
        els.modalListBody.innerHTML = '<div style="text-align:center; padding:40px;"><i class="fa-solid fa-circle-notch fa-spin fa-2x"></i></div>';
        els.modalList.classList.add('open');

        if (!uids || uids.length === 0) {
            els.modalListBody.innerHTML = '<div class="empty-list-message" style="text-align:center; padding:40px; color:#888;">Ninguém por aqui ainda.</div>';
            return;
        }

        try {
            const snaps = await Promise.all(uids.slice(0, 50).map(id => db.collection('users').doc(id).get()));
            let html = '<div class="user-list-container" style="display:flex; flex-direction:column; gap:12px;">';
            snaps.forEach(s => {
                if(s.exists) {
                    const u = s.data();
                    html += `
                    <div class="user-list-item" style="display:flex; align-items:center; gap:12px; padding:8px; border-bottom:1px solid #f0f0f0;">
                        <img src="${u.photo || 'https://ui-avatars.com/api/?name=U'}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;">
                        <div class="uli-info">
                            <div class="uli-name" style="font-weight:700;">${u.realname} ${getRoleBadgeHTML(u)}</div>
                            <div class="uli-username" style="color:#888; font-size:0.85rem;">@${u.username}</div>
                        </div>
                    </div>`;
                }
            });
            els.modalListBody.innerHTML = html + '</div>';
        } catch (err) { els.modalListBody.innerHTML = '<p>Erro ao carregar.</p>'; }
    }

    if (els.btnEdit) {
        els.btnEdit.addEventListener('click', () => {
            if (!myOriginalData) return;
            document.getElementById('input-realname').value = myOriginalData.realname || "";
            document.getElementById('input-username').value = myOriginalData.username || "";
            document.getElementById('input-bio').value = myOriginalData.bio || "";
            document.getElementById('input-link').value = myOriginalData.link || "";
            if (els.imgPreviewEdit) els.imgPreviewEdit.src = myOriginalData.photo || "https://ui-avatars.com/api/?name=User";
            tempProfileImage = null; 
            els.modalEdit.classList.add('open');
        });
    }
    
    if (els.btnCamera && els.inputGlobalUpload) {
        els.btnCamera.onclick = (e) => { e.preventDefault(); els.inputGlobalUpload.click(); };
        els.inputGlobalUpload.onchange = async (e) => {
            const file = e.target.files[0];
            if(file) {
                const base64 = await compressImage(file, 800, 0.7);
                if(els.imgPreviewEdit) els.imgPreviewEdit.src = base64;
                tempProfileImage = base64;
            }
        };
    }

    if(els.btnSaveEdit) {
        els.btnSaveEdit.onclick = async () => {
            els.btnSaveEdit.disabled = true;
            try {
                const newData = {
                    realname: document.getElementById('input-realname').value,
                    username: document.getElementById('input-username').value.toLowerCase().replace(/\s+/g, ''),
                    bio: document.getElementById('input-bio').value,
                    link: document.getElementById('input-link').value
                };
                if(tempProfileImage) newData.photo = tempProfileImage;
                await db.collection('users').doc(currentProfileUid).set(newData, {merge:true});
                if(auth.currentUser && tempProfileImage) await auth.currentUser.updateProfile({photoURL: tempProfileImage});
                myOriginalData = {...myOriginalData, ...newData};
                updateHeaderUI(myOriginalData);
                els.modalEdit.classList.remove('open');
            } catch(e){ alert("Erro ao salvar."); }
            finally { els.btnSaveEdit.disabled = false; }
        };
    }

    function compressImage(file, w, q) {
        return new Promise(resolve => {
            const r = new FileReader();
            r.onload = e => {
                const img = new Image();
                img.onload = () => {
                    const cvs = document.createElement('canvas');
                    let nw = img.width, nh = img.height;
                    if(nw > w) { nh = Math.round(nh * (w/nw)); nw = w; }
                    cvs.width = nw; cvs.height = nh;
                    cvs.getContext('2d').drawImage(img,0,0,nw,nh);
                    resolve(cvs.toDataURL('image/jpeg', q));
                };
                img.src = e.target.result;
            };
            r.readAsDataURL(file);
        });
    }

    async function loadFeed(uid) {
        if (!els.feedContainer) return;
        els.feedContainer.innerHTML = '';
        const snapshot = await db.collection('posts').where('authorId', '==', uid).orderBy('timestamp', 'desc').limit(50).get();
        
        if (snapshot.empty) {
            if (els.emptyState) els.emptyState.style.display = 'block';
            return;
        }
        if (els.emptyState) els.emptyState.style.display = 'none';

        snapshot.forEach(doc => {
            const post = doc.data();
            const div = document.createElement('div');
            
            div.id = `grid-post-${doc.id}`;
            
            let cls = 'gallery-item';
            if (isMasterUser({role: post.authorRole})) cls += ' master-post-border';
            else if (post.authorRole === 'nutri') cls += ' verified-post-border';
            div.className = cls;
            
            let html = '';
            if(post.images && post.images.length > 0) html = `<img src="${post.images[0]}" class="gallery-image">`;
            else if(post.image) html = `<img src="${post.image}" class="gallery-image">`;
            else html = `<div class="gallery-text-only"><p>${post.content.substring(0,60)}...</p></div>`;
            
            div.innerHTML = `${html}<div class="gallery-overlay"><i class="fa-solid fa-heart"></i> <span class="likes-num">${post.likes ? post.likes.length : 0}</span></div>`;
            div.onclick = () => openPostModal(doc.id, post);
            els.feedContainer.appendChild(div);
        });
    }

    // --- MODAL DETALHES ---
    async function openPostModal(postId, postData) {
        if (!els.modal) return;
        currentOpenPostId = postId;
        replyTarget = null;
        
        els.modal.classList.add('open');
        els.inputComment.value = '';
        
        if(els.emojiContainer) els.emojiContainer.classList.remove('show-picker');
        if(els.imgPreviewContainer) els.imgPreviewContainer.classList.add('hidden');

        if (postData.images && postData.images.length > 0) {
            els.leftContent.innerHTML = `<img src="${postData.images[0]}" class="inst-post-img">`;
        } else if (postData.image) {
            els.leftContent.innerHTML = `<img src="${postData.image}" class="inst-post-img">`;
        } else {
            els.leftContent.innerHTML = `<div style="padding:40px; text-align:center;">${postData.content}</div>`;
        }

        els.authorName.innerHTML = `${postData.authorName} ${getRoleBadgeHTML({role:postData.authorRole, crn:postData.authorCRN})}`;
        els.authorPhoto.src = postData.authorPhoto || "https://ui-avatars.com/api/?name=User";
        
        updateMainLikeButton(postData.likes);
        els.commentsList.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Carregando...</p>';
        await loadComments(postId);
    }

    async function loadComments(postId) {
        const comments = await interactionService.getComments(postId);
        els.commentsList.innerHTML = '';
        
        if (comments.length === 0) {
            els.commentsList.innerHTML = '<div style="text-align:center; color:#999; padding:20px;">Seja o primeiro a comentar.</div>';
            return;
        }

        const authors = new Set(comments.map(c => c.authorId));
        comments.forEach(c => c.replies && c.replies.forEach(r => authors.add(r.authorId)));
        
        const userMap = {};
        await Promise.all([...authors].map(async uid => {
            const doc = await db.collection('users').doc(uid).get();
            if(doc.exists) userMap[uid] = doc.data();
        }));

        comments.forEach(c => {
            if(userMap[c.authorId]) {
                c.authorPhoto = userMap[c.authorId].photo;
                c.authorRole = userMap[c.authorId].role;
            }
            if(c.replies) c.replies.forEach(r => {
                if(userMap[r.authorId]) {
                    r.authorPhoto = userMap[r.authorId].photo;
                    r.authorRole = userMap[r.authorId].role;
                }
            });

            // CALLBACKS: DELETE COM MODAL QUESTION
            const callbacks = {
                onLike: (cid, liked) => interactionService.toggleCommentLike(postId, cid, currentProfileUid, liked).then(() => loadComments(postId)),
                onReply: (cid, name) => { replyTarget = {id:cid}; els.inputComment.placeholder = `Respondendo a ${name}...`; els.inputComment.focus(); },
                
                onDelete: async (cid) => {
                    const result = await Swal.fire({
                        title: 'Excluir comentário?',
                        text: "Essa ação não pode ser desfeita.",
                        icon: 'question', // CORREÇÃO: Ícone mais amigável
                        showCancelButton: true,
                        confirmButtonText: 'Excluir',
                        cancelButtonText: 'Cancelar',
                        customClass: {
                            popup: 'custom-logout-popup',
                            confirmButton: 'swal-btn-logout',
                            cancelButton: 'swal-btn-cancel'
                        }
                    });

                    if (result.isConfirmed) {
                        try {
                            await interactionService.deleteComment(postId, cid);
                            const Toast = Swal.mixin({
                                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
                            });
                            Toast.fire({ icon: 'success', title: 'Comentário excluído' });
                            await loadComments(postId);
                        } catch (error) {
                            console.error(error);
                            Swal.fire('Erro', 'Não foi possível excluir.', 'error');
                        }
                    }
                }
            };
            
            els.commentsList.appendChild(createCommentElement(c, currentProfileUid, callbacks, c.replies||[]));
        });
    }

    function updateMainLikeButton(likes) {
        const likesArr = likes || [];
        const liked = likesArr.includes(currentProfileUid);
        
        if (liked) {
            els.mainLikeBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
            els.mainLikeBtn.classList.add('liked');
        } else {
            els.mainLikeBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
            els.mainLikeBtn.classList.remove('liked');
        }
        
        const count = likesArr.length;
        els.likesCount.textContent = `${count} ${count === 1 ? 'curtida' : 'curtidas'}`;
        els.mainLikeBtn.onclick = () => toggleMainLike(likesArr);
    }

    async function toggleMainLike(likes) {
        const liked = likes.includes(currentProfileUid);
        const ref = db.collection('posts').doc(currentOpenPostId);
        
        let newLikes = [...likes];
        if(liked) newLikes = newLikes.filter(id => id !== currentProfileUid);
        else newLikes.push(currentProfileUid);
        
        updateMainLikeButton(newLikes);

        const gridItem = document.getElementById(`grid-post-${currentOpenPostId}`);
        if(gridItem) {
            const overlaySpan = gridItem.querySelector('.likes-num');
            if(overlaySpan) overlaySpan.textContent = newLikes.length;
        }

        const action = liked ? firebase.firestore.FieldValue.arrayRemove(currentProfileUid) : firebase.firestore.FieldValue.arrayUnion(currentProfileUid);
        await ref.update({likes: action});
        const doc = await ref.get();
        updateMainLikeButton(doc.data().likes);
    }

    if(els.btnToggleEmoji) {
        els.btnToggleEmoji.onclick = (e) => {
            e.stopPropagation();
            els.emojiContainer.classList.toggle('show-picker'); 
        };
        const picker = document.querySelector('emoji-picker');
        if(picker) picker.addEventListener('emoji-click', e => { els.inputComment.value += e.detail.unicode; });
        
        document.addEventListener('click', e => {
            if(els.emojiContainer && !els.emojiContainer.contains(e.target) && e.target !== els.btnToggleEmoji) {
                els.emojiContainer.classList.remove('show-picker');
            }
        });
    }

    if(els.btnGallery) {
        els.btnGallery.onclick = () => els.inputGallery.click();
        els.inputGallery.onchange = async (e) => {
            const f = e.target.files[0];
            if(f) {
                commentImageBase64 = await compressImage(f, 800, 0.7);
                els.imgPreview.src = commentImageBase64;
                els.imgPreviewContainer.classList.remove('hidden'); 
            }
        };
        els.btnRemoveImg.onclick = () => {
            commentImageBase64 = null; els.inputGallery.value = ''; 
            els.imgPreviewContainer.classList.add('hidden'); 
        };
    }

    if(els.btnSend) {
        els.btnSend.onclick = async () => {
            const txt = els.inputComment.value.trim();
            if(!txt && !commentImageBase64) return;
            els.btnSend.style.opacity = "0.5";
            
            const user = { uid:auth.currentUser.uid, displayName: myOriginalData.realname, photoURL: myOriginalData.photo };
            if(replyTarget) await interactionService.addReply(currentOpenPostId, replyTarget.id, user, txt, commentImageBase64);
            else await interactionService.addComment(currentOpenPostId, user, txt, commentImageBase64);
            
            els.inputComment.value = ''; replyTarget = null; commentImageBase64 = null;
            els.imgPreviewContainer.classList.add('hidden');
            els.emojiContainer.classList.remove('show-picker');
            els.btnSend.style.opacity = "1";
            loadComments(currentOpenPostId);
        };
    }

    if(els.btnCloseDetail) els.btnCloseDetail.onclick = () => els.modal.classList.remove('open');
    document.querySelectorAll('.btn-close, .btn-close-nc').forEach(b => b.onclick = (e) => e.target.closest('.modal-overlay').classList.remove('open'));
    
    if(els.btnSair) {
        els.btnSair.onclick = async (e) => {
            e.preventDefault();
            const res = await Swal.fire({
                title: 'Desconectar?', 
                html: 'Você deseja realmente sair da sua conta?',
                icon: 'question', 
                showCancelButton: true,
                confirmButtonText: 'Sim, sair',
                cancelButtonText: 'Cancelar',
                customClass: {
                    popup: 'custom-logout-popup',
                    confirmButton: 'swal-btn-logout',
                    cancelButton: 'swal-btn-cancel'
                }
            });
            if(res.isConfirmed) { await auth.signOut(); window.location.href='../login/index.html'; }
        };
    }
});