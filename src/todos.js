export function createToDo(title, description = "", dueDate, priority, projectIndex = null) {
    let checked = false;

    const toggleToDo = () => {
        checked = !checked;
    }

    const isChecked = () => checked;

    return {
        title,
        description,
        dueDate,
        priority,
        projectIndex,
        toggleToDo,
        isChecked,
    };
}