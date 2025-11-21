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

    const allSubmenuLinks = parentMenuItem.querySelectorAll('.submenu-list__item.has-submenu');
    const allSubmenuContents = parentMenuItem.querySelectorAll('.submenu-content');

    allSubmenuLinks.forEach(sl => sl.classList.remove('active'));
    allSubmenuContents.forEach(sc => sc.classList.remove('active'));

    subLink.classList.add('active');
    const contentKeyElement = subLink.querySelector('.submenu-list__item-title');
    if (contentKeyElement) {
        const firstContentKey = contentKeyElement.textContent;
        const targetContent = parentMenuItem.querySelector(`.submenu-content[data-submenu-for="${firstContentKey}"]`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }
};

function closeMenu(item) {
    item.classList.remove('js-hover'); 
    item.classList.add('is-closing'); 
    const submenuLinks = item.querySelectorAll('.submenu-list__item.has-submenu');
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

    const submenuLinks = item.querySelectorAll('.submenu-list__item.has-submenu');
    const submenuContents = item.querySelectorAll('.submenu-content');

    const burgerCheck = document.querySelector('.main-header__burger');
    if (!burgerCheck || getComputedStyle(burgerCheck).display === 'none') {
        setTimeout(() => {
            submenuLinks.forEach(sl => sl.classList.remove('active'));
            submenuContents.forEach(sc => sc.classList.remove('active'));

            if (submenuLinks.length > 0) {
                const firstSubLink = submenuLinks[0];
                firstSubLink.classList.add('active');
                const firstContentKeyElement = firstSubLink.querySelector('.submenu-list__item-title');
                if (firstContentKeyElement) {
                    const firstContentKey = firstContentKeyElement.textContent;
                    const firstContent = item.querySelector(`.submenu-content[data-submenu-for="${firstContentKey}"]`);
                    if (firstContent) firstContent.classList.add('active');
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
    // LÓGICA PARA ATIVAR O MURAL DE DESEJOS (FIREBASE)
    else if (pageId === 'mural-natal') { 
        if (typeof setupWishMural !== 'undefined') {
            setTimeout(() => { setupWishMural(); }, 100);
        }
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

    if (typeof ScrollTrigger !== 'undefined') {
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

        if (typeof gsap !== 'undefined') {
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
            bars.forEach(bar => {
                bar.style.width = bar.dataset.value.replace(',', '.') + "%";
            });
        }
    });
}

// --- 5. LÓGICA DE ANIMAÇÃO (GSAP) ---
if (typeof gsap !== 'undefined') {
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
            console.error("Elementos do DOM do Jogo de Classificar EMBUTIDO não encontrados.");
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
 * LÓGICA DO FILTRO DA PÁGNA DE RECEITAS
 * ======================================================= */
function setupRecipeFilters() {
    const filterContainer = document.querySelector('.filter-bar');
    const recipePage = document.getElementById('receitas');

    if (!filterContainer || !recipePage || !recipePage.classList.contains('active')) {
        return;
    }

    const filterButtons = filterContainer.querySelectorAll('.filter-btn');
    const recipeCards = document.querySelectorAll('#recipe-grid .cards_item');

    const performFilter = (filter) => {
        recipeCards.forEach(card => {
            const categories = card.dataset.category; 

            if (filter === 'todos' || (categories && categories.includes(filter))) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            performFilter(filter);
        });
    });

    const initialActiveButton = filterContainer.querySelector('.filter-btn[data-filter="todos"]');
    if (initialActiveButton) {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        initialActiveButton.classList.add('active');
        performFilter('todos');
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
 * LÓGICA CHATBOT (CORRIGIDA - CLIQUE INTERNO SEGURO)
 * ======================================================= */
function setupChatbotToggle() {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const chatWindow = document.getElementById('chatbot-window');

    if (!toggleBtn || !chatWindow || !closeBtn) return;

    function toggleChatbot() {
        const isHidden = chatWindow.classList.contains('hidden');
        chatWindow.classList.toggle('hidden');
        toggleBtn.classList.toggle('hidden');

        if (isHidden) {
            // Se abriu, fecha o calendário se estiver aberto
            const calendarPopup = document.getElementById('calendar-popup');
            if (calendarPopup && !calendarPopup.classList.contains('hidden')) {
                 // Usa a função de fechar do calendário para garantir a limpeza do body
                 if (typeof MiniCalendar !== 'undefined' && MiniCalendar.close) {
                    MiniCalendar.close();
                 } else {
                    calendarPopup.classList.add('hidden');
                    document.body.classList.remove('calendar-open');
                 }
            }
            // Foca no input
            const input = document.getElementById('chatbot-input');
            if (input) setTimeout(() => input.focus(), 400);
        }
    }

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede que o clique no botão feche imediatamente
        toggleChatbot();
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleChatbot();
    });

    // --- CORREÇÃO PRINCIPAL ---
    // Impede que cliques DENTRO do chat propaguem para o document e fechem a janela
    chatWindow.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Fecha ao clicar FORA (no document)
    document.addEventListener('click', (event) => {
        // Se a janela NÃO tem a classe 'hidden', significa que ela está aberta
        if (!chatWindow.classList.contains('hidden')) {
            // Se o clique NÃO foi no botão que abre/fecha, feche a janela
            if (!toggleBtn.contains(event.target)) {
                chatWindow.classList.add('hidden');
                toggleBtn.classList.remove('hidden');
            }
        }
    });
}


/* =======================================================
 * 📅 LÓGICA DO CALENDÁRIO POPUP (CORRIGIDO, VISUAL PREMIUM)
 * ======================================================= */
const MiniCalendar = {
    date: new Date(),
    today: new Date(),
    
    // BANCO DE DADOS DE EVENTOS (Datas no formato AAAA-MM-DD)
    events: [
        // Dia 23 teve duas ações (Infantil + Início Idosos)
        { date: "2025-10-23", title: "Ação Infantil & Idosos (Dia 1)", type: "acao" },
        
        // Dia 24 foi a continuação dos Idosos
        { date: "2025-10-24", title: "Ação Idosos (Dia 2)", type: "acao" },
        
        { date: "2025-11-03", title: "Ação Adultos", type: "acao" },
        { date: "2025-11-05", title: "Ação Adultos (Dia 2)", type: "acao" },
        { date: "2025-12-25", title: "Natal", type: "feriado" }
    ],
    // Intervalos (Ex: Temporada de Natal)
    ranges: [
        { start: "2025-12-01", end: "2026-01-06", title: "Temporada de Natal", type: "sazonal" }
    ],

    init: function() {
        const toggleBtn = document.getElementById('calendar-toggle-btn');
        const closeBtn = document.getElementById('calendar-close-btn');
        const popup = document.getElementById('calendar-popup');
        const prevBtn = document.getElementById('prev-month-mini');
        const nextBtn = document.getElementById('next-month-mini');

        if(!toggleBtn || !popup) return; 

        // 1. Abrir/Fechar
        const toggleCal = () => {
            const isHidden = popup.classList.contains('hidden');
            if(isHidden) {
                this.open();
            } else {
                this.close();
            }
        };

        toggleBtn.addEventListener('click', toggleCal);
        closeBtn.addEventListener('click', toggleCal);

        // 👇 NOVO: FECHAR AO CLICAR FORA
        document.addEventListener('click', (event) => {
            // Se o calendário está ABERTO...
            if (!popup.classList.contains('hidden')) {
                // ...e o clique NÃO foi dentro do calendário...
                // ...e o clique NÃO foi no botão que abre o calendário...
                if (!popup.contains(event.target) && !toggleBtn.contains(event.target)) {
                    this.close();
                }
            }
        });

        // 2. Navegação Meses
        prevBtn.addEventListener('click', () => {
            this.date.setMonth(this.date.getMonth() - 1);
            this.render();
        });
        nextBtn.addEventListener('click', () => {
            this.date.setMonth(this.date.getMonth() + 1);
            this.render();
        });

        this.render();
    },
    
    open: function() {
        const popup = document.getElementById('calendar-popup');
        if (!popup) return;
        
        popup.classList.remove('hidden');
        document.body.classList.add('calendar-open');
        
        // Fecha o chatbot se estiver aberto
        const chatWindow = document.getElementById('chatbot-window');
        const chatToggleBtn = document.getElementById('chatbot-toggle-btn');
        
        if(chatWindow && !chatWindow.classList.contains('hidden')) {
            chatWindow.classList.add('hidden');
            if(chatToggleBtn) chatToggleBtn.classList.remove('hidden');
        }
    },
    
    close: function() {
        const popup = document.getElementById('calendar-popup');
        if (!popup) return;
        
        popup.classList.add('hidden');
        document.body.classList.remove('calendar-open');
    },

    render: function() {
        const monthYear = document.getElementById('current-month-mini');
        const daysContainer = document.getElementById('calendar-days-mini');
        const infoBox = document.getElementById('event-info-mini');
        
        this.date.setDate(1); 

        const month = this.date.getMonth();
        const year = this.date.getFullYear();
        
        const lastDay = new Date(year, month + 1, 0).getDate();
        const prevLastDay = new Date(year, month, 0).getDate();
        const firstDayIndex = this.date.getDay();
        const lastDayIndex = new Date(year, month + 1, 0).getDay();
        const nextDays = 7 - lastDayIndex - 1;

        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        
        monthYear.innerText = `${months[month]} ${year}`;
        daysContainer.innerHTML = "";

        // Dias do mês anterior
        for (let x = firstDayIndex; x > 0; x--) {
            daysContainer.innerHTML += `<li class="inactive" style="opacity:0.3">${prevLastDay - x + 1}</li>`;
        }

        // Dias do mês atual
        for (let i = 1; i <= lastDay; i++) {
            let li = document.createElement('li');
            li.innerText = i;
            
            // Checa se é hoje
            const isToday = i === this.today.getDate() && month === this.today.getMonth() && year === this.today.getFullYear();
            if (isToday) {
                li.classList.add('today');
            }

            // Checa Eventos Pontuais
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
            const event = this.events.find(e => e.date === dateStr);
            
            // Checa Ranges (Natal)
            let inRange = false;
            const currDateObj = new Date(year, month, i);
            const range = this.ranges.find(r => {
                const start = new Date(r.start + "T00:00:00");
                const end = new Date(r.end + "T00:00:00");
                return currDateObj >= start && currDateObj <= end;
            });

            if (event) {
                li.classList.add('has-event');
                
                // Ícone visual no detalhe
                let iconClass = 'fa-circle';
                if(event.type === 'acao') iconClass = 'fa-handshake';
                if(event.type === 'feriado') iconClass = 'fa-star';

                li.onclick = () => {
                    infoBox.innerHTML = `
                        <strong style="color: var(--color-primary); font-size: 1.1em;">
                            <i class="fa-solid ${iconClass}"></i> ${i} de ${months[month]}
                        </strong>
                        <span style="color: #555;">${event.title}</span>
                    `;
                };
            } else if (range) {
                 li.classList.add('in-range-mini');
                 
                 // Classes para bordas arredondadas no CSS
                 const rStart = new Date(range.start + "T00:00:00");
                 const rEnd = new Date(range.end + "T00:00:00");
                 if (currDateObj.getTime() === rStart.getTime()) li.classList.add('in-range-start');
                 if (currDateObj.getTime() === rEnd.getTime()) li.classList.add('in-range-end');

                 li.onclick = () => {
                    infoBox.innerHTML = `
                        <strong style="color: #c0392b;">
                            <i class="fa-solid fa-gift"></i> ${range.title}
                        </strong>
                        <span>Aproveite nossa decoração e receitas especiais!</span>
                    `;
                };
            } else {
                 li.onclick = () => {
                    infoBox.innerHTML = `<strong>${i} de ${months[month]}</strong><span style="color:#999">Nenhum evento programado.</span>`;
                };
            }
            
            // Mensagem padrão para hoje sem evento
            if(isToday && !event && !range) {
                 li.onclick = () => {
                    infoBox.innerHTML = `<strong>Hoje, ${i} de ${months[month]}</strong><span>Aproveite o dia!</span>`;
                };
            }

            daysContainer.appendChild(li);
        }
    }
};


/* =======================================================
 * 1. Configuração da Caça aos Presentes (COM ANIMAÇÃO FINAL)
 * ======================================================= */
const giftHuntGame = {
    totalGifts: 3,
    foundGifts: 0,
    foundIds: [],

    init: function() {
        const gifts = document.querySelectorAll('.hidden-gift');
        const toast = document.getElementById('gift-hunt-toast');
        
        // Se o elemento contador existir dentro do toast, pegamos ele, senão o próprio toast
        const countSpan = document.getElementById('gift-count');
        
        if (!toast || gifts.length === 0) return;

        // NOTA: Removi o setTimeout que mostrava o toast automaticamente.
        // Agora ele começa invisível.

        gifts.forEach((gift, index) => {
            gift.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (!this.foundIds.includes(index)) {
                    this.foundIds.push(index);
                    this.foundGifts++;
                    
                    // Marca o presente como encontrado
                    gift.classList.add('found');
                    
                    // --- MUDANÇA VISUAL: TEXTO CURTO ---
                    // Atualiza o texto para ser apenas "1/3", "2/3"
                    if(countSpan) {
                        // Se tiver o span específico, atualiza ele
                        countSpan.textContent = `${this.foundGifts}/${this.totalGifts}`;
                        // Remove o texto "Ache os presentes" para ficar minimalista
                        toast.innerHTML = `<i class="fa-solid fa-gift"></i> ${this.foundGifts} / ${this.totalGifts}`;
                    }
                    
                    // Mostra o Mini HUD apenas ao achar o primeiro
                    if (this.foundGifts === 1) {
                        toast.classList.add('visible');
                    }

                    // Efeito de "Pulo" no placar para chamar atenção quando atualiza
                    toast.style.transform = "translateX(-50%) scale(1.1)";
                    setTimeout(() => {
                        toast.style.transform = "translateX(-50%) scale(1)";
                    }, 200);

                    // Confete
                    if(typeof confetti === 'function') {
                        confetti({ particleCount: 50, spread: 60, origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight } });
                    }

                    // VITÓRIA
                    if (this.foundGifts === this.totalGifts) {
                        toast.style.backgroundColor = "#f0fdf4";
                        toast.style.borderColor = "#3D7938";
                        toast.innerHTML = '<i class="fa-solid fa-check"></i> Completo!';
                        
                        setTimeout(() => {
                           this.triggerVictoryAnimation();
                        }, 800);
                    }
                }
            });
        });
    },

    triggerVictoryAnimation: function() {
        const modal = document.getElementById('gift-reveal-modal');
        if(modal) {
            modal.classList.remove('hidden');
            setTimeout(() => { modal.classList.add('active'); }, 10);
             if(typeof confetti === 'function') {
                var duration = 3 * 1000;
                var animationEnd = Date.now() + duration;
                var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 11001 };
                function randomInRange(min, max) { return Math.random() * (max - min) + min; }
                var interval = setInterval(function() {
                var timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                var particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
                }, 250);
            }
        }
    }
};

// Função global para fechar o modal de presente
function closeGiftModal() {
    const modal = document.getElementById('gift-reveal-modal');
    if(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 500); // Espera a animação de fade-out terminar
    }
}

