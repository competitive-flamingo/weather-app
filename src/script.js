import "./styles.css";
import {createToDo} from "./todos";
import {createProject} from "./projects";
import {format} from "date-fns";
import {renderProject, displayProjectTasks, displayTodaysTasks, renderTask, renderDetails, displayAllTasks, renderProjects} from "./domStuff"

const DATE_FORMAT = "MMMM dd, yyyy";
const projects = [];
const projectsElement = document.querySelector(".projects-section");
const tasksElement = document.querySelector(".tasks-list");
const projectDialog = document.querySelector(".add-project");
const newProjectButton = document.querySelector(".new-project-btn");
const newTaskButton = document.querySelector(".new-task-btn");
const taskDialog = document.querySelector(".add-task");
const projectDialogForm = document.querySelector(".project-dialog-form");
const taskDialogForm = document.querySelector(".task-dialog-form");
const taskDialogConfirmButton = document.querySelector(".add-task .confirm");
const projectDialogConfirmButton = document.querySelector(".add-project .confirm");
const detailsDialog = document.querySelector(".show-details");
let currentDateElement;
let isEdittingTask = false;
let edittingTaskIndex = null;
let currentProjectIndex = null;


export function saveToLocalStorage() {
    const dataToSave = {
        projects: projects.map(project => ({
            ...project,
            inventory: project.inventory.map(todo => ({
                title: todo.title,
                description: todo.description,
                dueDate: todo.dueDate,
                priority: todo.priority,
                projectIndex: todo.projectIndex,
                checked: todo.isChecked()
            })),
        }))
    };
    localStorage.setItem('todoAppData', JSON.stringify(dataToSave));
}

function loadFromLocalStorage() {
    const savedData = JSON.parse(localStorage.getItem('todoAppData'));
    if(!savedData) return;
    savedData.projects.forEach(projectData => {
        const newProject = createProject(projectData.title);
        newProject.inventory = projectData.inventory.map(todoData => {
            const todo = createToDo(
                todoData.title,
                todoData.description,
                todoData.dueDate,
                todoData.priority,
                todoData.projectIndex,
            )
            if(todoData.checked) todo.toggleToDo();
            return todo;
        })
        projects.push(newProject);
    })
    renderProjects(projects);
    deactivateProjects();
    document.querySelector(".project-item.home").classList.add("active");
    displayAllTasks(projects);
}


function deactivateProjects() {
    document.querySelectorAll(".project-item").forEach((project) => {
        project.classList.remove("active");
    });
}

function getSelectedPriority() {
    const selectedPriority = document.querySelector('input[name="priority"]:checked').value;
    return selectedPriority;
}

function getActiveProject() {
    return document.querySelector(".project-item.active");
}


document.addEventListener("DOMContentLoaded", () => {
    loadFromLocalStorage();
    currentDateElement = document.querySelector(".current-date")
    currentDateElement.textContent = format(new Date(), DATE_FORMAT);
});

setInterval(() => {
    currentDateElement.textContent = format(new Date(), DATE_FORMAT);
}, 1000 * 60);


newProjectButton.addEventListener("click", (event) => {
    projectDialog.showModal();
});

projectDialogConfirmButton.addEventListener("click", (event) => {
    event.preventDefault();
    if(projectDialogForm.checkValidity()) {
        const title = document.querySelector(".add-project input");
        const project = createProject(title.value);
        const projectElement = renderProject(project);
        projectElement.setAttribute("data-index", projects.length);
        projects.push(project);
        saveToLocalStorage();
        projectsElement.append(projectElement);
        projectDialog.close();
        projectDialogForm.reset();
    }
    else projectDialogForm.reportValidity();
});

projectsElement.addEventListener("click", (event) => {
    const targetElement = event.target.closest(".project-item");
    if(!targetElement) return;
    deactivateProjects();
    targetElement.classList.add("active");
    if(targetElement.classList.contains("home")) {
        displayAllTasks(projects);
    }
    else if(targetElement.classList.contains("today")) {
        displayTodaysTasks(projects);
    }
    else {
        const projectIndex = parseInt(targetElement.dataset.index);
        displayProjectTasks(projects[projectIndex]);
    }
});

newTaskButton.addEventListener("click", (event) => {
    taskDialog.showModal();
});

