class App {
    constructor() {
        this.mainContent = document.getElementById('main-content');
        this.currentPage = null;
        this.pages = {
            goals: { title: 'Цели', instance: null },
            events: { title: 'События', instance: null },
            calendar: { title: 'Календарь', instance: null },
            settings: { title: 'Настройки', instance: null }
        };

        this.initializeEventListeners();
        this.navigateToPage('goals');
    }

    initializeEventListeners() {
        document.addEventListener('pageChange', (event) => {
            this.navigateToPage(event.detail.page);
        });
    }

    createPage(pageId) {
        const page = document.createElement('div');
        page.className = 'page';
        
        const content = document.createElement('div');
        content.className = 'page-content';
        
        if (pageId !== 'goals') {
            const header = document.createElement('div');
            header.className = 'page-header';
            header.innerHTML = `<h1 class="page-title">${this.pages[pageId].title}</h1>`;
            page.appendChild(header);
        }
        
        page.appendChild(content);
        return page;
    }

    initializePageInstance(pageId) {
        if (!this.pages[pageId].instance) {
            switch (pageId) {
                case 'goals':
                    this.pages[pageId].instance = new Goals();
                    break;
                case 'events':
                    this.pages[pageId].instance = new Events();
                    break;
                case 'calendar':
                    this.pages[pageId].instance = new Calendar();
                    break;
                case 'settings':
                    this.pages[pageId].instance = new Settings();
                    break;
            }
        }
        return this.pages[pageId].instance;
    }

    navigateToPage(pageId) {
        if (this.currentPage === pageId) return;

        // Destroy current page instance if exists
        if (this.currentPage && this.pages[this.currentPage].instance) {
            this.pages[this.currentPage].instance.destroy();
        }

        // Clear current page
        this.mainContent.innerHTML = '';

        // Create and add new page
        const newPage = this.createPage(pageId);
        this.mainContent.appendChild(newPage);

        // Initialize and render new page
        const pageInstance = this.initializePageInstance(pageId);
        if (pageInstance && typeof pageInstance.render === 'function') {
            pageInstance.render();
        }

        this.currentPage = pageId;
    }
}

// Initialize the application
new App(); 