// =======================================================
// LÓGICA DO MURAL DE DESEJOS (FIREBASE)
// =======================================================

// Funções para controle do Modal de Leitura (Nova funcionalidade)
function closeLetterModal() {
    const modal = document.getElementById('letter-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('game-modal-open');
    }
}

function openLetterModal(messageText) {
    const modal = document.getElementById('letter-modal');
    const content = document.getElementById('letter-text-content');
    
    if (modal && content) {
        // Usa textContent para segurança contra XSS
        content.textContent = messageText; 
        modal.classList.add('active');
        document.body.classList.add('game-modal-open');
    }
}


// Função para gerar uma posição e rotação aleatória para o presente na árvore
function generateRandomPosition() {
    const minX = 15; 
    const maxX = 85; 
    const minY = 10; 
    const maxY = 90; 
    
    const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
    // Rotação aleatória (entre -10 e 10 graus)
    const rotation = Math.floor(Math.random() * 21) - 10; 
    
    return { top: y + '%', left: x + '%', rotation: rotation };
}

// Lista de Paletas de Cores (Papel / Fita)
const giftPalettes = [
    { papel: '#fcf8f0', fita: '#d92d2d' }, // Clássico: Creme e Vermelho
    { papel: '#d92d2d', fita: '#FFD700' }, // Vermelho e Dourado
    { papel: '#3D7938', fita: '#fcf8f0' }, // Verde e Creme
    { papel: '#FFD700', fita: '#d92d2d' }, // Dourado e Vermelho
    { papel: '#ffffff', fita: '#3D7938' }, // Branco e Verde
    { papel: '#8B0000', fita: '#00FF00' }, // Vinho e Verde Neon
    { papel: '#191970', fita: '#C0C0C0' }  // Azul Noite e Prata
];

