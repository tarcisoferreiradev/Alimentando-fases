import { AuthService } from '../services/auth.service.js';

/**
 * CONTROLADOR DE LOGIN (UI Logic)
 * Gerencia eventos do DOM, Feedbacks visuais e Loading.
 */
export class LoginController {
    
    constructor() {
        try {
            this.authService = new AuthService();
        } catch (e) {
            Swal.fire('Erro Crítico', 'Falha ao iniciar sistema de autenticação.', 'error');
        }

        // Cache dos elementos do DOM
        this.ui = {
            form: document.getElementById('loginForm'),
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            rememberMe: document.getElementById('rememberMe'),
            btnPrimary: document.querySelector('.btn-primary'),
            googleBtn: document.getElementById('google-login-btn'),
            forgotBtn: document.getElementById('forgot-btn'),
            togglePass: document.getElementById('togglePassword')
        };
    }

    init() {
        if (this.ui.form) {
            this.addEventListeners();
            console.log("Login Module: Inicializado");
        }
    }

    addEventListeners() {
        this.ui.form.addEventListener('submit', (e) => this.handleLogin(e));
        
        if (this.ui.googleBtn) {
            this.ui.googleBtn.addEventListener('click', () => this.handleGoogleLogin());
        }

        if (this.ui.forgotBtn) {
            this.ui.forgotBtn.addEventListener('click', (e) => this.handleForgot(e));
        }

        if (this.ui.togglePass) {
            this.ui.togglePass.addEventListener('click', () => this.togglePasswordVisibility());
        }
    }

    // --- Helpers de Interface ---

    toggleLoading(isLoading) {
        const btn = this.ui.btnPrimary;
        if (!btn) return;

        if (isLoading) {
            btn.dataset.original = btn.innerText;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';
            btn.style.opacity = '0.8';
        } else {
            btn.innerHTML = btn.dataset.original || 'Entrar';
            btn.disabled = false;
            btn.style.cursor = 'pointer';
            btn.style.opacity = '1';
        }
    }

    togglePasswordVisibility() {
        const input = this.ui.password;
        const icon = this.ui.togglePass;
        
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        
        icon.classList.toggle('fa-eye', isPassword);
        icon.classList.toggle('fa-eye-slash', !isPassword);
    }

    // --- Manipuladores de Eventos (Handlers) ---

    async handleLogin(e) {
        e.preventDefault();
        this.toggleLoading(true);

        const email = this.ui.email.value.trim();
        const password = this.ui.password.value;
        const remember = this.ui.rememberMe.checked;

        try {
            await this.authService.loginEmailPassword(email, password, remember);
            
            Swal.fire({
                icon: 'success',
                title: 'Login realizado!',
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                position: 'top-end'
            });

            setTimeout(() => window.location.href = '../index.html', 1500);

        } catch (error) {
            this.toggleLoading(false);
            const msg = this.authService.parseError(error);
            Swal.fire({ icon: 'error', title: 'Atenção', text: msg, confirmButtonColor: '#53954a' });
        }
    }

    async handleGoogleLogin() {
        try {
            const result = await this.authService.loginGoogle();
            
            Swal.fire({
                icon: 'success',
                title: `Bem-vindo, ${result.user.displayName.split(' ')[0]}!`,
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                position: 'top-end'
            });
            setTimeout(() => window.location.href = '../index.html', 1500);
            
        } catch (error) {
            const msg = this.authService.parseError(error);
            Swal.fire({ icon: 'error', title: 'Erro Google', text: msg });
        }
    }

    async handleForgot(e) {
        e.preventDefault();
        const email = this.ui.email.value.trim();

        if (!email) {
            return Swal.fire({
                icon: 'warning',
                title: 'Campo obrigatório',
                text: 'Digite seu e-mail acima para recuperar a senha.',
                confirmButtonColor: '#53954a'
            });
        }

        const confirm = await Swal.fire({
            title: 'Recuperar Senha',
            text: `Enviar link para: ${email}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#53954a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Enviar'
        });

        if (confirm.isConfirmed) {
            try {
                await this.authService.recoverPassword(email);
                Swal.fire('Enviado!', 'Verifique sua caixa de entrada.', 'success');
            } catch (error) {
                const msg = this.authService.parseError(error);
                Swal.fire({ icon: 'error', title: 'Erro', text: msg });
            }
        }
    }
}