taskDialogConfirmButton.addEventListener("click", (event) => { // handle task submission
    event.preventDefault();
    if(taskDialogForm.checkValidity()) {
        const title = document.querySelector(".add-task #title");
        const details = document.querySelector(".add-task #details");
        const dueDate = document.querySelector(".add-task #date");
        const selectedPriority = getSelectedPriority();
        const activeProject = getActiveProject();
        const activeProjectIndex = parseInt(activeProject.dataset.index);
        if(isEdittingTask) {
            const task = projects[currentProjectIndex].inventory[edittingTaskIndex];
            task.title = title.value;
            task.description = details.value;
            task.dueDate = dueDate.value;
            task.priority = selectedPriority;
            if(activeProject.classList.contains("home")) {
                displayAllTasks(projects);
            }
            else if(activeProject.classList.contains("today")) {
                displayTodaysTasks(projects);
            }
            else {
                displayProjectTasks(projects[currentProjectIndex]);
            }
        }
        else {
            const task = createToDo(title.value, details.value, dueDate.value, selectedPriority, activeProjectIndex);
            const taskElement = renderTask(task);
            projects[activeProjectIndex].inventory.push(task);
            displayProjectTasks(projects[activeProjectIndex]);
        }
        saveToLocalStorage();
        clearEdittingTask();
        taskDialogForm.reset();
        taskDialog.close();
    }
    else taskDialogForm.reportValidity();
});

function clearEdittingTask() {
    isEdittingTask = false;
    edittingTaskIndex = null;
    currentProjectIndex = null;
}

document.querySelector(".add-task .cancel").addEventListener("click", (event) => {
    taskDialogForm.reset();
    clearEdittingTask();
});

tasksElement.addEventListener("click", (event) => {
    const targetElement = event.target;
    const actionsContainer = targetElement.closest(".taskActions-container");
    const checkboxContainer = targetElement.closest(".checkbox-container");
    if (actionsContainer) {
        document.querySelectorAll(".taskActions-container.active").forEach(container => {
            if (container !== actionsContainer) container.classList.remove("active");
        });
        actionsContainer.classList.toggle("active");
        if (targetElement.tagName === "BUTTON") {
            actionsContainer.classList.remove("active");
            const taskElement = targetElement.parentNode.parentNode.parentNode;
            const projectIndex = taskElement.dataset.project;
            switch(targetElement.className) {
                case "details-action":
                    detailsDialog.showModal();
                    renderDetails(projects, projectIndex, parseInt(taskElement.dataset.index));
                    break;
                case "edit-action":
                    handleEditTask(taskElement);
                    break;
                case "delete-action":
                    handleDeleteTask(taskElement);
                    break;
            }
        }
    }
    else if(targetElement.className == "delete-project-btn") {
        const selectedProject = getActiveProject();
        const projectIndex = selectedProject.dataset.index;
        projects.splice(projectIndex, 1);
        saveToLocalStorage();
        selectedProject.remove();
        renderProjects(projects);
        deactivateProjects();
        document.querySelector(".project-item.home").classList.add("active");
        displayAllTasks(projects);
    }
});

function handleEditTask(taskElement) {
    isEdittingTask = true;
    const projectIndex = taskElement.dataset.project;
    const taskIndex = parseInt(taskElement.dataset.index);
    const task = projects[projectIndex].inventory[taskIndex];

    edittingTaskIndex = taskIndex;
    currentProjectIndex = projectIndex;

    // Populate form fields
    document.querySelector(".add-task #title").value = task.title;
    document.querySelector(".add-task #details").value = task.description;
    document.querySelector(".add-task #date").value = task.dueDate;

    // Set priority
    document.querySelector(`input[name="priority"][value="${task.priority}"]`).checked = true;

    taskDialog.showModal();
}

function handleDeleteTask(taskElement) {
    const taskIndex = parseInt(taskElement.dataset.index);
    const projectIndex = taskElement.dataset.project;
    const activeProject = getActiveProject();
    projects[projectIndex].inventory.splice(taskIndex, 1);
    saveToLocalStorage();
    if(activeProject.classList.contains("home")) {
        displayAllTasks(projects);
    }
    else if(activeProject.classList.contains("today")) {
        displayTodaysTasks(projects);
    }
    else {
        displayProjectTasks(projects[projectIndex]);
    }

}

document.addEventListener("click", (event) => {
    if (!event.target.closest(".taskActions-container")) {
        document.querySelectorAll(".taskActions-container.active").forEach(container => {
            container.classList.remove("active");
        });
    }
});