// Função para renderizar as mensagens (CORRIGIDA: Cores Fixas por Mensagem)
function renderWishes(wishes) {
    const displayArea = document.getElementById('wish-display-area');
    const noWishes = document.getElementById('no-wishes-yet');
    if (!displayArea) return;

    displayArea.innerHTML = '';

    if (wishes.length === 0) {
        if (noWishes) noWishes.style.display = 'block';
        return;
    }
    if (noWishes) noWishes.style.display = 'none';

    wishes.forEach(wish => {
        const gift = document.createElement('div');
        gift.classList.add('christmas-gift-box');
        
        // 1. Gera posição aleatória (Mantemos a posição aleatória para espalhar)
        const position = generateRandomPosition();
        gift.style.top = position.top;
        gift.style.left = position.left;
        gift.style.setProperty('--random-rotation', position.rotation);
        
        // =====================================================
        // 2. CORREÇÃO: ESCOLHA DE COR BASEADA NA MENSAGEM
        // =====================================================
        // Em vez de sortear, somamos os códigos das letras da mensagem
        // Isso garante que a mesma mensagem sempre gere o mesmo número.
        let colorIndex = 0;
        if (wish.message) {
            for (let i = 0; i < wish.message.length; i++) {
                colorIndex += wish.message.charCodeAt(i);
            }
        }
        
        // Pega o resto da divisão para escolher uma paleta válida
        const safeIndex = colorIndex % giftPalettes.length;
        const palette = giftPalettes[safeIndex];
        
        // 3. APLICA AS CORES FIXAS
        gift.style.setProperty('--cor-papel', palette.papel);
        gift.style.setProperty('--cor-fita', palette.fita);
        
        // Evento de clique
        gift.addEventListener('click', () => {
            openLetterModal(wish.message); 
        });

        // HTML Interno
        gift.innerHTML = `
            <div class="gift-ribbon"></div> 
            <div class="gift-message-content">
                <p class="gift-message-text">${wish.message.substring(0, 15)}...</p> 
            </div>
        `;
        displayArea.appendChild(gift);
    });
}

