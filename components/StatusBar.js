class StatusBar {
    constructor() {
        this.element = document.getElementById('status-bar');
        this.render();
        this.startClock();
    }

    render() {
        this.element.innerHTML = `
            <div class="status-bar-content">
                <div class="time-date"></div>
            </div>
        `;
    }

    startClock() {
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
    }

    updateDateTime() {
        const timeDate = this.element.querySelector('.time-date');
        const now = new Date();
        
        // Convert to Warsaw time
        const warsawTime = now.toLocaleString('ru-RU', {
            timeZone: 'Europe/Warsaw',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const day = now.toLocaleString('ru-RU', {
            timeZone: 'Europe/Warsaw',
            day: 'numeric'
        });

        const month = now.toLocaleString('ru-RU', {
            timeZone: 'Europe/Warsaw',
            month: 'long'
        });

        const year = now.toLocaleString('ru-RU', {
            timeZone: 'Europe/Warsaw',
            year: 'numeric'
        });

        timeDate.textContent = `${warsawTime} • ${day} ${month.toLowerCase()} ${year}`;
    }
}

// Initialize the status bar
new StatusBar(); 