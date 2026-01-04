document.addEventListener('DOMContentLoaded', () => {
    /* =======================================================
     * LÓGICA DE REDIRECIONAMENTO VIA URL (ROBUSTA)
     * ======================================================= */
    let hash = window.location.hash.substring(1); // Remove o '#'
    
    // CORREÇÃO AUTOMÁTICA DE LINKS: Se vier 'origem', muda para 'origem-alimentar'
    if (hash === 'origem') { hash = 'origem-alimentar'; }

    if (hash) {
        // Pequeno delay (150ms) para garantir que o site carregou scripts e funções
        setTimeout(() => {
            // TENTATIVA 1: Usar a função oficial de navegação
            if (typeof navigateTo === 'function') {
                navigateTo(hash); 
            } 
            // TENTATIVA 2: Simular clique no menu (Mais garantido)
            else {
                const linkMenu = document.querySelector(`.nav-link[data-page="${hash}"]`) || 
                                 document.querySelector(`a[href="#${hash}"]`);
                if (linkMenu) {
                    linkMenu.click();
                }
                // TENTATIVA 3: Força bruta (manipula o CSS)
                else {
                    const targetSection = document.getElementById(hash);
                    const allPages = document.querySelectorAll('.page-content');
                    
                    if (targetSection && allPages.length > 0) {
                        allPages.forEach(s => s.classList.remove('active'));
                        targetSection.classList.add('active');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        
                        // Inicializa jogos se necessário
                        if(hash === 'infancia' && typeof EmbeddedClassifyGame !== 'undefined') EmbeddedClassifyGame.init();
                        if(hash === 'adolescencia' && typeof WordSearchGame !== 'undefined') WordSearchGame.init();
                        if(hash === 'origem-alimentar') setupOriginMap();
                    }
                }
            }
        }, 150);
    }
});

// 1. OTIMIZAÇÃO DE SCROLL (Passive Listeners)
(function() {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'touchstart' || type === 'touchmove' || type === 'wheel') {
            if (typeof options === 'object') {
                options.passive = true;
            } else if (typeof options === 'boolean') {
                // mantém como está
            } else {
                options = { passive: true };
            }
        }
        originalAddEventListener.call(this, type, listener, options);
    };
})();

if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

/* =======================================================
 * MAPA DE ÁUDIOS PRÉ-GERADOS (M4A)
 * ======================================================= */
const preGeneratedAudios = {
    'quemsomos': 'audios/quemsomos.m4a',
    'origem-alimentar': 'audios/origemalimentar.m4a',
    'infancia': 'audios/infancia.m4a',
    'adolescencia': 'audios/adolescencia.m4a',
    'adulto': 'audios/adultos.m4a',
    'idoso': 'audios/idosos.m4a',
    'higiene': 'audios/higiene.m4a',
    'rotulagem': 'audios/rotulagem.m4a',
    'acoes': 'audios/acoes.m4a'
};

// Variável global para controlar a reprodução do áudio
let currentAudio = null;


// --- 2. LÓGICA DO MENU MOBILE ---
const burger = document.querySelector('.main-header__burger');
const navWrapper = document.querySelector('.main-header__navigation-wrapper');

function toggleMobileMenu() {
    if (!burger || !navWrapper) return;
    burger.classList.toggle('active');
    navWrapper.classList.toggle('open');
}

function closeMobileMenu() {
    if (!burger || !navWrapper) return;
    burger.classList.remove('active');
    navWrapper.classList.remove('open');
}

if (burger) {
    burger.addEventListener('click', toggleMobileMenu);
}


// --- 3. LÓGICA DO MEGA MENU (Desktop) ---
const menuItems = document.querySelectorAll('.main-header__list-item.has-submenu');
const mainHeader = document.querySelector('.main-header'); 

