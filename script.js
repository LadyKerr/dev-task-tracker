class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.editingTaskId = null;
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.timer = {
            workTime: 25,
            breakTime: 5,
            timeLeft: 25 * 60,
            isRunning: false,
            isBreak: false,
            intervalId: null
        };
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
        
        // Add completion filter
        document.getElementById('completionFilter').addEventListener('change', () => this.filterTasks());

        // Add tag filter change event
        document.getElementById('tagFilter').addEventListener('change', () => this.filterTasks());

        // Pomodoro timer event listeners
        document.querySelectorAll('.timer-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const workTime = parseInt(btn.dataset.work);
                const breakTime = parseInt(btn.dataset.break);
                this.setTimerPreset(workTime, breakTime);
            });
        });

        document.getElementById('customTimerBtn').addEventListener('click', () => {
            const workTime = prompt('Enter work time in minutes:', '25');
            const breakTime = prompt('Enter break time in minutes:', '5');
            if (workTime && breakTime) {
                this.setTimerPreset(parseInt(workTime), parseInt(breakTime));
            }
        });

        document.getElementById('startTimer').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseTimer').addEventListener('click', () => this.pauseTimer());
        document.getElementById('resetTimer').addEventListener('click', () => this.resetTimer());
    }
    
    validateTaskInput(task) {
        const errors = [];
        
        if (!task.title.trim()) {
            errors.push('Title is required');
        }
        
        if (!task.description.trim()) {
            errors.push('Description is required');
        }
        
        if (!task.dueDate) {
            errors.push('Due date is required');
        } else {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (isNaN(dueDate.getTime())) {
                errors.push('Invalid due date format');
            } else if (dueDate < today) {
                errors.push('Due date cannot be in the past');
            }
        }
        
        if (!task.category) {
            errors.push('Category is required');
        }
        
        if (!task.priority) {
            errors.push('Priority is required');
        }
        
        return errors;
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
        document.getElementById('taskTags').value = task.tags ? task.tags.join(', ') : '';

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
            createdAt: this.editingTaskId ? this.tasks.find(t => t.id === this.editingTaskId).createdAt : new Date().toISOString(),
            tags: document.getElementById('taskTags').value
                .split(',')
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag !== '')
        };

        const validationErrors = this.validateTaskInput(task);
        
        if (validationErrors.length > 0) {
            const errorMessage = validationErrors.join('\n');
            alert(errorMessage);
            return;
        }

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
        const completionFilter = document.getElementById('completionFilter').value;
        const tagFilter = document.getElementById('tagFilter').value;

        let filteredTasks = [...this.tasks];

        if (categoryFilter !== 'All') {
            filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
        }
        if (priorityFilter !== 'All') {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        if (completionFilter !== 'All Tasks') {
            filteredTasks = filteredTasks.filter(task => 
                completionFilter === 'Completed' ? task.completed : !task.completed
            );
        }
        if (tagFilter !== 'All') {
            filteredTasks = filteredTasks.filter(task => 
                task.tags && task.tags.includes(tagFilter.toLowerCase())
            );
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
        const tags = ['All', ...new Set(this.tasks.flatMap(task => task.tags || []))];

        const categoryFilter = document.getElementById('categoryFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        const tagFilter = document.getElementById('tagFilter');

        categoryFilter.innerHTML = categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');

        priorityFilter.innerHTML = priorities.map(priority => 
            `<option value="${priority}">${priority}</option>`
        ).join('');

        tagFilter.innerHTML = tags.map(tag => 
            `<option value="${tag}">${tag === 'All' ? 'All' : '#' + tag}</option>`
        ).join('');

        const completionFilter = document.getElementById('completionFilter');
        completionFilter.innerHTML = `
            <option value="All">All Tasks</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
        `;
    }

    renderTasks(tasksToRender) {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';
    
        tasksToRender.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.category.toLowerCase().replace(' ', '-')} ${task.completed ? 'completed' : ''}`;
            taskElement.innerHTML = this.createTaskTemplate(task);
            tasksList.appendChild(taskElement);
        });
    }
    
    createTaskTemplate(task) {
        const tagsHtml = task.tags && task.tags.length > 0
            ? `<div class="task-tags">
                ${task.tags.map(tag => `<span class="task-tag" onclick="taskManager.filterByTag('${tag}')">#${tag}</span>`).join('')}
               </div>`
            : '';

        return `
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <span class="task-category ${task.category.toLowerCase().replace(' ', '-')}">${task.category}</span>
            </div>
            <p class="task-description">${task.description}</p>
            ${tagsHtml}
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
    }

    calculateDueDate(dueDate) {
        const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (days < 0) return 'Overdue';
        if (days === 0) return 'Today';
        if (days === 1) return '1 day';
        return `${days} days`;
    }

    setTimerPreset(workTime, breakTime) {
        this.timer.workTime = workTime;
        this.timer.breakTime = breakTime;
        this.resetTimer();
    }

    startTimer() {
        if (!this.timer.isRunning) {
            this.timer.isRunning = true;
            document.getElementById('startTimer').textContent = 'Running';
            
            this.timer.intervalId = setInterval(() => {
                if (this.timer.timeLeft > 0) {
                    this.timer.timeLeft--;
                    this.updateTimerDisplay();
                } else {
                    this.handleTimerComplete();
                }
            }, 1000);
        }
    }

    pauseTimer() {
        if (this.timer.isRunning) {
            clearInterval(this.timer.intervalId);
            this.timer.isRunning = false;
            document.getElementById('startTimer').textContent = 'Start';
        }
    }

    resetTimer() {
        this.pauseTimer();
        this.timer.timeLeft = this.timer.workTime * 60;
        this.timer.isBreak = false;
        this.updateTimerDisplay();
        document.getElementById('timerStatus').textContent = 'Work Time';
    }

    handleTimerComplete() {
        const notification = new Notification("Pomodoro Timer", {
            body: this.timer.isBreak ? "Break time is over! Time to work!" : "Work time is over! Time for a break!",
            icon: "🍅"
        });

        this.timer.isBreak = !this.timer.isBreak;
        this.timer.timeLeft = (this.timer.isBreak ? this.timer.breakTime : this.timer.workTime) * 60;
        this.updateTimerDisplay();
        document.getElementById('timerStatus').textContent = this.timer.isBreak ? 'Break Time' : 'Work Time';
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer.timeLeft / 60);
        const seconds = this.timer.timeLeft % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = display;
    }

    filterByTag(tag) {
        document.getElementById('tagFilter').value = tag;
        this.filterTasks();
    }
}

// Initialize the task manager
const taskManager = new TaskManager();

module.exports = TaskManager;