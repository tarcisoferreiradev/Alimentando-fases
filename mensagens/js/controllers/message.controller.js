import { AuthService } from '../services/auth.js';
import { ChatService } from '../services/chat.js';
import { Formatters } from '../utils/formatters.js';

export class MessageController {
    constructor() {
        this.currentUser = null;
        this.currentChatId = null;
        this.typingTimeout = null;
        this.giphyTimeout = null; 
        this.replyToData = null; 
        
        this.giphyApiKey = 'Mnlz1Z1P0Bd2m1x6D9170bCN9bDOguld'; 
        
        this.cacheDOM();
        this.bindEvents();
    }

    cacheDOM() {
        this.dom = {
            sidebarPanel: document.getElementById('chat-sidebar-panel'),
            windowPanel: document.getElementById('chat-window-panel'),
            listContainer: document.getElementById('conversations-list'),
            activeChatView: document.getElementById('active-chat-view'),
            emptyState: document.getElementById('empty-state-view'),
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('btn-send-message'),
            messagesArea: document.getElementById('messages-area'),
            inputActions: document.getElementById('input-actions'),
            btnEmoji: document.getElementById('btn-emoji-trigger'),
            emojiContainer: document.getElementById('emoji-popup-container'),
            btnAttach: document.getElementById('btn-attach-trigger'),
            fileInput: document.getElementById('chat-img-upload'),
            attachmentMenu: document.getElementById('attachment-menu'),
            btnHeart: document.querySelector('.fa-heart')?.parentElement, 
            btnOpenGallery: document.getElementById('btn-open-gallery'),
            btnOpenCamera: document.getElementById('btn-open-camera'),
            btnOpenGif: document.getElementById('btn-open-gif'),
            btnOpenSticker: document.getElementById('btn-open-sticker'),
            replyBar: document.getElementById('reply-preview-bar'),
            replyName: document.getElementById('reply-target-name'),
            replyText: document.getElementById('reply-target-text'),
            btnCloseReply: document.getElementById('btn-close-reply'),
            headerName: document.getElementById('chat-header-name'),
            headerAvatar: document.getElementById('chat-header-avatar'),
            headerStatus: document.getElementById('chat-header-status'),
            headerDot: document.getElementById('header-status-dot'),
            currentUsername: document.getElementById('current-username-display'),
            btnNewChat: document.querySelector('.new-chat-btn'),
            btnBackMobile: document.getElementById('btn-back-mobile'),
            modalNewChat: document.getElementById('modal-new-chat'),
            btnCloseNewChat: document.querySelector('.btn-close-nc'),
            modalDelete: document.getElementById('modal-delete-confirm'),
            btnCancelDelete: document.getElementById('btn-cancel-delete'),
            btnConfirmDelete: document.getElementById('btn-confirm-delete'),
            modalMedia: document.getElementById('modal-media-selector'),
            mediaGrid: document.getElementById('media-grid-content'),
            giphyInput: document.getElementById('giphy-search-input'),
            btnCloseMedia: document.querySelector('#modal-media-selector .btn-close-nc')
        };
    }