const handleSubmenuLinkHover = (event) => {
    const subLink = event.currentTarget;
    const parentMenuItem = subLink.closest('.main-header__list-item.has-submenu');
    if (!parentMenuItem) return;

    // CORREÇÃO: Seleciona TODOS os itens para limpar o estado ativo corretamente
    const allSubmenuLinks = parentMenuItem.querySelectorAll('.submenu-list__item');
    const allSubmenuContents = parentMenuItem.querySelectorAll('.submenu-content');

    allSubmenuLinks.forEach(sl => sl.classList.remove('active'));
    allSubmenuContents.forEach(sc => sc.classList.remove('active'));

    // Adiciona ativo ao item atual
    subLink.classList.add('active');

    // Só tenta abrir painel lateral se tiver a classe has-submenu
    if (subLink.classList.contains('has-submenu')) {
        const contentKeyElement = subLink.querySelector('.submenu-list__item-title');
        if (contentKeyElement) {
            const firstContentKey = contentKeyElement.textContent;
            const targetContent = parentMenuItem.querySelector(`.submenu-content[data-submenu-for="${firstContentKey}"]`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        }
    }
};

function closeMenu(item) {
    item.classList.remove('js-hover'); 
    item.classList.add('is-closing'); 
    
    // Remove listener de todos os itens
    const submenuLinks = item.querySelectorAll('.submenu-list__item');
    submenuLinks.forEach((subLink) => {
        subLink.removeEventListener('mouseenter', handleSubmenuLinkHover);
    });

    const burger = document.querySelector('.main-header__burger');
    if (burger && getComputedStyle(burger).display === 'flex') {
        const submenuWrapper = item.querySelector('.submenu-wrapper');
        if (submenuWrapper) {
            submenuWrapper.style.maxHeight = null;
        }
    } 
}

function openMenu(item) {
    item.classList.remove('is-closing');
    item.classList.add('js-hover'); 

    const burger = document.querySelector('.main-header__burger');
    if (burger && getComputedStyle(burger).display === 'flex') {
        const submenuWrapper = item.querySelector('.submenu-wrapper');
        if (submenuWrapper) {
            submenuWrapper.style.maxHeight = submenuWrapper.scrollHeight + "px";
        }
    }

    // CORREÇÃO: Seleciona todos os itens da lista
    const submenuLinks = item.querySelectorAll('.submenu-list__item');
    const submenuContents = item.querySelectorAll('.submenu-content');

    const burgerCheck = document.querySelector('.main-header__burger');
    if (!burgerCheck || getComputedStyle(burgerCheck).display === 'none') {
        setTimeout(() => {
            submenuLinks.forEach(sl => sl.classList.remove('active'));
            submenuContents.forEach(sc => sc.classList.remove('active'));

            if (submenuLinks.length > 0) {
                const firstSubLink = submenuLinks[0];
                firstSubLink.classList.add('active');
                
                // Só abre conteúdo se o primeiro item tiver submenu
                if (firstSubLink.classList.contains('has-submenu')) {
                    const firstContentKeyElement = firstSubLink.querySelector('.submenu-list__item-title');
                    if (firstContentKeyElement) {
                        const firstContentKey = firstContentKeyElement.textContent;
                        const firstContent = item.querySelector(`.submenu-content[data-submenu-for="${firstContentKey}"]`);
                        if (firstContent) firstContent.classList.add('active');
                    }
                }
            }
        }, 0); 
    } 

    submenuLinks.forEach((subLink) => {
        subLink.addEventListener('mouseenter', handleSubmenuLinkHover);

        subLink.addEventListener('click', (e) => {
            const burger = document.querySelector('.main-header__burger');

            if (burger && getComputedStyle(burger).display !== 'flex') {
                const mainMenuItem = subLink.closest('.main-header__list-item.has-submenu');
                if (mainMenuItem) {
                    closeMenu(mainMenuItem);
                }
                return;
            }

            closeMobileMenu();

            const mainMenuItem = subLink.closest('.main-header__list-item.has-submenu');
            if (mainMenuItem) {
                closeMenu(mainMenuItem);
            }
        });
    });
}

menuItems.forEach(item => {
    const link = item.querySelector(':scope > a');
    const submenuWrapper = item.querySelector('.submenu-wrapper');

    if (!link || !submenuWrapper) return;

    link.addEventListener('click', (e) => {
        e.preventDefault(); 
        e.stopPropagation(); 

        const wasOpen = item.classList.contains('js-hover');

        menuItems.forEach(otherItem => {
            if (otherItem !== item) { 
                closeMenu(otherItem);
            }
        });

        if (wasOpen) {
            closeMenu(item); 
        } else {
            openMenu(item); 

            const burger = document.querySelector('.main-header__burger');
            if (navWrapper && burger && getComputedStyle(burger).display === 'flex') {
                setTimeout(() => {
                    const itemTop = item.offsetTop;
                    const containerPaddingTop = parseFloat(window.getComputedStyle(navWrapper).paddingTop) || 0;

                    navWrapper.scrollTo({
                        top: itemTop - containerPaddingTop,
                        behavior: 'smooth'
                    });
                }, 50); 
            }
        }
    });

    submenuWrapper.addEventListener('click', (e) => {
        e.stopPropagation(); 
    });

    const focusableElements = Array.from(item.querySelectorAll('a, button'));
    if (focusableElements.length > 0) {
        const lastElement = focusableElements[focusableElements.length - 1];
        const firstElement = focusableElements[0];
        firstElement.addEventListener('keydown', (e) => {
            if (e.shiftKey && e.key === 'Tab') {
                closeMenu(item);
            }
        });
        lastElement.addEventListener('keydown', (e) => {
            if (!e.shiftKey && e.key === 'Tab') {
                closeMenu(item);
            }
        });
        item.addEventListener('focusout', (e) => {
            if (!item.contains(e.relatedTarget)) {
                closeMenu(item);
            }
        });
    }
});

document.addEventListener('click', (e) => {
    menuItems.forEach(menuItem => {
        closeMenu(menuItem);
    });
});


// --- 1. LÓGICA DE NAVEGAÇÃO (SPA) ---
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page-content');
const appContainer = document.getElementById('app-container');

function navigateTo(pageId, anchorId = null) { 
    window.scrollTo({ top: 0, behavior: 'instant' });

    pages.forEach(page => page.classList.remove('active'));

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        pageId = 'home'; 
        document.getElementById('home').classList.add('active');
    }

    setupTextToSpeech();

    if (pageId === 'home') {
        setupHeroCarousel();
    }
    else if (pageId === 'adolescencia') {
        if (typeof WordSearchGame !== 'undefined' && WordSearchGame.init) {
            setTimeout(() => { WordSearchGame.init(); }, 100);
        }
    }
    else if (pageId === 'infancia') {
        if (typeof EmbeddedClassifyGame !== 'undefined' && EmbeddedClassifyGame.init) {
            setTimeout(() => { EmbeddedClassifyGame.init(); }, 100);
        }
    }
    else if (pageId === 'receitas') {
        if (typeof setupRecipeFilters !== 'undefined') {
            setTimeout(() => { setupRecipeFilters(); }, 100);
        }
    }
    else if (pageId === 'adulto') {
        setupSnackPlanner();
        animateChartBars();
    }
    else if (pageId === 'idoso') {
        setupHydrationCalculator();
    }
    else if (pageId === 'higiene') {
        setupHandwashGuide();
    }
    else if (pageId === 'origem-alimentar') {
        setupOriginMap();
    }
    else if (pageId === 'agenda') {
        setTimeout(() => { FullPageCalendar.init(); }, 100);
    }

    if (anchorId) {
        const targetElement = document.querySelector(anchorId); 
        if (targetElement) {
            setTimeout(() => {
                const headerOffset = 90;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }, 50); 
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    closeMobileMenu();

    if (menuItems && typeof closeMenu === 'function') {
        menuItems.forEach(menuItem => {
            closeMenu(menuItem);
        });
    }

    if (typeof ScrollTrigger !== 'undefined' && window.innerWidth > 1024) {
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 10);
    }
}

/* =======================================================
 * LÓGICA DE LEITURA DE TELA (TTS)
 * ======================================================= */
function generateSpeechContent(pageId, button) {
    const pageElement = document.getElementById(pageId);
    if (!pageElement) return;

    const synth = window.speechSynthesis;

    if (synth.speaking) {
        synth.cancel();
        button.innerHTML = '<i class="fa-solid fa-volume-up"></i> Ler Conteúdo';
        return;
    }
    
    const readableElements = pageElement.querySelectorAll('.topic-content, .section-description, .pullquote, .quiz-pergunta, .card_content h2, .card_content h5');
    
    let textToRead = '';
    readableElements.forEach(el => {
        if (el.textContent.trim().length > 0 && el.offsetHeight > 0) {
             textToRead += el.textContent.trim() + '. '; 
        }
    });

    if (textToRead) {
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'pt-BR';
        
        button.innerHTML = '<i class="fa-solid fa-stop-circle"></i> Parar Leitura';

        utterance.onend = () => {
            button.innerHTML = '<i class="fa-solid fa-volume-up"></i> Ler Conteúdo';
        };
        synth.speak(utterance);
    } else {
        alert('Nenhum texto legível encontrado nesta seção.');
    }
}

function playAudioContent(audioPath, button) {
    const synth = window.speechSynthesis;
    if (synth.speaking) {
        synth.cancel();
    }

    if (!currentAudio) {
        currentAudio = new Audio();
    }
    
    if (currentAudio.src.endsWith(audioPath) && currentAudio.readyState >= 1) {
        if (currentAudio.paused) {
            currentAudio.play();
        } else {
            currentAudio.pause();
        }
    } else {
        currentAudio.src = audioPath;
        currentAudio.load();
        currentAudio.play().catch(e => console.error("Erro ao tentar reproduzir o áudio:", e));
    }

    const updateButton = () => {
        if (currentAudio.paused || currentAudio.ended) {
            button.innerHTML = '<i class="fa-solid fa-volume-up"></i> Ler Conteúdo';
            button.classList.remove('playing');
        } else {
            button.innerHTML = '<i class="fa-solid fa-stop-circle"></i> Parar Leitura';
            button.classList.add('playing');
        }
    };
    
    currentAudio.onplay = updateButton;
    currentAudio.onpause = updateButton;
    currentAudio.onended = updateButton;
    updateButton(); 
}

function readPageContent(pageId, button) {
    const audioPath = preGeneratedAudios[pageId];

    if (audioPath) {
        playAudioContent(audioPath, button);
    } else {
        generateSpeechContent(pageId, button);
    }
}

function setupTextToSpeech() {
    const pagesWithContent = document.querySelectorAll('#infancia, #adolescencia, #adulto, #idoso, #quemsomos, #origem-alimentar, #higiene, #rotulagem, #acoes');
    
    pagesWithContent.forEach(page => {
        const contentSection = page.querySelector('.content-section');
        
        if (contentSection && !page.querySelector('.read-aloud-button-wrapper')) {
            
            const button = document.createElement('button');
            button.classList.add('cta-link', 'read-aloud-button');
            button.innerHTML = '<i class="fa-solid fa-volume-up"></i> Ler Conteúdo';
            button.setAttribute('aria-label', 'Clique para ler o conteúdo completo desta página');
            
            const wrapper = document.createElement('div');
            wrapper.classList.add('read-aloud-button-wrapper'); 
            wrapper.appendChild(button);

            const firstContentElement = page.querySelector('.section-description') || page.querySelector('.topic-container');
            
            if (firstContentElement) {
                firstContentElement.parentNode.insertBefore(wrapper, firstContentElement);

                button.addEventListener('click', () => {
                    readPageContent(page.id, button);
                });
            }
        }
    });
}

document.addEventListener('navigateRequest', (e) => {
    const { pageId, anchorId } = e.detail;
    if (pageId) {
        navigateTo(pageId, anchorId);
    }
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const pageId = link.dataset.page;
        if (!pageId) return; 

        e.preventDefault(); 

        const href = link.getAttribute('href');
        let anchorId = null;

        if (href && href.startsWith('#') && href.length > 1) {
            anchorId = href;
        }

        navigateTo(pageId, anchorId); 

        closeMobileMenu();

        if (menuItems && typeof closeMenu === 'function') {
            menuItems.forEach(menuItem => {
                closeMenu(menuItem);
            });
        }
    });
});


