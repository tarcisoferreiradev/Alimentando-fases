export class Calculators {
    static init() {
        // Água
        const weightInput = document.getElementById('user-weight-water');
        if (weightInput) {
            weightInput.addEventListener('input', () => {
                const weight = parseFloat(weightInput.value);
                const result = document.getElementById('water-result-text');
                const area = document.getElementById('calc-result-area');
                
                if (weight > 0) {
                    const liters = (weight * 35 / 1000).toFixed(2);
                    result.innerText = `${liters} Litros`;
                    area.classList.remove('hidden');
                } else {
                    area.classList.add('hidden');
                }
            });
        }

        // IMC
        const btnIMC = document.getElementById('btn-calc-imc');
        if (btnIMC) {
            btnIMC.addEventListener('click', () => {
                const h = parseFloat(document.getElementById('imc-height').value) / 100; // cm para m
                const w = parseFloat(document.getElementById('imc-weight').value);
                const valEl = document.getElementById('imc-value');
                const badge = document.getElementById('imc-status-badge');
                const area = document.getElementById('imc-result-area');

                if (h > 0 && w > 0) {
                    const imc = (w / (h * h)).toFixed(1);
                    valEl.innerText = imc;
                    area.classList.remove('hidden');

                    if (imc < 18.5) { badge.innerText = "Abaixo do peso"; badge.style.color = "#e67e22"; }
                    else if (imc < 24.9) { badge.innerText = "Peso Normal"; badge.style.color = "#27ae60"; }
                    else if (imc < 29.9) { badge.innerText = "Sobrepeso"; badge.style.color = "#f39c12"; }
                    else { badge.innerText = "Obesidade"; badge.style.color = "#c0392b"; }
                }
            });
        }
    }
}