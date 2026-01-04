import { escapeHtml, getTimeAgo } from './formatters.js';

export const createCommentElement = (comment, currentUserId, callbacks, replies = []) => {
    const div = document.createElement('div');
    div.className = 'inst-comment-block'; // Wrapper para Comentário + Respostas

    const isOwner = currentUserId === comment.authorId;
    const isLiked = comment.likes && comment.likes.includes(currentUserId);
    const likeCount = comment.likes ? comment.likes.length : 0;

    // Imagem do Comentário Principal
    let mediaHtml = '';
    if (comment.image) {
        mediaHtml = `<img src="${comment.image}" class="inst-comment-img" onclick="window.open(this.src)" alt="Foto">`;
    }

    const deleteBtn = isOwner 
        ? `<button class="btn-comment-action danger" data-action="delete">Excluir</button>` 
        : '';

    const likeText = likeCount > 0 ? `<span class="likes-sub-count">${likeCount} curtida${likeCount > 1 ? 's' : ''}</span>` : '';

    // --- HTML DAS RESPOSTAS (LOOP) ---
    let repliesHtml = '';
    if (replies.length > 0) {
        repliesHtml = `<div class="inst-replies-list">`;
        replies.forEach(reply => {
            const isReplyOwner = currentUserId === reply.authorId;
            const replyMedia = reply.image ? `<img src="${reply.image}" class="inst-comment-img" onclick="window.open(this.src)">` : '';
            
            repliesHtml += `
                <div class="inst-comment-row is-reply">
                    <img src="${reply.authorPhoto || 'https://ui-avatars.com/api/?name=U'}" class="inst-c-avatar">
                    <div class="inst-c-wrapper">
                        <div class="inst-c-bubble">
                            <span class="inst-c-text">
                                <strong class="author-name">${escapeHtml(reply.authorName)}</strong>
                                ${escapeHtml(reply.text)}
                            </span>
                            ${replyMedia}
                        </div>
                        <div class="inst-c-actions">
                            <span class="time-ago">${getTimeAgo(reply.timestamp)}</span>
                            ${isReplyOwner ? `<button class="btn-comment-action danger" onclick="document.dispatchEvent(new CustomEvent('delete-reply', {detail: {commentId: '${comment.id}', replyId: '${reply.id}'}}))">Excluir</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        repliesHtml += `</div>`;
    }

    // HTML DO COMENTÁRIO PAI
    div.innerHTML = `
        <div class="inst-comment-row">
            <img src="${comment.authorPhoto || 'https://ui-avatars.com/api/?name=User'}" class="inst-c-avatar">
            
            <div class="inst-c-wrapper">
                <div class="inst-c-bubble">
                    <span class="inst-c-text">
                        <strong class="author-name">${escapeHtml(comment.authorName)}</strong>
                        ${escapeHtml(comment.text)}
                    </span>
                    ${mediaHtml}
                </div>

                <div class="inst-c-actions">
                    <span class="time-ago">${getTimeAgo(comment.timestamp)}</span>
                    ${likeText}
                    <button class="btn-comment-action" data-action="reply">Responder</button>
                    ${deleteBtn}
                </div>
            </div>

            <button class="btn-comment-like ${isLiked ? 'liked' : ''}" data-action="like">
                <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
        </div>
        ${repliesHtml} `;

    // Listeners
    const btnLike = div.querySelector('[data-action="like"]');
    const btnReply = div.querySelector('[data-action="reply"]');
    const btnDelete = div.querySelector('[data-action="delete"]');

    if(btnLike) btnLike.onclick = () => callbacks.onLike(comment.id, !isLiked);
    if(btnReply) btnReply.onclick = () => callbacks.onReply(comment.id, comment.authorName); // Passa ID para saber quem responder
    if(btnDelete) btnDelete.onclick = () => callbacks.onDelete(comment.id);

    return div;
};