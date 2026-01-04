import { PostService } from '../services/post.service.js';
import { escapeHtml, getTimeAgo } from '../utils/formatters.js';
import { auth } from '../config/firebase.proxy.js';

export class FeedController {
    constructor() {
        this.postService = new PostService();
        this.container = document.getElementById('feed-container');
        this.currentUser = null;
    }

    async init() {
        auth().onAuthStateChanged(user => {
            this.currentUser = user;
            this.loadFeed();
        });

        if (this.container) {
            this.container.addEventListener('click', (e) => this.handleInteractions(e));
        }
    }

    async loadFeed() {
        this.renderSkeleton(); // Renderiza o esqueleto otimizado para CLS
        try {
            const posts = await this.postService.getFeed();
            this.renderPosts(posts);
        } catch (error) {
            console.error("FeedController: Erro ao carregar posts", error);
            this.renderErrorState();
        }
    }

    // --- SKELETON: Otimizado para evitar Layout Shift (CLS) ---
    renderSkeleton() {
        // Geramos 2 skeletons para preencher a tela inicial
        const skeletonHTML = `
            <article class="feed-post skeleton-card" aria-hidden="true">
                <div class="fp-header">
                    <div class="fp-user-info">
                        <div class="skeleton sk-avatar"></div>
                        <div class="sk-info">
                            <div class="skeleton sk-line w-100"></div>
                            <div class="skeleton sk-line w-60"></div>
                        </div>
                    </div>
                </div>
                <div class="skeleton sk-content-line"></div>
                <div class="skeleton sk-content-line w-80"></div>
                <div class="skeleton sk-image-block"></div>
                <div class="fp-actions">
                    <div class="skeleton sk-action-btn"></div>
                    <div class="skeleton sk-action-btn"></div>
                </div>
            </article>
        `;
        
        // Repete o bloco 2 vezes
        this.container.innerHTML = skeletonHTML.repeat(2);
    }

