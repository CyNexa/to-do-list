document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');

    // Load tasks from local storage when the page loads
    loadTasks();

    taskInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && taskInput.value.trim() !== '') {
            addTask(taskInput.value.trim());
            taskInput.value = '';

            // Save tasks to local storage after adding a new task
            saveTasks();
        }
    });

    function addTask(taskText) {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        const label = document.createElement('label');
        label.innerText = taskText;

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.addEventListener('click', function () {
            // Remove the task's li element
            li.remove();
            // Save tasks to local storage after deleting a task
            saveTasks();
        });

        li.appendChild(label);
        li.appendChild(deleteButton);

        taskList.appendChild(li);

        checkbox.addEventListener('change', function () {
            label.classList.toggle('completed', checkbox.checked);
            // Save tasks to local storage after changing task completion status
            saveTasks();
        });
    }

    function loadTasks() {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(taskText => addTask(taskText));
    }

    function saveTasks() {
        const tasks = Array.from(taskList.children).map(li => li.querySelector('label').innerText);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});
