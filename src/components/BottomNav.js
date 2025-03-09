class BottomNav {
    constructor() {
        this.element = document.getElementById('bottom-nav');
        this.currentPage = 'goals';
        this.render();
        this.addEventListeners();
    }

    render() {
        this.element.innerHTML = `
            <a href="#" class="nav-item" data-page="goals">
                <span class="nav-icon">🎯</span>
                <span>Цели</span>
            </a>
            <a href="#" class="nav-item" data-page="events">
                <span class="nav-icon">📅</span>
                <span>События</span>
            </a>
            <a href="#" class="nav-item" data-page="calendar">
                <span class="nav-icon">📆</span>
                <span>Календарь</span>
            </a>
            <a href="#" class="nav-item" data-page="settings">
                <span class="nav-icon">⚙️</span>
                <span>Настройки</span>
            </a>
        `;

        // Устанавливаем активную вкладку
        const activeItem = this.element.querySelector(`[data-page="${this.currentPage}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    addEventListeners() {
        const navItems = this.element.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigate(page);
            });
        });
    }

    navigate(page) {
        // Remove active class from all items
        this.element.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to selected item
        const activeItem = this.element.querySelector(`[data-page="${page}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        this.currentPage = page;

        // Trigger page change event
        const event = new CustomEvent('pageChange', { detail: { page } });
        document.dispatchEvent(event);
    }
}

// Initialize the bottom navigation
new BottomNav(); 