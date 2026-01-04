export class UsdaService {
    constructor() {
        // Chave API Pública (Demo) ou a sua se tiver
        this.apiKey = 'rydkVuq1v7t9W1QhF1HiDCv1l4DRK3LQP7nyeGtx'; 
        this.baseUrl = 'https://api.nal.usda.gov/fdc/v1';
    }

    async searchFoods(query) {
        if (!query) return [];

        try {
            // dataType=Foundation,SR Legacy prioriza alimentos in natura (frutas, verduras, carnes cruas)
            // pageNumber=1&pageSize=12 limita para carregar rápido
            const url = `${this.baseUrl}/foods/search?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&pageSize=12&dataType=Foundation,SR Legacy`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erro API USDA: ${response.status}`);
            
            const data = await response.json();
            return data.foods || [];
        } catch (error) {
            console.error("USDA Service Error:", error);
            throw error;
        }
    }

    extractNutrients(food) {
        // Função auxiliar para buscar valor pelo ID do nutriente
        const getNutrient = (ids) => {
            // Aceita um ID único ou um Array de IDs possíveis
            const idList = Array.isArray(ids) ? ids : [ids];
            
            // Procura o primeiro que tiver valor > 0
            const nutrient = food.foodNutrients.find(x => idList.includes(x.nutrientId) && x.value > 0);
            
            // Se achou, retorna arredondado. Se não, tenta achar qualquer um (mesmo zero).
            if (nutrient) return Math.round(nutrient.value);
            
            const fallback = food.foodNutrients.find(x => idList.includes(x.nutrientId));
            return fallback ? Math.round(fallback.value) : 0;
        };

        return {
            // === CORREÇÃO DO "0 KCAL" ===
            // 1008: Energia (Atwater General)
            // 208:  Energia (kcal) antiga
            // 2047: Energia (Atwater Specific) - Comum em frutas
            // 2048: Energia (Calculada)
            calories: getNutrient([1008, 208, 2047, 2048]),
            
            // 1003: Proteína
            // 203: Proteína (antigo)
            protein: getNutrient([1003, 203]),
            
            // 1004: Gordura Total
            // 204: Gordura (antigo)
            fat: getNutrient([1004, 204]),
            
            // 1005: Carboidratos
            // 205: Carboidratos (antigo)
            carbs: getNutrient([1005, 205])
        };
    }
}