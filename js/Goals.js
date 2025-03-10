class Goals {
    constructor() {
        this.goals = [];
        this.isEditMode = false;
        this.timerInterval = null;
        this.loadGoals();
        this.render();
    }

    loadGoals() {
        try {
            const savedGoals = localStorage.getItem('goals');
            if (savedGoals) {
                const parsedGoals = JSON.parse(savedGoals);
                this.goals = parsedGoals;
            }
        } catch (e) {
            console.error('Failed to load goals:', e);
            this.goals = [];
        }
    }

    saveGoals() {
        try {
            localStorage.setItem('goals', JSON.stringify(this.goals));
        } catch (e) {
            console.error('Failed to save goals:', e);
        }
    }

    formatDuration(startTime) {
        const now = new Date().getTime();
        const duration = now - startTime;
        
        const years = Math.floor(duration / (1000 * 60 * 60 * 24 * 365));
        const months = Math.floor((duration % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor((duration % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((duration % (1000 * 60)) / 1000);

        return {
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

    createGoalElement(goal) {
        const goalElement = document.createElement('div');
        goalElement.className = 'goal-item';
        goalElement.dataset.id = goal.id;

        if (this.isEditMode) {
            goalElement.classList.add('edit-mode');
            goalElement.innerHTML = `
                <div class="goal-drag-handle">☰</div>
                <div class="goal-title">${goal.title}</div>
                <button class="goal-delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            const deleteBtn = goalElement.querySelector('.goal-delete-btn');
            deleteBtn.addEventListener('click', () => {
                this.deleteGoal(parseInt(goalElement.dataset.id));
            });
        } else {
            const duration = this.formatDuration(goal.startTime);
            
            goalElement.innerHTML = `
                <div class="goal-title">${goal.title}</div>
                <div class="goal-timer-container">
                    <div class="timer-blocks">
                        <div class="timer-block">
                            <div class="timer-number">${duration.days}</div>
                            <div class="timer-label">дней</div>
                        </div>
                        <div class="timer-block">
                            <div class="timer-number">${duration.hours}</div>
                            <div class="timer-label">час</div>
                        </div>
                        <div class="timer-block">
                            <div class="timer-number">${duration.minutes}</div>
                            <div class="timer-label">мин</div>
                        </div>
                        <div class="timer-block">
                            <div class="timer-number">${duration.seconds}</div>
                            <div class="timer-label">сек</div>
                        </div>
                    </div>
                </div>
                <div class="goal-start-date">
                    Создано: ${this.formatDate(goal.startTime)}
                </div>
            `;
        }

        return goalElement;
    }

    updateTimers() {
        if (!this.isEditMode) {
            this.goals.forEach(goal => {
                const goalElement = document.querySelector(`.goal-item[data-id="${goal.id}"]`);
                if (goalElement) {
                    const duration = this.formatDuration(goal.startTime);
                    const numbers = goalElement.querySelectorAll('.timer-number');
                    
                    if (numbers.length === 4) {
                        numbers[0].textContent = duration.days;
                        numbers[1].textContent = duration.hours;
                        numbers[2].textContent = duration.minutes;
                        numbers[3].textContent = duration.seconds;
                    }
                }
            });
        }
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const editButton = document.querySelector('.edit-button');
        editButton.textContent = this.isEditMode ? 'Готово' : 'Изменить';
        
        const goalsList = document.querySelector('.goals-list');
        const goals = goalsList.querySelectorAll('.goal-item');
        goals.forEach(goal => {
            goal.classList.toggle('edit-mode');
            
            // Перестраиваем содержимое элемента при выходе из режима редактирования
            if (!this.isEditMode) {
                const goalId = parseInt(goal.dataset.id);
                const goalData = this.goals.find(g => g.id === goalId);
                if (goalData) {
                    const duration = this.formatDuration(goalData.startTime);
                    goal.innerHTML = `
                        <div class="goal-title">${goalData.title}</div>
                        <div class="goal-timer-container">
                            <div class="timer-blocks">
                                <div class="timer-block">
                                    <div class="timer-number">${duration.days}</div>
                                    <div class="timer-label">дней</div>
                                </div>
                                <div class="timer-block">
                                    <div class="timer-number">${duration.hours}</div>
                                    <div class="timer-label">час</div>
                                </div>
                                <div class="timer-block">
                                    <div class="timer-number">${duration.minutes}</div>
                                    <div class="timer-label">мин</div>
                                </div>
                                <div class="timer-block">
                                    <div class="timer-number">${duration.seconds}</div>
                                    <div class="timer-label">сек</div>
                                </div>
                            </div>
                        </div>
                        <div class="goal-start-date">
                            Создано: ${this.formatDate(goalData.startTime)}
                        </div>
                    `;
                }
            } else {
                const title = goal.querySelector('.goal-title').textContent;
                goal.innerHTML = `
                    <div class="goal-drag-handle">☰</div>
                    <div class="goal-title">${title}</div>
                    <button class="goal-delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                `;

                const deleteBtn = goal.querySelector('.goal-delete-btn');
                deleteBtn.addEventListener('click', () => {
                    this.deleteGoal(parseInt(goal.dataset.id));
                });
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

    initSortable() {
        const goalsList = document.querySelector('.goals-list');
        this.sortable = new Sortable(goalsList, {
            animation: 150,
            handle: '.goal-drag-handle',
            onEnd: (evt) => {
                const goals = [...this.goals];
                const item = goals.splice(evt.oldIndex, 1)[0];
                goals.splice(evt.newIndex, 0, item);
                this.goals = goals;
                this.saveGoals();
            }
        });
    }

    addNewGoal(title) {
        if (this.goals.length >= 15) {
            alert('Достигнут лимит целей (15)');
            return false;
        }

        const goal = {
            id: Date.now(),
            title,
            startTime: Date.now()
        };

        this.goals.unshift(goal);
        this.saveGoals();
        this.render();
        return true;
    }

    deleteGoal(id) {
        this.goals = this.goals.filter(goal => goal.id !== id);
        this.saveGoals();
        this.render();
    }

    reorderGoals(oldIndex, newIndex) {
        const goal = this.goals.splice(oldIndex, 1)[0];
        this.goals.splice(newIndex, 0, goal);
        this.saveGoals();
    }

    render() {
        const container = document.querySelector('.goals-container');
        if (!container) return;

        const header = container.querySelector('.page-header');
        if (header) {
            const editButton = header.querySelector('.edit-button');
            if (editButton) {
                editButton.textContent = this.isEditMode ? 'Готово' : 'Изменить';
            }
        }

        const goalsList = container.querySelector('.goals-list');
        goalsList.innerHTML = '';

        if (this.goals.length === 0) {
            goalsList.innerHTML = `
                <div class="goals-empty-state">
                    <div class="goals-empty-state-icon">🎯</div>
                    <div class="goals-empty-state-text">Нет целей</div>
                </div>
            `;
        } else {
            this.goals.forEach(goal => {
                goalsList.appendChild(this.createGoalElement(goal));
            });
        }

        this.setupEventListeners(container);

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (!this.isEditMode && this.goals.length > 0) {
            this.timerInterval = setInterval(() => this.updateTimers(), 1000);
        }
    }

    setupEventListeners(container) {
        const editButton = container.querySelector('.edit-button');
        const addButton = container.querySelector('.add-button');
        const goalsList = container.querySelector('.goals-list');

        editButton.addEventListener('click', () => this.toggleEditMode());

        addButton.addEventListener('click', () => {
            const modal = document.querySelector('.add-goal-modal') || this.createModal();
            modal.style.display = 'flex';
            const input = modal.querySelector('.goal-input');
            input.value = '';
            input.focus();
        });

        if (this.isEditMode && this.goals.length > 0) {
            new Sortable(goalsList, {
                animation: 150,
                handle: '.goal-drag-handle',
                onEnd: (evt) => {
                    this.reorderGoals(evt.oldIndex, evt.newIndex);
                }
            });

            container.querySelectorAll('.goal-delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const goalItem = e.target.closest('.goal-item');
                    if (goalItem) {
                        this.deleteGoal(parseInt(goalItem.dataset.id));
                    }
                });
            });
        }
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'add-goal-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Новая цель</h2>
                <input type="text" class="goal-input" placeholder="Введите название цели" maxlength="50">
                <div class="modal-buttons">
                    <button class="cancel-button">Отмена</button>
                    <button class="start-button">Старт</button>
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
        const input = modal.querySelector('.goal-input');

        cancelButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        const handleStart = () => {
            const title = input.value.trim();
            if (title && this.addNewGoal(title)) {
                modal.style.display = 'none';
            }
        };

        startButton.addEventListener('click', handleStart);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleStart();
            }
        });

        document.body.appendChild(modal);
        return modal;
    }
}

// Инициализация страницы целей
const goalsPage = new Goals(); 