// =======================================================
// ✅ LÓGICA DO CARROSSEL DO HERO
// =======================================================
function setupHeroCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.carousel-dots button');
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');

    if (slides.length <= 1) { 
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (dots.length > 0) document.querySelector('.carousel-dots').style.display = 'none';
        return;
    }

    let currentSlide = 0;
    let slideInterval;

    function showSlide(n) {
        if (n >= slides.length) { n = 0; }
        if (n < 0) { n = slides.length - 1; }

        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[n].classList.add('active');
        dots[n].classList.add('active');

        currentSlide = n;
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetInterval();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetInterval();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetInterval();
        });
    });

    function startInterval() {
        slideInterval = setInterval(nextSlide, 5000); 
    }

    function resetInterval() {
        clearInterval(slideInterval);
        startInterval();
    }

    showSlide(0); 
    startInterval(); 
}

// =======================================================
// GRÁFICO DE BARRAS (SEÇÃO ADULTO)
// =======================================================
function animateChartBars() {
    const charts = document.querySelectorAll('.interactive-chart');

    charts.forEach(chart => {
        const bars = chart.querySelectorAll('.chart-bar');

        if (typeof gsap !== 'undefined' && window.innerWidth > 1024) {
            gsap.set(bars, {
                width: "0%",
                autoAlpha: 1
            });

            ScrollTrigger.create({
                trigger: chart, 
                start: "top 80%", 
                once: true, 
                onEnter: () => {
                    gsap.to(bars, {
                        duration: 1.5, 
                        width: (i, target) => target.dataset.value.replace(',', '.') + "%",
                        ease: "power2.out", 
                        stagger: 0.1 
                    });
                }
            });
        } else {
            // Mobile: mostra barras cheias direto
            bars.forEach(bar => {
                bar.style.width = bar.dataset.value.replace(',', '.') + "%";
                bar.style.opacity = "1";
            });
        }
    });
}

