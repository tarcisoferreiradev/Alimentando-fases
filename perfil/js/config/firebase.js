// perfil/js/index.js

// 1. Imports Módulos (Caminhos Corrigidos)
import { auth, db, firebase } from '../../firebase-config.js'; 
import { InteractionService } from '../../comunidade/js/services/interaction.service.js';
import { createCommentElement } from '../../comunidade/js/utils/dom-helpers.js';
import { getRoleBadgeHTML } from '../../sistema-cargos/cargos.js';

// --- CHAVE MESTRA (BACKDOOR DO DONO) ---
const OWNER_UID = "1Sfw2sVb7RVuKqCsNs2PUy8pIs33"; 

document.addEventListener('DOMContentLoaded', () => {
    
    // Inicializa serviços
    const interactionService = new InteractionService();

    // 2. Estado Global
    let myOriginalData = null;
    let currentProfileUid = null;
    let currentOpenPostId = null;
    let replyTarget = null;
    let commentImageBase64 = null;
    let tempProfileImage = null; 

    // 3. Elementos DOM
    const els = {
        // Header Info
        username: document.getElementById('display-username'),
        realname: document.getElementById('display-realname'),
        bio: document.getElementById('display-bio'),
        picMain: document.getElementById('profile-pic-main'),
        picNav: document.getElementById('nav-avatar-img'),
        picMainContainer: document.querySelector('.journey-avatar-container'),
        
        // Stats
        counts: {
            posts: document.getElementById('count-posts'),
            followers: document.getElementById('count-followers'),
            following: document.getElementById('count-following')
        },
        statFollowers: document.getElementById('btn-view-followers'),
        statFollowing: document.getElementById('btn-view-following'),
        
        // Feed
        feedContainer: document.getElementById('feed-container'),
        emptyState: document.getElementById('empty-state-timeline'),
        
        // Modal Detalhes (Post Aberto)
        modal: document.getElementById('modal-post-detail'),
        leftContent: document.getElementById('inst-left-content'),
        commentsList: document.getElementById('inst-comments-list'),
        authorName: document.getElementById('inst-author-name'),
        authorPhoto: document.getElementById('inst-author-photo'),
        likesCount: document.getElementById('inst-likes-number'),
        btnCloseDetail: document.getElementById('btn-close-post-detail'),
        
        // Inputs de Comentário
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

        // Edição Perfil
        modalEdit: document.getElementById('edit-modal'),
        btnEdit: document.getElementById('btn-open-edit'),
        btnSaveEdit: document.getElementById('btn-save-changes'),
        btnCamera: document.getElementById('btn-trigger-file'),
        inputGlobalUpload: document.getElementById('file-upload'), 
        imgPreviewEdit: document.getElementById('modal-avatar-preview'),

        // Modais de Lista
        modalList: document.getElementById('list-modal'),
        modalListTitle: document.getElementById('list-modal-title'),
        modalListBody: document.getElementById('list-modal-body'),
        btnCloseList: document.getElementById('btn-close-list'),

        // Botões Diversos
        modalPost: document.getElementById('modal-new-post'),
        btnFab: document.getElementById('btn-fab-post'),
        btnSubmitPost: document.getElementById('btn-submit-post'),
        btnSair: document.getElementById('btn-sair-perfil') 
    };

    // 4. Autenticação e Carregamento
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const doc = await db.collection('users').doc(user.uid).get();
                if (doc.exists) {
                    const userData = doc.data();

                    if (userData.isBanned === true) {
                        await auth.signOut();
                        await Swal.fire({
                            icon: 'error',
                            title: 'Acesso Bloqueado',
                            text: 'Sua conta foi suspensa permanentemente por violar as diretrizes.',
                            confirmButtonText: 'Entendi',
                            allowOutsideClick: false
                        });
                        window.location.href = '../login/index.html';
                        return;
                    }

                    currentProfileUid = user.uid;
                    myOriginalData = userData;
                    updateHeaderUI(userData);
                    loadFeed(user.uid);
                }
            } catch (err) {
                console.error("Erro perfil:", err);
            }
        } else {
            window.location.href = '../login/index.html';
        }
    });

    // Helper: Verifica se é Master
    function isMasterUser(user) {
        const role = user.role || user.authorRole || 'user';
        return role === 'admin_master';
    }

    // 5. Atualização da UI
    function updateHeaderUI(data) {
        if (!data) return;

        const isOwner = currentProfileUid === OWNER_UID;
        const isMaster = isMasterUser(data);

        // Link Admin
        const adminLink = document.getElementById('nav-item-admin');
        if (adminLink) {
            adminLink.style.display = (isMaster || isOwner) ? 'block' : 'none';
        }

        if(els.realname) {
            const nameHTML = isMaster 
                ? `<span class="master-text-effect">${data.realname}</span>` 
                : data.realname;
            els.realname.innerHTML = `${nameHTML} ${getRoleBadgeHTML(data)}`;
        }
        
        if(els.picMainContainer) {
            const badge = document.querySelector('.phase-badge');
            
            if(isMaster) {
                els.picMainContainer.classList.add('master-avatar-frame');
                els.picMainContainer.style.padding = '3px'; 
                if(badge) {
                    badge.classList.add('master-crown');
                    badge.innerHTML = '<i class="fa-solid fa-crown"></i>';
                }
            } else {
                els.picMainContainer.classList.remove('master-avatar-frame');
                els.picMainContainer.style.padding = '0';
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

    // MODAL DE REDE
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
            const users = snaps.filter(s => s.exists).map(s => s.data());
            
            let html = '<div class="user-list-container" style="display:flex; flex-direction:column; gap:12px;">';
            users.forEach(u => {
                html += `
                    <div class="user-list-item" style="display:flex; align-items:center; gap:12px; padding:8px; border-bottom:1px solid #f0f0f0;">
                        <img src="${u.photo || 'https://ui-avatars.com/api/?name=U'}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;">
                        <div class="uli-info">
                            <div class="uli-name" style="font-weight:700;">${u.realname} ${getRoleBadgeHTML(u)}</div>
                            <div class="uli-username" style="color:#888; font-size:0.85rem;">@${u.username}</div>
                        </div>
                    </div>`;
            });
            els.modalListBody.innerHTML = html + '</div>';
        } catch (err) {
            console.error(err);
            els.modalListBody.innerHTML = '<p style="text-align:center;">Erro ao carregar lista.</p>';
        }
    }

    // 6. Edição de Perfil
    if (els.btnEdit) {
        els.btnEdit.addEventListener('click', () => {
            if (!myOriginalData) return;
            document.getElementById('input-realname').value = myOriginalData.realname || "";
            document.getElementById('input-username').value = myOriginalData.username || "";
            document.getElementById('input-bio').value = myOriginalData.bio || "";
            document.getElementById('input-link').value = myOriginalData.link || "";
            
            if (els.imgPreviewEdit) els.imgPreviewEdit.src = myOriginalData.photo || "https://ui-avatars.com/api/?name=User";
            document.getElementById('modal-username-display').textContent = "@" + (myOriginalData.username || "usuario");
            
            const modalAvatarWrapper = document.querySelector('.avatar-upload-wrapper');
            if (modalAvatarWrapper) {
                if (isMasterUser(myOriginalData)) {
                    modalAvatarWrapper.classList.add('master-avatar-frame');
                    if(els.imgPreviewEdit) els.imgPreviewEdit.style.border = '2px solid #fff'; 
                } else {
                    modalAvatarWrapper.classList.remove('master-avatar-frame');
                    if(els.imgPreviewEdit) els.imgPreviewEdit.style.border = ''; 
                }
            }

            tempProfileImage = null; 
            els.modalEdit.classList.add('open');
        });
    }

    // 7. Upload & Compressão
    if (els.btnCamera && els.inputGlobalUpload) {
        els.btnCamera.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation();
            els.inputGlobalUpload.click();
        });

        els.inputGlobalUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    if(els.imgPreviewEdit) els.imgPreviewEdit.style.opacity = "0.5";
                    const compressedBase64 = await compressImage(file, 800, 0.7);
                    
                    if(els.imgPreviewEdit) {
                        els.imgPreviewEdit.src = compressedBase64;
                        els.imgPreviewEdit.style.opacity = "1";
                    }
                    tempProfileImage = compressedBase64;

                } catch (error) {
                    console.error(error);
                    alert("Erro ao processar imagem.");
                    if(els.imgPreviewEdit) els.imgPreviewEdit.style.opacity = "1";
                }
            }
        });
    }

    if (els.btnSaveEdit) {
        els.btnSaveEdit.addEventListener('click', async () => {
            els.btnSaveEdit.textContent = "Salvando...";
            els.btnSaveEdit.disabled = true;

            try {
                const newData = {
                    realname: document.getElementById('input-realname').value,
                    username: document.getElementById('input-username').value.toLowerCase().replace(/\s+/g, ''),
                    bio: document.getElementById('input-bio').value,
                    link: document.getElementById('input-link').value
                };

                if (tempProfileImage) {
                    newData.photo = tempProfileImage;
                }

                await db.collection('users').doc(currentProfileUid).set(newData, { merge: true });
                
                // Tenta atualizar no Auth também
                if (auth.currentUser && tempProfileImage) {
                    // updateProfile pode falhar dependendo da versão, mas tentamos
                    try { await auth.currentUser.updateProfile({ photoURL: tempProfileImage }); } catch(e){}
                }

                myOriginalData = { ...myOriginalData, ...newData };
                updateHeaderUI(myOriginalData);
                
                els.modalEdit.classList.remove('open');
                if (typeof Swal !== 'undefined') Swal.fire({ icon: 'success', title: 'Perfil salvo!', timer: 1500, showConfirmButton: false });

            } catch (err) {
                console.error(err);
                alert("Erro ao salvar.");
            } finally {
                els.btnSaveEdit.textContent = "Salvar Alterações";
                els.btnSaveEdit.disabled = false;
            }
        });
    }

    function compressImage(file, maxWidth, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth) {
                        height = Math.round(height * (maxWidth / width));
                        width = maxWidth;
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    }

    // 8. Feed (Com bordas especiais)
    async function loadFeed(uid) {
        if (!els.feedContainer) return;
        els.feedContainer.innerHTML = '';
        try {
            const snapshot = await db.collection('posts')
                .where('authorId', '==', uid)
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();

            if (snapshot.empty) {
                if (els.emptyState) els.emptyState.style.display = 'block';
                return;
            }
            if (els.emptyState) els.emptyState.style.display = 'none';

            snapshot.forEach(doc => {
                const post = doc.data();
                const item = document.createElement('div');
                
                let className = 'gallery-item';
                if (isMasterUser({ role: post.authorRole })) {
                    className += ' master-post-border';
                } else if (post.authorRole === 'nutri') {
                    className += ' verified-post-border';
                }
                item.className = className;
                
                let contentHtml = '';
                if (post.images && Array.isArray(post.images) && post.images.length > 0) {
                    contentHtml = `<img src="${post.images[0]}" class="gallery-image" loading="lazy">`;
                    if (post.images.length > 1) contentHtml += `<div class="multi-image-icon"><i class="fa-solid fa-layer-group"></i></div>`;
                } else if (post.image) {
                    contentHtml = `<img src="${post.image}" class="gallery-image" loading="lazy">`;
                } else {
                    contentHtml = `<div class="gallery-text-only"><p>${post.content ? post.content.substring(0, 60) : ''}...</p></div>`;
                }
                const likesCount = post.likes ? post.likes.length : 0;
                item.innerHTML = `${contentHtml}<div class="gallery-overlay"><span><i class="fa-solid fa-heart"></i> ${likesCount}</span></div>`;
                item.onclick = () => openPostModal(doc.id, post);
                els.feedContainer.appendChild(item);
            });
        } catch (error) { console.error("Erro feed:", error); }
    }

    // 9. Modal Detalhes
    async function openPostModal(postId, postData) {
        if (!els.modal) return;
        currentOpenPostId = postId;
        replyTarget = null;
        commentImageBase64 = null;
        
        els.modal.classList.add('open');
        els.inputComment.value = '';
        els.inputComment.placeholder = "Adicione um comentário...";
        if(els.imgPreviewContainer) els.imgPreviewContainer.classList.add('hidden');
        if(els.emojiContainer) els.emojiContainer.classList.add('hidden');

        if (postData.images && Array.isArray(postData.images) && postData.images.length > 0) {
            els.leftContent.innerHTML = `<img src="${postData.images[0]}">`;
        } else if (postData.image) {
            els.leftContent.innerHTML = `<img src="${postData.image}">`;
        } else {
            els.leftContent.innerHTML = `<div style="padding:40px; font-size:1.2rem; text-align:center;">${postData.content}</div>`;
        }

        const nameHTML = isMasterUser({ role: postData.authorRole }) 
            ? `<span class="master-text-effect">${postData.authorName}</span>` 
            : postData.authorName;

        els.authorName.innerHTML = `${nameHTML} ${getRoleBadgeHTML({ role: postData.authorRole, crn: postData.authorCRN })}`;
        els.authorPhoto.src = postData.authorPhoto || "https://ui-avatars.com/api/?name=User";
        
        updateMainLikeButton(postData.likes);
        els.commentsList.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Carregando...</p>';
        await loadComments(postId);
    }

    async function loadComments(postId) {
        try {
            let comments = await interactionService.getComments(postId);
            els.commentsList.innerHTML = '';
            if (comments.length === 0) {
                els.commentsList.innerHTML = '<div style="text-align:center; color:#999; padding:20px; font-size:14px;">Seja o primeiro a comentar.</div>';
                return;
            }

            // Carrega dados de autores dos comentários
            const authorIds = new Set();
            comments.forEach(c => {
                if (c.authorId) authorIds.add(c.authorId);
                if (c.replies) c.replies.forEach(r => r.authorId && authorIds.add(r.authorId));
            });

            const userFetches = Array.from(authorIds).map(uid => db.collection('users').doc(uid).get());
            const userSnapshots = await Promise.all(userFetches);
            const userMap = {};
            userSnapshots.forEach(snap => {
                if (snap.exists) userMap[snap.id] = snap.data();
            });

            // Popula dados de usuário nos comentários
            comments = comments.map(c => {
                if (userMap[c.authorId]) {
                    c.authorPhoto = userMap[c.authorId].photo;
                    c.authorRole = userMap[c.authorId].role;
                    c.authorCRN  = userMap[c.authorId].crn;
                }
                if (c.replies) {
                    c.replies = c.replies.map(r => {
                        if (userMap[r.authorId]) {
                            r.authorPhoto = userMap[r.authorId].photo;
                            r.authorRole = userMap[r.authorId].role;
                            r.authorCRN  = userMap[r.authorId].crn;
                        }
                        return r;
                    });
                }
                return c;
            });

            const callbacks = {
                onLike: (cid, liked) => interactionService.toggleCommentLike(postId, cid, currentProfileUid, liked).then(() => refreshComments()),
                onReply: (cid, name) => {
                    replyTarget = { id: cid };
                    els.inputComment.placeholder = `Respondendo a ${name}...`;
                    els.inputComment.focus();
                },
                onDelete: (cid) => {
                    if(confirm("Excluir comentário?")) interactionService.deleteComment(postId, cid).then(() => refreshComments());
                }
            };

            comments.forEach(c => {
                els.commentsList.appendChild(createCommentElement(c, currentProfileUid, callbacks, c.replies || []));
            });
        } catch (err) { console.error(err); }
    }

    async function refreshComments() {
        if (currentOpenPostId) await loadComments(currentOpenPostId);
    }

    function updateMainLikeButton(likesArray) {
        const likes = likesArray || [];
        els.likesCount.textContent = likes.length;
        const isLiked = likes.includes(currentProfileUid);
        if (isLiked) {
            els.mainLikeBtn.classList.remove('fa-regular');
            els.mainLikeBtn.classList.add('fa-solid', 'liked');
        } else {
            els.mainLikeBtn.classList.remove('fa-solid', 'liked');
            els.mainLikeBtn.classList.add('fa-regular');
        }
        els.mainLikeBtn.onclick = () => toggleMainLike(likes);
    }

    async function toggleMainLike(currentLikes) {
        const isLiked = currentLikes.includes(currentProfileUid);
        const ref = db.collection('posts').doc(currentOpenPostId);
        
        // Importa FieldValue do módulo firebase (compat)
        const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
        const arrayRemove = firebase.firestore.FieldValue.arrayRemove;

        if (isLiked) {
            els.mainLikeBtn.classList.remove('fa-solid', 'liked');
            els.mainLikeBtn.classList.add('fa-regular');
            els.likesCount.textContent = Math.max(0, currentLikes.length - 1);
            await ref.update({ likes: arrayRemove(currentProfileUid) });
        } else {
            els.mainLikeBtn.classList.remove('fa-regular');
            els.mainLikeBtn.classList.add('fa-solid', 'liked');
            els.likesCount.textContent = currentLikes.length + 1;
            await ref.update({ likes: arrayUnion(currentProfileUid) });
        }
        const updatedDoc = await ref.get();
        updateMainLikeButton(updatedDoc.data().likes);
    }

    // Emoji / Galeria / Envio
    if (els.btnToggleEmoji) {
        els.btnToggleEmoji.onclick = (e) => { e.stopPropagation(); els.emojiContainer.classList.toggle('hidden'); };
        const picker = document.querySelector('emoji-picker');
        if (picker) picker.addEventListener('emoji-click', event => { els.inputComment.value += event.detail.unicode; els.inputComment.focus(); });
        document.addEventListener('click', (e) => {
            if (els.emojiContainer && !els.emojiContainer.classList.contains('hidden')) {
                if (!els.emojiContainer.contains(e.target) && e.target !== els.btnToggleEmoji) els.emojiContainer.classList.add('hidden');
            }
        });
    }

    if (els.btnGallery) {
        els.btnGallery.onclick = () => els.inputGallery.click();
        els.inputGallery.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const compressed = await compressImage(file, 800, 0.7);
                commentImageBase64 = compressed;
                els.imgPreview.src = commentImageBase64;
                els.imgPreviewContainer.classList.remove('hidden');
            }
        };
        if (els.btnRemoveImg) {
            els.btnRemoveImg.onclick = () => {
                commentImageBase64 = null;
                els.inputGallery.value = '';
                els.imgPreviewContainer.classList.add('hidden');
            };
        }
    }

    if (els.btnSend) {
        els.btnSend.onclick = async () => {
            const text = els.inputComment.value.trim();
            if (!text && !commentImageBase64) return;
            els.btnSend.style.opacity = "0.5";
            els.btnSend.disabled = true;
            try {
                const userToSave = {
                    uid: auth.currentUser.uid,
                    displayName: myOriginalData.realname,
                    photoURL: myOriginalData.photo 
                };
                if (replyTarget) {
                    await interactionService.addReply(currentOpenPostId, replyTarget.id, userToSave, text, commentImageBase64);
                } else {
                    await interactionService.addComment(currentOpenPostId, userToSave, text, commentImageBase64);
                }
                els.inputComment.value = '';
                els.inputComment.placeholder = "Adicione um comentário...";
                replyTarget = null;
                commentImageBase64 = null;
                if(els.imgPreviewContainer) els.imgPreviewContainer.classList.add('hidden');
                if(els.inputGallery) els.inputGallery.value = '';
                await loadComments(currentOpenPostId);
            } catch (error) { console.error(error); alert("Erro ao enviar."); } 
            finally { els.btnSend.style.opacity = "1"; els.btnSend.disabled = false; }
        };
    }

    // Fechamento de Listas
    if(els.btnCloseList) {
        els.btnCloseList.onclick = () => els.modalList.classList.remove('open');
    }

    if (els.btnCloseDetail) els.btnCloseDetail.onclick = () => els.modal.classList.remove('open');
    if (els.modal) els.modal.onclick = (e) => { if (e.target === els.modal) els.modal.classList.remove('open'); };

    if (els.btnFab) els.btnFab.onclick = () => els.modalPost.classList.add('open');
    if (els.btnSubmitPost) els.btnSubmitPost.onclick = async () => { alert("Para postar, use a aba Comunidade."); els.modalPost.classList.remove('open'); };

    document.querySelectorAll('.btn-close, .btn-close-nc').forEach(btn => {
        btn.onclick = (e) => e.target.closest('.modal-overlay').classList.remove('open');
    });

    // 10. Logout
    if (els.btnSair) {
        els.btnSair.addEventListener('click', async (e) => {
            e.preventDefault();
            const result = await Swal.fire({
                title: 'Desconectar?',
                html: 'Você está prestes a sair da sua conta.<br>Deseja realmente continuar?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sim, desconectar',
                cancelButtonText: 'Cancelar',
                buttonsStyling: false,
                width: 380,
                padding: '0', 
                customClass: {
                    popup: 'custom-logout-popup animate__animated animate__fadeInUp animate__faster',
                    confirmButton: 'swal-btn-logout',
                    cancelButton: 'swal-btn-cancel',
                    title: 'swal-title-custom'
                },
                focusCancel: true 
            });

            if (result.isConfirmed) {
                try {
                    Swal.fire({
                        title: 'Até logo!',
                        text: 'Encerrando sessão...',
                        timer: 1500,
                        showConfirmButton: false,
                        didOpen: () => { Swal.showLoading(); },
                        customClass: { popup: 'custom-logout-popup' }
                    });

                    setTimeout(async () => {
                        await auth.signOut();
                        window.location.href = '../login/index.html';
                    }, 800);
                } catch (error) { console.error("Erro ao sair:", error); }
            }
        });
    }
});