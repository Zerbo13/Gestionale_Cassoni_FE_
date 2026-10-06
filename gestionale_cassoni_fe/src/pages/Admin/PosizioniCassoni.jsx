import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { FiPrinter } from "react-icons/fi";


function PosizioniCassoni() {
  const navigate = useNavigate()

  const [cassoni, setCassoni] = useState([])
  const [ricerca, setRicerca] = useState('')
  const [errore, setErrore] = useState('')
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }

    fetch('https://gestionale-cassoni.onrender.com/api/cassoni', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            'Errore durante il caricamento dei cassoni'
          )
        }

        return response.json()
      })
      .then((listaCassoni) => {
        const richiestePosizioni = listaCassoni.map(
          (cassone) =>
            fetch(
              `https://gestionale-cassoni.onrender.com/api/cassoni/${cassone.id}/posizione`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            )
              .then((response) => {
                if (!response.ok) {
                  throw new Error(
                    'Errore durante il caricamento della posizione'
                  )
                }

                return response.json()
              })
              .then((posizione) => {
                return {
                  ...cassone,
                  posizioneAttuale: posizione.posizione,
                  giorniFermo: posizione.giorniFermo
                }
              })
        )

        return Promise.all(richiestePosizioni)
      })
      .then((data) => {
        setCassoni(data)
      })
      .catch((error) => {
        setErrore(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [navigate, token])

  const stampa = () => {
    window.print()
  }

  const cassoniFiltrati = cassoni
    .filter((cassone) => {
      const testo = ricerca
        .trim()
        .toLowerCase()

      return (
        cassone.codiceCassone
          ?.toLowerCase()
          .includes(testo) ||
        cassone.tipologia
          ?.toLowerCase()
          .includes(testo) ||
        cassone.colore
          ?.toLowerCase()
          .includes(testo) ||
        cassone.posizioneAttuale
          ?.toLowerCase()
          .includes(testo)
      )
    })
    .sort((a, b) => {
      return b.giorniFermo - a.giorniFermo
    })

  const cassoniAttivi = cassoni.filter(
    (cassone) => cassone.attivo
  ).length

  const cassoniFermiTreGiorni = cassoni.filter(
    (cassone) => cassone.giorniFermo >= 3
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

      <Navbar />

      <main className="container py-4">

        <div className="d-flex flex-wrap gap-2 mb-4 no-print">

          <button
            className="btn btn-outline-dark"
            onClick={() => navigate('/admin')}
          >
            Dashboard
          </button>

          <button
            className="btn btn-outline-primary"
            onClick={() => navigate('/admin/viaggi')}
          >
            Scheda giornaliera
          </button>

          <button
            className="btn btn-danger"
            onClick={() => navigate('/admin/posizioni')}
          >
            Posizione cassoni
          </button>

          <button
            className="btn btn-outline-warning"
            onClick={() => navigate('/admin/anagrafiche')}
          >
            Anagrafiche
          </button>

        </div>

        <h1 className="h3 mb-4">
          Posizione cassoni
        </h1>

        {errore && (
          <div className="alert alert-danger no-print">
            {errore}
          </div>
        )}

        <div className="row g-3 mb-4">

          <div className="col-md-4">

            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">

                <small className="text-muted">
                  Cassoni totali
                </small>

                <h3 className="mb-0">
                  {cassoni.length}
                </h3>

              </div>
            </div>

          </div>

          <div className="col-md-4">

            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">

                <small className="text-muted">
                  Cassoni attivi
                </small>

                <h3 className="mb-0">
                  {cassoniAttivi}
                </h3>

              </div>
            </div>

          </div>

          <div className="col-md-4">

            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">

                <small className="text-muted">
                  Fermi da almeno 3 giorni
                </small>

                <h3 className="mb-0">
                  {cassoniFermiTreGiorni}
                </h3>

              </div>
            </div>

          </div>

        </div>

        <div className="card shadow-sm">

          <div className="card-body">

            <div className="row mb-4 no-print">

              <div className="col-md-7">

                <label className="form-label">
                  Cerca cassone
                </label>

                <input
                  type="search"
                  className="form-control"
                  value={ricerca}
                  onChange={(e) =>
                    setRicerca(e.target.value)
                  }
                  placeholder="Codice, tipologia, colore o posizione..."
                />

              </div>

            </div>

            {cassoniFiltrati.length === 0 ? (

              <p className="text-muted mb-0">
                Nessun cassone trovato.
              </p>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead>

                    <tr>
                      <th>Cassone</th>
                      <th>Tipologia</th>
                      <th>Colore</th>
                      <th>Misura</th>
                      <th>Posizione attuale</th>
                      <th>Giorni fermo</th>
                      <th>Stato</th>
                    </tr>

                  </thead>

                  <tbody>

                    {cassoniFiltrati.map((cassone) => (

                      <tr key={cassone.id}>

                        <td>
                          <strong>
                            {cassone.codiceCassone}
                          </strong>
                        </td>

                        <td>
                          {cassone.tipologia || '-'}
                        </td>

                        <td>
                          {cassone.colore || '-'}
                        </td>

                        <td>
                          {cassone.misura || '-'}
                        </td>

                        <td>
                          {cassone.posizioneAttuale || '-'}
                        </td>

                        <td>

                          <span
                            className={
                              cassone.giorniFermo >= 5
                                ? 'badge bg-danger'
                                : cassone.giorniFermo >= 3
                                ? 'badge bg-warning text-dark'
                                : 'badge bg-success'
                            }
                          >
                            {cassone.giorniFermo}
                          </span>

                        </td>

                        <td>

                          {cassone.attivo ? (

                            <span className="badge bg-success">
                              Attivo
                            </span>

                          ) : (

                            <span className="badge bg-secondary">
                              Disattivato
                            </span>

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

        <div className="d-flex justify-content-end mt-3 no-print">

         <button
                     className="btn btn-danger"
                     onClick={stampa}
                   >
                     <FiPrinter />
                     Salva /
                      Stampa posizioni dei cassoni
                   </button>

        </div>

      </main>

    </div>
  )
}

export default PosizioniCassoni