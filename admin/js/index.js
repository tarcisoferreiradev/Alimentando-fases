// admin/js/index.js

import { getRoleBadgeHTML } from '../../sistema-cargos/cargos.js';
// Importa auth e db da configuração central
import { auth, db } from '../../firebase-config.js'; 

// --- SEU UID (BACKDOOR DO DONO) ---
const OWNER_UID = "1Sfw2sVb7RVuKqCsNs2PUy8pIs33"; 

document.addEventListener('DOMContentLoaded', async () => {

    let currentUser = null;

    // ============================================================
    // 1. SEGURANÇA E INICIALIZAÇÃO
    // ============================================================
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = '../login/index.html';
            return;
        }

        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (!doc.exists) {
                alert("Usuário não encontrado.");
                window.location.href = '../login/index.html';
                return;
            }
            
            const userData = doc.data();

            // Lógica de Proteção
            const isOwner = user.uid === OWNER_UID;
            const isMaster = userData.role === 'admin_master';

            if (!isMaster && !isOwner) {
                alert("ACESSO NEGADO: Área restrita.");
                window.location.href = '../perfil/index.html';
                return;
            }

            currentUser = { uid: user.uid, ...userData };
            initDashboard();

        } catch (error) {
            console.error("Erro de autenticação:", error);
            alert("Erro ao verificar credenciais.");
        }
    });

    function initDashboard() {
        renderMyPreview();
        loadAllUsers();     
        setupNavigation();  

        // Botão do Card "Meu Status Atual"
        const btnUpdateMe = document.getElementById('btn-update-me');
        if (btnUpdateMe) {
            btnUpdateMe.onclick = async () => {
                const newRole = document.getElementById('select-my-role').value;
                await updateUserRole(currentUser.uid, newRole, null);
                window.location.reload();
            };
        }

        // Busca em tempo real
        const searchInput = document.getElementById('search-users');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('#users-table-body tr').forEach(row => {
                    const text = row.innerText.toLowerCase();
                    row.style.display = text.includes(term) ? '' : 'none';
                });
            });
        }
    }

    // ============================================================
    // 2. NAVEGAÇÃO ENTRE ABAS
    // ============================================================
    function setupNavigation() {
        const links = document.querySelectorAll('.nav-links li');
        const sections = document.querySelectorAll('.admin-section');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if(link.querySelector('a').getAttribute('href').includes('../perfil')) return;

                e.preventDefault();
                links.forEach(l => l.classList.remove('active'));
                sections.forEach(s => s.style.display = 'none');

                link.classList.add('active');
                
                const targetId = link.querySelector('a').getAttribute('data-target');
                if (targetId) {
                    const targetSection = document.getElementById(targetId);
                    if(targetSection) {
                        targetSection.style.display = 'block';
                        if(targetId === 'section-posts') loadAllPosts();
                    }
                }
            });
        });
    }

    // ============================================================
    // 3. GERENCIAMENTO DE USUÁRIOS
    // ============================================================
    async function loadAllUsers() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center">Buscando dados...</td></tr>';

        try {
            const snapshot = await db.collection('users').orderBy('realname').limit(50).get(); 
            tbody.innerHTML = '';

            snapshot.forEach(doc => {
                const u = doc.data();
                const uid = doc.id;
                
                if (uid === currentUser.uid) return; 

                const isBanned = u.isBanned === true;
                const tr = document.createElement('tr');
                if (isBanned) tr.style.backgroundColor = "#ffebee"; 

                const professionalRoles = ['nutri', 'doctor', 'nurse', 'pe_teacher', 'teacher'];
                const isProfessional = professionalRoles.includes(u.role);

                const userCell = `
                    <div class="user-cell">
                        <img src="${u.photo || 'https://ui-avatars.com/api/?name=U'}" class="table-avatar">
                        <div class="user-info-text">
                            <strong>${u.realname || 'Sem nome'} ${isBanned ? '<span style="color:red;font-weight:bold">(BANIDO)</span>' : ''}</strong>
                            <small>${u.username || uid}</small>
                        </div>
                    </div>
                `;

                const actionsCell = `
                    <div style="display:flex; gap:10px; align-items:center;">
                        <select class="admin-select role-changer" style="width: 140px;">
                            <option value="user" ${u.role === 'user' ? 'selected' : ''}>Usuário</option>
                            <option value="student" ${u.role === 'student' ? 'selected' : ''}>Estudante</option>
                            <optgroup label="Profissionais">
                                <option value="nutri" ${u.role === 'nutri' ? 'selected' : ''}>Nutricionista</option>
                                <option value="doctor" ${u.role === 'doctor' ? 'selected' : ''}>Médico</option>
                                <option value="nurse" ${u.role === 'nurse' ? 'selected' : ''}>Enfermeiro</option>
                                <option value="pe_teacher" ${u.role === 'pe_teacher' ? 'selected' : ''}>Personal</option>
                                <option value="teacher" ${u.role === 'teacher' ? 'selected' : ''}>Professor</option>
                            </optgroup>
                            <option value="admin_master" ${u.role === 'admin_master' ? 'selected' : ''}>👑 Master</option>
                        </select>
                        
                        <input type="text" class="admin-input crn-input" 
                               value="${u.crn || ''}" placeholder="Registro" style="width: 100px;"
                               ${!isProfessional ? 'disabled' : ''}>

                        <button class="btn-icon-save btn-save-role" data-uid="${uid}" title="Salvar Alterações">
                            <i class="fa-solid fa-floppy-disk"></i>
                        </button>

                        <div style="width:1px; height:20px; background:#ccc; margin:0 5px;"></div>

                        <button class="btn-ban-action ${isBanned ? 'banned' : ''}" data-uid="${uid}" title="${isBanned ? 'Desbanir' : 'Banir Usuário'}">
                            <i class="fa-solid ${isBanned ? 'fa-lock-open' : 'fa-ban'}"></i>
                        </button>
                    </div>
                `;

                tr.innerHTML = `<td>${userCell}</td><td>${getRoleBadgeHTML(u)}</td><td>${actionsCell}</td>`;
                tbody.appendChild(tr);
            });

            attachUserListeners();

        } catch (error) { console.error(error); }
    }

    function attachUserListeners() {
        const professionalRoles = ['nutri', 'doctor', 'nurse', 'pe_teacher', 'teacher'];
        
        document.querySelectorAll('.role-changer').forEach(select => {
            select.addEventListener('change', (e) => {
                const row = e.target.closest('tr');
                const crnInput = row.querySelector('.crn-input');
                
                if (professionalRoles.includes(e.target.value)) {
                    crnInput.disabled = false;
                    crnInput.focus();
                    if(!crnInput.value) crnInput.placeholder = "Digite...";
                } else {
                    crnInput.disabled = true;
                    crnInput.value = ''; 
                }
            });
        });

        document.querySelectorAll('.btn-save-role').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const btnEl = e.target.closest('button');
                const uid = btnEl.dataset.uid;
                
                const row = btnEl.closest('tr');
                const roleSelect = row.querySelector('.role-changer');
                const crnInput = row.querySelector('.crn-input');
                
                const newRole = roleSelect.value;
                const newCrn = crnInput.value;

                const icon = btnEl.querySelector('i');
                const originalClass = icon.className;
                icon.className = 'fa-solid fa-spinner fa-spin';

                try {
                    await db.collection('users').doc(uid).update({ 
                        role: newRole, 
                        crn: newCrn || null 
                    });
                    
                    icon.className = 'fa-solid fa-check';
                    const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
                    Toast.fire({ icon: 'success', title: 'Atualizado com sucesso!' });
                    setTimeout(() => icon.className = originalClass, 2000);
                    
                } catch (error) {
                    console.error("Erro ao salvar:", error);
                    icon.className = 'fa-solid fa-xmark';
                    let msg = "Erro ao atualizar.";
                    if (error.code === 'permission-denied') msg = "Permissão negada. Verifique as Regras.";
                    alert(msg);
                    setTimeout(() => icon.className = originalClass, 3000);
                }
            });
        });

        document.querySelectorAll('.btn-ban-action').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const btnEl = e.target.closest('button');
                const uid = btnEl.dataset.uid;
                const isCurrentlyBanned = btnEl.classList.contains('banned');

                const action = isCurrentlyBanned ? "Desbloquear" : "BANIR";
                
                const confirm = await Swal.fire({
                    title: `${action} Usuário?`,
                    text: isCurrentlyBanned ? "O acesso será restaurado." : "O usuário será desconectado imediatamente.",
                    icon: isCurrentlyBanned ? 'question' : 'warning',
                    showCancelButton: true,
                    confirmButtonColor: isCurrentlyBanned ? '#2ecc71' : '#d33',
                    confirmButtonText: `Sim, ${action}`
                });

                if (confirm.isConfirmed) {
                    try {
                        await db.collection('users').doc(uid).update({ isBanned: !isCurrentlyBanned });
                        Swal.fire('Atualizado!', '', 'success');
                        loadAllUsers(); 
                    } catch (err) {
                        console.error(err);
                        alert("Erro ao alterar status.");
                    }
                }
            });
        });
    }

    // ============================================================
    // 4. LIMPEZA DE CONTEÚDO
    // ============================================================
    async function loadAllPosts() {
        const grid = document.getElementById('admin-feed-grid');
        if (!grid) return;
        
        grid.innerHTML = '<p>Carregando...</p>';

        try {
            const snapshot = await db.collection('posts').orderBy('timestamp', 'desc').limit(20).get();
            grid.innerHTML = '';

            snapshot.forEach(doc => {
                const post = doc.data();
                const div = document.createElement('div');
                div.className = 'admin-post-card';
                
                let imgSrc = '';
                if(post.images && post.images.length > 0) imgSrc = post.images[0];
                else if(post.image) imgSrc = post.image;

                const imgHTML = imgSrc ? `<img src="${imgSrc}" class="admin-post-img">` : '';
                const textHTML = post.content ? `<p class="admin-post-text">${post.content.substring(0, 100)}...</p>` : '<p class="admin-post-text"><i>Sem texto</i></p>';

                div.innerHTML = `
                    <div class="admin-post-header">
                        <small>${post.authorName || 'Anonimo'}</small>
                        <button class="btn-delete-post" data-id="${doc.id}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    ${imgHTML}
                    ${textHTML}
                `;
                grid.appendChild(div);
            });

            document.querySelectorAll('.btn-delete-post').forEach(btn => {
                btn.onclick = async (e) => {
                    const pid = e.target.closest('button').dataset.id;
                    const confirm = await Swal.fire({
                        title: 'Apagar Post?', text: "Irreversível.", icon: 'error', showCancelButton: true, confirmButtonColor: '#d33'
                    });

                    if(confirm.isConfirmed) {
                        try {
                            await db.collection('posts').doc(pid).delete();
                            e.target.closest('.admin-post-card').remove();
                            Swal.fire('Deletado!', '', 'success');
                        } catch(err) {
                            alert("Erro ao deletar post.");
                        }
                    }
                }
            });

        } catch (err) { console.error(err); }
    }

    // ============================================================
    // 5. AUXILIARES
    // ============================================================
    function renderMyPreview() {
        const preview = document.getElementById('my-preview-area');
        if(preview) preview.innerHTML = `${getRoleBadgeHTML(currentUser)}`;
    }
    
    // CORREÇÃO: Adicionada a palavra 'function' aqui
    async function updateUserRole(uid, role, crn) {
        try {
            await db.collection('users').doc(uid).update({ 
                role: role, 
                crn: crn || null 
            });
            const Toast = Swal.mixin({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
            });
            Toast.fire({ icon: 'success', title: 'Cargo atualizado!' });
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar.");
        }
    }
});