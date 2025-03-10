class Calendarius {
    constructor() {
        this.calendars = [];
        this.isEditMode = false;
        this.sortable = null;
        this.currentYear = new Date().getFullYear();
        
        // DOM элементы
        this.editButton = document.querySelector('.edit-button');
        this.addButton = document.querySelector('.add-button');
        this.calendariusList = document.querySelector('.calendarius-list');
        this.createModal = document.getElementById('createCalendarModal');
        this.viewModal = document.getElementById('viewCalendarModal');
        
        // Инициализация
        this.loadCalendars();
        this.setupEventListeners();
        this.render();
    }

    loadCalendars() {
        try {
            const saved = localStorage.getItem('calendarius');
            this.calendars = saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load calendars:', e);
            this.calendars = [];
        }
    }

    saveCalendars() {
        try {
            localStorage.setItem('calendarius', JSON.stringify(this.calendars));
        } catch (e) {
            console.error('Failed to save calendars:', e);
        }
    }

    setupEventListeners() {
        // Кнопки в шапке
        this.editButton.addEventListener('click', () => this.toggleEditMode());
        this.addButton.addEventListener('click', () => this.showCreateModal());

        // Модальное окно создания календаря
        const saveButton = document.getElementById('saveCalendar');
        const cancelButton = document.getElementById('cancelCreate');

        saveButton.addEventListener('click', () => this.createCalendar());
        cancelButton.addEventListener('click', () => this.hideCreateModal());

        // Модальное окно просмотра календаря
        const closeButton = document.getElementById('closeCalendarView');

        closeButton.addEventListener('click', () => this.hideViewModal());

        // Закрытие модальных окон при клике вне их
        this.createModal.addEventListener('click', (e) => {
            if (e.target === this.createModal) this.hideCreateModal();
        });

        this.viewModal.addEventListener('click', (e) => {
            if (e.target === this.viewModal) this.hideViewModal();
        });
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        this.editButton.textContent = this.isEditMode ? 'Готово' : 'Изменить';
        
        const calendarItems = this.calendariusList.querySelectorAll('.calendar-item');
        calendarItems.forEach(item => {
            const calendarId = parseInt(item.dataset.id);
            const calendarData = this.calendars.find(c => c.id === calendarId);
            
            if (calendarData) {
                item.classList.toggle('edit-mode');
                item.innerHTML = this.isEditMode ? `
                    <div class="calendar-drag-handle">☰</div>
                    <div class="calendar-title">${calendarData.title}</div>
                    <button class="calendar-delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : `
                    <div class="calendar-item-header">
                        <div class="calendar-item-title">${calendarData.title}</div>
                        <div class="calendar-item-date">${this.getMonthName(calendarData.month)} ${calendarData.year}</div>
                    </div>
                    <div class="calendar-item-progress">
                        ${calendarData.selectedDays.length} из ${new Date(calendarData.year, calendarData.month + 1, 0).getDate()} дней
                    </div>
                `;

                if (this.isEditMode) {
                    const deleteBtn = item.querySelector('.calendar-delete-btn');
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.deleteCalendar(calendarId);
                    });
                } else {
                    item.addEventListener('click', () => this.showViewModal(calendarData));
                }
            }
        });

        if (this.isEditMode) {
            this.initSortable();
        } else if (this.sortable) {
            this.sortable.destroy();
            this.sortable = null;
        }
    }

    initSortable() {
        this.sortable = new Sortable(this.calendariusList, {
            animation: 150,
            handle: '.calendar-drag-handle',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: (evt) => {
                const calendars = [...this.calendars];
                const item = calendars.splice(evt.oldIndex, 1)[0];
                calendars.splice(evt.newIndex, 0, item);
                this.calendars = calendars;
                this.saveCalendars();
            }
        });
    }

    getMonthName(month) {
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return monthNames[month];
    }

    showCreateModal() {
        const yearInput = document.getElementById('calendarYear');
        yearInput.value = new Date().getFullYear();
        
        const monthInput = document.getElementById('calendarMonth');
        monthInput.value = new Date().getMonth();

        this.createModal.classList.add('active');
    }

    hideCreateModal() {
        this.createModal.classList.remove('active');
        document.getElementById('calendarTitle').value = '';
    }

    createCalendar() {
        const title = document.getElementById('calendarTitle').value.trim();
        const month = parseInt(document.getElementById('calendarMonth').value);
        const year = parseInt(document.getElementById('calendarYear').value);

        if (!title) {
            alert('Пожалуйста, введите название календаря');
            return;
        }

        if (this.calendars.length >= 15) {
            alert('Достигнут лимит календарей (15)');
            return;
        }

        const calendar = {
            id: Date.now(),
            title,
            month,
            year,
            selectedDays: []
        };

        this.calendars.push(calendar);
        this.saveCalendars();
        this.hideCreateModal();
        this.render();
    }

    showViewModal(calendar) {
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        document.getElementById('viewCalendarTitle').textContent = 
            `${calendar.title} - ${monthNames[calendar.month]} ${calendar.year}`;

        this.renderCalendarDays(calendar);
        this.viewModal.classList.add('active');
    }

    hideViewModal() {
        this.viewModal.classList.remove('active');
    }

    renderCalendarDays(calendar) {
        const daysContainer = document.querySelector('.calendar-days');
        daysContainer.innerHTML = '';

        const date = new Date(calendar.year, calendar.month, 1);
        const lastDay = new Date(calendar.year, calendar.month + 1, 0).getDate();
        
        // Получаем день недели первого дня месяца (0 = воскресенье)
        let firstDayWeek = date.getDay();
        firstDayWeek = firstDayWeek === 0 ? 7 : firstDayWeek; // Преобразуем воскресенье из 0 в 7

        // Добавляем пустые ячейки в начале
        for (let i = 1; i < firstDayWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            daysContainer.appendChild(emptyDay);
        }

        // Добавляем дни месяца
        for (let day = 1; day <= lastDay; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            if (calendar.selectedDays.includes(day)) {
                dayElement.classList.add('selected');
            }

            dayElement.addEventListener('click', () => {
                const index = calendar.selectedDays.indexOf(day);
                if (index === -1) {
                    calendar.selectedDays.push(day);
                } else {
                    calendar.selectedDays.splice(index, 1);
                }
                dayElement.classList.toggle('selected');
                this.updateCalendarStats(calendar);
                this.saveCalendars();
            });

            daysContainer.appendChild(dayElement);
        }

        this.updateCalendarStats(calendar);
    }

    updateCalendarStats(calendar) {
        const lastDay = new Date(calendar.year, calendar.month + 1, 0).getDate();
        document.getElementById('selectedDays').textContent = calendar.selectedDays.length;
        document.getElementById('totalDays').textContent = lastDay;
    }

    deleteCalendar(id) {
        this.calendars = this.calendars.filter(cal => cal.id !== id);
        this.saveCalendars();
        this.render();
    }

    createCalendarElement(calendar) {
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        const lastDay = new Date(calendar.year, calendar.month + 1, 0).getDate();
        const element = document.createElement('div');
        element.className = 'calendar-item';
        element.dataset.id = calendar.id;
        
        if (this.isEditMode) {
            element.classList.add('edit-mode');
            element.innerHTML = `
                <div class="calendar-drag-handle">☰</div>
                <div class="calendar-title">${calendar.title}</div>
                <button class="calendar-delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            const deleteBtn = element.querySelector('.calendar-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCalendar(calendar.id);
            });
        } else {
            element.innerHTML = `
                <div class="calendar-item-header">
                    <div class="calendar-item-title">${calendar.title}</div>
                    <div class="calendar-item-date">${monthNames[calendar.month]} ${calendar.year}</div>
                </div>
                <div class="calendar-item-progress">
                    ${calendar.selectedDays.length} из ${lastDay} дней
                </div>
            `;

            element.addEventListener('click', () => this.showViewModal(calendar));
        }

        return element;
    }

    render() {
        this.calendariusList.innerHTML = '';

        if (this.calendars.length === 0) {
            this.calendariusList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <p>Нет календарей</p>
                </div>
            `;
            return;
        }

        this.calendars.forEach(calendar => {
            this.calendariusList.appendChild(this.createCalendarElement(calendar));
        });
    }
}

// Инициализация
const calendariusPage = new Calendarius(); 