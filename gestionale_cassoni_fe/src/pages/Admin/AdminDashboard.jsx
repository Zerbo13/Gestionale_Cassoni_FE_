import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const navigate = useNavigate()

  const [viaggiOggi, setViaggiOggi] = useState([])
  const [errore, setErrore] = useState('')
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const nome = localStorage.getItem('nome')

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }

    fetch('http://localhost:3001/api/viaggi/oggi', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((testo) => {
            throw new Error(testo)
          })
        }

        return response.json()
      })
      .then((data) => {
        setViaggiOggi(data)
      })
      .catch((error) => {
        setErrore(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [navigate, token])

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  const viaggiInCorso = viaggiOggi.filter(
    (viaggio) => viaggio.stato === 'IN_CORSO'
  )

  const cassoniMovimentati = new Set(
    viaggiOggi.map((viaggio) => viaggio.cassone)
  ).size

  const ultimiMovimenti = [...viaggiOggi]
    .sort((a, b) => {
      return (
        new Date(b.dataOraInizio) -
        new Date(a.dataOraInizio)
      )
    })
    .slice(0, 5)

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" />
        <p className="mt-3">Caricamento...</p>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-light">

     <nav className="navbar navbar-dark bg-dark">
        <div className="container">

          <span className="navbar-brand">
            Gestionale Cassoni
          </span>

          <div className="d-flex align-items-center gap-3">

            <button
              className="btn btn-danger btn-sm"
              onClick={logout}
            >
              Esci
            </button>

          </div>

        </div>
      </nav>

      <main className="container py-4">

        {errore && (
          <div className="alert alert-danger">
            {errore}
          </div>
        )}
        
        <div className="d-flex flex-wrap gap-2 mb-4">

            <button
              className="btn btn-dark"
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
              className="btn btn-outline-warning"
              onClick={() => navigate('/admin/anagrafiche')}
            >
              📋 Anagrafiche
            </button>

          </div>

        <div className="card shadow-sm mb-4">

          <div className="card-body">
            

            <small className="text-muted">
              Area responsabile
            </small>

            <h2 className="mt-2">
              Buongiorno {nome} 👋
            </h2>

            <p className="text-muted mb-0">
              Da qui puoi controllare rapidamente i movimenti
              della giornata e la posizione dei cassoni.
            </p>

          </div>
        </div>

        <div className="row g-3 mb-4">

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">

                <p className="mb-2">
                  🚚 Viaggi oggi
                </p>

                <h2 className="mb-0">
                  {viaggiOggi.length}
                </h2>

              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">

                <p className="mb-2">
                  🟠 In corso
                </p>

                <h2 className="mb-0">
                  {viaggiInCorso.length}
                </h2>

              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">

                <p className="mb-2">
                  📦 Cassoni movimentati
                </p>

                <h2 className="mb-0">
                  {cassoniMovimentati}
                </h2>

              </div>
            </div>
          </div>

        </div>

        <div className="row g-3 mb-4">

          <div className="col-lg-12">

            <div className="card shadow-sm h-100">
              <div className="card-body">

                <h4 className="mb-3">
                  Viaggi in corso
                </h4>

                {viaggiInCorso.length === 0 ? (
                  <p className="text-muted mb-0">
                    Nessun viaggio in corso.
                  </p>
                ) : (
                  viaggiInCorso.map((viaggio) => (
                    <div
                      key={viaggio.id}
                      className="border-bottom pb-2 mb-2"
                    >
                      <strong>
                        {viaggio.cassone}
                      </strong>

                      <div className="small text-muted">
                        {viaggio.partenza}
                        {' → '}
                        {viaggio.destinazione}
                      </div>

                      <div className="small">
                        {viaggio.mezzo}
                      </div>
                    </div>
                  ))
                )}

              </div>
            </div>

          </div>

        </div>

        <div className="card shadow-sm">
          <div className="card-body">

            <h4 className="mb-3">
              Ultimi movimenti di oggi
            </h4>

            {ultimiMovimenti.length === 0 ? (
              <p className="text-muted mb-0">
                Nessun movimento registrato oggi.
              </p>
            ) : (
              <div className="table-responsive">

                <table className="table align-middle">

                  <thead>
                    <tr>
                      <th>Ora</th>
                      <th>Operaio</th>
                      <th>Mezzo</th>
                      <th>Cassone</th>
                      <th>Percorso</th>
                      <th>Stato</th>
                    </tr>
                  </thead>

                  <tbody>

                    {ultimiMovimenti.map((viaggio) => (
                      <tr key={viaggio.id}>

                        <td>
                          {new Date(
                            viaggio.dataOraInizio
                          ).toLocaleTimeString(
                            'it-IT',
                            {
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )}
                        </td>

                        <td>
                          {viaggio.operaio}
                        </td>

                        <td>
                          {viaggio.mezzo}
                        </td>

                        <td>
                          {viaggio.cassone}
                        </td>

                        <td>
                          {viaggio.partenza}
                          {' → '}
                          {viaggio.destinazione}
                        </td>

                        <td>
                          <span
                            className={
                              viaggio.stato === 'COMPLETATO'
                                ? 'badge bg-success'
                                : viaggio.stato === 'ANNULLATO'
                                ? 'badge bg-danger'
                                : 'badge bg-warning text-dark'
                            }
                          >
                            {viaggio.stato}
                          </span>
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        </div>

      </main>

    </div>
  )
}

export default AdminDashboard