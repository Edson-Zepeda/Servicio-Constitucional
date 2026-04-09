import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <section>
          <h3>Portal editorial SSC</h3>
          <p>
            Catalogo academico con perfiles diferenciados para consulta, gestion y
            seguimiento administrativo.
          </p>
        </section>

        <section>
          <h3>Contacto</h3>
          <p>Direccion General de Publicaciones</p>
          <p>publicaciones@ucol.mx</p>
          <p>312 316 10 81</p>
        </section>

        <section>
          <h3>Funciones clave</h3>
          <p>Busqueda avanzada</p>
          <p>Favoritos personales</p>
          <p>Administracion de usuarios y publicaciones</p>
        </section>
      </div>

      <div className="footer-bottom">
        <span>Universidad de Colima | {new Date().getFullYear()}</span>
        <span>Sistema local de demostracion con persistencia en navegador</span>
      </div>
    </footer>
  )
}

export default Footer
