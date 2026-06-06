// script.js
import { getTasks, createTask, updateTask, deleteTask } from "./api.js";

const columns = ["todoList", "doingList", "doneList"];

// Carregar tarefas do backend
window.addEventListener("DOMContentLoaded", async () => {
  const tasks = await getTasks();
  tasks.forEach(task => renderTask(task));
});

// Adicionar tarefa
document.getElementById("addBtn").addEventListener("click", async () => {
  const input = document.getElementById("taskInput");
  const prioritySelect = document.getElementById("taskPriority");
  const text = input.value.trim();
  const priority = prioritySelect ? prioritySelect.value : "normal";

  if (!text) return alert("Digite uma tarefa!");

  const newTask = await createTask({ text, column: "todoList", priority });
  renderTask(newTask);
  input.value = "";
});

// Renderizar tarefa
function renderTask(task) {
  const { id, text, column, priority } = task;
  const ul = document.getElementById(column);
  const li = document.createElement("li");
  li.draggable = true;
  li.dataset.id = id;
  li.dataset.column = column;
  li.dataset.priority = priority;

  // Conteúdo editável
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("task-content");
  contentDiv.textContent = text;
  contentDiv.contentEditable = true;
  contentDiv.addEventListener("blur", async () => {
    await updateTask(id, { text: contentDiv.textContent.trim() });
  });
  li.appendChild(contentDiv);

  // Tag de prioridade
  const tag = document.createElement("span");
  tag.classList.add("priority-tag", priority);
  tag.textContent = priority[0].toUpperCase();
  li.appendChild(tag);

  // Botão excluir
  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑️";
  delBtn.onclick = async () => {
    li.remove();
    await deleteTask(id);
  };
  li.appendChild(delBtn);

  // Drag & Drop
  li.addEventListener("dragstart", () => li.classList.add("dragging"));
  li.addEventListener("dragend", async () => {
    li.classList.remove("dragging");
    const newColumn = li.dataset.column;
    await updateTask(id, { column: newColumn });
  });

  setCardColor(li, column);
  ul.appendChild(li);
}

// Drag & Drop
columns.forEach(id => {
  const ul = document.getElementById(id);

  ul.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(ul, e.clientY);
    if (!afterElement) ul.appendChild(dragging);
    else ul.insertBefore(dragging, afterElement);
  });

  ul.addEventListener("drop", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    if (!dragging) return;
    const newColumn = ul.id;
    dragging.dataset.column = newColumn;
    ul.appendChild(dragging);
    setCardColor(dragging, newColumn);
  });
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    else return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function setCardColor(li, columnId) {
  switch (columnId) {
    case "todoList": li.style.borderLeft = "5px solid #0077cc"; break;
    case "doingList": li.style.borderLeft = "5px solid #ff9800"; break;
    case "doneList": li.style.borderLeft = "5px solid #4caf50"; break;
    default: li.style.borderLeft = "5px solid #0077cc"; break;
  }
}
