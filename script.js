class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.editingTaskId = null;
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.setupEventListeners();
        this.updateUI();
        this.initializeTheme();
    }

    initializeTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-theme');
            document.querySelector('.theme-toggle').textContent = '☀️';
        }
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Theme toggle
        document.querySelector('.theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Filter changes
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterTasks());
        document.getElementById('priorityFilter').addEventListener('change', () => this.filterTasks());
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Set editing mode
        this.editingTaskId = taskId;

        // Populate form with task data
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDueDate').value = task.dueDate;

        // Change form submit button
        const submitButton = document.querySelector('#taskForm button[type="submit"]');
        submitButton.textContent = 'Update Task';
        
        // Scroll to form
        document.getElementById('taskForm').scrollIntoView({ behavior: 'smooth' });
    }

    addTask() {
        const task = {
            id: this.editingTaskId || Date.now(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            category: document.getElementById('taskCategory').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            completed: this.editingTaskId ? this.tasks.find(t => t.id === this.editingTaskId).completed : false,
            createdAt: this.editingTaskId ? this.tasks.find(t => t.id === this.editingTaskId).createdAt : new Date().toISOString()
        };

        if (this.editingTaskId) {
            // Update existing task
            this.tasks = this.tasks.map(t => t.id === this.editingTaskId ? task : t);
            this.editingTaskId = null;
            document.querySelector('#taskForm button[type="submit"]').textContent = 'Add Task';
        } else {
            // Add new task
            this.tasks.push(task);
        }

        this.saveTasks();
        this.updateUI();
        document.getElementById('taskForm').reset();
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.updateUI();
    }

    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.updateUI();
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-theme');
        document.querySelector('.theme-toggle').textContent = this.isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('darkMode', this.isDarkMode);
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    filterTasks() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;

        let filteredTasks = [...this.tasks];

        if (categoryFilter !== 'All') {
            filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
        }
        if (priorityFilter !== 'All') {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }

        this.renderTasks(filteredTasks);
    }

    updateUI() {
        this.updateStats();
        this.updateFilters();
        this.renderTasks(this.tasks);
    }

    updateStats() {
        const activeTasks = this.tasks.filter(task => !task.completed).length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const highPriorityTasks = this.tasks.filter(task => task.priority === 'High').length;

        document.getElementById('activeTasks').textContent = activeTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('highPriorityTasks').textContent = highPriorityTasks;
    }

    updateFilters() {
        const categories = ['All', ...new Set(this.tasks.map(task => task.category))];
        const priorities = ['All', ...new Set(this.tasks.map(task => task.priority))];

        const categoryFilter = document.getElementById('categoryFilter');
        const priorityFilter = document.getElementById('priorityFilter');

        categoryFilter.innerHTML = categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');

        priorityFilter.innerHTML = priorities.map(priority => 
            `<option value="${priority}">${priority}</option>`
        ).join('');
    }

    renderTasks(tasksToRender) {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';

        tasksToRender.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.category.toLowerCase().replace(' ', '-')} ${task.completed ? 'completed' : ''}`;
            
            taskElement.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <span class="task-category ${task.category.toLowerCase().replace(' ', '-')}">${task.category}</span>
                </div>
                <p class="task-description">${task.description}</p>
                <div class="task-meta">
                    <span>Due in ${this.calculateDueDate(task.dueDate)}</span>
                    <div class="task-actions">
                        <button onclick="taskManager.toggleTaskCompletion(${task.id})">
                            ${task.completed ? '↩️' : '✓'}
                        </button>
                        <button onclick="taskManager.editTask(${task.id})">✏️</button>
                        <button onclick="taskManager.deleteTask(${task.id})">🗑️</button>
                    </div>
                </div>
            `;
            
            tasksList.appendChild(taskElement);
        });
    }

    calculateDueDate(dueDate) {
        const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (days < 0) return 'Overdue';
        if (days === 0) return 'Today';
        if (days === 1) return '1 day';
        return `${days} days`;
    }
}

// Initialize the task manager
const taskManager = new TaskManager();