// --- 5. LÓGICA DE ANIMAÇÃO (GSAP) - OTIMIZADA E SEGURA ---
if (typeof gsap !== 'undefined') {
    
    // SE FOR MOBILE (Telas menores que 1024px):
    if (window.innerWidth <= 1024) {
        const hiddenElements = document.querySelectorAll(".gs_reveal");
        hiddenElements.forEach(el => {
            el.classList.remove("gs_reveal");
            el.style.opacity = "1";
            el.style.visibility = "visible";
            el.style.transform = "none";
        });
        
        const topicBlocks = document.querySelectorAll('.topic-block');
        topicBlocks.forEach(el => {
            el.style.opacity = "1";
            el.style.visibility = "visible";
            el.style.transform = "none";
        });
    } 
    // SE FOR DESKTOP:
    else {
        gsap.registerPlugin(ScrollTrigger);

        function animateFrom(elem, direction = 1, distance = 50) {
            let y = direction * distance;
            gsap.fromTo(elem, { y: y, autoAlpha: 0 }, {
                duration: 1.25,
                y: 0,
                autoAlpha: 1,
                ease: "expo.out",
                overwrite: "auto"
            });
        }

        function hide(elem) {
            gsap.set(elem, { autoAlpha: 0 });
        }

        gsap.utils.toArray(".gs_reveal").forEach(function (elem) {
            hide(elem); 

            let direction = 1; 
            let distance = 50;

            if (elem.classList.contains('gs_reveal_fromLeft') || elem.classList.contains('gs_reveal_fromRight')) {
                const xDistance = elem.classList.contains('gs_reveal_fromLeft') ? -100 : 100;
                ScrollTrigger.create({
                    trigger: elem,
                    start: "top 85%",
                    once: true,
                    onEnter: () => {
                        gsap.fromTo(elem, { x: xDistance, autoAlpha: 0 }, {
                            duration: 1.25,
                            x: 0,
                            autoAlpha: 1,
                            ease: "expo.out",
                            overwrite: "auto"
                        });
                    }
                });
                return; 
            }

            ScrollTrigger.create({
                trigger: elem,
                start: "top 85%",
                once: true,
                onEnter: () => animateFrom(elem, direction, distance),
                markers: false
            });
        });

        // Animação dos blocos de texto (Tópicos)
        const topicBlocks = gsap.utils.toArray('#adolescencia .topic-block');
        if (topicBlocks.length > 0) {
            gsap.set(topicBlocks, { autoAlpha: 0, y: 50 });

            ScrollTrigger.create({
                trigger: "#adolescencia .topic-container",
                start: "top 75%",
                end: "bottom 25%",
                markers: false,
                onEnter: () => {
                    gsap.to(topicBlocks, {
                        duration: 0.8,
                        autoAlpha: 1,
                        y: 0,
                        stagger: 0.15,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                },
                onLeaveBack: () => {
                    gsap.set(topicBlocks, { autoAlpha: 0, y: 50 });
                }
            });
        }
    }
}

// --- 6. LÓGICA DO CARROSSEL 3D (NUTRIENTES) ---
const carouselWrapperNutrients = document.querySelector('#adolescencia .carousel-wrapper');
const gridNutrients = document.querySelector('#adolescencia .grid-nutrients');
const cardsNutrients = document.querySelectorAll('#adolescencia .flip-card');
const prevButtonNutrients = document.querySelector('#adolescencia .prev-card');
const nextButtonNutrients = document.querySelector('#adolescencia .next-card');

if (carouselWrapperNutrients && gridNutrients && cardsNutrients.length > 0 && prevButtonNutrients && nextButtonNutrients) {
    let currentIndexNutrients = 0;
    const totalCardsNutrients = cardsNutrients.length;
    const gapNutrients = parseFloat(window.getComputedStyle(gridNutrients).gap) || 30;

    function getCardWidth() {
        if (cardsNutrients.length > 0) {
            return cardsNutrients[0].offsetWidth;
        }
        return 0;
    }

    function updateNutrientsCarousel() {
        const cardWidth = getCardWidth();
        if (cardWidth === 0) {
            setTimeout(updateNutrientsCarousel, 100);
            return;
        }

        const wrapperWidth = carouselWrapperNutrients.clientWidth;
        const visibleCards = Math.max(1, Math.floor((wrapperWidth + gapNutrients) / (cardWidth + gapNutrients)));
        const maxIndex = Math.max(0, totalCardsNutrients - visibleCards);

        if (currentIndexNutrients > maxIndex) {
            currentIndexNutrients = maxIndex;
        }

        const totalGridWidth = (cardWidth * totalCardsNutrients) + (gapNutrients * (totalCardsNutrients - 1));
        const maxScroll = Math.max(0, totalGridWidth - wrapperWidth);
        let targetOffset = currentIndexNutrients * (cardWidth + gapNutrients);

        if (targetOffset > maxScroll) {
            targetOffset = maxScroll;
        }

        gridNutrients.style.transform = `translateX(-${targetOffset}px)`;
        gridNutrients.style.transition = 'transform 0.5s ease-out';

        prevButtonNutrients.disabled = currentIndexNutrients === 0;
        nextButtonNutrients.disabled = targetOffset >= (maxScroll - 1);
    }

    prevButtonNutrients.addEventListener('click', () => {
        if (currentIndexNutrients > 0) {
            currentIndexNutrients--;
            updateNutrientsCarousel();
        }
    });

    nextButtonNutrients.addEventListener('click', () => {
        if (!nextButtonNutrients.disabled) {
            currentIndexNutrients++;
            updateNutrientsCarousel();
        }
    });

    window.addEventListener('resize', () => {
        gridNutrients.style.transition = 'none';
        updateNutrientsCarousel();
    });

    setTimeout(updateNutrientsCarousel, 50);

} else if (prevButtonNutrients && nextButtonNutrients) {
    prevButtonNutrients.style.display = 'none';
    nextButtonNutrients.style.display = 'none';
}


/* =======================================================
 * CONTROLE GERAL DOS JOGOS
 * ======================================================= */

function showGameCover() {
    document.body.classList.remove('game-modal-open');
    document.querySelectorAll('.game-container-wrapper').forEach(container => {
        container.classList.remove('active');
    });
    document.querySelectorAll('.game-modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
}

function launchGame(containerId, gameInitializerFunction) {
    document.body.classList.add('game-modal-open');

    document.querySelectorAll('.game-container-wrapper').forEach(container => {
        if (container.id !== containerId) {
            container.classList.remove('active');
        }
    });

    const gameContainer = document.getElementById(containerId);
    if (gameContainer) {
        gameContainer.classList.add('active');

        const gameArea = gameContainer.querySelector('.game-area');
        if (gameArea) {
            gameArea.classList.add('active');
        } 

        if (gameInitializerFunction && typeof gameInitializerFunction === 'function') {
            try {
                gameInitializerFunction();
            } catch (error) {
                console.error(`Erro ao inicializar o jogo ${containerId}:`, error);
                showGameCover();
            }
        } 

    } else {
        document.body.classList.remove('game-modal-open');
    }
}

document.querySelector('#classify-game-area-embedded .game-restart-btn')?.addEventListener('click', () => {
    if (typeof EmbeddedClassifyGame !== 'undefined' && EmbeddedClassifyGame.init) EmbeddedClassifyGame.init();
});


/* =======================================================
 * LÓGICA DA CALCULADORA DE HIDRATAÇÃO (IDOSO)
 * ======================================================= */
function setupHydrationCalculator() {
    const calcContainer = document.getElementById('hydration-calculator');
    if (!calcContainer) return; 

    const btnMenos = document.getElementById('btn-peso-menos');
    const btnMais = document.getElementById('btn-peso-mais');
    const displayPeso = document.getElementById('display-peso');

    const ageButtons = document.querySelectorAll('.age-button');
    const btnCalcular = document.getElementById('calcHidratacaoBtn');

    const displayLitros = document.getElementById('calcLitros');
    const displayCopos = document.getElementById('calcCopos');
    const displayDisclaimer = document.getElementById('calc-disclaimer');

    let currentPeso = 70;
    let currentMlPorKg = 30; 
    let currentAnimation = null; 

    function updatePesoDisplay() {
        if (displayPeso) displayPeso.textContent = currentPeso;
    }

    if (btnMenos) {
        btnMenos.addEventListener('click', () => {
            if (currentPeso > 20) { 
                currentPeso--;
                updatePesoDisplay();
            }
        });
    }

    if (btnMais) {
        btnMais.addEventListener('click', () => {
            if (currentPeso < 200) { 
                currentPeso++;
                updatePesoDisplay();
            }
        });
    }

    ageButtons.forEach(button => {
        button.addEventListener('click', () => {
            ageButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentMlPorKg = parseInt(button.dataset.value, 10);
        });
    });

    if (btnCalcular) {
        btnCalcular.addEventListener('click', () => {
            const totalMl = currentPeso * currentMlPorKg;
            const totalLitros = (totalMl / 1000); 
            const totalCopos = Math.ceil(totalMl / 250);

            if (typeof gsap !== 'undefined') {
                let counter = { value: 0 }; 

                if (displayLitros && displayLitros.textContent) {
                    let currentText = displayLitros.textContent.split(' ')[0].replace(',', '.');
                    let currentValue = parseFloat(currentText);
                    if (!isNaN(currentValue)) {
                        counter.value = currentValue; 
                    }
                }

                if (currentAnimation) {
                    currentAnimation.kill();
                }

                currentAnimation = gsap.to(counter, {
                    duration: 1.2, 
                    value: totalLitros,
                    ease: "power2.out",
                    onUpdate: () => {
                        if (displayLitros) {
                            displayLitros.textContent = `${counter.value.toFixed(2).replace('.', ',')} Litros`;
                        }
                    },
                    onComplete: () => {
                        currentAnimation = null; 
                    }
                });

                if (displayCopos) {
                    displayCopos.innerHTML = ''; 
                    let copoElements = []; 

                    if (totalCopos > 0) {
                        for (let i = 0; i < totalCopos; i++) {
                            const copoIcon = document.createElement('i');
                            copoIcon.className = 'fa-solid fa-droplet';

                            if (i < 15) { 
                                displayCopos.appendChild(copoIcon);
                                copoElements.push(copoIcon); 
                            }
                        }
                        if (totalCopos > 15) {
                            const extraText = document.createElement('span');
                            extraText.textContent = ` +${totalCopos - 15}`;
                            extraText.style.fontSize = '0.7em';
                            extraText.style.fontWeight = 'bold';
                            extraText.style.marginLeft = '5px';
                            displayCopos.appendChild(extraText);
                        }
                    }

                    gsap.fromTo(copoElements, {
                        opacity: 0,
                        scale: 0.5,
                        y: -10 
                    }, {
                        duration: 0.3, 
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        ease: "back.out(1.7)",
                        stagger: 0.08, 
                        delay: 0.2 
                    });
                }
            } else {
                if (displayLitros) displayLitros.textContent = `${totalLitros.toFixed(2).replace('.', ',')} Litros`;
                if (displayCopos) {
                    displayCopos.innerHTML = ''; 
                    if (totalCopos > 0) {
                        for (let i = 0; i < totalCopos; i++) {
                           
                        }
                    }
                }
            }

            if (displayDisclaimer) {
                displayDisclaimer.style.display = 'none';
            }
        });
    }

    updatePesoDisplay();
}


// ===============================================
// ==== LÓGICA DO PLANEJADOR DE LANCHES (ADULTO) =====
// ===============================================

function setupSnackPlanner() {
    const plannerDays = document.querySelectorAll('.planner-day');
    const modal = document.getElementById('snack-selector-modal');
    const modalTitle = document.getElementById('snack-modal-title');
    const optionButtons = document.querySelectorAll('.snack-option-btn');
    const closeModalBtn = document.querySelector('#snack-selector-modal .game-close-btn');
    const resetBtn = document.getElementById('planner-reset-btn');
    const downloadBtn = document.getElementById('planner-download-btn'); 

    if (plannerDays.length === 0 || !modal || optionButtons.length === 0 || !resetBtn || !downloadBtn) {
        return; 
    }

    let currentDayElement = null;
    const weekDayNames = {
        seg: 'Segunda-feira',
        ter: 'Terça-feira',
        qua: 'Quarta-feira',
        qui: 'Quinta-feira',
        sex: 'Sexta-feira',
        sab: 'Sábado',
        dom: 'Domingo'
    };

    function openModal(dayElement) {
        currentDayElement = dayElement;
        const dayKey = currentDayElement.dataset.day;
        modalTitle.textContent = `Escolha seu lanche para: ${weekDayNames[dayKey]}`;
        modal.classList.add('active');
        document.body.classList.add('game-modal-open');
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.classList.remove('game-modal-open');
        currentDayElement = null;
    }

    function generateDownload() {
        const date = new Date().toLocaleDateString('pt-BR');
        let content = "=== Meu Plano Semanal de Lanches (Alimentando Fases) ===\n";
        content += `Gerado em: ${date}\n\n`;

        let allEmpty = true;

        plannerDays.forEach(day => {
            const dayName = day.querySelector('h5').textContent;
            const choice = day.querySelector('.planner-choice span').textContent;

            let line = `${dayName}: `;

            if (day.classList.contains('filled')) {
                line += choice + " (Lanche Inteligente)";
                allEmpty = false;
            } else if (day.classList.contains('off-day')) {
                line += choice + " (Dia de Descanso)";
                allEmpty = false;
            } else {
                line += "Não Planejado";
            }
            content += line + "\n";
        });

        if (allEmpty) {
            alert("O plano está vazio! Escolha suas opções antes de baixar.");
            return;
        }

        content += "\n========================================================\n";
        content += "Lembre-se: Hidratação e planejamento são a chave para o sucesso na rotina adulta!";

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `Plano_Lanches_Semana_${date.replace(/\//g, '-')}.txt`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); 
    }

    plannerDays.forEach(day => {
        day.addEventListener('click', () => {
            openModal(day);
        });
    });

    optionButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentDayElement) {
                const choiceText = button.dataset.snack;
                const choiceSpan = currentDayElement.querySelector('.planner-choice span');

                currentDayElement.classList.remove('filled', 'off-day');
                currentDayElement.querySelector('.planner-choice i').style.display = 'block';

                if (choiceText === "Folga") {
                    choiceSpan.textContent = choiceText;
                    currentDayElement.classList.add('off-day');
                    currentDayElement.querySelector('.planner-choice i').style.display = 'none';

                } else if (choiceText) {
                    choiceSpan.textContent = choiceText;
                    currentDayElement.classList.add('filled');
                    currentDayElement.querySelector('.planner-choice i').style.display = 'none';

                } else {
                    choiceSpan.textContent = 'Clique para escolher';
                }
            }
            closeModal();
        });
    });

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    resetBtn.addEventListener('click', () => {
        plannerDays.forEach(day => {
            day.querySelector('.planner-choice span').textContent = 'Clique para escolher';
            day.querySelector('.planner-choice i').style.display = 'block';
            day.classList.remove('filled', 'off-day');
        });
    });

    downloadBtn.addEventListener('click', generateDownload);
}


