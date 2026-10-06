import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'

function StoricoViaggi() {
  const navigate = useNavigate()

  const [viaggi, setViaggi] = useState([])
  const [errore, setErrore] = useState('')
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const nome = localStorage.getItem('nome')

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }

    fetch('https://gestionale-cassoni.onrender.com/api/viaggi/miei', {
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
        const oggi = new Date()

        const viaggiOggi = data
          .filter((viaggio) => {
            if (!viaggio.dataOraInizio) {
              return false
            }

            const dataViaggio = new Date(
              viaggio.dataOraInizio
            )

            return (
              dataViaggio.getDate() === oggi.getDate() &&
              dataViaggio.getMonth() === oggi.getMonth() &&
              dataViaggio.getFullYear() === oggi.getFullYear()
            )
          })
          .sort((a, b) => {
            return (
              new Date(b.dataOraInizio) -
              new Date(a.dataOraInizio)
            )
          })

        setViaggi(viaggiOggi)
      })
      .catch((error) => {
        setErrore(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])


  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" />

        <p className="mt-3">
          Caricamento...
        </p>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-light">

     <Navbar />

      <main className="container py-4">

        <h1 className="h3 mb-4">
          Benvenuto {nome}
        </h1>

        <div className="d-flex gap-2 mb-4">

          <button
            className="btn btn-outline-primary"
            onClick={() => navigate('/operaio')}
          >
            Avvia viaggio
          </button>

          <button
            className="btn btn-primary"
            onClick={() =>
              navigate('/operaio/storico')
            }
          >
            Storico
          </button>

        </div>

        {errore && (
          <div className="alert alert-danger">
            {errore}
          </div>
        )}

        <div className="card shadow-sm">

          <div className="card-body">

            <h4 className="mb-4">
              Viaggi di oggi
            </h4>

            {viaggi.length === 0 ? (

              <p className="text-muted mb-0">
                Nessun viaggio effettuato oggi.
              </p>

            ) : (

              <div className="table-responsive">

                <table className="table table-striped table-hover align-middle">

                  <thead>
                    <tr>
                      <th>Ora</th>
                      <th>Mezzo</th>
                      <th>Cassone</th>
                      <th>Partenza</th>
                      <th>Destinazione</th>
                      <th>Stato</th>
                      <th>Note</th>
                    </tr>
                  </thead>

                  <tbody>

                    {viaggi.map((viaggio) => (

                      <tr key={viaggio.id}>

                        <td>
                          {viaggio.dataOraInizio
                            ? new Date(
                                viaggio.dataOraInizio
                              ).toLocaleTimeString(
                                'it-IT',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }
                              )
                            : '-'}
                        </td>

                        <td>
                          {viaggio.mezzo}
                        </td>

                        <td>
                          {viaggio.cassone}
                        </td>

                        <td>
                          {viaggio.partenza}
                        </td>

                        <td>
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

                        <td>
                          {viaggio.note || '-'}
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

export default StoricoViaggi