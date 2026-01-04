export class TranslationService {
    constructor() {
        // API Gratuita (MyMemory) - Suficiente para o fluxo de pesquisa
        this.apiUrl = 'https://api.mymemory.translated.net/get';
    }

    /**
     * PT -> EN (Para pesquisar: "Maçã" vira "Apple")
     */
    async toEnglish(text) {
        return this._translate(text, 'pt|en');
    }

    /**
     * EN -> PT (Para exibir: "Apple, raw" vira "Maçã, crua")
     */
    async toPortuguese(text) {
        return this._translate(text, 'en|pt');
    }

    /**
     * Traduz vários itens de uma vez (Para a lista de resultados)
     */
    async translateBatch(texts) {
        if (!texts || texts.length === 0) return [];
        // Executa em paralelo para não travar a UI
        const promises = texts.map(text => this.toPortuguese(text));
        return Promise.all(promises);
    }

    async _translate(text, langPair) {
        if (!text) return '';
        try {
            const query = encodeURIComponent(text);
            const url = `${this.apiUrl}?q=${query}&langpair=${langPair}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.responseData) {
                return data.responseData.translatedText;
            }
            return text; // Fallback: retorna original se falhar
        } catch (error) {
            console.warn("Translation Service: Falha não crítica", error);
            return text;
        }
    }
}