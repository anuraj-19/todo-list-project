
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const filters = document.querySelector(".filters");

// Load saved tasks
let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("todoTasks"));

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.id === "number" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

let currentFilter = "all";
let editingId = null;

// Save tasks
function saveTasks() {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

// Display tasks
function displayTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    if (filteredTasks.length === 0) {
        const message = document.createElement("li");
        message.className = "empty-message";
        message.textContent = "No tasks to display.";
        taskList.appendChild(message);
    }

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.dataset.action = "toggle";
        checkbox.dataset.id = task.id;
        checkbox.setAttribute("aria-label", "Complete " + task.text);

        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        if (task.completed) {
            span.classList.add("completed");
        }

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.dataset.action = "edit";
        editButton.dataset.id = task.id;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = task.id;

        li.append(checkbox, span, editButton, deleteButton);
        taskList.appendChild(li);
    });

    const activeCount = tasks.filter(task => !task.completed).length;
    const completedCount = tasks.filter(task => task.completed).length;

    taskCount.textContent =
        `Total: ${tasks.length} | Active: ${activeCount} | Completed: ${completedCount}`;

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );
    });
}

// Add or update a task
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        taskInput.focus();
        return;
    }

    if (editingId !== null) {
        const task = tasks.find(task => task.id === editingId);

        if (task) {
            task.text = text;
        }

        editingId = null;
        addButton.textContent = "Add Task";
    } else {
        tasks.push({
            id: Date.now(),
            text: text,
            completed: false
        });
    }

    saveTasks();
    displayTasks();

    taskInput.value = "";
    taskInput.focus();
});

// Handle edit and delete using event delegation
taskList.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const id = Number(button.dataset.id);
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    if (action === "edit") {
        taskInput.value = task.text;
        editingId = task.id;
        addButton.textContent = "Update Task";
        taskInput.focus();
    }

    if (action === "delete") {
        tasks = tasks.filter(task => task.id !== id);

        if (editingId === id) {
            editingId = null;
            taskInput.value = "";
            addButton.textContent = "Add Task";
        }

        saveTasks();
        displayTasks();
    }
});

// Handle completion
taskList.addEventListener("change", function(event) {
    if (event.target.dataset.action !== "toggle") {
        return;
    }

    const id = Number(event.target.dataset.id);
    const task = tasks.find(task => task.id === id);

    if (task) {
        task.completed = event.target.checked;
        saveTasks();
        displayTasks();
    }
});

// Filter tasks
filters.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-filter]");

    if (!button) {
        return;
    }

    currentFilter = button.dataset.filter;
    displayTasks();
});

// Initial display
displayTasks();
