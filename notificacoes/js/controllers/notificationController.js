/**
 * Controller: Notification UI Logic
 * Responsabilidade: Manipulação do DOM, Renderização de Templates e Event Handling.
 */
import { NotificationService } from '../services/notificationService.js';
import { DateUtils } from '../utils/dateUtils.js';

export class NotificationController {
    constructor() {
        // Cache de seletores DOM para performance
        this.container = document.getElementById('notifications-container');
        this.btnMarkAll = document.getElementById('btn-mark-all-read');
        this.currentUser = null;
        this.unsubscribe = null;
    }

    /**
     * Inicializa o controller com o contexto do usuário.
     * @param {Object} user - Objeto de usuário autenticado.
     */
    init(user) {
        this.currentUser = user;
        this.setupListeners();
        this.startStream();
    }

    /**
     * Configura listeners de eventos estáticos da UI.
     */
    setupListeners() {
        if (this.btnMarkAll) {
            this.btnMarkAll.addEventListener('click', () => this.handleMarkAllRead());
        }
    }

    /**
     * Inicia o stream de dados do Firestore via Service.
     */
    startStream() {
        if (this.unsubscribe) this.unsubscribe(); // Limpeza de listeners anteriores
        
        this.unsubscribe = NotificationService.subscribeToNotifications(
            this.currentUser.uid,
            (data) => this.render(data),
            (err) => this.renderErrorState()
        );
    }

    /**
     * Manipulador de ação "Marcar todas como lidas".
     */
    async handleMarkAllRead() {
        try {
            await NotificationService.markAllAsRead(this.currentUser.uid);
            // Feedback visual via SweetAlert2 (Global)
            const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            Toast.fire({ icon: 'success', title: 'Todas marcadas como lidas' });
        } catch (error) {
            console.error('[Controller] Erro ao marcar todas:', error);
        }
    }

    /**
     * Renderização principal utilizando DocumentFragment para minimizar Reflow/Repaint.
     * @param {Array} notifications - Lista de dados brutos.
     */
    render(notifications) {
        if (!notifications || notifications.length === 0) {
            this.renderEmptyState();
            return;
        }

        const groups = this.groupNotificationsByDate(notifications);
        const fragment = document.createDocumentFragment();

        this.appendGroupToFragment(fragment, 'Hoje', groups.hoje);
        this.appendGroupToFragment(fragment, 'Esta Semana', groups.semana);
        this.appendGroupToFragment(fragment, 'Este Mês', groups.mes);
        this.appendGroupToFragment(fragment, 'Anteriores', groups.antigas);

        this.container.innerHTML = '';
        this.container.appendChild(fragment);
    }

    /**
     * Lógica de agrupamento temporal dos dados.
     * @param {Array} notifs 
     * @returns {Object} Grupos categorizados.
     */
    groupNotificationsByDate(notifs) {
        const now = new Date();
        const groups = { hoje: [], semana: [], mes: [], antigas: [] };

        notifs.forEach(n => {
            if (!n.timestamp) return;
            const date = n.timestamp.toDate();
            const diffDays = (now - date) / (1000 * 60 * 60 * 24);

            if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth()) groups.hoje.push(n);
            else if (diffDays < 7) groups.semana.push(n);
            else if (diffDays < 30) groups.mes.push(n);
            else groups.antigas.push(n);
        });
        return groups;
    }

    /**
     * Renderiza um grupo específico no fragmento.
     */
    appendGroupToFragment(fragment, title, items) {
        if (items.length === 0) return;

        const titleEl = document.createElement('h4');
        titleEl.className = 'notif-group-title';
        titleEl.textContent = title;
        fragment.appendChild(titleEl);

        items.forEach(item => {
            fragment.appendChild(this.createNotificationElement(item));
        });
    }

    /**
     * Factory de elementos DOM para notificações individuais.
     * Aplica sanitização de inputs.
     */
    createNotificationElement(data) {
        const el = document.createElement('div');
        el.className = `notif-item ${!data.read ? 'unread' : ''}`;
        
        const senderName = DateUtils.escapeHtml(data.senderName);
        const content = this.formatNotificationText(data.type, senderName, data.commentSnippet);
        const timeAgo = DateUtils.getTimeAgo(data.timestamp);
        const avatarUrl = data.senderPhoto || 'https://ui-avatars.com/api/?name=U';

        el.innerHTML = `
            <img src="${avatarUrl}" class="notif-avatar" loading="lazy" alt="Avatar">
            <div class="notif-content">
                <span class="notif-text">${content}</span>
                <span class="notif-time">${timeAgo}</span>
            </div>
            ${data.postImage ? `<img src="${data.postImage}" class="notif-preview-img" loading="lazy">` : ''}
        `;

        // Event Delegation Pattern preferível, mas onclick direto simplifica para este escopo
        el.onclick = () => this.handleNotificationClick(data);

        return el;
    }

    formatNotificationText(type, name, snippet) {
        // Mapeamento de tipos para templates de string
        const templates = {
            'like_post': `<strong>${name}</strong> curtiu sua publicação.`,
            'comment': `<strong>${name}</strong> comentou: "${DateUtils.escapeHtml(snippet)}"`,
            'follow': `<strong>${name}</strong> começou a seguir você.`
        };
        return templates[type] || `<strong>${name}</strong> interagiu com você.`;
    }

    async handleNotificationClick(data) {
        if (!data.read) {
            NotificationService.markAsRead(data.id).catch(console.error);
        }
        
        // Navegação
        if (data.postId) window.location.href = `../perfil/index.html?uid=${this.currentUser.uid}&openPost=${data.postId}`;
        else if (data.type === 'follow') window.location.href = `../perfil/index.html?uid=${data.senderId}`;
    }

    renderEmptyState() {
        this.container.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-bell-slash" style="font-size:2rem; margin-bottom:15px; opacity:0.5;"></i>
                <p>Nenhuma notificação por enquanto.</p>
            </div>`;
    }

    renderErrorState() {
        this.container.innerHTML = `<div class="error-state">Erro ao carregar notificações.</div>`;
    }
}