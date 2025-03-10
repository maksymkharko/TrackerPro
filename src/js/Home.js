class Home {
    constructor() {
        this.updateStats();
    }

    updateStats() {
        // Получаем данные из localStorage
        const goals = JSON.parse(localStorage.getItem('goals')) || [];
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const calendars = JSON.parse(localStorage.getItem('calendarius')) || [];

        // Обновляем статистику на странице
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers[0].textContent = goals.length;
        statNumbers[1].textContent = events.length;
        statNumbers[2].textContent = calendars.length;
    }
}

class Todo {
    constructor() {
        this.todos = [];
        this.isEditMode = false;
        this.loadTodos();
        this.setupEventListeners();
        this.render();
    }

    loadTodos() {
        try {
            const savedTodos = localStorage.getItem('todos');
            if (savedTodos) {
                this.todos = JSON.parse(savedTodos);
            }
        } catch (e) {
            console.error('Failed to load todos:', e);
            this.todos = [];
        }
    }

    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (e) {
            console.error('Failed to save todos:', e);
        }
    }

    setupEventListeners() {
        // Кнопки в шапке
        const editButton = document.querySelector('.edit-button');
        const addButton = document.querySelector('.add-button');
        
        editButton.addEventListener('click', () => this.toggleEditMode());
        addButton.addEventListener('click', () => this.showAddModal());

        // Модальное окно
        const modal = document.querySelector('.add-todo-modal');
        const cancelButton = modal.querySelector('.cancel-button');
        const saveButton = modal.querySelector('.save-button');
        const input = modal.querySelector('.todo-input');

        cancelButton.addEventListener('click', () => this.hideAddModal());
        saveButton.addEventListener('click', () => this.addTodo());

        // Закрытие модального окна при клике вне его
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideAddModal();
            }
        });

        // Добавление по Enter
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const editButton = document.querySelector('.edit-button');
        editButton.textContent = this.isEditMode ? 'Готово' : 'Изменить';
        
        const todoItems = document.querySelectorAll('.todo-item');
        todoItems.forEach(item => {
            item.classList.toggle('edit-mode');
        });

        if (this.isEditMode) {
            this.initSortable();
        } else {
            if (this.sortable) {
                this.sortable.destroy();
                this.sortable = null;
            }
        }
    }

    initSortable() {
        const todoList = document.querySelector('.todo-list');
        this.sortable = new Sortable(todoList, {
            animation: 150,
            handle: '.todo-drag-handle',
            onEnd: (evt) => {
                const todos = [...this.todos];
                const item = todos.splice(evt.oldIndex, 1)[0];
                todos.splice(evt.newIndex, 0, item);
                this.todos = todos;
                this.saveTodos();
            }
        });
    }

    showAddModal() {
        const modal = document.querySelector('.add-todo-modal');
        const input = modal.querySelector('.todo-input');
        modal.classList.add('active');
        input.value = '';
        input.focus();
    }

    hideAddModal() {
        const modal = document.querySelector('.add-todo-modal');
        modal.classList.remove('active');
    }

    addTodo() {
        const input = document.querySelector('.todo-input');
        const title = input.value.trim();

        if (title) {
            const todo = {
                id: Date.now(),
                title,
                createdAt: new Date().toISOString()
            };

            this.todos.unshift(todo);
            this.saveTodos();
            this.render();
            this.hideAddModal();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    createTodoElement(todo) {
        const todoElement = document.createElement('div');
        todoElement.className = 'todo-item';
        if (this.isEditMode) todoElement.classList.add('edit-mode');
        
        todoElement.innerHTML = `
            <div class="todo-drag-handle">☰</div>
            <div class="todo-title">${todo.title}</div>
            <button class="todo-delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;

        const deleteBtn = todoElement.querySelector('.todo-delete-btn');
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        return todoElement;
    }

    render() {
        const todoList = document.querySelector('.todo-list');
        todoList.innerHTML = '';

        this.todos.forEach(todo => {
            todoList.appendChild(this.createTodoElement(todo));
        });
    }
}

// Инициализация
const homePage = new Home();

// Инициализация списка дел
new Todo(); 