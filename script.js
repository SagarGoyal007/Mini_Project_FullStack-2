const todoInput = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const filters = document.querySelectorAll(".filter");
const itemsLeft = document.getElementById("itemsLeft");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

let todos = [];
let currentFilter = "all";

function loadTodos() {
  const stored = localStorage.getItem("todos");
  if (stored) {
    try {
      todos = JSON.parse(stored);
    } catch {
      todos = [];
    }
  }
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function updateCount() {
  const left = todos.filter(t => !t.completed).length;
  itemsLeft.textContent = left + (left === 1 ? " item left" : " items left");
}

function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.id = todo.id;
  if (todo.completed) li.classList.add("completed");

  const main = document.createElement("label");
  main.className = "todo-main";

  const check = document.createElement("input");
  check.type = "checkbox";
  check.className = "todo-check";
  check.checked = todo.completed;

  const span = document.createElement("span");
  span.className = "todo-text";
  span.textContent = todo.text;

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "todo-edit-input";
  editInput.value = todo.text;

  main.appendChild(check);
  main.appendChild(span);
  main.appendChild(editInput);

  const actions = document.createElement("div");
  actions.className = "todo-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "btn small edit-btn";
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn small delete-btn";
  deleteBtn.textContent = "Delete";

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(main);
  li.appendChild(actions);

  check.addEventListener("change", () => toggleTodo(todo.id));
  editBtn.addEventListener("click", () => toggleEditMode(li, todo.id));
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));
  editInput.addEventListener("keydown", e => {
    if (e.key === "Enter") finishEdit(li, todo.id);
    if (e.key === "Escape") cancelEdit(li, todo.id);
  });
  editInput.addEventListener("blur", () => finishEdit(li, todo.id));

  return li;
}

function renderTodos() {
  todoList.innerHTML = "";
  let filtered = todos;
  if (currentFilter === "active") {
    filtered = todos.filter(t => !t.completed);
  } else if (currentFilter === "completed") {
    filtered = todos.filter(t => t.completed);
  }
  filtered.forEach(todo => {
    const el = createTodoElement(todo);
    todoList.appendChild(el);
  });
  updateCount();
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;
  const todo = {
    id: Date.now().toString(),
    text: text,
    completed: false
  };
  todos.unshift(todo);
  saveTodos();
  todoInput.value = "";
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

function toggleEditMode(li, id) {
  const isEditing = li.classList.contains("editing");
  if (!isEditing) {
    li.classList.add("editing");
    const input = li.querySelector(".todo-edit-input");
    input.value = todos.find(t => t.id === id).text;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  } else {
    finishEdit(li, id);
  }
}

function finishEdit(li, id) {
  const input = li.querySelector(".todo-edit-input");
  const value = input.value.trim();
  if (!value) {
    deleteTodo(id);
    return;
  }
  todos = todos.map(t =>
    t.id === id ? { ...t, text: value } : t
  );
  saveTodos();
  li.classList.remove("editing");
  renderTodos();
}

function cancelEdit(li, id) {
  li.classList.remove("editing");
  renderTodos();
}

function setFilter(filter) {
  currentFilter = filter;
  filters.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  renderTodos();
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  renderTodos();
}

function clearAll() {
  todos = [];
  saveTodos();
  renderTodos();
}

addBtn.addEventListener("click", addTodo);

todoInput.addEventListener("keydown", e => {
  if (e.key === "Enter") addTodo();
});

filters.forEach(btn => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

clearCompletedBtn.addEventListener("click", clearCompleted);
clearAllBtn.addEventListener("click", clearAll);

loadTodos();
renderTodos();
