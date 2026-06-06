// script.js

const columns = ["todoList", "doingList", "doneList"];

// --- FUNÇÕES AUXILIARES DO LOCALSTORAGE ---

// Carregar tarefas salvas no navegador
function getTasksFromStorage() {
  const tasks = localStorage.getItem("tasks");
  return tasks ? JSON.parse(tasks) : [];
}

// Salvar a lista atualizada de tarefas no navegador
function saveTasksToStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// --- FUNÇÕES PRINCIPAIS ---

// Carregar tarefas ao abrir a página
window.addEventListener("DOMContentLoaded", () => {
  const tasks = getTasksFromStorage();
  tasks.forEach(task => renderTask(task));
});

// Adicionar tarefa
document.getElementById("addBtn").addEventListener("click", () => {
  const input = document.getElementById("taskInput");
  const prioritySelect = document.getElementById("taskPriority");
  const text = input.value.trim();
  const priority = prioritySelect ? prioritySelect.value : "normal";

  if (!text) return alert("Digite uma tarefa!");

  // Cria um objeto de tarefa simulando o ID do backend
  const newTask = {
    id: Date.now().toString(), // Gera um ID único baseado no tempo atual
    text,
    column: "todoList",
    priority
  };

  // Salva no LocalStorage
  const tasks = getTasksFromStorage();
  tasks.push(newTask);
  saveTasksToStorage(tasks);

  // Renderiza na tela
  renderTask(newTask);
  input.value = "";
});

// Renderizar tarefa na tela
function renderTask(task) {
  const { id, text, column, priority } = task;
  const ul = document.getElementById(column);
  
  // Evita renderizar se a coluna não existir no HTML
  if (!ul) return; 

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
  
  // Atualizar texto ao clicar fora do card
  contentDiv.addEventListener("blur", () => {
    const updatedText = contentDiv.textContent.trim();
    let tasks = getTasksFromStorage();
    tasks = tasks.map(t => t.id === id ? { ...t, text: updatedText } : t);
    saveTasksToStorage(tasks);
  });
  li.appendChild(contentDiv);

  // Tag de prioridade
  const tag = document.createElement("span");
  tag.classList.add("priority-tag", priority);
  tag.textContent = priority ? priority[0].toUpperCase() : "N";
  li.appendChild(tag);

  // Botão excluir
  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑️";
  delBtn.onclick = () => {
    li.remove();
    // Remove do LocalStorage
    let tasks = getTasksFromStorage();
    tasks = tasks.filter(t => t.id !== id);
    saveTasksToStorage(tasks);
  };
  li.appendChild(delBtn);

  // Drag & Drop do Card (Fim do movimento)
  li.addEventListener("dragstart", () => li.classList.add("dragging"));
  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    
    // Pequeno delay para garantir que o 'drop' da coluna atualizou o dataset primeiro
    setTimeout(() => {
      const newColumn = li.dataset.column;
      let tasks = getTasksFromStorage();
      tasks = tasks.map(t => t.id === id ? { ...t, column: newColumn } : t);
      saveTasksToStorage(tasks);
    }, 50);
  });

  setCardColor(li, column);
  ul.appendChild(li);
}

// --- CONFIGURAÇÃO DO DRAG & DROP NAS COLUNAS ---
columns.forEach(id => {
  const ul = document.getElementById(id);
  if (!ul) return;

  ul.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    if (!dragging) return;
    
    const afterElement = getDragAfterElement(ul, e.clientY);
    if (!afterElement) {
      ul.appendChild(dragging);
    } else {
      ul.insertBefore(dragging, afterElement);
    }
  });

  ul.addEventListener("drop", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    if (!dragging) return;
    
    const newColumn = ul.id;
    dragging.dataset.column = newColumn;
    setCardColor(dragging, newColumn);
  });
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
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