    bindEvents() {
        this.dom.sendBtn.addEventListener('click', () => this.handleSendMessage());
        this.dom.messageInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') this.handleSendMessage();
        });
        this.dom.messageInput.addEventListener('input', () => {
            this.toggleSendButton();
            this.handleTyping();
        });
        this.dom.btnEmoji.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleEmojiPicker();
        });
        if(this.dom.btnHeart) this.dom.btnHeart.addEventListener('click', () => this.handleSendMessage('❤️'));
        this.dom.btnAttach.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dom.attachmentMenu.classList.toggle('hidden');
        });
        
        if(this.dom.btnOpenGallery) this.dom.btnOpenGallery.addEventListener('click', () => {
            this.dom.attachmentMenu.classList.add('hidden');
            this.dom.fileInput.click();
        });
        if(this.dom.btnOpenGif) this.dom.btnOpenGif.addEventListener('click', () => {
            this.dom.attachmentMenu.classList.add('hidden');
            this.openGiphyModal();
        });
        if(this.dom.btnOpenCamera) this.dom.btnOpenCamera.addEventListener('click', () => alert('Câmera em breve'));
        if(this.dom.btnOpenSticker) this.dom.btnOpenSticker.addEventListener('click', () => alert('Figurinhas em breve'));

        this.dom.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        if(this.dom.giphyInput) {
            this.dom.giphyInput.addEventListener('input', (e) => {
                clearTimeout(this.giphyTimeout);
                this.giphyTimeout = setTimeout(() => {
                    this.fetchGifs(e.target.value);
                }, 800); 
            });
        }
        if(this.dom.btnCloseMedia) this.dom.btnCloseMedia.addEventListener('click', () => {
            this.dom.modalMedia.classList.remove('open');
        });

        document.addEventListener('click', (e) => {
            if(!this.dom.emojiContainer.contains(e.target) && e.target !== this.dom.btnEmoji) {
                this.dom.emojiContainer.classList.add('hidden');
            }
            if(!this.dom.attachmentMenu.contains(e.target) && e.target !== this.dom.btnAttach) {
                this.dom.attachmentMenu.classList.add('hidden');
            }
            document.querySelectorAll('.mini-reaction-picker').forEach(el => el.classList.add('hidden'));
        });

        this.dom.btnCloseReply.addEventListener('click', () => this.cancelReply());
        if(this.dom.btnNewChat) this.dom.btnNewChat.addEventListener('click', () => this.dom.modalNewChat.classList.add('open'));
        if(this.dom.btnCloseNewChat) this.dom.btnCloseNewChat.addEventListener('click', () => this.dom.modalNewChat.classList.remove('open'));
        if(this.dom.btnBackMobile) this.dom.btnBackMobile.addEventListener('click', () => this.backToChatList());
    }

    init() {
        AuthService.onAuthStateChanged(user => {
            if (user) {
                this.currentUser = user;
                this.dom.currentUsername.innerText = user.username || "Eu";
                this.loadConversations();
                AuthService.updatePresence(user.uid);
                setInterval(() => AuthService.updatePresence(user.uid), 60000);
            } else {
                window.location.href = '../login/index.html';
            }
        });
    }

    openGiphyModal() {
        this.dom.modalMedia.classList.add('open');
        this.dom.giphyInput.value = '';
        this.dom.giphyInput.focus();
        this.fetchGifs(); 
    }

    async fetchGifs(query = '') {
        this.dom.mediaGrid.innerHTML = '<div class="loading-spinner">Carregando...</div>';
        try {
            const endpoint = query ? 'search' : 'trending';
            const limit = 20;
            const url = `https://api.giphy.com/v1/gifs/${endpoint}?api_key=${this.giphyApiKey}&q=${query}&limit=${limit}&rating=g`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erro API: ${response.status}`);
            const data = await response.json();
            this.renderGifs(data.data);
        } catch (error) {
            console.error("Erro Giphy:", error);
            this.dom.mediaGrid.innerHTML = '<div class="loading-spinner">Erro ao carregar.<br>Verifique sua conexão.</div>';
        }
    }

    renderGifs(gifs) {
        this.dom.mediaGrid.innerHTML = '';
        if(!gifs || gifs.length === 0) {
            this.dom.mediaGrid.innerHTML = '<div class="loading-spinner">Nada encontrado.</div>';
            return;
        }
        gifs.forEach(gif => {
            const div = document.createElement('div');
            div.className = 'gif-item';
            const thumbUrl = gif.images.fixed_height_small.url; 
            const sendUrl = gif.images.downsized.url; 
            div.innerHTML = `<img src="${thumbUrl}" loading="lazy">`;
            div.onclick = () => {
                this.sendGif(sendUrl);
                this.dom.modalMedia.classList.remove('open');
            };
            this.dom.mediaGrid.appendChild(div);
        });
    }

    async sendGif(url) {
        // CORREÇÃO: Força status de leitura falso ao enviar
        this.isCurrentChatRead = false; 
        await ChatService.sendImageMessage(this.currentChatId, this.currentUser.uid, url, 'image'); 
    }

    async showDeleteConfirmation() {
        return new Promise((resolve) => {
            const modal = this.dom.modalDelete;
            modal.classList.add('open');
            const cleanup = () => {
                modal.classList.remove('open');
                this.dom.btnCancelDelete.removeEventListener('click', onCancel);
                this.dom.btnConfirmDelete.removeEventListener('click', onConfirm);
            };
            const onCancel = () => { cleanup(); resolve(false); };
            const onConfirm = () => { cleanup(); resolve(true); };
            this.dom.btnCancelDelete.addEventListener('click', onCancel, { once: true });
            this.dom.btnConfirmDelete.addEventListener('click', onConfirm, { once: true });
        });
    }

    toggleEmojiPicker() {
        const container = this.dom.emojiContainer;
        if (container.innerHTML === '') {
            import('https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js')
                .then(() => {
                    const picker = document.createElement('emoji-picker');
                    picker.setAttribute('locale', 'pt'); 
                    picker.classList.add('light');
                    picker.addEventListener('emoji-click', event => {
                        this.dom.messageInput.value += event.detail.unicode;
                        this.toggleSendButton();
                    });
                    container.appendChild(picker);
                    container.classList.remove('hidden');
                });
        } else {
            container.classList.toggle('hidden');
        }
    }

    async handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            await ChatService.sendImageMessage(this.currentChatId, this.currentUser.uid, ev.target.result);
        };
        reader.readAsDataURL(file);
        this.dom.fileInput.value = '';
    }

    async handleSendMessage(forceText = null) {
        const text = forceText || this.dom.messageInput.value.trim();
        if(!text) return;
        if(this.typingTimeout) clearTimeout(this.typingTimeout);
        this.dom.messageInput.value = '';
        this.toggleSendButton();
        this.dom.emojiContainer.classList.add('hidden');
        
        // CORREÇÃO: Força status de leitura falso ao enviar
        this.isCurrentChatRead = false; 
        
        await ChatService.sendMessage(this.currentChatId, this.currentUser.uid, text, this.replyToData);
        this.cancelReply(); 
    }

    renderMessage(msg, id) {
        const isSent = msg.senderId === this.currentUser.uid;
        const div = document.createElement('div');
        div.className = `message-row ${isSent ? 'sent' : 'received'}`;
        div.id = `msg-${id}`;
        
        const time = Formatters.dateToTime(msg.timestamp);
        
        let contentHtml = msg.text || '';
        let bubbleClass = 'message-bubble'; 

        if (msg.type === 'image') {
            contentHtml = `<img src="${msg.image}" class="msg-img-content">`;
            bubbleClass += ' media-bubble'; 
        } 
        else if (msg.text) {
            const emojiCount = this.countEmojis(msg.text);
            const isOnlyEmoji = this.isOnlyEmojis(msg.text);
            if (isOnlyEmoji && emojiCount > 0 && emojiCount <= 8) {
                bubbleClass += ' big-emoji'; 
                if(emojiCount <= 3) bubbleClass += ' no-bg'; 
            }
        }

        let replyHtml = '';
        if (msg.replyTo) {
            replyHtml = `
            <div class="reply-context">
                <span class="reply-label">Respondendo:</span>
                <span class="reply-text">${msg.replyTo.text.substring(0, 35)}${msg.replyTo.text.length>35?'...':''}</span>
            </div>`;
        }
        
        let reactionHtml = msg.reaction ? `<div class="reaction-badge">${msg.reaction}</div>` : '';
        let checkHtml = '';
        if(isSent) {
            // CORREÇÃO: Usa o status atualizado
            const readClass = this.isCurrentChatRead ? 'read' : ''; 
            checkHtml = `<i class="fa-solid fa-check-double msg-check ${readClass}"></i>`;
        }

        div.innerHTML = `
            <div class="msg-content-wrapper">
                <div class="msg-hover-menu">
                    <button class="msg-opt-btn" title="Responder" data-action="reply"><i class="fa-solid fa-reply"></i></button>
                    <button class="msg-opt-btn" title="Reagir" data-action="react-menu"><i class="fa-regular fa-face-smile"></i></button>
                    <button class="msg-opt-btn" title="Copiar" data-action="copy"><i class="fa-regular fa-copy"></i></button>
                    ${isSent ? `<button class="msg-opt-btn danger" title="Apagar" data-action="delete"><i class="fa-regular fa-trash-can"></i></button>` : ''}
                </div>
                <div class="mini-reaction-picker hidden" id="react-picker-${id}">
                    <span class="reaction-opt" onclick="window.reactTo('${id}', '❤️')">❤️</span>
                    <span class="reaction-opt" onclick="window.reactTo('${id}', '😂')">😂</span>
                    <span class="reaction-opt" onclick="window.reactTo('${id}', '😮')">😮</span>
                    <span class="reaction-opt" onclick="window.reactTo('${id}', '😢')">😢</span>
                    <span class="reaction-opt" onclick="window.reactTo('${id}', '😡')">😡</span>
                    <span class="reaction-opt" onclick="window.reactTo('${id}', '👍')">👍</span>
                </div>
                <div class="${bubbleClass}">
                    ${replyHtml}
                    ${contentHtml}
                    ${reactionHtml}
                    <div class="msg-meta"><span>${time}</span>${checkHtml}</div>
                </div>
            </div>
        `;
        window.reactTo = (msgId, emoji) => {
            ChatService.reactToMessage(this.currentChatId, msgId, emoji);
            document.getElementById(`react-picker-${msgId}`).classList.add('hidden');
        };
        const btns = div.querySelectorAll('.msg-opt-btn');
        btns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                this.handleMessageAction(btn.dataset.action, id, msg);
            };
        });
        this.dom.messagesArea.appendChild(div);
    }

    async handleMessageAction(action, msgId, msgData) {
        if (action === 'reply') {
            this.replyToData = { id: msgId, text: msgData.text || '[Mídia]' };
            this.dom.replyBar.classList.remove('hidden');
            const partnerName = this.dom.headerName.innerText;
            const displayName = msgData.senderId === this.currentUser.uid ? 'você' : partnerName;
            this.dom.replyName.innerText = `Respondendo a ${displayName}`;
            this.dom.replyText.innerText = this.replyToData.text;
            this.dom.messageInput.focus();
        } 
        else if (action === 'copy') {
            navigator.clipboard.writeText(msgData.text || '');
        }
        else if (action === 'delete') {
            const confirmed = await this.showDeleteConfirmation();
            if(confirmed) {
                ChatService.deleteMessage(this.currentChatId, msgId);
            }
        } 
        else if (action === 'react-menu') {
            document.querySelectorAll('.mini-reaction-picker').forEach(el => el.classList.add('hidden'));
            const picker = document.getElementById(`react-picker-${msgId}`);
            picker.classList.remove('hidden');
        }
    }

    cancelReply() {
        this.replyToData = null;
        this.dom.replyBar.classList.add('hidden');
    }

    toggleSendButton() {
        if(this.dom.messageInput.value.trim().length > 0) {
            this.dom.sendBtn.classList.remove('hidden');
            this.dom.inputActions.style.display = 'none';
        } else {
            this.dom.sendBtn.classList.add('hidden');
            this.dom.inputActions.style.display = 'flex';
        }
    }

    handleTyping() {
        if(!this.currentChatId) return;
        if(this.typingTimeout) clearTimeout(this.typingTimeout);
        ChatService.setTypingStatus(this.currentChatId, this.currentUser.uid, true);
        this.typingTimeout = setTimeout(() => {
            ChatService.setTypingStatus(this.currentChatId, this.currentUser.uid, false);
        }, 1000);
    }

    scrollToBottom() {
        this.dom.messagesArea.scrollTop = this.dom.messagesArea.scrollHeight;
    }

    loadConversations() {
        ChatService.listenToConversations(this.currentUser.uid, (snap) => {
            this.dom.listContainer.innerHTML = '';
            snap.forEach(doc => { this.renderConversationItem(doc.id, doc.data()); });
        });
    }

    async renderConversationItem(chatId, data) {
        const otherUserId = data.participants.find(uid => uid !== this.currentUser.uid);
        if(!otherUserId) return; 
        const div = document.createElement('div');
        div.className = `conversation-item ${chatId === this.currentChatId ? 'active' : ''}`;
        let name = "Carregando..."; 
        let photo = "https://ui-avatars.com/api/?name=...";
        const isUnread = (data.lastMessageBy !== this.currentUser.uid && data.read === false);
        div.innerHTML = `
            <img src="${photo}" class="chat-item-avatar">
            <div class="chat-item-info">
                <div class="chat-item-name">${name}</div>
                <div class="chat-item-preview">${data.lastMessage || 'Nova conversa'}</div>
            </div>
            ${isUnread ? '<div class="unread-dot"></div>' : ''}
        `;
        this.dom.listContainer.appendChild(div);
        const userProfile = await AuthService.getUserProfile(otherUserId);
        if (userProfile) {
            name = userProfile.username || "Usuário";
            photo = userProfile.photo || photo;
            div.querySelector('.chat-item-avatar').src = photo;
            div.querySelector('.chat-item-name').innerText = name;
            div.onclick = () => this.selectChat(chatId, { username: name, photo: photo, uid: otherUserId });
            if (this.currentChatId === chatId) {
                this.dom.headerName.innerText = name;
                this.dom.headerAvatar.src = photo;
                this.dom.headerName.onclick = () => window.location.href = `../perfil/index.html?uid=${otherUserId}`;
            }
        } else {
             div.onclick = () => this.selectChat(chatId, { username: "Usuário", photo: photo, uid: otherUserId });
        }
    }

    selectChat(chatId, userObj) {
        this.currentChatId = chatId;
        document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
        this.dom.emptyState.style.display = 'none';
        this.dom.activeChatView.classList.remove('hidden');
        if(window.innerWidth <= 700) {
            if(this.dom.sidebarPanel) this.dom.sidebarPanel.classList.add('hidden-mobile');
            if(this.dom.windowPanel) this.dom.windowPanel.classList.add('active-mobile');
        }
        this.dom.headerName.innerText = userObj.username;
        this.dom.headerAvatar.src = userObj.photo;
        this.dom.headerStatus.innerText = '';
        this.dom.headerName.onclick = () => window.location.href = `../perfil/index.html?uid=${userObj.uid}`;
        ChatService.markAsRead(chatId);
        if(this.unsubMessages) this.unsubMessages();
        this.unsubMessages = ChatService.listenToMessages(chatId, (snap) => {
            this.dom.messagesArea.innerHTML = '';
            snap.forEach(doc => this.renderMessage(doc.data(), doc.id));
            this.scrollToBottom();
        });
        if(this.unsubStatus) this.unsubStatus();
        this.unsubStatus = ChatService.listenToChatStatus(chatId, (doc) => {
            if(!doc.exists) return;
            const data = doc.data();
            this.isCurrentChatRead = (data.read === true);
            if(this.isCurrentChatRead) document.querySelectorAll('.msg-check').forEach(el => el.classList.add('read'));
            const isPartnerTyping = data.typing && data.typing[userObj.uid];
            if(isPartnerTyping) {
                this.dom.headerStatus.innerText = 'Digitando...';
                this.dom.headerStatus.classList.add('typing-anim');
                this.dom.headerStatus.style.color = '#53954a';
            } else {
                this.dom.headerStatus.classList.remove('typing-anim');
                this.refreshPresence(userObj.uid);
            }
        });
        if(this.unsubPresence) this.unsubPresence();
        this.unsubPresence = AuthService.listenToPartnerPresence(userObj.uid, (data) => {
            if(this.dom.headerStatus.innerText === 'Digitando...') return;
            this.updatePresenceUI(data.lastActive ? data.lastActive.toDate() : null);
        });
    }

    refreshPresence(uid) {
        AuthService.listenToPartnerPresence(uid, (data) => {
             if(this.dom.headerStatus.innerText !== 'Digitando...') {
                 this.updatePresenceUI(data.lastActive ? data.lastActive.toDate() : null);
             }
        });
    }

    updatePresenceUI(date) {
        if(!date) return;
        const diff = (new Date() - date) / 1000 / 60; 
        if(diff < 3) {
            this.dom.headerDot.className = 'status-dot online';
            this.dom.headerStatus.innerText = 'Online';
            this.dom.headerStatus.style.color = '#4caf50';
        } else {
            this.dom.headerDot.className = 'status-dot offline';
            this.dom.headerStatus.innerText = Formatters.lastSeen(date);
            this.dom.headerStatus.style.color = '#888';
        }
    }
    
    backToChatList() {
        if(this.dom.sidebarPanel) this.dom.sidebarPanel.classList.remove('hidden-mobile');
        if(this.dom.windowPanel) this.dom.windowPanel.classList.remove('active-mobile');
        this.currentChatId = null;
        document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
    }

    isOnlyEmojis(str) {
        if (!str) return false;
        const emojiRegex = /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff]|\s)+$/;
        return emojiRegex.test(str);
    }

    countEmojis(str) {
        const emojiRegex = /([\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
        const matches = str.match(emojiRegex);
        return matches ? matches.length : 0;
    }
}