import { useState } from "react";

function Aplicacion() {
  const [tareas, setTareas] = useState([
    {id: 1, texto: "Aprender React", completada: false },
    { id: 2, texto: "Hacer la lista de tareas", completada: true },
    { id: 3, texto: "Practicar CSS", completada: false }]);
function toggleTarea(id) {
  setTareas(prev =>
    prev.map(t =>
      t.id === id ? { ...t, completada: !t.completada } : t
    )
  );
}
  function removeTarea(id) {
  setTareas(prev => prev.filter(t => t.id !== id)); 
}
  const [nuevaTarea, setNuevaTarea] = useState("");
  function addTarea() {
    if (nuevaTarea.trim() === "") return;
    const nueva = {
      id: Date.now(),
      texto: nuevaTarea,
      completada: false
    };
    setTareas(prev => [...prev, nueva]);
    setNuevaTarea("");
  }
  

  return (
    <div className="app">
      <div className="encabezado">
        <h1>Todo List</h1>
      </div>
    <div className="instrucciones">
     <div className="nueva-tarea">
        <input
          type="text"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          placeholder="Nueva tarea"
          onKeyDown={(e) => e.key === "Enter" && addTarea()} // 👈 aquí el truco
        />
        <button 
        onClick={addTarea} 
        aria-label= "Agregar tarea" 
        disabled = {!nuevaTarea.trim()}
        >
          Agregar
        </button>
      </div>


      {tareas.length === 0 ? (
        <p>No hay tareas</p>
      ) : (
        <>
          <p>Número de tareas: {tareas.length}</p>
          <ul>
            {tareas.map((tarea) => (
              <li key={tarea.id}>
                <div className="tarea-contenido">
                  <input
                    type="checkbox"
                    checked={tarea.completada}
                    onChange={() => toggleTarea(tarea.id)}
                  />

                  <span className={tarea.completada ? "completada" : ""}>  
                    {tarea.texto}
                  </span>
                </div>
                <button onClick={() => removeTarea(tarea.id)}>
                  X
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  </div>    
  );
}
export default Aplicacion;
