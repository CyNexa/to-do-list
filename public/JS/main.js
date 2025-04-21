const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("addTask");

taskForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-desc").value.trim();

  if (!title) return;

  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description })
  });

  document.getElementById("task-title").value = "";
  document.getElementById("task-desc").value = "";

  loadTasks();
});

// Add a modal container to the HTML (if not already present)
document.body.insertAdjacentHTML(
  "beforeend",
  `
  <div id="edit-modal" class="hidden fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded shadow-lg w-96">
      <h2 class="text-xl font-bold mb-4">Edit Task</h2>
      <div class="mb-4">
        <label for="edit-title" class="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" id="edit-title" class="border p-2 w-full rounded" />
      </div>
      <div class="mb-4">
        <label for="edit-description" class="block text-sm font-medium text-gray-700">Description</label>
        <textarea id="edit-description" class="border p-2 w-full rounded"></textarea>
      </div>
      <div class="flex justify-end space-x-2">
        <button id="cancel-edit" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
        <button id="confirm-edit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Confirm</button>
      </div>
    </div>
  </div>
  `
);

// Fetch and display tasks
async function loadTasks() {
  const res = await fetch("/api/tasks");
  const tasks = await res.json();

  taskList.innerHTML = "";

  tasks.forEach(task => {
    const taskEl = document.createElement("li");
    taskEl.className = "bg-white p-4 rounded shadow";

    taskEl.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <label class="flex items-start space-x-3">
            <label class="flex items-center cursor-pointer relative mt-1" for="check-2">
              <input type="checkbox" ${task.completed ? "checked" : ""} class="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800" id="check-2" />
              <span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" stroke-width="1"> <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
              </span>
            </label>
            <div>
              <h3 class="text-lg font-medium ${task.completed ? "line-through text-gray-500" : ""}" id="title-${task.id}">${task.title}</h3>
              <p class="text-sm text-gray-600" id="desc-${task.id}">${task.description || ''}</p>
            </div>
          </label>
        </div>
        <div class="space-x-2">
          <button class="text-blue-500 hover:text-blue-700" onclick="enableEdit('${task.id}', '${task.title}', '${task.description || ''}')">Edit</button>
          <button class="text-red-500 hover:text-red-700" onclick="deleteTask('${task.id}')">Delete</button>
        </div>
      </div>
    `;

    taskList.appendChild(taskEl);
  });
}

// Enable popup editing
function enableEdit(taskId, currentTitle, currentDescription) {
  const modal = document.getElementById("edit-modal");
  const titleInput = document.getElementById("edit-title");
  const descriptionInput = document.getElementById("edit-description");
  const confirmButton = document.getElementById("confirm-edit");
  const cancelButton = document.getElementById("cancel-edit");

  // Populate the modal with the current task data
  titleInput.value = currentTitle;
  descriptionInput.value = currentDescription;

  // Show the modal
  modal.classList.remove("hidden");

  // Handle confirm button click
  confirmButton.onclick = async function () {
    const newTitle = titleInput.value.trim();
    const newDescription = descriptionInput.value.trim();

    if (newTitle) {
      await updateTask(taskId, newTitle, newDescription);
      modal.classList.add("hidden"); // Hide the modal after saving
    }
  };

  // Handle cancel button click
  cancelButton.onclick = function () {
    modal.classList.add("hidden"); // Hide the modal without saving
  };
}

// Save the edited task
async function saveEdit(taskId) {
  const newTitle = document.getElementById(`edit-title-${taskId}`).value.trim();
  const newDescription = document.getElementById(`edit-desc-${taskId}`).value.trim();

  if (newTitle) {
    await updateTask(taskId, newTitle, newDescription);
  }
}

// Cancel the edit
function cancelEdit(taskId, originalTitle, originalDescription) {
  const titleEl = document.getElementById(`title-${taskId}`);
  const descEl = document.getElementById(`desc-${taskId}`);

  titleEl.innerHTML = originalTitle;
  descEl.innerHTML = originalDescription;

  const parentDiv = titleEl.closest("div").nextElementSibling;
  parentDiv.innerHTML = `
    <button class="text-blue-500 hover:text-blue-700" onclick="enableEdit('${taskId}', '${originalTitle}', '${originalDescription}')">Edit</button>
    <button class="text-red-500 hover:text-red-700" onclick="deleteTask('${taskId}')">Delete</button>
  `;
}

// Update task function
async function updateTask(taskId, title, description) {
  await fetch(`/api/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description })
  });

  loadTasks();
}

// Delete task function
async function deleteTask(taskId) {
  await fetch(`/api/tasks/${taskId}`, {
    method: "DELETE"
  });

  loadTasks();
}

// On page load
loadTasks();
