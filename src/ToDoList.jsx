import { useState, useEffect } from "react";

export default function TodoList() {
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState("");
    const [filter, setFilter] = useState("all");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedTask, setEditedTask] = useState("");

    useEffect(() => {
        fetch('https://salasfastapi-backend.onrender.com/tasks/list/', {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data) => setTasks(data))
            .catch((error) => console.error("Error fetching tasks:", error));
    }, []);

    const addTask = () => {
        if (task.trim() === "") return alert("Task cannot be empty!");

        const newTask = { text: task, completed: false };

        fetch('https://salasfastapi-backend.onrender.com/tasks/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify(newTask),
        })
            .then((response) => response.json())
            .then((data) => {
                setTasks([...tasks, data]);
                setTask("");
            })
            .catch((error) => console.error("Error adding task:", error));
    };

    const toggleComplete = (index) => {
        const updatedTask = { ...tasks[index], completed: !tasks[index].completed };
        const taskId = tasks[index].id;

        // Send the updated task to the backend to update the completion status
        fetch(`https://salasfastapi-backend.onrender.com/tasks/update/${taskId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({ completed: updatedTask.completed }), // Send only the completed field
        })
            .then((response) => response.json())
            .then(() => {
                // Update the state locally after the backend confirms the update
                const updatedTasks = tasks.map((t, i) =>
                    i === index ? { ...t, completed: updatedTask.completed } : t
                );
                setTasks(updatedTasks);
            })
            .catch((error) => console.error("Error toggling task completion:", error));
    };

    const removeTask = (index) => {
        const taskId = tasks[index].id;

        fetch(`https://salasfastapi-backend.onrender.com/tasks/delete/${taskId}/`, {
            method: 'DELETE',
            headers: {
                'accept': 'application/json',
            },
        })
            .then(() => {
                setTasks(tasks.filter((_, i) => i !== index));
            })
            .catch((error) => console.error("Error deleting task:", error));
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        setEditedTask(tasks[index].text);
    };

    const saveEdit = (index) => {
        if (editedTask.trim() === "") return alert("Task cannot be empty!");

        const updatedTask = { ...tasks[index], text: editedTask };
        const taskId = tasks[index].id;

        fetch(`https://salasfastapi-backend.onrender.com/tasks/update/${taskId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify(updatedTask),
        })
            .then((response) => response.json())
            .then(() => {
                const updatedTasks = tasks.map((t, i) =>
                    i === index ? { ...t, text: editedTask } : t
                );
                setTasks(updatedTasks);
                setEditingIndex(null);
                setEditedTask("");
            })
            .catch((error) => console.error("Error saving edited task:", error));
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === "completed") return task.completed;
        if (filter === "pending") return !task.completed;
        return true;
    });

    return (
        <div className="todo-container">
            <h2>To-Do List</h2>
            <div className="input-container">
                <input 
                    type="text" 
                    placeholder="Add a new task..." 
                    value={task} 
                    onChange={(e) => setTask(e.target.value)} 
                />
                <button className="add-btn" onClick={addTask}>
                    <i className="fas fa-plus"></i> Add
                </button>
            </div>

            <div className="filter-container">
                <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
                <button className={filter === "completed" ? "active" : ""} onClick={() => setFilter("completed")}>Completed</button>
                <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pending</button>
            </div>

            <div className="task-list-container">
                <ul>
                    {filteredTasks.map((t, index) => (
                        <li key={index}>
                            <input 
                                type="checkbox" 
                                checked={t.completed} 
                                onChange={() => toggleComplete(index)} 
                            />
                            
                            {editingIndex === index ? (
                                <input 
                                    type="text" 
                                    value={editedTask} 
                                    onChange={(e) => setEditedTask(e.target.value)} 
                                    autoFocus
                                />
                            ) : (
                                <span className={t.completed ? "completed task-text" : "task-text"}>{t.text}</span>
                            )}

                            <div className="task-actions">
                                {editingIndex === index ? (
                                    <button className="save-btn" onClick={() => saveEdit(index)}>
                                        <i className="fas fa-save"></i>
                                    </button>
                                ) : (
                                    <button className="edit-btn" onClick={() => startEditing(index)}>
                                        <i className="fas fa-edit"></i>
                                    </button>
                                )}
                                
                                <button className="delete-btn" onClick={() => removeTask(index)}>
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