// Função para escutar mudanças em tempo real (Leitura)
function listenForWishes() {
    // A variável 'db' é inicializada no index.html (onde o SDK do Firebase está)
    if (!db) return;

    db.collection('desejosNatal')
      // Ordena as mensagens pelas mais recentes
      .orderBy('timestamp', 'desc') 
      .limit(30)
      .onSnapshot(snapshot => {
        const wishes = [];
        snapshot.forEach(doc => {
            // Garante que a mensagem tenha sido salva corretamente no servidor
            if (doc.data().timestamp) { 
                wishes.push(doc.data()); 
            }
        });
        renderWishes(wishes); 
      }, error => {
        console.error("Erro ao escutar mensagens:", error);
      });
}

// Função para enviar a mensagem (Escrita - Anônima)
function sendWish(message, form) {
    const statusEl = document.getElementById('wish-status');
    if (!db) {
         statusEl.textContent = 'Erro: Banco de dados não inicializado.';
         statusEl.style.color = '#d92d2d';
         statusEl.style.display = 'block';
         return;
    }

    db.collection('desejosNatal').add({
        // Apenas a mensagem, para garantir o anonimato
        message: message,
        // Usa o carimbo de data/hora do servidor do Firebase
        timestamp: firebase.firestore.FieldValue.serverTimestamp() 
    })
    .then(() => {
        statusEl.textContent = 'Presente pendurado com sucesso!';
        statusEl.style.color = 'var(--color-primary)';
        form.reset();
    })
    .catch((error) => {
        statusEl.textContent = `Erro ao pendurar presente: ${error.message}`;
        statusEl.style.color = '#d92d2d';
    })
    .finally(() => {
        statusEl.style.display = 'block';
        setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
    });
}