/* =======================================================
 * FUNÇÃO DE CONFETE
 * ======================================================= */
function triggerConfetti(modalElement) {
    if (typeof confetti !== 'function' || !modalElement) {
        console.warn('Biblioteca de confete não carregada ou modal inválido.');
        return;
    }

    const icon = modalElement.querySelector('.win-icon');
    setTimeout(() => {
        let origin = { y: 0.6, x: 0.5 };
        if (icon) {
            const rect = icon.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                origin = {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight
                };
            }
        }
        confetti({
            particleCount: 150,
            spread: 90,
            colors: ['#53954a', '#6e513d', '#f9efd4', '#FFFFFF'],
            origin: origin,
            zIndex: 3000
        });
    }, 450);
}


/* =======================================================
 * LÓGICA JOGO DE CLASSIFICAR (EMBUTIDO NA INFÂNCIA)
 * ======================================================= */

const EmbeddedClassifyGame = {
    foodItemsData: [
        { name: 'Maçã', imageSrc: 'Imagens/maca.webp', category: 'natura' },
        { name: 'Brócolis', imageSrc: 'Imagens/brocolis.webp', category: 'natura' },
        { name: 'Arroz', imageSrc: 'Imagens/arroz.webp', category: 'natura' },
        { name: 'Pão Francês', imageSrc: 'Imagens/pao.webp', category: 'processado' }, 
        { name: 'Queijo', imageSrc: 'Imagens/queijo.webp', category: 'processado' },
        { name: 'Geleia', imageSrc: 'Imagens/geleia.webp', category: 'processado' },
        { name: 'Salgadinho', imageSrc: 'Imagens/salgadinho.webp', category: 'ultra' },
        { name: 'Refrigerante', imageSrc: 'Imagens/refri.webp', category: 'ultra' },
        { name: 'Bolacha Recheada', imageSrc: 'Imagens/bolacha.webp', category: 'ultra' },
        { name: 'Nuggets', imageSrc: 'Imagens/nuggets.webp', category: 'ultra' },
    ],
    gameArea: null,
    foodBank: null,
    dropZones: null,
    scoreDisplay: null,
    winModal: null,
    remainingItems: 0,
    draggedItemElement: null,

    init: function () {
        this.gameArea = document.getElementById('classify-game-area-embedded');
        this.foodBank = this.gameArea?.querySelector('.classify-food-bank');
        this.dropZones = this.gameArea?.querySelectorAll('.classify-zone');
        this.scoreDisplay = document.getElementById('classify-score-embedded');
        this.winModal = document.getElementById('classify-win-modal'); 

        if (!this.gameArea || !this.foodBank || !this.dropZones || !this.scoreDisplay) {
            // console.error("Elementos do DOM do Jogo de Classificar EMBUTIDO não encontrados.");
            return; 
        }

        this.resetGame();
        if (this.winModal) this.winModal.classList.remove('active');

        this.foodBank.innerHTML = '';
        this.dropZones.forEach(zone => {
            zone.classList.remove('correct', 'incorrect', 'over');
            zone.removeEventListener('dragover', this.handleDragOver.bind(this));
            zone.removeEventListener('dragleave', this.handleDragLeave.bind(this));
            zone.removeEventListener('drop', this.handleDrop.bind(this));
        });

        const shuffledItems = this.shuffleArray([...this.foodItemsData]);
        shuffledItems.forEach(itemData => {
            const itemElement = this.createFoodItemElement(itemData);
            this.foodBank.appendChild(itemElement);
        });
        this.remainingItems = shuffledItems.length;
        this.updateScore();

        this.dropZones.forEach(zone => {
            zone.addEventListener('dragover', this.handleDragOver.bind(this));
            zone.removeEventListener('dragleave', this.handleDragLeave.bind(this));
            zone.addEventListener('drop', this.handleDrop.bind(this));
        });
    },

    createFoodItemElement: function (itemData) {
        const item = document.createElement('div');
        item.classList.add('classify-food-item');
        item.draggable = true;
        item.dataset.name = itemData.name;
        item.innerHTML = `<img src="${itemData.imageSrc}" alt="${itemData.name}">`;
        item.addEventListener('dragstart', this.handleDragStart.bind(this));
        item.addEventListener('dragend', this.handleDragEnd.bind(this));
        return item;
    },

    handleDragStart: function (event) {
        const targetItem = event.target.closest('.classify-food-item');
        if (!targetItem) return;
        this.draggedItemElement = targetItem;
        event.dataTransfer.setData('text/plain', targetItem.dataset.name);
        setTimeout(() => targetItem.classList.add('dragging'), 0);
    },

    handleDragEnd: function (event) {
        const targetItem = event.target.closest('.classify-food-item');
        if (!targetItem) return;
        targetItem.classList.remove('dragging');
        this.draggedItemElement = null;
    },

    handleDragOver: function (event) {
        event.preventDefault();
        const zone = event.target.closest('.classify-zone');
        if (zone) {
            zone.classList.add('over');
        }
    },

    handleDragLeave: function (event) {
        const zone = event.target.closest('.classify-zone');
        if (zone) {
            zone.classList.remove('over');
        }
    },

    handleDrop: function (event) {
        event.preventDefault();
        const zone = event.target.closest('.classify-zone');
        if (!zone || !this.draggedItemElement) return;

        const foodName = event.dataTransfer.getData('text/plain');
        const targetCategory = zone.dataset.category;
        const foodData = this.foodItemsData.find(item => item.name === foodName);

        zone.classList.remove('over');

        if (foodData && foodData.category === targetCategory) {
            zone.classList.add('correct');
            this.draggedItemElement.classList.add('hide');
            this.draggedItemElement.draggable = false;
            this.remainingItems--;
            this.updateScore();
            this.checkWinCondition();
            setTimeout(() => zone.classList.remove('correct'), 500);
        } else {
            zone.classList.add('incorrect');
            setTimeout(() => zone.classList.remove('incorrect'), 500);
        }
        this.draggedItemElement = null;
    },

    updateScore: function () {
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = `Itens restantes: ${this.remainingItems}`;
        }
    },

    checkWinCondition: function () {
        if (this.remainingItems === 0) {
            this.showWinModal();
        }
    },

    showWinModal: function () {
        if (this.winModal) {
            this.winModal.classList.add('active');
            triggerConfetti(this.winModal);
        }
    },

    resetGame: function () {
        this.remainingItems = 0;
        this.draggedItemElement = null;
        if (this.dropZones) {
            this.dropZones.forEach(zone => zone.classList.remove('correct', 'incorrect', 'over'));
        }
    },

    shuffleArray: function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};


