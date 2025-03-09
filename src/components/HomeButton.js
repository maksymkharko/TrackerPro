class HomeButton {
    constructor() {
        this.element = document.getElementById('home-button');
        this.render();
        this.addEventListeners();
    }

    render() {
        this.element.innerHTML = `
            <div class="home-icon">🏠</div>
        `;
    }

    addEventListeners() {
        this.element.addEventListener('click', () => {
            // Trigger navigation to home page
            const event = new CustomEvent('pageChange', { 
                detail: { page: 'home' }
            });
            document.dispatchEvent(event);
        });
    }
}

// Initialize the home button
new HomeButton(); 