import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchSelect from '../../components/SearchSelect'
import Navbar from '../../components/Navbar'

function OperaioDashboard() {
  const navigate = useNavigate()

  const [mezzi, setMezzi] = useState([])
  const [cassoni, setCassoni] = useState([])
  const [luoghi, setLuoghi] = useState([])

  const [mezzoId, setMezzoId] = useState('')
  const [cassoneId, setCassoneId] = useState('')
  const [destinazioneId, setDestinazioneId] = useState('')
  const [note, setNote] = useState('')

  const [viaggioInCorso, setViaggioInCorso] = useState(null)

  const [errore, setErrore] = useState('')
  const [messaggio, setMessaggio] = useState('')
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const nome = localStorage.getItem('nome')
  const cognome = localStorage.getItem('cognome')

  const headers = {
    Authorization: `Bearer ${token}`
  }

  const caricaDati = () => {
    Promise.all([
      fetch('https://gestionale-cassoni.onrender.com/api/mezzi/attivi', {
        headers
      }),
      fetch('https://gestionale-cassoni.onrender.com/api/cassoni', {
        headers
      }),
      fetch('https://gestionale-cassoni.onrender.com/api/luoghi/attivi', {
        headers
      }),
      fetch('https://gestionale-cassoni.onrender.com/api/viaggi/miei', {
        headers
      })
    ])
      .then((responses) => {
        const erroreResponse = responses.find(
          (response) => !response.ok
        )

        if (erroreResponse) {
          throw new Error(
            'Errore durante il caricamento dei dati'
          )
        }

        return Promise.all(
          responses.map((response) => response.json())
        )
      })
      .then((data) => {
        const listaMezzi = data[0]
        const listaCassoni = data[1]
        const listaLuoghi = data[2]
        const listaViaggi = data[3]

        setMezzi(listaMezzi)

        setCassoni(
          listaCassoni.filter(
            (cassone) => cassone.attivo === true
          )
        )

        setLuoghi(listaLuoghi)

        const viaggioAttivo = listaViaggi.find(
          (viaggio) => viaggio.stato === 'IN_CORSO'
        )

        if (viaggioAttivo) {
          setViaggioInCorso(viaggioAttivo)
        } else {
          setViaggioInCorso(null)
        }
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

    caricaDati()
  }, [])

  const avviaViaggio = (e) => {
    e.preventDefault()

    setErrore('')
    setMessaggio('')

    if (!mezzoId) {
      setErrore('Seleziona un mezzo')
      return
    }

    if (!cassoneId) {
      setErrore('Seleziona un cassone')
      return
    }

    if (!destinazioneId) {
      setErrore('Seleziona una destinazione')
      return
    }

    fetch('https://gestionale-cassoni.onrender.com/api/viaggi/avvia', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mezzoId: Number(mezzoId),
        cassoneId: Number(cassoneId),
        destinazioneId: Number(destinazioneId),
        note
      })
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
        setViaggioInCorso(data)

        setMezzoId('')
        setCassoneId('')
        setDestinazioneId('')
        setNote('')

        setMessaggio(
          'Viaggio avviato correttamente'
        )
      })
      .catch((error) => {
        setErrore(error.message)
      })
  }

  const chiudiViaggio = () => {
    setErrore('')
    setMessaggio('')

    fetch(
      `https://gestionale-cassoni.onrender.com/api/viaggi/${viaggioInCorso.id}/chiudi`,
      {
        method: 'PUT',
        headers
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
        setViaggioInCorso(null)

        setMessaggio(
          'Viaggio chiuso correttamente'
        )

        caricaDati()
      })
      .catch((error) => {
        setErrore(error.message)
      })
  }

  const annullaViaggio = () => {
    setErrore('')
    setMessaggio('')

    fetch(
      `https://gestionale-cassoni.onrender.com/api/viaggi/${viaggioInCorso.id}/annulla`,
      {
        method: 'PUT',
        headers
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
        setViaggioInCorso(null)

        setMessaggio(
          'Viaggio annullato'
        )

        caricaDati()
      })
      .catch((error) => {
        setErrore(error.message)
      })
  }


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

     <Navbar/>

      <main className="container py-4">

        <h1 className="h3 mb-4">
          Benvenuto {nome} {cognome}
        </h1>

        <div className="d-flex gap-2 mb-4">

          <button
            className="btn btn-primary"
            onClick={() => navigate('/operaio')}
          >
            Avvia viaggio
          </button>

          <button
            className="btn btn-outline-primary"
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

        {messaggio && (
          <div className="alert alert-success">
            {messaggio}
          </div>
        )}

        {viaggioInCorso ? (

          <div className="card shadow-sm">

            <div className="card-body">

              <h4 className="mb-4">
                Viaggio in corso
              </h4>

              <div className="row g-3">

                <div className="col-md-6">
                  <strong>Mezzo</strong>
                  <p>{viaggioInCorso.mezzo}</p>
                </div>

                <div className="col-md-6">
                  <strong>Cassone</strong>
                  <p>{viaggioInCorso.cassone}</p>
                </div>

                <div className="col-md-6">
                  <strong>Partenza</strong>
                  <p>{viaggioInCorso.partenza}</p>
                </div>

                <div className="col-md-6">
                  <strong>Destinazione</strong>
                  <p>{viaggioInCorso.destinazione}</p>
                </div>

                <div className="col-12">
                  <strong>Note</strong>

                  <p>
                    {viaggioInCorso.note || 'Nessuna nota'}
                  </p>
                </div>

              </div>

              <div className="d-flex gap-2 mt-3">

                <button
                  className="btn btn-success"
                  onClick={chiudiViaggio}
                >
                  Chiudi viaggio
                </button>

                <button
                  className="btn btn-danger"
                  onClick={annullaViaggio}
                >
                  Annulla viaggio
                </button>

              </div>

            </div>

          </div>

        ) : (

          <div className="card shadow-sm">

            <div className="card-body">

              <h4 className="mb-4">
                Avvia nuovo viaggio
              </h4>

              <form onSubmit={avviaViaggio}>

                <div className="mb-3">

                  <label className="form-label">
                    Mezzo
                  </label>

                  <SearchSelect
                    items={mezzi}
                    placeholder="Cerca mezzo..."
                    getLabel={(mezzo) =>
                      `${mezzo.targa} - ${mezzo.modello}`
                    }
                    onSelect={(mezzo) =>
                      setMezzoId(mezzo.id)
                    }
                  />

                </div>

                <div className="mb-3">

                  <label className="form-label">
                    Cassone
                  </label>

                  <SearchSelect
                    items={cassoni}
                    placeholder="Cerca cassone..."
                    getLabel={(cassone) =>
                      `${cassone.codiceCassone} - ${cassone.colore} - ${cassone.misura}`
                    }
                    onSelect={(cassone) =>
                      setCassoneId(cassone.id)
                    }
                  />

                </div>

                <div className="mb-3">

                  <label className="form-label">
                    Destinazione
                  </label>

                  <SearchSelect
                    items={luoghi}
                    placeholder="Cerca destinazione..."
                    getLabel={(luogo) =>
                      `${luogo.nome} - ${luogo.indirizzo}`
                    }
                    onSelect={(luogo) =>
                      setDestinazioneId(luogo.id)
                    }
                  />

                </div>

                <div className="mb-3">

                  <label className="form-label">
                    Note
                  </label>

                  <textarea
                    className="form-control"
                    rows="3"
                    maxLength="500"
                    value={note}
                    onChange={(e) =>
                      setNote(e.target.value)
                    }
                    placeholder="Note opzionali"
                  />

                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Avvia viaggio
                </button>

              </form>

            </div>

          </div>

        )}

      </main>

    </div>
  )
}

export default OperaioDashboard