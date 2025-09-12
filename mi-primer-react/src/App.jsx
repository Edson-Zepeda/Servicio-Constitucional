import { useEffect, useState } from "react";

function Aplicacion() {
  const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/proyecto/api_tareas.php';

  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [cargando, setCargando] = useState(false);

  const mapFromApi = (row) => ({ id: row.id, texto: row.titulo, completada: !!row.completado });

  useEffect(() => {
    (async () => {
      try {
        setCargando(true);
        const res = await fetch(API);
        const data = await res.json();
        if (Array.isArray(data)) {
          setTareas(data.map(mapFromApi));
        }
      } catch (e) {
        console.error('Error cargando tareas', e);
      } finally {
        setCargando(false);
      }
    })();
  }, [API]);

  async function toggleTarea(id) {
    const actual = tareas.find(t => t.id === id);
    if (!actual) return;
    const nuevoEstado = actual.completada ? 0 : 1;
    try {
      await fetch(`${API}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completado: nuevoEstado })
      });
      setTareas(prev => prev.map(t => t.id === id ? { ...t, completada: !t.completada } : t));
    } catch (e) {
      console.error('Error actualizando tarea', e);
    }
  }

  async function removeTarea(id) {
    try {
      await fetch(`${API}?id=${id}`, { method: 'DELETE' });
      setTareas(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error('Error eliminando tarea', e);
    }
  }

  async function addTarea() {
    if (nuevaTarea.trim() === "") return;
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: nuevaTarea, descripcion: null, completado: 0 })
      });
      const creado = await res.json();
      // creado: { id, titulo, descripcion, completado }
      setTareas(prev => [...prev, mapFromApi(creado)]);
      setNuevaTarea("");
    } catch (e) {
      console.error('Error creando tarea', e);
    }
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