/* =======================================================
 * GUIA INTERATIVO (HIGIENE DAS MÃOS)
 * ======================================================= */
function setupHandwashGuide() {
    const handWashSteps = [
        {
            icon: 'fa-faucet',
            title: 'Passo 1 de 5',
            text: 'Molhe as mãos com água corrente.'
        },
        {
            icon: 'fa-pump-soap',
            title: 'Passo 2 de 5',
            text: 'Aplique sabão suficiente para cobrir toda a superfície das mãos.'
        },
        {
            icon: 'fa-hand-sparkles',
            title: 'Passo 3 de 5',
            text: 'Esfregue as mãos por pelo menos 20 segundos (palmas, costas, dedos, unhas e punhos).'
        },
        {
            icon: 'fa-faucet-drip',
            title: 'Passo 4 de 5',
            text: 'Enxágue as mãos completamente com água corrente.'
        },
        {
            icon: 'fa-scroll',
            title: 'Passo 5 de 5',
            text: 'Seque as mãos com uma toalha limpa ou secador de mãos.'
        }
    ];

    const guide = document.querySelector('.handwash-guide');
    if (!guide) return; 

    const prevBtn = document.getElementById('btn-prev-step');
    const nextBtn = document.getElementById('btn-next-step');
    const stepCounter = document.getElementById('step-counter');

    const iconEl = guide.querySelector('.guide-icon i');
    const titleEl = guide.querySelector('.guide-step-title');
    const textEl = guide.querySelector('.guide-step-text');

    let currentStep = 0;

    function updateStep(stepIndex) {
        const stepData = handWashSteps[stepIndex];

        textEl.classList.add('fade-out');
        iconEl.classList.add('fade-out'); 

        setTimeout(() => {
            iconEl.className = `fa-solid ${stepData.icon}`; 
            titleEl.textContent = stepData.title;
            textEl.textContent = stepData.text;
            stepCounter.textContent = `${stepIndex + 1} / ${handWashSteps.length}`;

            prevBtn.disabled = (stepIndex === 0);
            nextBtn.disabled = (stepIndex === handWashSteps.length - 1);

            textEl.classList.remove('fade-out');
            iconEl.classList.remove('fade-out');
        }, 300); 
    }

    nextBtn.addEventListener('click', () => {
        if (currentStep < handWashSteps.length - 1) {
            currentStep++;
            updateStep(currentStep);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateStep(currentStep);
        }
    });
}


/* =======================================================
 * LÓGICA DO MAPA INTERATIVO (JORNADA DOS SABORES)
 * ======================================================= */

const originMapData = {
    'indigena': {
        title: 'Matriz Indígena',
        imageSrc: 'Imagens/icone-indigena.webp',
        altText: 'Ícone da Matriz Indígena',
        color: 'var(--color-primary)', 
        bgColor: '#f0fdf4', 
        items: [
            { icon: 'fa-seedling', text: 'Mandioca (Farinha, Beiju, Polvilho)' },
            { icon: 'fa-mortar-pestle', text: 'Paçoca (Mistura original)' },
            { icon: 'fa-apple-whole', text: 'Frutos Nativos (Açaí, Pequi, Cupuaçu)' },
            { icon: 'fa-leaf', text: 'Conhecimento da Terra e das Estações' }
        ]
    },
    'portuguesa': {
        title: 'Matriz Portuguesa',
        imageSrc: 'Imagens/icone-portuguesa.webp',
        altText: 'Ícone da Matriz Portuguesa',
        color: 'var(--color-secondary)', 
        bgColor: 'var(--color-background)', 
        items: [
            { icon: 'fa-utensils', text: 'Adaptação de Pratos (Ex: Feijoada)' },
            { icon: 'fa-wheat-awn', text: 'Introdução do Arroz' },
            { icon: 'fa-wine-bottle', text: 'Azeite de Oliva, Alho e Cebola' },
            { icon: 'fa-users', text: 'Hábito do Almoço de Domingo' }
        ]
    },
    'africana': {
        title: 'Matriz Africana',
        imageSrc: 'Imagens/icone-africana.webp',
        altText: 'Ícone da Matriz Africana',
        color: '#d97706', 
        bgColor: '#fffbeb', 
        items: [
            { icon: 'fa-oil-can', text: 'Azeite de Dendê' },
            { icon: 'fa-mug-hot', text: 'Leite de Coco' },
            { icon: 'fa-drumstick-bite', text: 'Vatapá e Caruru' },
            { icon: 'fa-mug-hot', text: 'Adaptação da Canjica (Kanzika)' }
        ]
    }
};

function closeOriginModal() {
    const modal = document.getElementById('origin-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('game-modal-open');
    }
}

function populateOriginModal(data) {
    const modal = document.getElementById('origin-modal');
    if (!modal) return;

    const modalContent = modal.querySelector('.game-modal-content');
    const titleEl = document.getElementById('origin-modal-title');
    const iconEl = document.getElementById('origin-modal-icon'); 
    const listEl = document.getElementById('origin-modal-list');
    
    titleEl.textContent = data.title;
    iconEl.src = data.imageSrc;
    iconEl.alt = data.altText;

    listEl.innerHTML = '';

    data.items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fa-solid ${item.icon}" aria-hidden="true"></i> ${item.text}`;
        listEl.appendChild(li);
    });

    modalContent.style.borderColor = data.color;

    modal.classList.add('active');
    document.body.classList.add('game-modal-open');
}

function setupOriginMap() {
    const hotspots = document.querySelectorAll('.map-hotspot');
    const modal = document.getElementById('origin-modal');

    if (typeof gsap !== 'undefined' && hotspots.length > 0) {
        // Otimização Mobile: Se a tela for maior que 1024px, anima. Senão, mostra direto.
        if (window.innerWidth > 1024) {
            gsap.set(hotspots, { opacity: 0, scale: 0.5 });

            gsap.to(hotspots, {
                duration: 0.8, 
                opacity: 1,
                scale: 1,
                ease: "back.out(1.7)", 
                stagger: 0.2, 
                scrollTrigger: {
                    trigger: ".origin-map-container", 
                    start: "top 75%", 
                    toggleActions: "play none none none" 
                }
            });
        } else {
            // Mobile: Força visibilidade
            hotspots.forEach(h => {
                h.style.opacity = "1";
                h.style.transform = "scale(1)";
            });
        }
    }

    if (!hotspots.length || !modal) return; 

    const closeBtn = modal.querySelector('.game-close-btn');

    hotspots.forEach(hotspot => {
        hotspot.addEventListener('click', () => {
            const matrizKey = hotspot.dataset.matriz;
            const data = originMapData[matrizKey];
            if (data) {
                populateOriginModal(data);
            }
        });
    });

    closeBtn.addEventListener('click', closeOriginModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeOriginModal();
        }
    });
}


/* =======================================================
 * LÓGICA DO FILTRO DA PÁGNA DE RECEITAS (COM MEMÓRIA)
 * ======================================================= */
function setupRecipeFilters() {
    const filterContainer = document.querySelector('.filter-bar');
    const recipePage = document.getElementById('receitas');

    // Verifica se a página de receitas está ativa e se os elementos existem
    if (!filterContainer || !recipePage || !recipePage.classList.contains('active')) {
        return;
    }

    const filterButtons = filterContainer.querySelectorAll('.filter-btn');
    const recipeCards = document.querySelectorAll('#recipe-grid .cards_item');

    // Função que esconde/mostra os cards
    const performFilter = (filter) => {
        recipeCards.forEach(card => {
            const categories = card.dataset.category; 
            // Se for 'todos' mostra tudo, senão verifica se a categoria existe no card
            if (filter === 'todos' || (categories && categories.includes(filter))) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    };

    // Adiciona o clique em cada botão (Lógica padrão)
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            performFilter(filter);
        });
    });

    /* === LÓGICA DE FILTRO SAZONAL (Rabanada) === */
    // Verifica se viemos de um clique que pediu um filtro específico
    const filtroSalvo = sessionStorage.getItem('filtroInicial');

    if (filtroSalvo) {
        // Se veio da Home clicando na Rabanada, ativa o botão correspondente (ex: Sazonal)
        const targetBtn = filterContainer.querySelector(`.filter-btn[data-filter="${filtroSalvo}"]`);
        
        if (targetBtn) {
            // Remove a classe active de todos e adiciona no alvo
            filterButtons.forEach(btn => btn.classList.remove('active'));
            targetBtn.classList.add('active');
            
            // Executa o filtro
            performFilter(filtroSalvo);
        }
        
        // Limpa a memória para não ficar preso nisso se o usuário recarregar a página depois
        sessionStorage.removeItem('filtroInicial');
    } else {
        // Comportamento padrão (Se não tiver aviso, abre na aba "Todos")
        const initialActiveButton = filterContainer.querySelector('.filter-btn[data-filter="todos"]');
        if (initialActiveButton) {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            initialActiveButton.classList.add('active');
            performFilter('todos');
        }
    }
}

