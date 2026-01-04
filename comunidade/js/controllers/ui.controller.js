import { auth, db } from '../config/firebase.proxy.js';

export class UIController {
    constructor() {
        // Mapeamento de todos os elementos que recebem a foto do usuário
        this.avatarElements = {
            sidebar: document.getElementById('nav-avatar-img'),      // Avatar lá embaixo na esquerda
            story: document.getElementById('story-user-avatar'),     // Bolinha do Story
            widget: document.getElementById('widget-user-avatar'),   // "No que você está pensando?"
            modalPost: document.getElementById('modal-user-avatar'), // Dentro do modal de criar post
            instComment: document.getElementById('inst-author-photo') // Avatar no modal de detalhes (se for o dono)
        };

        // Elementos de texto (Nome)
        this.nameElements = {
            sidebar: document.querySelector('.p-name'),
            modalPost: document.querySelector('.cp-username')
        };
    }

    init() {
        // Monitora o estado de autenticação
        auth().onAuthStateChanged(async (user) => {
            if (user) {
                await this.updateUserInfo(user);
            } else {
                this.setGuestState();
            }
        });

        this.setupGlobalInteractions();
    }

    async updateUserInfo(firebaseUser) {
        try {
            // Tenta pegar dados mais recentes do Firestore (foto atualizada, etc)
            const doc = await db().collection('users').doc(firebaseUser.uid).get();
            
            let userData = {
                photo: firebaseUser.photoURL,
                name: firebaseUser.displayName
            };

            if (doc.exists) {
                const data = doc.data();
                // Prioriza a foto do banco se existir, senão usa do Auth
                userData.photo = data.photo || firebaseUser.photoURL;
                userData.name = data.realname || firebaseUser.displayName;
            }

            // Fallback se não tiver foto nenhuma
            const finalPhoto = userData.photo || 'https://ui-avatars.com/api/?name=User&background=random';

            // Atualiza TODOS os avatares na tela
            Object.values(this.avatarElements).forEach(img => {
                if (img) img.src = finalPhoto;
            });

            // Atualiza nomes onde necessário
            if (this.nameElements.sidebar) this.nameElements.sidebar.innerText = "Meu Perfil"; // Ou userData.name se preferir
            if (this.nameElements.modalPost) this.nameElements.modalPost.innerText = userData.name || "Você";

        } catch (error) {
            console.error("UIController: Erro ao buscar dados do usuário", error);
        }
    }

    setGuestState() {
        const guestPhoto = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        
        Object.values(this.avatarElements).forEach(img => {
            if (img) img.src = guestPhoto;
        });

        if (this.nameElements.sidebar) {
            this.nameElements.sidebar.innerText = "Fazer Login";
            this.nameElements.sidebar.style.color = "#53954a";
            this.nameElements.sidebar.style.fontWeight = "800";
            
            // Link para login
            const link = document.querySelector('.profile-pill-link');
            if(link) link.href = "../login/index.html";
        }
    }

    setupGlobalInteractions() {
        // Aqui você pode colocar lógicas globais da UI, 
        // como abrir o menu mobile ou dropdowns que não pertencem a um módulo específico.
        
        // Exemplo: Bloqueio para visitantes em botões chave
        const btnCreatePost = document.getElementById('btn-open-modal-post');
        if (btnCreatePost) {
            btnCreatePost.addEventListener('click', (e) => {
                if (!auth().currentUser) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showLoginAlert();
                }
            });
        }
    }

    showLoginAlert() {
        if(window.Swal) {
            Swal.fire({
                title: 'Modo Visitante',
                text: 'Faça login para participar da comunidade.',
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#53954a',
                confirmButtonText: 'Login',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) window.location.href = '../login/index.html';
            });
        } else {
            alert("Faça login para continuar.");
        }
    }
}