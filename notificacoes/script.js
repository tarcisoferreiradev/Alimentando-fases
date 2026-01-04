document.addEventListener('DOMContentLoaded', () => {
    
    // Verificação de segurança
    if (typeof firebase === 'undefined') { console.error("Firebase não carregado"); return; }
    
    const db = firebase.firestore();
    const auth = firebase.auth();
    let currentUser = null;

    // --- ELEMENTOS DOM ---
    const menuAvatar = document.getElementById('nav-avatar-img');
    const container = document.getElementById('notifications-container');
    const btnMarkAll = document.getElementById('btn-mark-all-read');
    
    // Elementos da Sidebar / Modais
    const btnOpenSettings = document.getElementById('btn-open-settings');
    const modalSettings = document.getElementById('modal-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnOpenTools = document.getElementById('btn-open-tools');
    const modalTools = document.getElementById('modal-tools');
    const btnCloseTools = document.getElementById('btn-close-tools');

    // --- CONFIGURAÇÃO DA BUSCA (Igual Comunidade) ---
    const searchInput = document.getElementById('global-search-input');
    const searchDropdown = document.getElementById('search-results-dropdown');
    
    const normalizeText = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const staticSiteIndex = [
        { title: "Quem Somos", desc: "Nossa história", icon: "fa-users", url: "../index.html#quemsomos", type: "Institucional" },
        { title: "Comunidade", desc: "Feed de posts", icon: "fa-earth-americas", url: "../comunidade/index.html", type: "Social" },
        { title: "Calculadora IMC", desc: "Ferramenta de saúde", icon: "fa-weight-scale", action: "openTools", type: "Ferramenta" }
    ];

    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = normalizeText(e.target.value.trim());
            searchDropdown.innerHTML = '';
            
            if(query.length < 2) { searchDropdown.classList.add('hidden'); return; }

            searchDropdown.classList.remove('hidden');
            let hasResults = false;

            const staticResults = staticSiteIndex.filter(item => normalizeText(`${item.title} ${item.desc}`).includes(query));

            staticResults.forEach(item => {
                hasResults = true;
                const div = document.createElement('div');
                div.className = 'search-item';
                div.innerHTML = `<div class=\"s-icon-box\"><i class=\"fa-solid ${item.icon}\"></i></div><div class=\"s-info\"><span class=\"s-title\">${item.title}</span><span class=\"s-desc\">${item.type}</span></div>`;
                div.addEventListener('click', () => {
                    if(item.action === 'openTools') modalTools.classList.add('open');
                    else if (item.url) window.location.href = item.url;
                    searchDropdown.classList.add('hidden');
                    searchInput.value = '';
                });
                searchDropdown.appendChild(div);
            });

            if(!hasResults) searchDropdown.innerHTML = `<div style="padding:15px; text-align:center; color:#888;">Nenhum resultado.</div>`;
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.classList.add('hidden');
            }
        });
    }

    // --- AUTH STATE ---
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const doc = await db.collection('users').doc(user.uid).get();
                currentUser = doc.exists ? { ...doc.data(), uid: user.uid } : { uid: user.uid, photo: user.photoURL };
                if(currentUser && menuAvatar) menuAvatar.src = currentUser.photo || "https://ui-avatars.com/api/?name=User";
                loadNotifications();
            } catch (error) { console.error("Erro auth:", error); }
        } else {
            window.location.href = '../login/index.html';
        }
    });

    // --- CARREGAR NOTIFICAÇÕES (TEMPO REAL) ---
    function loadNotifications() {
        db.collection('notifications')
            .where('recipientId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                if (snapshot.empty) {
                    container.innerHTML = '<div class="empty-state"><i class="fa-regular fa-bell-slash" style="font-size:2rem; margin-bottom:10px;"></i><p>Nenhuma notificação por enquanto.</p></div>';
                    return;
                }
                const notifs = [];
                snapshot.forEach(doc => notifs.push({ id: doc.id, ...doc.data() }));
                renderNotifications(notifs);
            }, error => console.error("Erro ao ouvir notificações:", error));
    }

    function renderNotifications(notifs) {
        container.innerHTML = '';
        const groups = { hoje: [], semana: [], mes: [], antigas: [] };
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;

        notifs.forEach(n => {
            if (!n.timestamp) return;
            const date = n.timestamp.toDate();
            const diffTime = now - date;
            const diffDays = diffTime / oneDay;

            if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) groups.hoje.push(n);
            else if (diffDays < 7) groups.semana.push(n);
            else if (diffDays < 30) groups.mes.push(n);
            else groups.antigas.push(n);
        });

        const renderSection = (title, items) => {
            if (items.length === 0) return;
            const titleEl = document.createElement('h4'); titleEl.className = 'notif-group-title'; titleEl.innerText = title;
            container.appendChild(titleEl);
            items.forEach(data => {
                const item = document.createElement('div'); item.className = `notif-item ${!data.read ? 'unread' : ''}`;
                let textContent = `<strong>${escapeHtml(data.senderName)}</strong> interagiu com você.`;
                if (data.type === 'like_post') textContent = `<strong>${escapeHtml(data.senderName)}</strong> curtiu sua publicação.`;
                else if (data.type === 'comment') textContent = `<strong>${escapeHtml(data.senderName)}</strong> comentou: "${escapeHtml(data.commentSnippet || '')}"`;
                else if (data.type === 'follow') textContent = `<strong>${escapeHtml(data.senderName)}</strong> começou a seguir você.`;

                item.innerHTML = `<img src="${data.senderPhoto || 'https://ui-avatars.com/api/?name=U'}" class="notif-avatar"><div class="notif-content"><span class="notif-text">${textContent}</span><span class="notif-time">${getTimeAgo(data.timestamp)}</span></div>${data.postImage ? `<img src="${data.postImage}" class="notif-preview-img">` : ''}`;
                
                item.addEventListener('click', async () => {
                    if (!data.read) await db.collection('notifications').doc(data.id).update({ read: true });
                    if (data.postId) window.location.href = `../comunidade/index.html?postId=${data.postId}`;
                    else if (data.type === 'follow') window.location.href = `../perfil/index.html?uid=${data.senderId}`;
                });
                container.appendChild(item);
            });
        };

        renderSection('Hoje', groups.hoje);
        renderSection('Esta Semana', groups.semana);
        renderSection('Este Mês', groups.mes);
        renderSection('Anteriores', groups.antigas);
    }

    if(btnMarkAll) {
        btnMarkAll.addEventListener('click', () => {
            db.collection('notifications').where('recipientId', '==', currentUser.uid).where('read', '==', false).get()
                .then(snapshot => {
                    const batch = db.batch();
                    snapshot.forEach(doc => batch.update(doc.ref, { read: true }));
                    return batch.commit();
                })
                .then(() => { const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }); Toast.fire({ icon: 'success', title: 'Todas lidas' }); });
        });
    }

    function getTimeAgo(timestamp) { if(!timestamp) return ''; const date = timestamp.toDate(); const diff = (new Date() - date) / 1000; if(diff < 60) return 'Agora mesmo'; if(diff < 3600) return Math.floor(diff/60) + ' min'; if(diff < 86400) return Math.floor(diff/3600) + ' h'; return Math.floor(diff/86400) + ' d'; }
    function escapeHtml(text) { return text ? text.replace(/</g, "&lt;").replace(/>/g, "&gt;") : ""; }

    // Ferramentas & Configurações
    window.calculateWater = () => { const weight = parseFloat(document.getElementById('user-weight-water').value); if (weight && weight > 0) { const liters = (weight * 35 / 1000).toFixed(2); document.getElementById('water-result-text').innerText = `${liters} Litros`; document.getElementById('calc-result-area').classList.remove('hidden'); } else { document.getElementById('calc-result-area').classList.add('hidden'); } };
    window.calculateIMC = () => { const h = parseFloat(document.getElementById('imc-height').value); const w = parseFloat(document.getElementById('imc-weight').value); const statusBadge = document.getElementById('imc-status-badge'); if (h > 0 && w > 0) { const imc = (w / ((h / 100) ** 2)).toFixed(1); document.getElementById('imc-value').innerText = imc; document.getElementById('imc-result-area').classList.remove('hidden'); if (imc < 18.5) { statusBadge.innerText = "Abaixo do peso"; statusBadge.style.color = "#e67e22"; } else if (imc < 24.9) { statusBadge.innerText = "Peso Normal"; statusBadge.style.color = "#27ae60"; } else if (imc < 29.9) { statusBadge.innerText = "Sobrepeso"; statusBadge.style.color = "#f39c12"; } else { statusBadge.innerText = "Obesidade"; statusBadge.style.color = "#c0392b"; } } };

    if(btnOpenSettings) btnOpenSettings.onclick = (e) => { e.preventDefault(); modalSettings.classList.add('open'); if(currentUser){ document.getElementById('st-info-username').value = currentUser.username || ''; document.getElementById('st-info-email').value = currentUser.email || 'Email Google'; } };
    if(btnCloseSettings) btnCloseSettings.onclick = () => modalSettings.classList.remove('open');
    if(btnOpenTools) btnOpenTools.onclick = (e) => { e.preventDefault(); modalTools.classList.add('open'); };
    if(btnCloseTools) btnCloseTools.onclick = () => modalTools.classList.remove('open');
});