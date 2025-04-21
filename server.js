const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // For unique IDs

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const tasksFilePath = path.join(__dirname, 'data', 'tasks.json');

// Read tasks from file
function readTasks() {
  const data = fs.readFileSync(tasksFilePath);
  return JSON.parse(data);
}

// Write tasks to file
function writeTasks(tasks) {
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
}

// Serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// GET all tasks
app.get('/api/tasks', (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

// POST new task
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;

  if (!title) return res.status(400).json({ error: "Title is required" });

  const newTask = {
    id: uuidv4(),
    title,
    description,
    completed: false,
    subtasks: []
  };

  const tasks = readTasks();
  tasks.push(newTask);
  writeTasks(tasks);

  res.status(201).json(newTask);
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { title, description } = req.body;

  const tasks = readTasks();
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title,
    description
  };

  writeTasks(tasks);

  res.status(200).json({ message: "Task updated successfully" });
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const tasks = readTasks();
  const updatedTasks = tasks.filter(task => task.id !== taskId);

  writeTasks(updatedTasks);

  res.status(200).json({ message: "Task deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
