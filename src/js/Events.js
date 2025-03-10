class Events {
    constructor() {
        this.events = [];
        this.isEditMode = false;
        this.sortable = null;
        this.timerInterval = null;
        this.eventsList = document.querySelector('.events-list');
        this.loadEvents();
        this.render();
    }

    loadEvents() {
        try {
            const savedEvents = localStorage.getItem('events');
            if (savedEvents) {
                this.events = JSON.parse(savedEvents);
            }
        } catch (e) {
            console.error('Failed to load events:', e);
            this.events = [];
        }
    }

    saveEvents() {
        try {
            localStorage.setItem('events', JSON.stringify(this.events));
        } catch (e) {
            console.error('Failed to save events:', e);
        }
    }

    formatCountdown(eventTime) {
        const now = new Date().getTime();
        const timeLeft = eventTime - now;
        
        if (timeLeft < 0) {
            return {
                isExpired: true,
                years: '00',
                months: '00',
                days: '00',
                hours: '00',
                minutes: '00',
                seconds: '00'
            };
        }

        const years = Math.floor(timeLeft / (1000 * 60 * 60 * 24 * 365));
        const months = Math.floor((timeLeft % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor((timeLeft % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        return {
            isExpired: false,
            years: String(years).padStart(2, '0'),
            months: String(months).padStart(2, '0'),
            days: String(days).padStart(2, '0'),
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0')
        };
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).toLowerCase();
    }

    createEventElement(event) {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.dataset.id = event.id;

        if (this.isEditMode) {
            eventElement.classList.add('edit-mode');
            eventElement.innerHTML = `
                <div class="event-edit-container">
                    <div class="event-drag-handle">☰</div>
                    <div class="event-title">${event.title}</div>
                    <button class="event-delete-btn">Удалить</button>
                </div>
            `;
        } else {
            const countdown = this.formatCountdown(event.eventTime);
            eventElement.innerHTML = `
                <div class="event-title">${event.title}</div>
                <div class="event-timer-container">
                    <div class="timer-blocks">
                        <div class="timer-block">
                            <div class="timer-number">${countdown.days}</div>
                            <div class="timer-label">дней</div>
                        </div>
                        <div class="timer-block">
                            <div class="timer-number">${countdown.hours}</div>
                            <div class="timer-label">час</div>
                        </div>
                        <div class="timer-block">
                            <div class="timer-number">${countdown.minutes}</div>
                            <div class="timer-label">мин</div>
                        </div>
                        <div class="timer-block">
                            <div class="timer-number">${countdown.seconds}</div>
                            <div class="timer-label">сек</div>
                        </div>
                    </div>
                </div>
                <div class="event-date">
                    Событие произойдет: ${this.formatDate(event.eventTime)}
                </div>
            `;
        }

        return eventElement;
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const editButton = document.querySelector('.edit-button');
        editButton.textContent = this.isEditMode ? 'Готово' : 'Изменить';
        
        const eventItems = this.eventsList.querySelectorAll('.event-item');
        eventItems.forEach(item => {
            const eventId = parseInt(item.dataset.id);
            const eventData = this.events.find(e => e.id === eventId);
            
            if (eventData) {
                item.classList.toggle('edit-mode');
                if (this.isEditMode) {
                    item.innerHTML = `
                        <div class="event-drag-handle">☰</div>
                        <div class="event-title">${eventData.title}</div>
                        <button class="event-delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;

                    const deleteBtn = item.querySelector('.event-delete-btn');
                    deleteBtn.addEventListener('click', () => {
                        this.deleteEvent(eventId);
                    });
                } else {
                    const countdown = this.formatCountdown(eventData.eventTime);
                    item.innerHTML = `
                        <div class="event-title">${eventData.title}</div>
                        <div class="event-timer-container">
                            <div class="timer-blocks">
                                <div class="timer-block">
                                    <div class="timer-number">${countdown.days}</div>
                                    <div class="timer-label">дней</div>
                                </div>
                                <div class="timer-block">
                                    <div class="timer-number">${countdown.hours}</div>
                                    <div class="timer-label">час</div>
                                </div>
                                <div class="timer-block">
                                    <div class="timer-number">${countdown.minutes}</div>
                                    <div class="timer-label">мин</div>
                                </div>
                                <div class="timer-block">
                                    <div class="timer-number">${countdown.seconds}</div>
                                    <div class="timer-label">сек</div>
                                </div>
                            </div>
                        </div>
                        <div class="event-date">
                            Событие произойдет: ${this.formatDate(eventData.eventTime)}
                        </div>
                    `;
                }
            }
        });

        if (this.isEditMode) {
            this.initSortable();
        } else if (this.sortable) {
            this.sortable.destroy();
            this.sortable = null;
            // Запускаем таймер обновления после выхода из режима редактирования
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }
            this.timerInterval = setInterval(() => this.updateTimers(), 1000);
        }
    }

    addNewEvent(title, eventTime) {
        if (this.events.length >= 15) {
            alert('Достигнут лимит событий (15)');
            return false;
        }

        const event = {
            id: Date.now(),
            title,
            eventTime: new Date(eventTime).getTime()
        };

        this.events.push(event);
        this.saveEvents();
        this.render();
        return true;
    }

    deleteEvent(id) {
        this.events = this.events.filter(event => event.id !== id);
        this.saveEvents();
        this.render();
    }

    reorderEvents(oldIndex, newIndex) {
        const event = this.events.splice(oldIndex, 1)[0];
        this.events.splice(newIndex, 0, event);
        this.saveEvents();
    }

    updateTimers() {
        if (!this.isEditMode) {
            this.events.forEach(event => {
                const eventElement = document.querySelector(`.event-item[data-id="${event.id}"]`);
                if (eventElement) {
                    const timerContainer = eventElement.querySelector('.event-timer-container');
                    if (timerContainer) {
                        const countdown = this.formatCountdown(event.eventTime);
                        const blocks = timerContainer.querySelectorAll('.timer-number');
                        
                        blocks[0].textContent = countdown.days;
                        blocks[1].textContent = countdown.hours;
                        blocks[2].textContent = countdown.minutes;
                        blocks[3].textContent = countdown.seconds;
                    }
                }
            });
        }
    }

    render() {
        const container = document.querySelector('.events-container');
        if (!container) return;

        const header = container.querySelector('.page-header');
        if (header) {
            const editButton = header.querySelector('.edit-button');
            if (editButton) {
                editButton.textContent = this.isEditMode ? 'Готово' : 'Изменить';
            }
        }

        const eventsList = container.querySelector('.events-list');
        eventsList.innerHTML = '';

        if (this.events.length === 0) {
            eventsList.innerHTML = `
                <div class="events-empty-state">
                    <div class="events-empty-state-icon">📅</div>
                    <div class="events-empty-state-text">Нет событий</div>
                </div>
            `;
        } else {
            this.events.forEach(event => {
                eventsList.appendChild(this.createEventElement(event));
            });
        }

        this.setupEventListeners(container);

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (!this.isEditMode && this.events.length > 0) {
            this.timerInterval = setInterval(() => this.updateTimers(), 1000);
        }
    }

    setupEventListeners(container) {
        const editButton = container.querySelector('.edit-button');
        const addButton = container.querySelector('.add-button');
        const eventsList = container.querySelector('.events-list');

        editButton.addEventListener('click', () => this.toggleEditMode());

        addButton.addEventListener('click', () => {
            const modal = document.querySelector('.add-event-modal') || this.createModal();
            modal.style.display = 'flex';
            const input = modal.querySelector('.event-input');
            const datetime = modal.querySelector('.event-datetime');
            input.value = '';
            datetime.value = '';
            input.focus();
        });

        if (this.isEditMode && this.events.length > 0) {
            this.initSortable();

            container.querySelectorAll('.event-delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const eventItem = e.target.closest('.event-item');
                    if (eventItem) {
                        this.deleteEvent(parseInt(eventItem.dataset.id));
                    }
                });
            });
        }
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'add-event-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Новое событие</h2>
                <input type="text" class="event-input" placeholder="Введите название события" maxlength="50">
                <input type="datetime-local" class="event-datetime">
                <div class="modal-buttons">
                    <button class="cancel-button">Отмена</button>
                    <button class="start-button">Создать</button>
                </div>
            </div>
        `;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        const cancelButton = modal.querySelector('.cancel-button');
        const startButton = modal.querySelector('.start-button');
        const input = modal.querySelector('.event-input');
        const datetime = modal.querySelector('.event-datetime');

        cancelButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        const handleStart = () => {
            const title = input.value.trim();
            const eventTime = datetime.value;
            
            if (!title) {
                alert('Введите название события');
                return;
            }
            if (!eventTime) {
                alert('Выберите дату и время события');
                return;
            }

            if (this.addNewEvent(title, eventTime)) {
                modal.style.display = 'none';
            }
        };

        startButton.addEventListener('click', handleStart);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                datetime.focus();
            }
        });

        document.body.appendChild(modal);
        return modal;
    }

    initSortable() {
        this.sortable = new Sortable(this.eventsList, {
            animation: 150,
            handle: '.event-drag-handle',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: (evt) => {
                const events = [...this.events];
                const item = events.splice(evt.oldIndex, 1)[0];
                events.splice(evt.newIndex, 0, item);
                this.events = events;
                this.saveEvents();
            }
        });
    }
}

// Инициализация страницы событий
const eventsPage = new Events(); 