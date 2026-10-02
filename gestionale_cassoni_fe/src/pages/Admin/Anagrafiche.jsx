import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'

function Anagrafiche() {
  const navigate = useNavigate()



  return (
    <div className="min-vh-100 bg-light">

      <Navbar />

      <main className="container py-4">

        <div className="d-flex flex-wrap gap-2 mb-4">

          <button
            className="btn btn-outline-dark"
            onClick={() => navigate('/admin')}
          >
            📊 Dashboard
          </button>

          <button
            className="btn btn-outline-primary"
            onClick={() => navigate('/admin/viaggi')}
          >
            🧾 Scheda giornaliera
          </button>

          <button
            className="btn btn-outline-danger"
            onClick={() => navigate('/admin/posizioni')}
          >
            📍 Posizione cassoni
          </button>

          <button
            className="btn btn-warning"
            onClick={() => navigate('/admin/anagrafiche')}
          >
            📋 Anagrafiche
          </button>

        </div>

        <h1 className="h3 mb-4">
          Anagrafiche
        </h1>

        <div className="row g-4">

          <div className="col-md-6">

            <div className="card shadow-sm h-100">

              <div className="card-body">

                <h4 className="card-title">
                  👷 Utenti
                </h4>

                <p className="text-muted">
                  Gestisci operai, amministratori e mezzi assegnati.
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate('/admin/anagrafiche/utenti')
                  }
                >
                  Gestisci utenti
                </button>

              </div>

            </div>

          </div>

          <div className="col-md-6">

            <div className="card shadow-sm h-100">

              <div className="card-body">

                <h4 className="card-title">
                  🚚 Mezzi
                </h4>

                <p className="text-muted">
                  Gestisci i mezzi aziendali e la loro disponibilità.
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate('/admin/anagrafiche/mezzi')
                  }
                >
                  Gestisci mezzi
                </button>

              </div>

            </div>

          </div>

          <div className="col-md-6">

            <div className="card shadow-sm h-100">

              <div className="card-body">

                <h4 className="card-title">
                  📦 Cassoni
                </h4>

                <p className="text-muted">
                  Gestisci cassoni, caratteristiche e posizione iniziale.
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate('/admin/anagrafiche/cassoni')
                  }
                >
                  Gestisci cassoni
                </button>

              </div>

            </div>

          </div>

          <div className="col-md-6">

            <div className="card shadow-sm h-100">

              <div className="card-body">

                <h4 className="card-title">
                  📍 Luoghi
                </h4>

                <p className="text-muted">
                  Gestisci depositi, cantieri e impianti.
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate('/admin/anagrafiche/luoghi')
                  }
                >
                  Gestisci luoghi
                </button>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  )
}

export default Anagrafiche