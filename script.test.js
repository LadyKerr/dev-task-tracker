const { JSDOM } = require('jsdom');
const TaskManager = require('./script.js');

// script.test.js

describe('TaskManager - addTask', () => {
    let taskManager;
    let dom;
    let mockDate;

    beforeEach(() => {
        // Setup DOM environment
        dom = new JSDOM(`
            <form id="taskForm">
                <input id="taskTitle" value="">
                <input id="taskDescription" value="">
                <select id="taskCategory"><option value="Work">Work</option></select>
                <select id="taskPriority"><option value="High">High</option></select>
                <input id="taskDueDate" value="">
                <button type="submit">Add Task</button>
            </form>
            <div id="tasksList"></div>
            <div id="activeTasks"></div>
            <div id="completedTasks"></div>
            <div id="highPriorityTasks"></div>
            <select id="categoryFilter"></select>
            <select id="priorityFilter"></select>
            <select id="completionFilter"></select>
        `);

        global.document = dom.window.document;
        global.window = dom.window;

        // Mock localStorage
        global.localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
        };

        // Mock Date.now()
        mockDate = 12345;
        global.Date.now = jest.fn(() => mockDate);

        // Import and instantiate TaskManager
        taskManager = new TaskManager();
    });

    test('should add a new task successfully', () => {
        // Setup form values
        document.getElementById('taskTitle').value = 'Test Task';
        document.getElementById('taskDescription').value = 'Test Description';
        document.getElementById('taskCategory').value = 'Work';
        document.getElementById('taskPriority').value = 'High';
        document.getElementById('taskDueDate').value = '2024-12-31';

        taskManager.addTask();

        // Verify task was added
        expect(taskManager.tasks).toHaveLength(1);
        expect(taskManager.tasks[0]).toEqual({
            id: mockDate,
            title: 'Test Task',
            description: 'Test Description',
            category: 'Work',
            priority: 'High',
            dueDate: '2024-12-31',
            completed: false,
            createdAt: expect.any(String)
        });
    });

    test('should validate required fields', () => {
        const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
        
        // Try to add task with empty fields
        taskManager.addTask();

        expect(mockAlert).toHaveBeenCalled();
        expect(taskManager.tasks).toHaveLength(0);
        
        mockAlert.mockRestore();
    });

    test('should update existing task', () => {
        // Add initial task
        const existingTask = {
            id: 1,
            title: 'Original Task',
            description: 'Original Description',
            category: 'Work',
            priority: 'High',
            dueDate: '2024-12-31',
            completed: false,
            createdAt: '2023-01-01T00:00:00.000Z'
        };
        taskManager.tasks = [existingTask];
        taskManager.editingTaskId = 1;

        // Setup form with updated values
        document.getElementById('taskTitle').value = 'Updated Task';
        document.getElementById('taskDescription').value = 'Updated Description';
        document.getElementById('taskCategory').value = 'Work';
        document.getElementById('taskPriority').value = 'High';
        document.getElementById('taskDueDate').value = '2024-12-31';

        taskManager.addTask();

        expect(taskManager.tasks[0].title).toBe('Updated Task');
        expect(taskManager.tasks[0].description).toBe('Updated Description');
        expect(taskManager.tasks[0].createdAt).toBe('2023-01-01T00:00:00.000Z');
        expect(taskManager.editingTaskId).toBeNull();
    });

    test('should save to localStorage after adding task', () => {
        document.getElementById('taskTitle').value = 'Test Task';
        document.getElementById('taskDescription').value = 'Test Description';
        document.getElementById('taskCategory').value = 'Work';
        document.getElementById('taskPriority').value = 'High';
        document.getElementById('taskDueDate').value = '2024-12-31';

        taskManager.addTask();

        expect(localStorage.setItem).toHaveBeenCalledWith('tasks', expect.any(String));
    });

    test('should reset form after adding task', () => {
        const mockReset = jest.fn();
        document.getElementById('taskForm').reset = mockReset;

        document.getElementById('taskTitle').value = 'Test Task';
        document.getElementById('taskDescription').value = 'Test Description';
        document.getElementById('taskCategory').value = 'Work';
        document.getElementById('taskPriority').value = 'High';
        document.getElementById('taskDueDate').value = '2024-12-31';

        taskManager.addTask();

        expect(mockReset).toHaveBeenCalled();
    });
});