// Setup da Lógica Principal do Mural (Inicializa Listeners)
function setupWishMural() {
    const form = document.getElementById('wish-form');
    const statusEl = document.getElementById('wish-status');

    if (!form || !statusEl) return;

    form.removeEventListener('submit', handleMuralSubmit);
    form.addEventListener('submit', handleMuralSubmit);
    
    listenForWishes();
    
    function handleMuralSubmit(e) {
        e.preventDefault();
        
        const message = document.getElementById('wish-message').value.trim();

        if (!message) {
            statusEl.textContent = 'Por favor, escreva uma mensagem.';
            statusEl.style.color = '#d97706';
            statusEl.style.display = 'block';
            return;
        }
        
        statusEl.textContent = 'Pendurando...';
        statusEl.style.color = '#d92d2d';
        // Fecha o modal de leitura, caso esteja aberto
        closeLetterModal(); 
        statusEl.style.display = 'block';
        
        sendWish(message, form);
    }
}


// =======================================================
// CHAMADAS GERAIS (Roda APÓS A DEFINIÇÃO das funções)
// =======================================================

setupHeroCarousel();

document.addEventListener('DOMContentLoaded', () => {
    // A ordem de inicialização é importante
    
    // 1. Inicializa o toggle do Chatbot
    setupChatbotToggle();
    
    // 2. Inicializa o Calendário
    if(typeof MiniCalendar !== 'undefined') {
        MiniCalendar.init();
    }
    
    // 3. Demais inicializações
    setupTextToSpeech();
    giftHuntGame.init();
    
    // --- NOVO: FECHAR PRESENTE CLICANDO FORA ---
    const giftModal = document.getElementById('gift-reveal-modal');
    if (giftModal) {
        giftModal.addEventListener('click', (e) => {
            // Verifica se o clique foi EXATAMENTE no fundo escuro (overlay)
            // OU no wrapper de conteúdo (que agora ocupa 100%)
            // MAS NÃO se foi num elemento filho (como o botão ou a caixa)
            
            if (!e.target.closest('.gift-container') && !e.target.closest('.close-modal')) {
                 closeGiftModal();
            }
        });
    }
    
    // 4. Fechar Modal de Carta ao clicar fora (nova função)
    const letterModal = document.getElementById('letter-modal');
    if (letterModal) {
        letterModal.addEventListener('click', (e) => {
            if (e.target === letterModal) {
                closeLetterModal();
            }
        });
    }

    // Garante que as funções de música rodem após o carregamento inicial
    setupMusicToggle();

});

