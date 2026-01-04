import { escapeHtml } from '../utils/formatters.js';

export class SearchService {
    constructor() {
        this.input = document.getElementById('global-search-input');
        this.dropdown = document.getElementById('search-results-dropdown');
        this.postsCache = []; // Cache temporário dos posts carregados
    }

    init(posts) {
        this.postsCache = posts;
        if (this.input) {
            this.input.addEventListener('input', (e) => this.handleSearch(e.target.value));
            // Fechar ao clicar fora
            document.addEventListener('click', (e) => {
                if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
                    this.dropdown.classList.add('hidden');
                }
            });
        }
    }

    updateCache(posts) {
        this.postsCache = posts;
    }

    handleSearch(query) {
        if (query.length < 2) {
            this.dropdown.classList.add('hidden');
            return;
        }

        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const results = this.postsCache.filter(post => {
            const content = (post.content || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const author = (post.authorName || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return content.includes(normalizedQuery) || author.includes(normalizedQuery);
        });

        this.renderResults(results);
    }

    renderResults(results) {
        this.dropdown.innerHTML = '';
        this.dropdown.classList.remove('hidden');

        if (results.length === 0) {
            this.dropdown.innerHTML = '<div style="padding:10px; text-align:center; color:#888;">Nenhum resultado.</div>';
            return;
        }

        results.slice(0, 5).forEach(post => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.innerHTML = `
                <div class="s-icon-box"><i class="fa-regular fa-file-lines"></i></div>
                <div class="s-info">
                    <span class="s-title">${escapeHtml(post.authorName)}</span>
                    <span class="s-desc">${escapeHtml(post.content.substring(0, 40))}...</span>
                </div>
            `;
            // Ao clicar, poderia abrir o modal do post
            div.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('open-post-detail', { detail: post.id }));
                this.dropdown.classList.add('hidden');
            });
            this.dropdown.appendChild(div);
        });
    }
}