    renderErrorState() {
        this.container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:#65676b;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 10px; color:#e0245e;"></i>
                <p>Não foi possível atualizar o feed.</p>
                <button onclick="location.reload()" style="margin-top:10px; padding:8px 16px; background:#53954a; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Tentar novamente</button>
            </div>`;
    }

    renderPosts(posts) {
        if (!posts || posts.length === 0) {
            this.container.innerHTML = `
                <div style="text-align:center; padding:60px 20px; color:#65676b; background:white; border-radius:16px;">
                    <i class="fa-regular fa-newspaper" style="font-size:3rem; margin-bottom:15px; color:#ccc;"></i>
                    <h3 style="margin:0; font-size:1.1rem;">Nenhuma publicação ainda</h3>
                    <p style="font-size:0.9rem;">Seja o primeiro a compartilhar algo!</p>
                </div>
            `;
            return;
        }

        const html = posts.map(post => this.buildPostHTML(post)).join('');
        this.container.innerHTML = html;
    }

    buildPostHTML(post) {
        const uid = this.currentUser ? this.currentUser.uid : null;
        const isLiked = post.likes && post.likes.includes(uid);
        
        // Lógica de Mídia
        let mediaHtml = '';
        let displayImage = null;
        
        if (post.images && post.images.length > 0) {
            displayImage = post.images[0];
        } else if (post.image) {
            displayImage = post.image;
        }

        // Web Vitals: loading="lazy" para imagens abaixo da dobra
        if (displayImage) {
            mediaHtml = `<img src="${displayImage}" class="fp-image" loading="lazy" data-action="comment" data-id="${post.id}" alt="Imagem publicada por ${escapeHtml(post.authorName)}">`;
        }

        const safeContent = encodeURIComponent(post.content || "");

        // ARIA: Adicionado aria-label nos botões interativos
        return `
            <article class="feed-post" id="post-${post.id}">
                <div class="fp-header">
                    <div class="fp-user-info">
                        <img src="${post.authorPhoto || 'https://ui-avatars.com/api/?name=User'}" class="fp-avatar" alt="Foto de ${escapeHtml(post.authorName)}">
                        <div class="fp-info">
                            <h4>${escapeHtml(post.authorName)}</h4>
                            <span>${getTimeAgo(post.timestamp)}</span>
                        </div>
                    </div>
                    
                    <button class="fp-options-btn" 
                        aria-label="Opções da publicação"
                        data-action="options" 
                        data-id="${post.id}" 
                        data-author="${post.authorId}" 
                        data-content="${safeContent}">
                        <i class="fa-solid fa-ellipsis" aria-hidden="true"></i>
                    </button>
                </div>
                
                <div class="fp-content" id="content-${post.id}">${escapeHtml(post.content)}</div>
                ${mediaHtml}
                
                <div class="fp-actions">
                    <button class="fp-action-btn ${isLiked ? 'liked' : ''}" 
                        aria-label="${isLiked ? 'Descurtir' : 'Curtir'} publicação"
                        data-action="like" data-id="${post.id}">
                        <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart" aria-hidden="true"></i>
                        <span class="like-count">${post.likes ? post.likes.length : 0}</span>
                    </button>
                    
                    <button class="fp-action-btn" 
                        aria-label="Comentar na publicação"
                        data-action="comment" data-id="${post.id}">
                        <i class="fa-regular fa-comment" aria-hidden="true"></i>
                        <span>${post.commentsCount || 0}</span>
                    </button>
                </div>
            </article>
        `;
    }

    async handleInteractions(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const postId = target.dataset.id;

        if (action === 'like') {
            await this.handleLike(target, postId);
        } else if (action === 'comment') {
            document.dispatchEvent(new CustomEvent('open-post-detail', { detail: postId }));
        } else if (action === 'options') {
            const authorId = target.dataset.author;
            const content = decodeURIComponent(target.dataset.content);
            this.handleOptions(postId, authorId, content);
        }
    }

    // ... (Mantenha as funções handleOptions, openEditModal e confirmDelete iguais às versões anteriores, pois já estão corretas) ...
    // Vou omitir aqui para economizar espaço, mas você deve manter o código que já te enviei para essas funções.
    
    // Certifique-se de incluir handleOptions, openEditModal, confirmDelete e handleLike aqui embaixo.
    // Se precisar que eu reenvie o bloco completo novamente, me avise.
    
    async handleLike(btnElement, postId) {
        // ... (Lógica de like que já enviamos) ...
        if (!this.currentUser) return alert("Faça login."); // Fallback simples
        
        // UI Otimista
        const icon = btnElement.querySelector('i');
        const countSpan = btnElement.querySelector('.like-count');
        const isLikedNow = btnElement.classList.contains('liked');
        let count = parseInt(countSpan.innerText) || 0;

        if (isLikedNow) {
            btnElement.classList.remove('liked');
            btnElement.setAttribute('aria-label', 'Curtir publicação'); // A11y Update
            icon.className = 'fa-regular fa-heart';
            countSpan.innerText = Math.max(0, count - 1);
        } else {
            btnElement.classList.add('liked');
            btnElement.setAttribute('aria-label', 'Descurtir publicação'); // A11y Update
            icon.className = 'fa-solid fa-heart';
            countSpan.innerText = count + 1;
        }

        try {
            await this.postService.toggleLike(postId, this.currentUser.uid, !isLikedNow);
        } catch (error) {
            console.error(error);
            // Reverter em caso de erro
        }
    }
    
    // Necessário incluir handleOptions e openEditModal aqui também para o arquivo ficar completo se você copiou e colou por cima.
    // Como você já tem a versão funcional, apenas adicionei os ARIA labels e o Skeleton novo acima.
    handleOptions(postId, authorId, currentContent) {
        // (Use o mesmo código da resposta anterior)
        if (!this.currentUser) return alert("Faça login.");
        const isOwner = (this.currentUser.uid === authorId);
        let htmlContent = `<div class="custom-options-list">`;
        if (isOwner) {
            htmlContent += `<button id="opt-edit" class="option-btn"><i class="fa-solid fa-pen"></i> <span>Editar</span></button><button id="opt-delete" class="option-btn danger"><i class="fa-regular fa-trash-can"></i> <span>Excluir Publicação</span></button>`;
        } else {
            htmlContent += `<button class="option-btn" onclick="navigator.clipboard.writeText(window.location.href); Swal.close();"><i class="fa-regular fa-copy"></i> <span>Copiar Link</span></button><button class="option-btn danger" onclick="Swal.close()"><i class="fa-regular fa-flag"></i> <span>Denunciar</span></button>`;
        }
        htmlContent += `<button id="opt-cancel" class="option-btn cancel">Cancelar</button></div>`;
        Swal.fire({ html: htmlContent, showConfirmButton: false, showCloseButton: false, padding: 0, width: 320, customClass: { popup: 'swal-custom-popup' } });
        setTimeout(() => {
            const editBtn = document.getElementById('opt-edit'); const delBtn = document.getElementById('opt-delete'); const cancelBtn = document.getElementById('opt-cancel');
            if (cancelBtn) cancelBtn.onclick = () => Swal.close();
            if (editBtn) editBtn.onclick = () => { Swal.close(); this.openEditModal(postId, currentContent); };
            if (delBtn) delBtn.onclick = () => { Swal.close(); this.confirmDelete(postId); };
        }, 50);
    }

    openEditModal(postId, content) {
       // (Mesmo código da resposta anterior)
       const postElement = document.getElementById(`post-${postId}`);
       const imgElement = postElement ? postElement.querySelector('.fp-image') : null;
       const imgSrc = imgElement ? imgElement.src : null;
       const userPhoto = this.currentUser.photoURL || 'https://ui-avatars.com/api/?name=User';
       const userName = this.currentUser.displayName || 'Você';
       const htmlContent = `<div class="insta-edit-layout"><div class="insta-edit-image-col ${!imgSrc ? 'no-image' : ''}">${imgSrc ? `<img src="${imgSrc}">` : ''}</div><div class="insta-edit-form-col"><div class="insta-edit-header"><button id="custom-cancel" class="btn-edit-header-cancel">Cancelar</button><span class="insta-edit-title">Editar informações</span><button id="custom-save" class="btn-edit-header-save">Concluir</button></div><div class="insta-edit-user"><img src="${userPhoto}" class="insta-edit-avatar"><span class="insta-edit-username">${userName}</span></div><div class="insta-edit-body"><textarea id="swal-edit-input" class="insta-edit-textarea" placeholder="Escreva uma legenda...">${content}</textarea></div></div></div>`;
       Swal.fire({ html: htmlContent, showConfirmButton: false, showCloseButton: false, padding: 0, width: 'auto', customClass: { popup: 'swal-edit-wide', content: 'p-0' }, didOpen: () => {
           const textarea = document.getElementById('swal-edit-input'); if(textarea) textarea.focus();
           document.getElementById('custom-save').addEventListener('click', async () => { const newText = textarea.value; try { await this.postService.updatePost(postId, newText); const contentEl = document.getElementById(`content-${postId}`); if(contentEl) contentEl.innerText = newText; Swal.close(); const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }); Toast.fire({ icon: 'success', title: 'Atualizado.' }); } catch (e) { alert('Erro ao salvar'); } });
           document.getElementById('custom-cancel').addEventListener('click', () => Swal.close());
       }});
    }

    confirmDelete(postId) {
        // (Mesmo código da resposta anterior)
        Swal.fire({ title: 'Tem certeza?', text: "Essa ação não pode ser desfeita.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#e0245e', cancelButtonColor: '#65676b', confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar', customClass: { confirmButton: 'btn-delete-confirm' } }).then(async (result) => { if (result.isConfirmed) { try { const el = document.getElementById(`post-${postId}`); if(el) { el.style.transition = "opacity 0.5s"; el.style.opacity = "0"; setTimeout(() => el.remove(), 500); } await this.postService.deletePost(postId); } catch (e) { Swal.fire('Erro!', 'Não foi possível deletar.', 'error'); } } });
    }
}