/* =======================================================
 * LÓGICA DO PLAYER DE MÚSICA (MOVIDO/CORRIGIDO)
 * ======================================================= */

function setupMusicToggle() {
    const musicBtn = document.getElementById('music-toggle');
    const audio = document.getElementById('xmas-bgm');
    
    if(musicBtn && audio) {
        audio.volume = 0.3; // Volume agradável (30%)
        
        musicBtn.addEventListener('click', () => {
            if (audio.paused) {
                // Tocar
                audio.play().catch(error => {
                    console.log("Autoplay bloqueado pelo navegador: ", error);
                });
                musicBtn.classList.add('playing');
                // Troca ícone para ondas sonoras
                musicBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>'; 
            } else {
                // Pausar
                audio.pause();
                musicBtn.classList.remove('playing');
                // Volta ícone de nota musical
                musicBtn.innerHTML = '<i class="fa-solid fa-music"></i>'; 
            }
        });
    }
}

/* =======================================================
 * ✨ EFEITO DO CURSOR PÓ MÁGICO (ESTRELAS)
 * ======================================================= */
document.addEventListener('mousemove', function(e) {
    // Frequência: 30% dos movimentos criam uma estrela
    if (Math.random() < 0.3) { 
        const dust = document.createElement('div');
        dust.classList.add('magic-dust');
        
        // Posição
        dust.style.left = e.pageX + 'px';
        dust.style.top = e.pageY + 'px';
        
        // --- TAMANHO AUMENTADO PARA ESTRELAS ---
        // Agora varia entre 10px e 20px para ficarem nítidas
        const size = Math.random() * 10 + 10;
        dust.style.width = size + 'px';
        dust.style.height = size + 'px';
        
        // Cores de Natal
        const colors = ['#d92d2d', '#3D7938', '#FFD700', '#c0392b'];
        dust.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        document.body.appendChild(dust);
        
        setTimeout(() => {
            dust.remove();
        }, 1200);
    }
});

