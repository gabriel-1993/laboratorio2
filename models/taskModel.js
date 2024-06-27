// models/taskModel.js

let tasks = [
    { id: 1, title: "tarea 1", completed: false },
    { id: 2, title: "tarea 2", completed: true }
];

// Obtener todas las tareas
const getAllTasks = () => {
    return tasks;
};

// Obtener una tarea por su ID
const getTaskById = (id) => {
    return tasks.find(task => task.id === id);
};

// Agregar una nueva tarea
const addTask = (title) => {
    const id = tasks.length + 1;
    const newTask = { id, title, completed: false };
    tasks.push(newTask);
    return newTask;
};

// Editar una tarea existente
const editTask = (id, title) => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].title = title;
        return tasks[taskIndex];
    }
    return null;
};

// Marcar tarea como completada
const completeTask = (id) => {
    const task = getTaskById(id);
    if (task) {
        task.completed = true;
    }
    return task;
};

// Marcar tarea como pendiente
const uncompleteTask = (id) => {
    const task = getTaskById(id);
    if (task) {
        task.completed = false;
    }
    return task;
};

// Eliminar una tarea
const deleteTask = (id) => {
    const initialLength = tasks.length;
    tasks = tasks.filter(task => task.id !== id);
    return tasks.length < initialLength;
};

export default {
    getAllTasks,
    getTaskById,
    addTask,
    editTask,
    completeTask,
    uncompleteTask,
    deleteTask
};
