import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const nome = localStorage.getItem('nome')
  const cognome = localStorage.getItem('cognome')
  const ruolo = localStorage.getItem('ruolo')

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  const tornaHome = () => {
    if (ruolo === 'ADMIN') {
      navigate('/admin')
    } else {
      navigate('/operaio')
    }
  }

  return (
    <nav className="navbar navbar-custom">
      <div className="container">

        <div
          className="navbar-brand d-flex align-items-center"
          onClick={tornaHome}
          style={{ cursor: 'pointer' }}
        >
          <img
            src="/Logo.png"
            alt="MC Trasporti - Gruppo Calafato"
            className="navbar-logo"
          />
        </div>

        <div className="d-flex align-items-center gap-3">

          <span className="navbar-user">
            {nome} {cognome}
          </span>

          <button
            className="btn btn-danger btn-sm"
            onClick={logout}
          >
            Esci
          </button>

        </div>

      </div>
    </nav>
  )
}

export default Navbar