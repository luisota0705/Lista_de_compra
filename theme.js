// ============================================
// GERENCIAMENTO DE TEMA CLARO/ESCURO
// ============================================

class ThemeManager {
    constructor() {
        this.theme = 'light';
        this.init();
    }

    // Detectar preferência do sistema
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Salvar tema no localStorage
    saveTheme(theme) {
        localStorage.setItem('app-theme', theme);
    }

    // Carregar tema salvo ou do sistema
    loadTheme() {
        const savedTheme = localStorage.getItem('app-theme');
        
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            this.theme = savedTheme;
        } else {
            this.theme = this.getSystemTheme();
        }
        
        return this.theme;
    }

    // Aplicar tema ao documento
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.theme = theme;
    }

    // Alternar entre claro e escuro
    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.saveTheme(newTheme);
        this.updateToggleButton(newTheme);
        
        // Disparar evento para outras partes do app
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
    }

    // Atualizar ícone do botão de toggle
    updateToggleButton(theme) {
        const toggleButtons = document.querySelectorAll('.btn-theme');
        toggleButtons.forEach(button => {
            const icon = button.querySelector('i');
            const text = button.querySelector('.theme-text');
            
            if (theme === 'dark') {
                if (icon) icon.className = 'fas fa-moon';
                if (text) text.textContent = 'Claro';
            } else {
                if (icon) icon.className = 'fas fa-sun';
                if (text) text.textContent = 'Escuro';
            }
        });
    }

    // Criar e adicionar botão de toggle ao DOM
    createToggleButton(containerId = null, position = 'header') {
        const button = document.createElement('button');
        button.className = 'btn-theme';
        button.setAttribute('aria-label', 'Alternar tema');
        
        const icon = document.createElement('i');
        const text = document.createElement('span');
        text.className = 'theme-text';
        
        button.appendChild(icon);
        button.appendChild(text);
        
        // Configurar ícone inicial
        const currentTheme = this.theme;
        if (currentTheme === 'dark') {
            icon.className = 'fas fa-moon';
            text.textContent = 'Claro';
        } else {
            icon.className = 'fas fa-sun';
            text.textContent = 'Escuro';
        }
        
        button.onclick = () => this.toggleTheme();
        
        // Adicionar ao container específico
        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.appendChild(button);
            }
        } else if (position === 'header') {
            // Para o index.html - adicionar ao lado do botão logout
            const header = document.querySelector('.app-header');
            if (header) {
                const actionsDiv = document.querySelector('.header-actions') || (() => {
                    const div = document.createElement('div');
                    div.className = 'header-actions';
                    const logoutBtn = header.querySelector('.btn-logout');
                    if (logoutBtn) {
                        logoutBtn.parentNode.insertBefore(div, logoutBtn);
                        div.appendChild(logoutBtn);
                    } else {
                        header.appendChild(div);
                    }
                    return div;
                })();
                actionsDiv.insertBefore(button, actionsDiv.querySelector('.btn-logout'));
            }
        } else if (position === 'login') {
            // Para o login.html - posição absoluta
            const loginContainer = document.querySelector('.login-container');
            if (loginContainer) {
                const toggleDiv = document.createElement('div');
                toggleDiv.className = 'theme-toggle-login';
                toggleDiv.appendChild(button);
                loginContainer.appendChild(toggleDiv);
            }
        }
        
        return button;
    }

    // Inicializar o gerenciador
    init() {
        const savedTheme = this.loadTheme();
        this.applyTheme(savedTheme);
        
        // Observar mudanças na preferência do sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            const savedTheme = localStorage.getItem('app-theme');
            // Só altera automaticamente se o usuário não tiver definido uma preferência manual
            if (!savedTheme) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(newTheme);
                this.updateToggleButton(newTheme);
            }
        });
    }
}

// Inicializar automaticamente quando o DOM estiver pronto
let themeManager = null;

document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
    
    // Adicionar botão de toggle baseado na página atual
    const isLoginPage = window.location.pathname.includes('login.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname.endsWith('/');
    
    if (isLoginPage) {
        themeManager.createToggleButton(null, 'login');
    } else {
        themeManager.createToggleButton(null, 'header');
    }
});

// Exportar para uso em outros módulos (se necessário)
window.themeManager = () => themeManager;