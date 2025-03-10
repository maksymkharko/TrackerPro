// Функция для обновления даты и времени
function updateDateTime() {
    const now = new Date();
    const timeElement = document.querySelector('.time');
    const dateElement = document.querySelector('.date');

    if (timeElement && dateElement) {
        // Форматирование времени (12:00)
        timeElement.textContent = now.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit'
        });

        // Форматирование даты (понедельник 9 марта 2025)
        const weekday = now.toLocaleString('ru-RU', { weekday: 'long' });
        const day = now.getDate();
        const month = now.toLocaleString('ru-RU', { month: 'long' });
        const year = now.getFullYear();
        dateElement.textContent = `${weekday} ${day} ${month} ${year}`;
    }
}

// Функция для обновления погоды
function updateWeather() {
    // Здесь будет код для получения погоды
    const temperature = '--'; // Заглушка
    const weatherElement = document.querySelector('.temperature');
    if (weatherElement) {
        weatherElement.textContent = `${temperature}°C`;
    }
}

// Инициализация страницы
function initPage() {
    // Немедленно пытаемся обновить время
    updateDateTime();
    // Устанавливаем интервал обновления
    setInterval(updateDateTime, 1000);
    // Запускаем обновление погоды
    updateWeather();
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', initPage);

class EditableList {
    constructor(container, options = {}) {
        this.container = container;
        this.isEditMode = false;
        this.sortable = null;
        this.options = {
            storageKey: options.storageKey || 'items',
            itemClass: options.itemClass || 'item',
            onSave: options.onSave || (() => {}),
            onDelete: options.onDelete || (() => {}),
            createItemContent: options.createItemContent || ((item) => item.toString())
        };
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const editButton = document.querySelector('.edit-button');
        editButton.textContent = this.isEditMode ? 'Готово' : 'Изменить';

        const items = this.container.querySelectorAll(`.${this.options.itemClass}`);
        items.forEach((item, index) => {
            item.classList.toggle('edit-mode-item');
            item.style.setProperty('--item-index', index);
            
            if (this.isEditMode) {
                const itemContent = item.innerHTML;
                item.innerHTML = `
                    <div class="drag-handle">☰</div>
                    <div class="item-content">${itemContent}</div>
                    <button class="delete-button">
                        <i class="fas fa-trash"></i>
                    </button>
                `;

                const deleteBtn = item.querySelector('.delete-button');
                deleteBtn.addEventListener('click', () => {
                    this.deleteItem(item.dataset.id);
                });
            } else {
                item.innerHTML = this.options.createItemContent(
                    this.getItemData(item.dataset.id)
                );
            }
        });

        if (this.isEditMode) {
            this.initSortable();
        } else {
            if (this.sortable) {
                this.sortable.destroy();
                this.sortable = null;
            }
            this.options.onSave();
        }
    }

    initSortable() {
        this.sortable = new Sortable(this.container, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: (evt) => {
                const items = this.getItems();
                const item = items.splice(evt.oldIndex, 1)[0];
                items.splice(evt.newIndex, 0, item);
                this.saveItems(items);
            }
        });
    }

    getItems() {
        try {
            return JSON.parse(localStorage.getItem(this.options.storageKey)) || [];
        } catch (e) {
            console.error('Failed to load items:', e);
            return [];
        }
    }

    saveItems(items) {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(items));
        } catch (e) {
            console.error('Failed to save items:', e);
        }
    }

    deleteItem(id) {
        const items = this.getItems().filter(item => item.id !== parseInt(id));
        this.saveItems(items);
        this.options.onDelete(id);
    }

    getItemData(id) {
        return this.getItems().find(item => item.id === parseInt(id));
    }
} 