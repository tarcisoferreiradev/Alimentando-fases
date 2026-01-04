document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. CONFIGURAÇÃO DAS CONQUISTAS ---
    const ALL_ACHIEVEMENTS = [
        { id: 'welcome_fases', title: 'Primeiros Passos', desc: 'Criou sua conta e entrou na plataforma.', icon: 'fa-solid fa-door-open', xp: 10 },
        { id: 'bio_master', title: 'Identidade', desc: 'Preencheu sua biografia e link social.', icon: 'fa-solid fa-id-card', xp: 20 },
        { id: 'photo_update', title: 'Biscoiteiro', desc: 'Atualizou sua foto de perfil pela primeira vez.', icon: 'fa-solid fa-camera', xp: 15 },
        { id: 'phase_guardian', title: 'Guardião da Fase', desc: 'Verificou o status da sua fase atual.', icon: 'fa-solid fa-seedling', xp: 25 },
        { id: 'planner_master', title: 'Mestre do Plano', desc: 'Consultou seu plano alimentar.', icon: 'fa-solid fa-clipboard-list', xp: 25 },
        { id: 'night_owl', title: 'Coruja da Noite', desc: 'Acessou o Alimentando Fases durante a noite (22h-05h).', icon: 'fa-solid fa-moon', xp: 50 },
        { id: 'social_butterfly', title: 'Sociável', desc: 'Acessou a área de mensagens.', icon: 'fa-regular fa-paper-plane', xp: 20 },
        { id: 'curious_badge', title: 'Curioso', desc: 'Inspecionou sua insígnia de nível.', icon: 'fa-solid fa-magnifying-glass', xp: 10 }
    ];

    if (typeof firebase === 'undefined' || !firebase.auth || !firebase.firestore) {
        console.error("ERRO CRÍTICO: Firebase não foi carregado no HTML."); 
        return;
    }

    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = typeof firebase.storage === 'function' ? firebase.storage() : null; // Previne erro se storage faltar

    // ELEMENTOS UI
    const els = {
        username: document.getElementById('display-username'),
        realname: document.getElementById('display-realname'),
        bio: document.getElementById('display-bio'),
        link: document.getElementById('display-link'),
        picMain: document.getElementById('profile-pic-main'),
        picNav: document.getElementById('nav-avatar-img'),
        countFollowers: document.getElementById('count-followers'),
        countFollowing: document.getElementById('count-following'),
        countPosts: document.getElementById('count-posts') 
    };

    // Botões e Containers
    const btnOpenEdit = document.getElementById('btn-open-edit');
    const visitorActions = document.getElementById('visitor-actions'); 
    const btnFollow = document.getElementById('btn-follow');           
    const btnBackProfile = document.getElementById('btn-back-profile');
    const actionsRow = document.getElementById('actions-row');
    
    // NOVO BOTÃO FAB
    const btnFabPost = document.getElementById('btn-fab-post');
    if(btnFabPost) {
        btnFabPost.addEventListener('click', () => {
            document.getElementById('modal-new-post').classList.add('open');
        });
    }
    
    const btnViewFollowers = document.getElementById('btn-view-followers');
    const btnViewFollowing = document.getElementById('btn-view-following');

    // Abas
    const tabBtnTimeline = document.getElementById('tab-btn-timeline');
    const tabBtnSaved = document.getElementById('tab-btn-saved');
    const tabBtnAchievements = document.getElementById('tab-btn-achievements');

    // Modais e Edição
    const modalEdit = document.getElementById('edit-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnSave = document.getElementById('btn-save-changes');
    const modalPhotoOptions = document.getElementById('photo-options-modal');
    const btnChangePhoto = document.getElementById('btn-trigger-file');
    const btnActionUpload = document.getElementById('btn-action-upload');
    const btnActionRemove = document.getElementById('btn-action-remove');
    const btnActionCancel = document.getElementById('btn-action-cancel');
    const fileInput = document.getElementById('file-upload');
    const modalAvatarPreview = document.getElementById('modal-avatar-preview');
    const modalUsernameDisplay = document.getElementById('modal-username-display');
    const modalRealnameDisplay = document.getElementById('modal-realname-display');

    // Modal Lista
    const modalList = document.getElementById('list-modal');
    const btnCloseList = document.getElementById('btn-close-list');
    const listTitle = document.getElementById('list-modal-title');
    const listBody = document.getElementById('list-modal-body');

    // Inputs
    const inputs = {
        username: document.getElementById('input-username'),
        realname: document.getElementById('input-realname'),
        bio: document.getElementById('input-bio'),
        link: document.getElementById('input-link'),
        counter: document.getElementById('char-counter')
    };

    // Busca
    const btnOpenSearch = document.getElementById('btn-open-search');
    const modalSearch = document.getElementById('search-modal');
    const btnCloseSearch = document.getElementById('btn-close-search');
    const inputSearch = document.getElementById('input-search-users');
    const resultsContainer = document.getElementById('search-results-container');

    // Gênero
    const customSelect = document.getElementById('gender-custom-select');
    const customSelectTrigger = customSelect ? customSelect.querySelector('.custom-select-trigger') : null;
    const customSelectText = document.getElementById('gender-display-text');
    const customOptions = customSelect ? customSelect.querySelectorAll('.custom-option') : [];
    const inputGenderHidden = document.getElementById('input-gender-hidden');
    const customGenderWrapper = document.getElementById('custom-gender-wrapper'); 
    const inputGenderCustom = document.getElementById('input-gender-custom');
    const btnCancelCustom = document.getElementById('btn-cancel-custom');

    // ESTADO GLOBAL
    let myOriginalData = {}; 
    let currentUserData = {}; 
    let currentProfileUid = null; 

    // --- FUNÇÕES DE CARGO (Badge) ---
    function getRoleBadge(userOrPost) {
        const role = userOrPost.role || userOrPost.authorRole;
        if (role === 'admin_master' || role === 'admin') return '<i class="fa-solid fa-circle-check badge-dev" style="color:#764ba2; margin-left:5px;" title="Admin"></i>';
        if (role === 'nutri') return '<i class="fa-solid fa-user-doctor badge-nutri" style="color:#28a745; margin-left:5px;" title="Nutri"></i>';
        const name = userOrPost.realname || userOrPost.authorName || '';
        if (name.includes('Tarx')) return '<i class="fa-solid fa-circle-check" style="color:#1da1f2; margin-left:5px;" title="Verificado"></i>';
        return '';
    }

    // --- CARREGAR FEED EM GRADE ---
    async function loadProfileFeed() {
        const feedContainer = document.getElementById('feed-container'); 
        const emptyState = document.getElementById('empty-state-timeline');
        
        if (!feedContainer) {
            console.warn("Container do feed não encontrado no HTML!");
            return;
        }
        
        if (!currentProfileUid) return;

        feedContainer.classList.add('gallery-grid');
        feedContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:20px; color:#666;">Carregando posts...</div>';
        
        try {
            const snapshot = await db.collection('posts')
                .where('authorId', '==', currentProfileUid)
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();
            
            feedContainer.innerHTML = '';
            
            if (snapshot.empty) {
                feedContainer.style.display = 'none';
                if(emptyState) emptyState.style.display = 'block';
                return;
            }
            if(emptyState) emptyState.style.display = 'none';
            feedContainer.style.display = 'grid'; 

            snapshot.forEach(doc => {
                const post = doc.data();
                const postId = doc.id;
                
                // Define a capa (Imagem ou Texto)
                let thumbHtml = '';
                const images = post.images || (post.image ? [post.image] : []);
                const multiIcon = images.length > 1 ? '<div class="multi-image-icon"><i class="fa-solid fa-layer-group"></i></div>' : '';

                if (images.length > 0) {
                    thumbHtml = `<img src="${images[0]}" class="gallery-image">`;
                } else {
                    const shortText = post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content;
                    thumbHtml = `<div class="gallery-text-only"><p>${escapeHtml(shortText)}</p></div>`;
                }

                const html = `
                    <div class="gallery-item" onclick="openPostModal('${postId}')">
                        ${thumbHtml}
                        ${multiIcon}
                        <div class="gallery-overlay">
                            <span><i class="fa-solid fa-heart"></i> ${post.likes ? post.likes.length : 0}</span>
                            <span><i class="fa-solid fa-comment"></i> ${post.commentsCount || 0}</span>
                        </div>
                    </div>
                `;
                feedContainer.insertAdjacentHTML('beforeend', html);
            });
            
            // Atualiza número de posts
            if(els.countPosts) els.countPosts.innerText = snapshot.size;

        } catch (e) {
            console.error("Erro ao carregar feed:", e);
            feedContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:red;">Erro ao carregar. Verifique o console (F12).</div>';
        }
    }

    // --- MODAL DE CRIAR POST ---
    const modalPost = document.getElementById('modal-new-post');
    const modalPostInput = document.getElementById('modal-post-input');
    const btnSubmitPost = document.getElementById('btn-submit-post');
    const modalPostFile = document.getElementById('modal-file-upload-post');
    const modalPreview = document.getElementById('modal-image-preview-area');
    let postImages = [];

    if(document.getElementById('btn-close-modal-post')) document.getElementById('btn-close-modal-post').onclick = () => modalPost.classList.remove('open');
    if(modalPostInput) modalPostInput.addEventListener('input', () => btnSubmitPost.disabled = modalPostInput.value.trim() === '');
    
    if(modalPostFile) modalPostFile.addEventListener('change', (e) => {
        if(e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                postImages.push(ev.target.result);
                modalPreview.innerHTML += `<img src="${ev.target.result}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">`;
                modalPreview.classList.remove('hidden');
                btnSubmitPost.disabled = false;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    if(btnSubmitPost) btnSubmitPost.addEventListener('click', async () => {
        if(checkGuest()) return;
        btnSubmitPost.innerText = "Publicando...";
        btnSubmitPost.disabled = true;
        try {
            await db.collection('posts').add({
                authorId: firebase.auth().currentUser.uid,
                authorName: myOriginalData.realname,
                authorPhoto: myOriginalData.photo,
                authorRole: myOriginalData.role || 'user',
                content: modalPostInput.value,
                images: postImages,
                image: postImages[0] || null,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                likes: [],
                commentsCount: 0
            });
            await db.collection('users').doc(firebase.auth().currentUser.uid).update({ 
                postsCount: firebase.firestore.FieldValue.increment(1) 
            });
            
            modalPost.classList.remove('open');
            postImages = []; modalPreview.innerHTML = ''; modalPostInput.value = '';
            btnSubmitPost.innerText = "Publicar";
            btnSubmitPost.disabled = false;
            
            // Recarrega o feed IMEDIATAMENTE
            loadProfileFeed(); 
            
        } catch(e) { 
            console.error(e); 
            btnSubmitPost.innerText = "Erro";
            btnSubmitPost.disabled = false;
        }
    });

    // Likes
    window.toggleLike = async (postId) => {
        if(checkGuest()) return;
        const uid = firebase.auth().currentUser.uid;
        const ref = db.collection('posts').doc(postId);
        await ref.update({ likes: firebase.firestore.FieldValue.arrayUnion(uid) }); 
        openPostModal(postId); // Atualiza modal
    };

    // --- VISUALIZAR POST (MODAL GRANDE) ---
    window.openPostModal = async (postId) => {
        const modal = document.getElementById('modal-post-detail');
        const left = document.getElementById('inst-left-content');
        const comments = document.getElementById('inst-comments-list');
        modal.classList.add('open');
        left.innerHTML = ''; comments.innerHTML = 'Carregando...';
        
        const doc = await db.collection('posts').doc(postId).get();
        const p = doc.data();
        
        const images = p.images || (p.image ? [p.image] : []);
        left.innerHTML = images.length > 0 ? `<img src="${images[0]}" style="max-width:100%; max-height:100%; object-fit:contain;">` : `<div style="padding:20px; color:white; text-align:center;">${p.content}</div>`;
        document.getElementById('inst-author-name').innerHTML = `${p.authorName} ${getRoleBadge(p)}`;
        document.getElementById('inst-author-photo').src = p.authorPhoto;
        document.getElementById('inst-likes-number').innerText = p.likes ? p.likes.length : 0;

        // Comentários
        const cSnap = await db.collection('posts').doc(postId).collection('comments').orderBy('timestamp').get();
        comments.innerHTML = '';
        if(cSnap.empty) comments.innerHTML = '<p style="color:#999; text-align:center; padding:20px;">Sem comentários.</p>';
        
        cSnap.forEach(cDoc => {
            const c = cDoc.data();
            comments.innerHTML += `<div style="margin-bottom:10px; border-bottom:1px solid #f0f0f0; padding-bottom:5px;"><strong>${c.authorName}</strong> ${c.text}</div>`;
        });
        
        // Enviar Comentário
        const btnSend = document.getElementById('inst-btn-send');
        const newBtn = btnSend.cloneNode(true);
        btnSend.parentNode.replaceChild(newBtn, btnSend);
        newBtn.addEventListener('click', async () => {
            const txt = document.getElementById('inst-comment-input').value;
            if(!txt) return;
            await db.collection('posts').doc(postId).collection('comments').add({
                text: txt, authorName: myOriginalData.realname, timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            await db.collection('posts').doc(postId).update({ commentsCount: firebase.firestore.FieldValue.increment(1) });
            document.getElementById('inst-comment-input').value = '';
            openPostModal(postId); // Recarrega modal
        });
    };

    // --- FUNÇÕES UI ORIGINAIS ---
    function activateCustomMode() { customSelect.classList.add('hidden'); customGenderWrapper.classList.add('visible'); inputGenderHidden.value = 'Personalizado'; inputGenderCustom.focus(); }
    function deactivateCustomMode() { customSelect.classList.remove('hidden'); customGenderWrapper.classList.remove('visible'); }
    function resetDropdown() { customSelectText.textContent = "Selecione"; customSelectText.classList.add('placeholder-text'); inputGenderHidden.value = ""; inputGenderCustom.value = ""; customOptions.forEach(opt => opt.classList.remove('selected')); deactivateCustomMode(); }

    if(customSelectTrigger) {
        customSelectTrigger.addEventListener('click', () => customSelect.classList.toggle('open'));
        document.addEventListener('click', (e) => { if (!customSelect.contains(e.target)) customSelect.classList.remove('open'); });
        customOptions.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.getAttribute('data-value');
                customOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                if (value === 'Personalizado') { activateCustomMode(); } 
                else { customSelectText.textContent = value; customSelectText.classList.remove('placeholder-text'); inputGenderHidden.value = value; deactivateCustomMode(); }
                customSelect.classList.remove('open');
            });
        });
    }
    if(btnCancelCustom) btnCancelCustom.addEventListener('click', () => { deactivateCustomMode(); resetDropdown(); });

    // Busca
    if(btnOpenSearch) btnOpenSearch.addEventListener('click', (e) => { e.preventDefault(); modalSearch.classList.add('open'); inputSearch.focus(); });
    if(btnCloseSearch) btnCloseSearch.addEventListener('click', () => modalSearch.classList.remove('open'));

    let searchTimeout;
    if(inputSearch) {
        inputSearch.addEventListener('input', () => {
            const term = inputSearch.value.trim().toLowerCase(); 
            resultsContainer.innerHTML = '<p class="search-placeholder">Buscando...</p>';
            clearTimeout(searchTimeout);
            if(term.length === 0) { resultsContainer.innerHTML = '<p class="search-placeholder">Digite para encontrar outros usuários.</p>'; return; }
            searchTimeout = setTimeout(() => { executeSearch(term); }, 500);
        });
    }

    async function executeSearch(term) {
        try {
            const snapshot = await db.collection('users').orderBy('username').startAt(term).endAt(term + '\uf8ff').limit(10).get();
            resultsContainer.innerHTML = '';
            if (snapshot.empty) { resultsContainer.innerHTML = '<p class="search-placeholder">Nenhum usuário encontrado.</p>'; return; }

            snapshot.forEach(doc => {
                const user = { ...doc.data(), uid: doc.id };
                if(doc.id === firebase.auth().currentUser.uid) return; 

                const card = document.createElement('div');
                card.className = 'user-result-card';
                card.innerHTML = `
                    <img src="${user.photo || 'https://ui-avatars.com/api/?name=U'}" alt="${user.username}">
                    <div class="ur-info"><h4>${user.realname}</h4><span>@${user.username}</span></div>
                    <i class="fa-solid fa-chevron-right" style="margin-left: auto; color: #ccc;"></i>`;
                card.addEventListener('click', () => viewUserProfile(user));
                resultsContainer.appendChild(card);
            });
        } catch (error) { console.error("Erro busca:", error); resultsContainer.innerHTML = '<p class="search-placeholder">Erro.</p>'; }
    }

    // Seguir
    async function toggleFollow() {
        const myUid = firebase.auth().currentUser.uid;
        const targetUid = currentProfileUid; 
        if(!targetUid || targetUid === myUid) return;

        const amIFollowing = myOriginalData.following && myOriginalData.following.includes(targetUid);
        updateFollowButton(!amIFollowing);
        btnFollow.disabled = true;

        const myRef = db.collection('users').doc(myUid);
        const targetRef = db.collection('users').doc(targetUid);

        try {
            if (amIFollowing) {
                await myRef.update({ following: firebase.firestore.FieldValue.arrayRemove(targetUid) });
                await targetRef.update({ followers: firebase.firestore.FieldValue.arrayRemove(myUid) });
                myOriginalData.following = myOriginalData.following.filter(id => id !== targetUid);
                if(currentUserData.followers) currentUserData.followers = currentUserData.followers.filter(id => id !== myUid);
            } else {
                await myRef.update({ following: firebase.firestore.FieldValue.arrayUnion(targetUid) });
                await targetRef.update({ followers: firebase.firestore.FieldValue.arrayUnion(myUid) });
                if(!myOriginalData.following) myOriginalData.following = [];
                myOriginalData.following.push(targetUid);
                if(!currentUserData.followers) currentUserData.followers = [];
                currentUserData.followers.push(myUid);
            }
            updateUI(currentUserData); 
        } catch (error) { console.error("Erro:", error); updateFollowButton(amIFollowing); } 
        finally { btnFollow.disabled = false; }
    }

    function updateFollowButton(isFollowing) {
        if (isFollowing) {
            btnFollow.classList.add('following');
            btnFollow.innerHTML = `<i class="fa-solid fa-check"></i> <span>Seguindo</span>`;
        } else {
            btnFollow.classList.remove('following');
            btnFollow.innerHTML = `<i class="fa-solid fa-user-plus"></i> <span>Seguir</span>`;
        }
    }
    if(btnFollow) btnFollow.addEventListener('click', toggleFollow);

    // Listas de Seguidores
    async function openUserList(title, userIds) {
        listTitle.textContent = title;
        listBody.innerHTML = '<p class="search-placeholder">Carregando...</p>';
        modalList.classList.add('open');
        if (!userIds || userIds.length === 0) { listBody.innerHTML = '<p class="search-placeholder">Ninguém aqui ainda.</p>'; return; }
        try {
            const userPromises = userIds.slice(0, 50).map(uid => db.collection('users').doc(uid).get());
            const snapshots = await Promise.all(userPromises);
            listBody.innerHTML = '';
            snapshots.forEach(doc => {
                if(doc.exists) {
                    const user = { ...doc.data(), uid: doc.id };
                    const card = document.createElement('div');
                    card.className = 'user-list-item'; 
                    card.innerHTML = `<img src="${user.photo || 'https://ui-avatars.com/api/?name=U'}" alt="${user.username}"><div class="uli-info"><h4>${user.realname}</h4><span>@${user.username}</span></div>`;
                    card.addEventListener('click', () => { modalList.classList.remove('open'); viewUserProfile(user); });
                    listBody.appendChild(card);
                }
            });
        } catch (error) { listBody.innerHTML = '<p class="search-placeholder">Erro ao carregar.</p>'; }
    }

    if(btnCloseList) btnCloseList.addEventListener('click', () => modalList.classList.remove('open'));
    if(btnViewFollowers) btnViewFollowers.addEventListener('click', () => openUserList('Seguidores', currentUserData.followers || []));
    if(btnViewFollowing) btnViewFollowing.addEventListener('click', () => openUserList('Seguindo', currentUserData.following || []));

    // Navegação Perfil
    function viewUserProfile(targetData) {
        currentProfileUid = targetData.uid; 
        currentUserData = targetData;
        updateUI(targetData);
        loadProfileFeed(); // Carrega posts do perfil visitado
        
        if(btnOpenEdit) btnOpenEdit.style.display = 'none';
        if(actionsRow) actionsRow.style.display = 'none';
        if(btnFabPost) btnFabPost.style.display = 'none'; // ESCONDE BOTÃO FAB EM PERFIL DE OUTROS
        if(visitorActions) visitorActions.style.display = 'flex'; 
        
        const isFollowing = myOriginalData.following && myOriginalData.following.includes(targetData.uid);
        updateFollowButton(isFollowing);

        if(tabBtnTimeline) { tabBtnTimeline.style.display = 'flex'; tabBtnTimeline.click(); }
        if(tabBtnSaved) tabBtnSaved.style.display = 'none';
        if(tabBtnAchievements) tabBtnAchievements.style.display = 'flex'; 

        modalSearch.classList.remove('open');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function returnToMyProfile() {
        currentProfileUid = firebase.auth().currentUser.uid;
        currentUserData = myOriginalData;
        updateUI(myOriginalData);
        loadProfileFeed();
        
        if(btnOpenEdit) btnOpenEdit.style.display = 'flex';
        if(actionsRow) actionsRow.style.display = 'flex';
        if(btnFabPost) btnFabPost.style.display = 'flex'; // MOSTRA BOTÃO FAB NO MEU PERFIL
        if(visitorActions) visitorActions.style.display = 'none'; 
        if(tabBtnTimeline) { tabBtnTimeline.style.display = 'flex'; tabBtnTimeline.click(); }
        if(tabBtnSaved) tabBtnSaved.style.display = 'flex';
    }
    if(btnBackProfile) btnBackProfile.addEventListener('click', returnToMyProfile);

    // Conquistas
    function renderAchievements(userUnlockedIds) {
        const container = document.getElementById('achievements-list-container');
        if(!container) return;
        container.innerHTML = ''; 
        let totalXP = 0;
        ALL_ACHIEVEMENTS.forEach(achiev => {
            const isUnlocked = userUnlockedIds.includes(achiev.id);
            if(isUnlocked) totalXP += achiev.xp;
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.innerHTML = `<div class="ac-icon"><i class="${achiev.icon}"></i></div><div class="ac-info"><h4>${achiev.title}</h4><p>${achiev.desc}</p><span class="ac-xp">+${achiev.xp} XP</span></div>`;
            container.appendChild(card);
        });
        document.getElementById('total-xp').textContent = totalXP;
        document.getElementById('user-level').textContent = Math.floor(totalXP / 100) + 1;
        document.getElementById('xp-bar-fill').style.width = `${totalXP % 100}%`;
    }

    function showToast(achievementId) {
        const achiev = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
        if(!achiev) return;
        const toast = document.getElementById('achievement-toast');
        document.getElementById('toast-message-text').textContent = achiev.title;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 4000);
    }

    async function checkAndUnlockAchievement(achievementId, userUid) {
        if(!userUid) return;
        const userRef = db.collection('users').doc(userUid);
        try {
            const doc = await userRef.get();
            if (!doc.exists) return;
            const data = doc.data();
            const unlockedList = data.achievements || [];
            if (unlockedList.includes(achievementId)) return;
            const newAchievements = [...unlockedList, achievementId];
            await userRef.update({ achievements: newAchievements });
            showToast(achievementId);
            renderAchievements(newAchievements);
            if(currentUserData.username === myOriginalData.username) {
                myOriginalData.achievements = newAchievements;
                updateUI(myOriginalData);
            }
        } catch (error) { console.error("Erro ao desbloquear:", error); }
    }

    const updateUI = (data) => {
        const headerElement = document.querySelector('.journey-header');
        if (data.role === 'admin_master') headerElement.classList.add('admin-mode');
        else headerElement.classList.remove('admin-mode');

        if(els.username) els.username.textContent = "@" + data.username;
        
        // --- BADGE NO NOME PRINCIPAL ---
        const badgeHTML = getRoleBadge(data);
        if(els.realname) els.realname.innerHTML = `${data.realname} ${badgeHTML}`;

        if(els.bio) els.bio.textContent = data.bio || "";
        if(els.link) {
            if (data.link) {
                const visualLink = data.link.replace(/^https?:\/\//, '');
                els.link.innerHTML = `<i class="fa-solid fa-link"></i> ${visualLink}`;
                els.link.href = data.link.startsWith('http') ? data.link : `https://${data.link}`;
                els.link.style.display = 'inline-flex';
            } else { els.link.style.display = 'none'; }
        }
        if(els.picMain) els.picMain.src = data.photo;
        if(myOriginalData && data.username === myOriginalData.username && els.picNav) els.picNav.src = data.photo;
        
        // Atualiza Contadores
        if(els.countFollowers) els.countFollowers.textContent = data.followers ? data.followers.length : 0;
        if(els.countFollowing) els.countFollowing.textContent = data.following ? data.following.length : 0;
        if(els.countPosts) els.countPosts.textContent = data.postsCount || 0; 

        renderAchievements(data.achievements || []);
    };

    // Load Inicial
    const loadUserData = async (user) => {
        const userRef = db.collection('users').doc(user.uid);
        try {
            const doc = await userRef.get();
            let data;
            
            let baseUserName = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '');
            const displayName = user.displayName || 'Usuário';
            const defaultPhoto = `https://ui-avatars.com/api/?name=${displayName}&background=121212&color=fff&size=150`;

            if (doc.exists) {
                data = doc.data();
                if (!data.photo) data.photo = defaultPhoto;
            } else {
                let finalUserName = baseUserName;
                const check = await db.collection('users').where('username', '==', baseUserName).get();
                if(!check.empty) finalUserName = baseUserName + Math.floor(Math.random() * 1000);

                data = {
                    username: finalUserName,
                    realname: displayName,
                    bio: '', 
                    link: '',
                    photo: user.photoURL || defaultPhoto,
                    gender: 'Prefiro não dizer',
                    role: 'user', 
                    achievements: [],
                    following: [], 
                    followers: [],
                    postsCount: 0 
                };
                await userRef.set(data);
            }
            
            myOriginalData = data; 
            currentProfileUid = user.uid; 
            currentUserData = data; 
            updateUI(data); 
            loadProfileFeed(); // CARREGA OS POSTS
            checkAndUnlockAchievement('welcome_fases', user.uid);
            
        } catch (error) { console.error("Erro no load:", error); }
    };

    const tabs = document.querySelectorAll('.j-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active', 'hidden'));
            tabPanes.forEach(p => p.classList.add('hidden'));
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            const el = document.getElementById(targetId);
            if(el) { el.classList.remove('hidden'); el.classList.add('active'); }
            if(targetId === 'tab-achievements') document.getElementById('achievements-dot').style.display = 'none';
        });
    });

    // Auth Change
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadUserData(user);
            const currentHour = new Date().getHours();
            if (currentHour >= 22 || currentHour < 5) checkAndUnlockAchievement('night_owl', user.uid);
            
            if(inputs.username) inputs.username.addEventListener('input', () => { inputs.username.value = inputs.username.value.toLowerCase().replace(/\s+/g, ''); });

            // ... (Lógica de abrir modal de edição mantida igual) ...
            btnOpenEdit.addEventListener('click', () => {
                const dataToEdit = myOriginalData;
                inputs.username.value = dataToEdit.username || "";
                inputs.realname.value = dataToEdit.realname || "";
                inputs.bio.value = dataToEdit.bio || "";
                inputs.link.value = dataToEdit.link || "";

                const savedGender = dataToEdit.gender;
                const standardOptions = ['Prefiro não dizer', 'Masculino', 'Feminino'];
                customOptions.forEach(opt => opt.classList.remove('selected'));
                if (!savedGender) resetDropdown();
                else if (standardOptions.includes(savedGender)) {
                    deactivateCustomMode();
                    inputGenderHidden.value = savedGender;
                    if(customSelectText) { customSelectText.textContent = savedGender; customSelectText.classList.remove('placeholder-text'); }
                    customOptions.forEach(opt => { if(opt.getAttribute('data-value') === savedGender) opt.classList.add('selected'); });
                } else {
                    activateCustomMode();
                    inputGenderCustom.value = savedGender; 
                    customOptions.forEach(opt => { if(opt.getAttribute('data-value') === 'Personalizado') opt.classList.add('selected'); });
                }
                modalUsernameDisplay.textContent = dataToEdit.username;
                modalRealnameDisplay.textContent = dataToEdit.realname;
                modalAvatarPreview.src = dataToEdit.photo || `https://ui-avatars.com/api/?name=${dataToEdit.realname}&background=121212&color=fff&size=150`;
                inputs.counter.textContent = inputs.bio.value.length;
                modalEdit.classList.add('open');
                document.body.classList.add('no-scroll');
            });

            btnSave.addEventListener('click', async () => {
                const cleanUsername = inputs.username.value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9._]/g, '') || "usuario";
                let finalGender = inputGenderHidden.value;
                if (finalGender === 'Personalizado' || finalGender === '') finalGender = inputGenderCustom.value.trim();

                btnSave.textContent = "Verificando...";
                btnSave.disabled = true;

                try {
                    const checkSnapshot = await db.collection('users').where('username', '==', cleanUsername).get();
                    let isTaken = false;
                    checkSnapshot.forEach(doc => { if (doc.id !== user.uid) isTaken = true; });

                    if (isTaken) { alert(`O usuário @${cleanUsername} já está em uso.`); btnSave.textContent = "Salvar Alterações"; btnSave.disabled = false; return; }

                    btnSave.textContent = "Salvando...";
                    const newData = {
                        ...myOriginalData, username: cleanUsername, realname: inputs.realname.value, bio: inputs.bio.value.trim(), link: inputs.link.value, photo: modalAvatarPreview.src, gender: finalGender
                    };

                    await db.collection('users').doc(user.uid).set(newData, { merge: true });
                    if (user.displayName !== newData.realname) await user.updateProfile({ displayName: newData.realname });
                    
                    myOriginalData = newData; updateUI(newData); 
                    if (newData.bio.length > 5 && newData.link.length > 3) checkAndUnlockAchievement('bio_master', user.uid);
                    modalEdit.classList.remove('open'); document.body.classList.remove('no-scroll');

                } catch (error) { console.error("Erro fatal ao salvar:", error); alert("Erro ao salvar."); } 
                finally { btnSave.textContent = "Salvar Alterações"; btnSave.disabled = false; }
            });
        } else { window.location.href = '../login/index.html'; }
    });

    const closeModal = () => { modalEdit.classList.remove('open'); document.body.classList.remove('no-scroll'); };
    btnCloseModal.addEventListener('click', closeModal);
    modalEdit.addEventListener('click', (e) => { if (e.target === modalEdit) closeModal(); });

    btnChangePhoto.addEventListener('click', () => { modalPhotoOptions.classList.add('open'); });
    btnActionUpload.addEventListener('click', () => { fileInput.click(); modalPhotoOptions.classList.remove('open'); });
    btnActionRemove.addEventListener('click', () => { modalAvatarPreview.src = `https://ui-avatars.com/api/?name=${myOriginalData.realname || 'User'}&background=121212&color=fff&size=150`; modalPhotoOptions.classList.remove('open'); });
    document.getElementById('btn-action-cancel').addEventListener('click', () => modalPhotoOptions.classList.remove('open'));
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) { modalAvatarPreview.src = e.target.result; }
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    inputs.bio.addEventListener('input', () => { inputs.counter.textContent = inputs.bio.value.length; });
    if (document.getElementById('btn-sair-perfil')) {
        document.getElementById('btn-sair-perfil').addEventListener('click', () => { if(confirm("Sair da conta?")) auth.signOut().then(() => window.location.href = '../login/index.html'); });
    }

    // Calculadoras e Utilitários Extras
    function checkGuest() {
        if (!auth.currentUser) {
            Swal.fire({ title: 'Atenção', text: 'Você precisa estar logado.', icon: 'warning' });
            return true;
        }
        return false;
    }
    function escapeHtml(text) { return text ? text.replace(/</g, "&lt;") : ""; }

    const phaseCard = document.querySelector('.highlight-card.secondary-action .fa-chart-pie')?.closest('.highlight-card');
    if (phaseCard) phaseCard.addEventListener('click', () => { if(firebase.auth().currentUser) checkAndUnlockAchievement('phase_guardian', firebase.auth().currentUser.uid); });
    const planCard = document.querySelector('.highlight-card.secondary-action .fa-book-open')?.closest('.highlight-card');
    if (planCard) planCard.addEventListener('click', () => { if(firebase.auth().currentUser) checkAndUnlockAchievement('planner_master', firebase.auth().currentUser.uid); });
    const badgeWrapper = document.querySelector('.phase-badge-wrapper');
    if (badgeWrapper) badgeWrapper.addEventListener('click', () => { if(firebase.auth().currentUser) checkAndUnlockAchievement('curious_badge', firebase.auth().currentUser.uid); });
    const messageLink = document.querySelector('.nav-links .fa-paper-plane')?.closest('a');
    if (messageLink) messageLink.addEventListener('click', () => { if(firebase.auth().currentUser) checkAndUnlockAchievement('social_butterfly', firebase.auth().currentUser.uid); });
});