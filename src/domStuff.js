import {format} from "date-fns";
import { saveToLocalStorage } from "./script";
const tasksElement = document.querySelector(".tasks-list");
const projectsElement = document.querySelector(".projects-section");
const tasksProjectNameElement = document.querySelector(".project-name");
const newTaskButton = document.querySelector(".new-task-btn");

export function renderProject(project) {
    const projectElement = document.createElement("div");
    projectElement.className = "project-item";
    
    const icon = document.createElement("span");
    icon.className = "project-icon";
    icon.textContent = "📁";
    
    const title = document.createElement("span");
    title.textContent = project.title;
    
    projectElement.append(icon, title);
    return projectElement;
}


export function displayProjectTasks(project, projectIndex) {
    newTaskButton.style.display = "block";
    tasksElement.innerHTML = "";
    tasksProjectNameElement.textContent = project.title;
    if(project.inventory.length) {
        project.inventory.forEach((todo, index) => {
            const taskElement = renderTask(todo);
            taskElement.setAttribute("data-index", index);
            taskElement.setAttribute("data-project", todo.projectIndex);
            tasksElement.appendChild(taskElement);
        });
    }
    else {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";
        emptyState.innerHTML = `
            <p>This project is empty</p>
            <div class="empty-state-actions">
                <button class="delete-project-btn">Delete Project</button>
            </div>
        `;
        tasksElement.appendChild(emptyState);
    }
}

export function displayTodaysTasks(projects) {
    newTaskButton.style.display = "none";
    tasksProjectNameElement.textContent = "Today";
    tasksElement.innerHTML = "";
    projects.forEach((project) => {
        project.inventory.filter((todo) => {
            return new Date(todo.dueDate).toDateString() === new Date().toDateString();
        }).forEach((todo, index) => {
            const taskElement = renderTask(todo);
            taskElement.setAttribute("data-index", index);
            taskElement.setAttribute("data-project", todo.projectIndex);
            tasksElement.appendChild(taskElement);
        });
    });
}

export function displayAllTasks(projects) {
    newTaskButton.style.display = "none";
    tasksProjectNameElement.textContent = "All";
    tasksElement.innerHTML = "";
    projects.forEach((project) => {
        project.inventory.forEach((todo, index) => {
            const taskElement = renderTask(todo);
            taskElement.setAttribute("data-index", index);
            taskElement.setAttribute("data-project", todo.projectIndex);
            tasksElement.appendChild(taskElement);
        });
    })
}

export function renderTask(task) {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";

    // Checkbox section
    const checkboxContainer = document.createElement("label");
    checkboxContainer.className = "checkbox-container";
    
    const checkboxInput = document.createElement("input");
    checkboxInput.type = "checkbox";
    checkboxInput.checked = task.isChecked();
    checkboxInput.addEventListener("change", (e) => {
        task.toggleToDo();
        saveToLocalStorage();
    });
    
    const checkmark = document.createElement("span");
    checkmark.className = "checkmark";
    
    checkboxContainer.append(checkboxInput, checkmark);

    // Task content section
    const taskContent = document.createElement("div");
    taskContent.className = "task-content";
    
    const taskTitle = document.createElement("h3");
    taskTitle.className = "task-title";
    taskTitle.textContent = task.title;
    
    const taskMeta = document.createElement("div");
    taskMeta.className = "task-meta";
    
    const dueDate = document.createElement("span");
    dueDate.className = "due-date";
    dueDate.textContent = `📅 ${format(new Date(task.dueDate), "MMM dd")}`;
    
    const priorityTag = document.createElement("span");
    priorityTag.className = `priority-tag ${task.priority}-priority`;
    priorityTag.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

    taskMeta.append(dueDate, priorityTag);
    taskContent.append(taskTitle, taskMeta);

    // Task actions menu
    const taskActionsContainer = document.createElement("div");
    taskActionsContainer.className = "taskActions-container";
    
    const actionsIcon = document.createElement("span");
    actionsIcon.className = "taskActions-icon";
    actionsIcon.textContent = "⋮";
    
    const actionsMenu = document.createElement("div");
    actionsMenu.className = "taskActions";
    
    const detailsButton = document.createElement("button");
    detailsButton.className = "details-action";
    detailsButton.textContent = "Details";
    
    const editButton = document.createElement("button");
    editButton.className = "edit-action";
    editButton.textContent = "Edit";
    
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-action";
    deleteButton.textContent = "Delete";

    actionsMenu.append(detailsButton, editButton, deleteButton);
    taskActionsContainer.append(actionsIcon, actionsMenu);

    // Assemble everything
    taskCard.append(
        checkboxContainer,
        taskContent,
        taskActionsContainer
    );

    return taskCard;
}

export function renderDetails(projects, projectIndex, taskIndex) {
    const task = projects[projectIndex].inventory[taskIndex];
    const title = document.querySelector(".show-details .title");
    const details = document.querySelector(".show-details .details");
    const dueDate = document.querySelector(".show-details .date");
    const priority = document.querySelector(".show-details .priority");
    

    title.textContent = task.title;
    details.textContent = task.description;
    dueDate.textContent = task.dueDate;
    priority.textContent = task.priority;
}

export function renderProjects(projects) {
    document.querySelectorAll(".project-item[data-index]").forEach((element) => {element.remove()});
    projects.forEach((project, index) => {
        project.inventory.forEach((task) => {task.projectIndex = index});
        const projectElement = renderProject(project);
        projectElement.setAttribute("data-index", index);
        projectsElement.appendChild(projectElement);
    });
}