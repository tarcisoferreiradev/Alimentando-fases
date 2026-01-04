document.addEventListener('DOMContentLoaded', () => {
    
    // --- REFERÊNCIAS ---
    const step1 = document.getElementById('step-1');
    const step3 = document.getElementById('step-3'); // O passo da senha agora é o 'step-3' no HTML

    const btnNext1 = document.getElementById('btn-next-1');
    const btnBack1 = document.getElementById('back-to-1');
    
    const title = document.getElementById('page-title');
    const subtitle = document.getElementById('page-subtitle');
    const legalFooter = document.getElementById('legal-footer');

    const inputName = document.getElementById('username');
    const inputEmail = document.getElementById('email');

    // --- NAVEGAÇÃO ENTRE OS PASSOS ---

    // Passo 1 -> Passo da Senha (antigo Passo 3)
    btnNext1.addEventListener('click', () => {
        if(inputName.value.trim() === "" || inputEmail.value.trim() === "") {
            alert("Por favor, preencha todos os campos.");
            return;
        }
        
        step1.classList.remove('active');
        step3.classList.add('active');
        
        title.textContent = "Proteja sua conta";
        subtitle.textContent = "Passo 2 de 2: Senha"; // ATUALIZADO
        if(legalFooter) legalFooter.style.display = 'none';
    });

    // Passo da Senha -> Passo 1 (Voltar)
    btnBack1.addEventListener('click', (e) => {
        e.preventDefault();
        
        step3.classList.remove('active');
        step1.classList.add('active');
        
        title.textContent = "Crie sua conta";
        subtitle.textContent = "Passo 1 de 2: Identificação"; // ATUALIZADO
        if(legalFooter) legalFooter.style.display = 'block';
    });

    // --- FORÇA DA SENHA (MANTIDO) ---
    const passwordInput = document.getElementById('reg-password');
    const strengthMeter = document.querySelector('.password-strength-meter');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    
    const reqLengthItem = document.getElementById('req-length');
    const reqNumberItem = document.getElementById('req-number');
    const reqSpecialItem = document.getElementById('req-special');

    if(passwordInput) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            
            if (password.length > 0) strengthMeter.style.display = 'block';
            else strengthMeter.style.display = 'none';

            // 1. Validar Regras
            const hasLength = password.length >= 8;
            updateRequirement(reqLengthItem, hasLength);

            const hasNumber = /\d/.test(password);
            updateRequirement(reqNumberItem, hasNumber);

            const hasSpecial = /[^A-Za-z0-9]/.test(password);
            updateRequirement(reqSpecialItem, hasSpecial);

            // 2. Calcular % da Barra
            let strength = 0;
            let checks = 0;
            if (hasLength) checks++;
            if (hasNumber) checks++;
            if (hasSpecial) checks++;

            if (password.length > 0) strength = 10;
            if (checks === 1) strength = 33;
            if (checks === 2) strength = 66;
            if (checks === 3) strength = 100;

            strengthFill.style.width = `${strength}%`;

            // 3. Cores
            if (strength <= 33) {
                strengthFill.style.backgroundColor = '#e74c3c'; // Fraca
                strengthText.textContent = "Fraca";
            } else if (strength <= 66) {
                strengthFill.style.backgroundColor = '#f1c40f'; // Moderada
                strengthText.textContent = "Moderada";
            } else {
                strengthFill.style.backgroundColor = '#53954a'; // Forte
                strengthText.textContent = "Forte";
            }
        });
    }

    function updateRequirement(element, isValid) {
        const icon = element.querySelector('i');
        if (isValid) {
            element.classList.add('valid');
            icon.classList.remove('fa-circle');
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            icon.classList.add('fa-circle-check');
        } else {
            element.classList.remove('valid');
            icon.classList.remove('fa-circle-check');
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            icon.classList.add('fa-circle');
        }
    }

    // --- FUNÇÃO DO OLHO DA SENHA (MANTIDO) ---
    const togglePass = document.querySelector('.toggle-password');
    if(togglePass) {
        togglePass.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            if(input) {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            }
        });
    }

    // --- SUBMIT FINAL (CONECTADO AO FIREBASE, MANTIDO) ---
    const form = document.getElementById('registerForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = inputEmail.value;
        const nome = inputName.value;
        const p1 = document.getElementById('reg-password').value;
        const p2 = document.getElementById('confirm-password').value;
        
        // Validação final de senha
        const hasLength = p1.length >= 8;
        const hasNumber = /\d/.test(p1);
        const hasSpecial = /[^A-Za-z0-9]/.test(p1);

        if(!hasLength || !hasNumber || !hasSpecial) {
            alert("A senha precisa atender a todos os requisitos!");
            return;
        }

        if(p1 !== p2) {
            alert("As senhas não coincidem!");
            return;
        }

        // Criar usuário no Firebase
        auth.createUserWithEmailAndPassword(email, p1)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // Salvar o Nome do usuário
                user.updateProfile({
                    displayName: nome
                }).then(() => {
                    alert("Conta criada com sucesso! Redirecionando para o login...");
                    window.location.href = '../login/index.html';
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                let errorMessage = error.message;

                if (errorCode === 'auth/email-already-in-use') {
                    errorMessage = "Este e-mail já está sendo usado.";
                } else if (errorCode === 'auth/weak-password') {
                    errorMessage = "A senha é muito fraca.";
                } else if (errorCode === 'auth/invalid-email') {
                    errorMessage = "O e-mail é inválido.";
                }
                
                alert("Erro: " + errorMessage);
                console.error(error);
            });
    });
});