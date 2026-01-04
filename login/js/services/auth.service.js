/**
 * SERVIÇO DE AUTENTICAÇÃO (Business Logic)
 * Responsável pela comunicação direta com o Firebase.
 */
export class AuthService {
    
    constructor() {
        // Garante que o SDK global do Firebase foi carregado via HTML
        if (typeof firebase === 'undefined') {
            console.error("ERRO CRÍTICO: Firebase SDK não encontrado. Verifique o HTML.");
            throw new Error("Firebase not initialized");
        }
        this.auth = firebase.auth();
    }

    async loginEmailPassword(email, password, rememberMe) {
        // Define persistência com base na escolha do usuário
        const persistence = rememberMe 
            ? firebase.auth.Auth.Persistence.LOCAL 
            : firebase.auth.Auth.Persistence.SESSION;

        await this.auth.setPersistence(persistence);
        return await this.auth.signInWithEmailAndPassword(email, password);
    }

    async loginGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        return await this.auth.signInWithPopup(provider);
    }

    async recoverPassword(email) {
        return await this.auth.sendPasswordResetEmail(email);
    }

    /**
     * Traduz erros técnicos do Firebase para mensagens amigáveis em PT-BR.
     */
    parseError(error) {
        const errorCode = error.code || error;
        
        // Log para debug em ambiente de desenvolvimento
        console.warn("Firebase Error:", errorCode);

        const errors = {
            // Códigos Legados e Comuns
            'auth/user-not-found': 'E-mail não cadastrado.',
            'auth/wrong-password': 'Senha incorreta.',
            'auth/invalid-email': 'Formato de e-mail inválido.',
            'auth/user-disabled': 'Conta desativada.',
            
            // Novos códigos de segurança (Firebase v9+)
            'auth/invalid-credential': 'E-mail ou senha incorretos.',
            'auth/invalid-login-credentials': 'E-mail ou senha incorretos.',
            
            // Bloqueios e Rede
            'auth/too-many-requests': 'Muitas tentativas falhas. Aguarde alguns instantes.',
            'auth/network-request-failed': 'Sem conexão com a internet.',
            
            // Fluxo Google
            'auth/popup-closed-by-user': 'Login cancelado pelo usuário.',
            'auth/popup-blocked': 'O navegador bloqueou o pop-up.'
        };

        return errors[errorCode] || 'Ocorreu um erro inesperado. Tente novamente.';
    }
}