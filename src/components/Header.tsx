import './Header.css'

interface HeaderProps {
  userName: string
  favoriteCount: number
  publicationCount: number
  featuredCount: number
}

const Header = ({
  userName,
  favoriteCount,
  publicationCount,
  featuredCount,
}: HeaderProps) => {
  return (
    <header className="hero-header">
      <div className="hero-copy">
        <p className="hero-kicker">Portal editorial SSC</p>
        <h1>Bienvenido, {userName}</h1>
        <p>
          Explora el catalogo institucional, guarda referencias clave y sigue las
          publicaciones mas consultadas por la comunidad.
        </p>
      </div>

      <div className="hero-stats">
        <article>
          <strong>{publicationCount}</strong>
          <span>publicaciones visibles</span>
        </article>
        <article>
          <strong>{favoriteCount}</strong>
          <span>favoritos guardados</span>
        </article>
        <article>
          <strong>{featuredCount}</strong>
          <span>titulos destacados</span>
        </article>
      </div>
    </header>
  )
}

export default Header
