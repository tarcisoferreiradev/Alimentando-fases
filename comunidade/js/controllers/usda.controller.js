import { UsdaService } from '../services/usda.service.js';
import { TranslationService } from '../services/translation.service.js';

export class UsdaController {
    constructor() {
        this.service = new UsdaService();
        this.translator = new TranslationService();
        
        this.modal = document.getElementById('modal-usda');
        this.input = document.getElementById('usda-search-input');
        this.btnSearch = document.getElementById('btn-usda-search');
        this.btnClose = document.getElementById('btn-close-usda');
        this.resultsList = document.getElementById('usda-results-list');
        this.loader = document.getElementById('usda-loader');
        this.btnOpen = document.querySelector('.btn-resource-action'); 
        
        // CRIA A VERSÃO "DELAYED" DA BUSCA
        // Espera 800ms após o usuário parar de digitar para rodar
        this.debouncedSearch = this.debounce(() => this.handleSearch(), 800);
    }

    // Função utilitária Sênior para performance
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    init() {
        if (this.btnOpen) this.btnOpen.addEventListener('click', () => this.open());
        if (this.btnClose) this.btnClose.addEventListener('click', () => this.close());
        
        // Se clicar na lupa, busca na hora (ignora delay)
        if (this.btnSearch) this.btnSearch.addEventListener('click', () => this.handleSearch());

        if (this.input) {
            // MUDANÇA: Evento 'input' detecta qualquer digitação
            this.input.addEventListener('input', () => {
                // UI: Mostra um feedback rápido que vai pesquisar
                if(this.input.value.length > 2) {
                    this.showTypingState(); 
                }
                // Dispara a busca com delay
                this.debouncedSearch();
            });
        }

        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.close();
            });
        }
    }

    open() { this.modal.classList.add('open'); this.input.focus(); }
    close() { this.modal.classList.remove('open'); }

    showTypingState() {
        // Feedback visual sutil enquanto o usuário digita
        this.resultsList.style.opacity = '0.5';
    }

    async handleSearch() {
        const queryPt = this.input.value.trim();
        
        // Limpa se estiver vazio
        if (queryPt.length === 0) {
            this.resultsList.innerHTML = `<div class="usda-placeholder-state"><i class="fa-solid fa-basket-shopping"></i><p>Digite para pesquisar...</p></div>`;
            this.resultsList.style.opacity = '1';
            this.loader.classList.add('hidden');
            return;
        }

        if (queryPt.length < 3) return; // Só busca com 3 letras ou mais

        // Começou a buscar de verdade
        this.resultsList.style.opacity = '1';
        this.showLoader(true, "Traduzindo e buscando...");
        this.resultsList.innerHTML = '';

        try {
            // 1. Traduzir (PT -> EN)
            const queryEn = await this.translator.toEnglish(queryPt);
            
            // 2. Buscar no USDA
            this.updateLoaderText("Consultando base oficial...");
            const foods = await this.service.searchFoods(queryEn);
            
            if (foods.length === 0) {
                this.renderEmpty(queryPt);
                return;
            }

            // 3. Tradução em Lote dos Resultados
            this.updateLoaderText("Traduzindo resultados...");
            const englishNames = foods.map(f => f.description);
            const portugueseNames = await this.translator.translateBatch(englishNames);

            // 4. Renderizar
            this.renderResults(foods, portugueseNames, queryEn);

        } catch (error) {
            console.error(error);
            this.resultsList.innerHTML = `<div style="text-align:center; padding:20px; color:#e0245e;">Erro de conexão.</div>`;
        } finally {
            this.showLoader(false);
        }
    }

    showLoader(isVisible, text = "Consultando...") {
        if (isVisible) {
            this.updateLoaderText(text);
            this.loader.classList.remove('hidden');
            this.resultsList.classList.add('hidden');
        } else {
            this.loader.classList.add('hidden');
            this.resultsList.classList.remove('hidden');
        }
    }

    updateLoaderText(text) {
        const p = this.loader.querySelector('p');
        if(p) p.innerText = text;
    }

    renderEmpty(term) {
        this.showLoader(false);
        this.resultsList.innerHTML = `<div style="text-align:center; padding:20px; color:#666;">Nenhum alimento encontrado para <strong>"${term}"</strong>.</div>`;
    }

    renderResults(foods, translatedNames, englishTerm) {
        // Feedback do termo usado
        this.resultsList.innerHTML = `
            <div class="usda-translation-feedback">
                <i class="fa-solid fa-check-double"></i> Resultados para: <strong>${englishTerm}</strong>
            </div>
        `;

        foods.forEach((food, index) => {
            const nutrients = this.service.extractNutrients(food);
            
            // Tenta usar nome traduzido, fallback para original
            // Removemos vírgulas excessivas que o USDA coloca (ex: "Apples, raw, with skin")
            let finalName = translatedNames[index] || food.description;
            
            // Ajuste visual da categoria
            let category = food.foodCategory || 'Geral';
            if(category.includes('Fruits')) category = 'Frutas';
            if(category.includes('Vegetables')) category = 'Vegetais';
            if(category.includes('Poultry')) category = 'Aves';
            if(category.includes('Beef')) category = 'Carnes';
            if(category.includes('Baked')) category = 'Padaria';

            const div = document.createElement('div');
            div.className = 'usda-item';
            div.innerHTML = `
                <h4>${finalName}</h4>
                <div class="usda-meta">
                    <span class="usda-badge">${category}</span>
                    <span>${Math.round(nutrients.calories)} kcal</span>
                </div>
                <div class="nutrient-grid">
                    <div class="nutrient-box"><span class="nutrient-val">${nutrients.calories}</span><span class="nutrient-label">Kcal</span></div>
                    <div class="nutrient-box"><span class="nutrient-val">${nutrients.protein}g</span><span class="nutrient-label">Prot</span></div>
                    <div class="nutrient-box"><span class="nutrient-val">${nutrients.carbs}g</span><span class="nutrient-label">Carb</span></div>
                    <div class="nutrient-box"><span class="nutrient-val">${nutrients.fat}g</span><span class="nutrient-label">Gord</span></div>
                </div>
            `;
            this.resultsList.appendChild(div);
        });
    }
}