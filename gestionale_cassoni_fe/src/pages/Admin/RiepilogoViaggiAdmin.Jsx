import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminViaggi() {
  const navigate = useNavigate()

  const [viaggi, setViaggi] = useState([])
  const [errore, setErrore] = useState('')
  const [loading, setLoading] = useState(true)

  const [ricerca, setRicerca] = useState('')
  const [filtroStato, setFiltroStato] = useState('TUTTI')

  const token = localStorage.getItem('token')
  const nome = localStorage.getItem('nome')
  const cognome = localStorage.getItem('cognome')

  const caricaViaggi = () => {
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
        setViaggi(data)
      })
      .catch((error) => {
        setErrore(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }

    caricaViaggi()
  }, [])

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  const chiudiViaggio = (id) => {
    setErrore('')

    fetch(
      `http://localhost:3001/api/viaggi/${id}/chiudi`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then((response) => {
        if (!response.ok) {
          return response.text().then((testo) => {
            throw new Error(testo)
          })
        }

        return response.json()
      })
      .then(() => {
        caricaViaggi()
      })
      .catch((error) => {
        setErrore(error.message)
      })
  }

  const annullaViaggio = (id) => {
    setErrore('')

    fetch(
      `http://localhost:3001/api/viaggi/${id}/annulla`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then((response) => {
        if (!response.ok) {
          return response.text().then((testo) => {
            throw new Error(testo)
          })
        }

        return response.json()
      })
      .then(() => {
        caricaViaggi()
      })
      .catch((error) => {
        setErrore(error.message)
      })
  }

  const viaggiFiltrati = viaggi
    .filter((viaggio) => {
      if (filtroStato === 'TUTTI') {
        return true
      }

      return viaggio.stato === filtroStato
    })
    .filter((viaggio) => {
      const testo = ricerca.toLowerCase()

      return (
        viaggio.operaio?.toLowerCase().includes(testo) ||
        viaggio.mezzo?.toLowerCase().includes(testo) ||
        viaggio.cassone?.toLowerCase().includes(testo) ||
        viaggio.partenza?.toLowerCase().includes(testo) ||
        viaggio.destinazione?.toLowerCase().includes(testo)
      )
    })
    .sort((a, b) => {
      return (
        new Date(b.dataOraInizio) -
        new Date(a.dataOraInizio)
      )
    })

  const viaggiInCorso = viaggi.filter(
    (viaggio) => viaggio.stato === 'IN_CORSO'
  ).length

  const viaggiCompletati = viaggi.filter(
    (viaggio) => viaggio.stato === 'COMPLETATO'
  ).length

  const viaggiAnnullati = viaggi.filter(
    (viaggio) => viaggio.stato === 'ANNULLATO'
  ).length

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

      <nav className="navbar navbar-expand-lg bg-white border-bottom">
        <div className="container py-2">

          <div className="d-flex flex-wrap gap-2">

            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/admin')}
            >
              📊 Dashboard
            </button>

            <button
              className="btn btn-dark"
              onClick={() => navigate('/admin/viaggi')}
            >
              🧾 Scheda giornaliera
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/admin/posizioni')}
            >
              📍 Posizione cassoni
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/admin/anagrafiche')}
            >
              📋 Anagrafiche
            </button>

          </div>

          <div className="d-flex align-items-center gap-3">

            <span>
              {nome} {cognome}
            </span>

            <button
              className="btn btn-outline-danger btn-sm"
              onClick={logout}
            >
              Esci
            </button>

          </div>

        </div>
      </nav>

      <main className="container py-4">

        <h1 className="h3 mb-4">
          Scheda giornaliera
        </h1>

        {errore && (
          <div className="alert alert-danger">
            {errore}
          </div>
        )}

        <div className="row g-3 mb-4">

          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">

                <small className="text-muted">
                  Viaggi oggi
                </small>

                <h3 className="mb-0">
                  {viaggi.length}
                </h3>

              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">

                <small className="text-muted">
                  In corso
                </small>

                <h3 className="mb-0">
                  {viaggiInCorso}
                </h3>

              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">

                <small className="text-muted">
                  Completati
                </small>

                <h3 className="mb-0">
                  {viaggiCompletati}
                </h3>

              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">

                <small className="text-muted">
                  Annullati
                </small>

                <h3 className="mb-0">
                  {viaggiAnnullati}
                </h3>

              </div>
            </div>
          </div>

        </div>

        <div className="card shadow-sm">

          <div className="card-body">

            <div className="row g-3 mb-4">

              <div className="col-md-8">

                <label className="form-label">
                  Cerca
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={ricerca}
                  onChange={(e) =>
                    setRicerca(e.target.value)
                  }
                  placeholder="Operaio, mezzo, cassone, partenza o destinazione"
                />

              </div>

              <div className="col-md-4">

                <label className="form-label">
                  Stato
                </label>

                <select
                  className="form-select"
                  value={filtroStato}
                  onChange={(e) =>
                    setFiltroStato(e.target.value)
                  }
                >

                  <option value="TUTTI">
                    Tutti
                  </option>

                  <option value="IN_CORSO">
                    In corso
                  </option>

                  <option value="COMPLETATO">
                    Completati
                  </option>

                  <option value="ANNULLATO">
                    Annullati
                  </option>

                </select>

              </div>

            </div>

            {viaggiFiltrati.length === 0 ? (

              <p className="text-muted mb-0">
                Nessun viaggio trovato.
              </p>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead>
                    <tr>
                      <th>Ora</th>
                      <th>Operaio</th>
                      <th>Mezzo</th>
                      <th>Cassone</th>
                      <th>Partenza</th>
                      <th>Destinazione</th>
                      <th>Stato</th>
                      <th>Azioni</th>
                    </tr>
                  </thead>

                  <tbody>

                    {viaggiFiltrati.map((viaggio) => (

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

                          {viaggio.stato === 'IN_CORSO' ? (

                            <div className="d-flex gap-2">

                              <button
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                  chiudiViaggio(viaggio.id)
                                }
                              >
                                Chiudi
                              </button>

                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  annullaViaggio(viaggio.id)
                                }
                              >
                                Annulla
                              </button>

                            </div>

                          ) : (
                            '-'
                          )}

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

export default AdminViaggi