// --- LÓGICA DE CELEBRAÇÃO DA DEDICATÓRIA (FORMATURA) ---
const dedicationBox = document.getElementById('class-dedication');
let confettiTimer = null;

if (dedicationBox && typeof triggerConfetti !== 'undefined') {
    dedicationBox.addEventListener('mouseenter', () => {
        if (confettiTimer) {
            return;
        }
        triggerConfetti(dedicationBox);
        confettiTimer = setTimeout(() => {
            confettiTimer = null;
        }, 2000);
    });
}

/* =======================================================
 * 📅 LÓGICA DA NOVA AGENDA (ATUALIZADA COM LINKS)
 * ======================================================= */
const FullPageCalendar = {
    date: new Date(),
    today: new Date(),
    
    // Lista de Eventos
    events: [
        { 
            date: "2025-10-23", 
            title: "Ação Infantil & Idosos", 
            type: "Ação", 
            desc: "Atividades lúdicas e roda de conversa.", 
            loc: "Escola Gilberto Freyre | Parque Santana",
            pageId: "acao-infancia-detalhe", 
            images: ["Imagens/acaoinfancia3.webp", "Imagens/acaoidosos4.webp"]
        },
        { 
            date: "2025-10-24", 
            title: "Ação Idosos (Dia 2)", 
            type: "Ação", 
            desc: "Continuação das atividades.", 
            loc: "Parque Santana",
            pageId: "acao-idoso-detalhe", 
            images: ["Imagens/acaoidosos1.webp"] 
        },
        { 
            date: "2025-11-03", 
            title: "Ação Adultos", 
            type: "Ação", 
            desc: "Saúde do trabalhador e DCNT.", 
            loc: "CDC",
            pageId: "acao-adulto-detalhe", 
            images: ["Imagens/acaoadultos1.webp"]
        },
        { 
            date: "2025-11-05", 
            title: "Ação Adultos (Dia 2)", 
            type: "Ação", 
            desc: "Palestras e avaliações.", 
            loc: "CDC",
            pageId: "acao-adulto-detalhe", 
            images: ["Imagens/acaoadultos2.webp"]
        },
        { 
            date: "2025-12-25", 
            title: "Natal", 
            type: "feriado", 
            desc: "Feriado Nacional.", 
            loc: "Em todo lugar", 
            time: "Dia Todo",
            images: ["Imagens/Farofa Festiva.webp", "Imagens/Rabanada de Forno.webp"]
        }
    ],

    // Inicialização
    init: function() {
        const container = document.getElementById('calendar-days-full');
        if(!container) return;

        const prevBtn = document.getElementById('prev-month-full');
        const nextBtn = document.getElementById('next-month-full');

        if(prevBtn) {
            const newPrev = prevBtn.cloneNode(true);
            prevBtn.parentNode.replaceChild(newPrev, prevBtn);
            newPrev.addEventListener('click', () => { 
                this.date.setMonth(this.date.getMonth() - 1); 
                this.render(); 
            });
        }
        
        if(nextBtn) {
            const newNext = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newNext, nextBtn);
            newNext.addEventListener('click', () => { 
                this.date.setMonth(this.date.getMonth() + 1); 
                this.render(); 
            });
        }

        this.render();
    },

    // Renderiza os dias do mês
    render: function() {
        const monthYear = document.getElementById('current-month-full');
        const daysContainer = document.getElementById('calendar-days-full');
        
        this.date.setDate(1); 

        const month = this.date.getMonth();
        const year = this.date.getFullYear();
        
        const lastDay = new Date(year, month + 1, 0).getDate();
        const prevLastDay = new Date(year, month, 0).getDate();
        const firstDayIndex = this.date.getDay();
        
        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        
        if(monthYear) monthYear.innerText = `${months[month]} ${year}`;
        if(daysContainer) daysContainer.innerHTML = "";

        for (let x = firstDayIndex; x > 0; x--) {
            daysContainer.innerHTML += `<li class="inactive">${prevLastDay - x + 1}</li>`;
        }

        for (let i = 1; i <= lastDay; i++) {
            let li = document.createElement('li');
            let content = `<span>${i}</span>`; 
            
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
            
            if (i === this.today.getDate() && month === this.today.getMonth() && year === this.today.getFullYear()) {
                li.classList.add('current-day');
            }

            const event = this.events.find(e => e.date === dateStr);
            
            if (event) {
                li.classList.add('has-event', `type-${event.type}`);
                li.setAttribute('data-title', event.title); 
                
                let iconClass = 'fa-circle';
                if(event.type === 'Ação') iconClass = 'fa-handshake'; 
                if(event.type === 'feriado') iconClass = 'fa-star';   
                
                content += `<div class="event-icon-marker"><i class="fa-solid ${iconClass}"></i></div>`;
            }

            li.innerHTML = content;

            li.addEventListener('click', () => {
                document.querySelectorAll('.days-full li').forEach(el => el.classList.remove('selected-day'));
                li.classList.add('selected-day');
                this.showDetails(i, month, months, event);
            });

            daysContainer.appendChild(li);
        }

        // Seção de animação: Só roda se a tela for maior que 1024px para otimizar mobile
        if (typeof gsap !== 'undefined' && window.innerWidth > 1024) {
            gsap.fromTo(".days-full li", 
                { opacity: 0, y: 20, scale: 0.9 }, 
                { duration: 0.4, opacity: 1, y: 0, scale: 1, stagger: 0.03, ease: "back.out(1.5)" }
            );
        } else {
            // No mobile, garante que esteja visível
            const allLi = document.querySelectorAll(".days-full li");
            allLi.forEach(li => { li.style.opacity = 1; li.style.transform = "none"; });
        }
    },

    // Mostra os detalhes
    showDetails: function(day, monthIndex, monthNames, event) {
        const display = document.getElementById('event-card-display');
        const fullDate = `${day} de ${monthNames[monthIndex]}`;

        if (event) {
            let iconClass = 'fa-calendar-check';
            if(event.type === 'Ação') iconClass = 'fa-users';
            if(event.type === 'feriado') iconClass = 'fa-star';

            // Link do Google Agenda
            const googleDate = event.date.replace(/-/g, '') + 'T090000';
            const googleDateEnd = event.date.replace(/-/g, '') + 'T120000';
            const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.desc)}&location=${encodeURIComponent(event.loc)}&dates=${googleDate}/${googleDateEnd}`;

            let galleryHTML = '';
            if (event.images && event.images.length > 0) {
                galleryHTML = '<div class="event-gallery-stack">';
                event.images.forEach(imgSrc => {
                    galleryHTML += `<div class="gallery-stack-item"><img src="${imgSrc}" alt="Foto do evento"></div>`;
                });
                galleryHTML += '</div>';
            } else {
                galleryHTML = '<div class="event-feature-image" style="height: 50px; background: transparent; box-shadow: none;"></div>';
            }

            let actionButtonHTML = '';
            if (event.type === 'Ação' && event.pageId) {
                actionButtonHTML = `
                    <a href="#" onclick="navigateTo('${event.pageId}'); return false;" class="cta-button" style="padding: 10px 20px; font-size:0.9em; flex:1; text-align:center;">
                        Ver Relato Completo
                    </a>
                `;
            }

            display.innerHTML = `
                <div class="event-card-full">
                    ${galleryHTML} <span class="date-badge">${fullDate}</span>
                    <h2>${event.title}</h2>
                    <p>${event.desc}</p>
                    
                    <div class="event-meta-grid">
                        <div class="meta-item">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${event.loc}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fa-solid ${iconClass}"></i>
                            <span style="text-transform: capitalize;">${event.type}</span>
                        </div>
                    </div>

                    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px;">
                        ${actionButtonHTML}
                        
                        <a href="${googleUrl}" target="_blank" class="cta-button" style="background: #fff; color: var(--color-primary) !important; border: 2px solid var(--color-primary); padding: 10px 20px; font-size:0.9em; flex:1; display: flex; align-items: center; justify-content: center; gap: 8px; text-align:center;">
                            <i class="fa-solid fa-calendar-plus"></i> Salvar
                        </a>
                    </div>
                </div>
            `;
        } else {
            display.innerHTML = `
                <div class="empty-state-full">
                    <i class="fa-regular fa-calendar"></i>
                    <h4 style="color: var(--color-secondary);">${fullDate}</h4>
                    <p>Não há eventos agendados para este dia.</p>
                </div>
            `;
        }
    }
};

// =======================================================
// CHAMADAS GERAIS
// =======================================================

setupHeroCarousel();

document.addEventListener('DOMContentLoaded', () => {
    setupTextToSpeech();
});


/* =======================================================
 * ✅ LÓGICA DE PERFIL E COMUNIDADE (TIMELINE)
 * ======================================================= */

// 1. Função que busca e desenha os posts
async function loadUserTimeline(targetUid) {
    const timelineTab = document.getElementById('tab-timeline');
    if (!timelineTab) return;

    let postsContainer = document.getElementById('profile-posts-list');
    const emptyState = timelineTab.querySelector('.empty-state-journey');

    // Cria o container de posts se não existir
    if (!postsContainer) {
        postsContainer = document.createElement('div');
        postsContainer.id = 'profile-posts-list';
        postsContainer.style.marginTop = '20px';
        postsContainer.style.display = 'flex';
        postsContainer.style.flexDirection = 'column';
        postsContainer.style.gap = '20px';
        
        if (emptyState && emptyState.parentNode) {
            emptyState.parentNode.insertBefore(postsContainer, emptyState.nextSibling);
        } else {
            timelineTab.appendChild(postsContainer);
        }
    }

    if (!targetUid) return;
    
    postsContainer.innerHTML = '<p style="text-align:center; color:#888; padding:20px;">Carregando publicações...</p>';

    try {
        // Busca posts deste usuário específico no Firebase
        const db = firebase.firestore();
        const snapshot = await db.collection('posts')
            .where('authorId', '==', targetUid)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        postsContainer.innerHTML = ''; 

        if (snapshot.empty) {
            if(emptyState) emptyState.style.display = 'block';
            postsContainer.style.display = 'none';
        } else {
            if(emptyState) emptyState.style.display = 'none';
            postsContainer.style.display = 'flex';

            snapshot.forEach(doc => {
                const post = doc.data();
                const date = post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString('pt-BR') : 'Recente';

                const card = document.createElement('article');
                card.style.cssText = `background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e6dac0; box-shadow: 0 2px 5px rgba(0,0,0,0.05);`;
                
                card.innerHTML = `
                    <div style="font-size: 1rem; color: #333; margin-bottom: 10px; line-height: 1.5;">${post.content}</div>
                    ${post.image ? `<img src="${post.image}" style="width: 100%; border-radius: 8px; margin-bottom: 15px; max-height: 300px; object-fit: cover;">` : ''}
                    <div style="display: flex; gap: 20px; color: #888; font-size: 0.85rem; border-top: 1px solid #eee; padding-top: 10px;">
                        <span><i class="fa-regular fa-clock"></i> ${date}</span>
                        <span><i class="fa-solid fa-heart" style="color: ${post.likes && post.likes.length ? '#d92d2d' : '#ccc'}"></i> ${post.likes ? post.likes.length : 0}</span>
                    </div>
                `;
                postsContainer.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Erro timeline:", error);
    }
}

// 2. Inicialização do Firebase e Lógica de Usuário
document.addEventListener('DOMContentLoaded', () => {
    
    if (typeof firebase === 'undefined' || !firebase.auth || !firebase.firestore) {
        console.warn("Firebase SDK ausente.");
        return;
    }

    const auth = firebase.auth();
    const db = firebase.firestore();
    let currentUserData = null; 

    // --- ABAS DO PERFIL ---
    const tabs = document.querySelectorAll('.j-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if(targetEl) {
                targetEl.classList.remove('hidden');
                targetEl.classList.add('active');
            }
        });
    });

    // --- MODAL DE EDIÇÃO ---
    const btnOpenEdit = document.getElementById('btn-open-edit');
    const modalEdit = document.getElementById('edit-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    
    if(btnOpenEdit) {
        btnOpenEdit.addEventListener('click', () => {
            if(modalEdit) {
                modalEdit.classList.add('open');
                if(currentUserData) {
                    const iUser = document.getElementById('input-username');
                    const iReal = document.getElementById('input-realname');
                    const iBio = document.getElementById('input-bio');
                    if(iUser) iUser.value = currentUserData.username || '';
                    if(iReal) iReal.value = currentUserData.realname || '';
                    if(iBio) iBio.value = currentUserData.bio || '';
                }
            }
        });
    }
    if(btnCloseModal && modalEdit) btnCloseModal.addEventListener('click', () => modalEdit.classList.remove('open'));

    // --- LOGIN ---
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const doc = await db.collection('users').doc(user.uid).get();
                if (doc.exists) {
                    currentUserData = doc.data();
                    updateProfileUI(currentUserData, user.uid);
                } else {
                    const newData = {
                        username: user.email.split('@')[0],
                        realname: user.displayName || 'Viajante',
                        photo: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`,
                        achievements: ['welcome_fases'],
                        followers: [],
                        following: [],
                        postsCount: 0
                    };
                    await db.collection('users').doc(user.uid).set(newData);
                    currentUserData = newData;
                    updateProfileUI(newData, user.uid);
                }
            } catch (err) { console.error(err); }
        }
    });

    // Atualiza Tela
    function updateProfileUI(data, uid) {
        const els = {
            username: document.getElementById('display-username'),
            realname: document.getElementById('display-realname'),
            bio: document.getElementById('display-bio'),
            picMain: document.getElementById('profile-pic-main'),
            countPosts: document.getElementById('count-posts'),
            level: document.getElementById('user-level'),
            xpBar: document.getElementById('xp-bar-fill'),
            totalXp: document.getElementById('total-xp')
        };

        if(els.username) els.username.textContent = "@" + (data.username || "usuario");
        if(els.realname) els.realname.textContent = data.realname || "Viajante";
        if(els.bio) els.bio.textContent = data.bio || "Minha jornada...";
        if(els.picMain) els.picMain.src = data.photo;
        if(els.countPosts) els.countPosts.textContent = data.postsCount || 0;

        if (data.achievements) {
            const totalXp = data.achievements.length * 20; 
            if(els.level) els.level.textContent = Math.floor(totalXp / 100) + 1;
            if(els.totalXp) els.totalXp.textContent = totalXp;
            if(els.xpBar) els.xpBar.style.width = `${totalXp % 100}%`;
            
            const ctn = document.getElementById('achievements-list-container');
            if(ctn) {
                ctn.innerHTML = '';
                data.achievements.forEach(id => {
                    ctn.innerHTML += `<div class="achievement-card unlocked"><div class="ac-icon"><i class="fa-solid fa-trophy"></i></div><div class="ac-info"><h4>${id}</h4></div></div>`;
                });
            }
        }

        // CARREGA A TIMELINE
        loadUserTimeline(uid);
    }
});