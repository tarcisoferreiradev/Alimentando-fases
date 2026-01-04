export class EditorController {
    constructor() {
        this.modal = document.getElementById('modal-image-editor');
        this.canvas = document.getElementById('editor-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        // Controles
        this.controls = {
            brightness: document.getElementById('edit-brightness'),
            contrast: document.getElementById('edit-contrast'),
            saturation: document.getElementById('edit-saturation'),
            sepia: document.getElementById('edit-sepia'),
            blur: document.getElementById('edit-blur'),
            invert: document.getElementById('edit-invert')
        };

        this.currentImage = null;
        this.currentRotation = 0;
        this.flipH = 1;
        this.flipV = 1;
        
        this.activeCallback = null; // Função chamada ao salvar
    }

    init() {
        if(!this.modal) return;

        // Listeners dos Sliders
        Object.values(this.controls).forEach(input => {
            if(input) input.addEventListener('input', () => this.render());
        });

        // Botões de Ação
        document.getElementById('btn-rotate-left')?.addEventListener('click', () => { this.currentRotation -= 90; this.render(); });
        document.getElementById('btn-rotate-right')?.addEventListener('click', () => { this.currentRotation += 90; this.render(); });
        document.getElementById('btn-flip-h')?.addEventListener('click', () => { this.flipH *= -1; this.render(); });
        document.getElementById('btn-flip-v')?.addEventListener('click', () => { this.flipV *= -1; this.render(); });
        
        // Filtros (Presets)
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.applyPreset(e.target.dataset.preset));
        });

        // Salvar e Cancelar
        document.getElementById('btn-save-edit-img')?.addEventListener('click', () => this.save());
        document.getElementById('btn-close-editor')?.addEventListener('click', () => this.close());
        document.getElementById('btn-cancel-edit-img')?.addEventListener('click', () => this.close());
    }

    open(file, callback) {
        this.activeCallback = callback;
        this.resetControls();
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                this.modal.classList.add('open');
                this.render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    render() {
        if (!this.currentImage || !this.ctx) return;

        // Ajusta dimensões baseado na rotação
        if (this.currentRotation % 180 === 0) {
            this.canvas.width = this.currentImage.width;
            this.canvas.height = this.currentImage.height;
        } else {
            this.canvas.width = this.currentImage.height;
            this.canvas.height = this.currentImage.width;
        }

        // Aplica Filtros CSS no Contexto
        this.ctx.filter = `
            brightness(${this.controls.brightness.value}%) 
            contrast(${this.controls.contrast.value}%) 
            saturate(${this.controls.saturation.value}%) 
            sepia(${this.controls.sepia.value}%) 
            blur(${this.controls.blur.value}px) 
            invert(${this.controls.invert.value}%)
        `;

        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate(this.currentRotation * Math.PI / 180);
        this.ctx.scale(this.flipH, this.flipV);
        this.ctx.drawImage(this.currentImage, -this.currentImage.width / 2, -this.currentImage.height / 2);
        this.ctx.restore();
    }

    applyPreset(preset) {
        this.resetControls();
        switch(preset) {
            case 'grayscale': this.controls.saturation.value = 0; break;
            case 'sepia': this.controls.sepia.value = 100; break;
            // Adicione mais presets aqui
        }
        this.render();
    }

    resetControls() {
        this.controls.brightness.value = 100;
        this.controls.contrast.value = 100;
        this.controls.saturation.value = 100;
        this.controls.sepia.value = 0;
        this.controls.blur.value = 0;
        this.controls.invert.value = 0;
        this.currentRotation = 0;
        this.flipH = 1; this.flipV = 1;
    }

    save() {
        const base64 = this.canvas.toDataURL('image/jpeg', 0.9);
        if (this.activeCallback) this.activeCallback(base64);
        this.close();
    }

    close() {
        this.modal.classList.remove('open');
        this.currentImage = null;
    }
}