/* =======================================================
 * LÓGICA DA CONTAGEM REGRESSIVA
 * ======================================================= */
function updateChristmasCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    let xmasDate = new Date(currentYear, 11, 25, 0, 0, 0); 

    if (now > xmasDate) {
        xmasDate.setFullYear(currentYear + 1);
    }

    const diff = xmasDate - now;

    const daysTotal = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const months = Math.floor(daysTotal / 30);
    const days = daysTotal % 30;

    // Elementos
    const elMonths = document.getElementById('cd-months');
    const elBoxMonths = document.getElementById('box-months'); // A caixa inteira do mês
    const elLabelMonths = document.getElementById('lbl-months'); // O texto "mês/meses"
    
    const elDays = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMinutes = document.getElementById('cd-minutes');
    const elSeconds = document.getElementById('cd-seconds');

    if (elSeconds) { 
        // Lógica do Mês (Ocultar a caixa se for 0)
        if (months > 0) {
            elMonths.innerText = months;
            if(elBoxMonths) elBoxMonths.style.display = 'flex'; // Mostra a caixa
            
            // Singular/Plural
            if(elLabelMonths) elLabelMonths.innerText = (months === 1) ? 'mês' : 'meses';
        } else {
            if(elBoxMonths) elBoxMonths.style.display = 'none'; // Esconde a caixa inteira
        }

        // Formatação com zero à esquerda (01, 05, 10)
        if(elDays) elDays.innerText = days < 10 ? '0' + days : days;
        if(elHours) elHours.innerText = hours < 10 ? '0' + hours : hours;
        if(elMinutes) elMinutes.innerText = minutes < 10 ? '0' + minutes : minutes;
        if(elSeconds) elSeconds.innerText = seconds < 10 ? '0' + seconds : seconds;
    }
}

// Inicia o relógio
setInterval(updateChristmasCountdown, 1000); 
updateChristmasCountdown();