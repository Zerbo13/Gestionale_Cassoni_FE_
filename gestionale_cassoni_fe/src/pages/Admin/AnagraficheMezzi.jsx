import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'

const API = 'https://gestionale-cassoni.onrender.com/api'

async function richiesta(percorso, token, opzioni = {}) {
  const response = await fetch(`${API}${percorso}`, {
    ...opzioni,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opzioni.body
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(opzioni.headers || {})
    }
  })

  const testo = await response.text()

  let data

  try {
    data = testo ? JSON.parse(testo) : null
  } catch {
    data = testo
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        'Sessione scaduta. Accedi nuovamente.'
      )
    }

    if (response.status === 403) {
      throw new Error(
        'Non sei autorizzato a eseguire questa operazione.'
      )
    }

    if (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data)
    ) {
      if (data.message) {
        throw new Error(data.message)
      }

      if (data.messaggio) {
        throw new Error(data.messaggio)
      }

      const errori = Object.values(data)
        .filter(
          (valore) =>
            typeof valore === 'string'
        )

      if (errori.length > 0) {
        throw new Error(
          errori.join(' - ')
        )
      }
    }

    if (
      typeof data === 'string' &&
      data.trim()
    ) {
      throw new Error(data)
    }

    throw new Error(
      'Operazione non riuscita.'
    )
  }

  return data
}

const campi = [
  {
    nome: 'targa',
    label: 'Targa',
    obbligatorio: true,
    maiuscolo: true
  },
  {
    nome: 'modello',
    label: 'Modello',
    obbligatorio: true
  },
  {
    nome: 'tipo',
    nomeRisposta: 'tipologia',
    nomePayload: 'tipo',
    label: 'Tipo',
    obbligatorio: true
  }
]


const titolo = 'Mezzi'
const singolare = 'Mezzo'
const endpoint = 'mezzi'
const campoUnivoco = 'targa'
const posizioneIniziale = false
const gestioneUtente = false

function AnagraficheMezzi() {
  const navigate = useNavigate()

  const token =
    localStorage.getItem('token')

  const ruolo =
    localStorage.getItem('ruolo')

  const [elementi, setElementi] =
    useState([])

  const [luoghi, setLuoghi] =
    useState([])

  const [mezzi, setMezzi] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [salvataggio, setSalvataggio] =
    useState(false)

  const [errore, setErrore] =
    useState('')

  const [
    erroreSecondario,
    setErroreSecondario
  ] = useState('')

  const [
    erroreForm,
    setErroreForm
  ] = useState('')

  const [
    messaggio,
    setMessaggio
  ] = useState('')

  const [ricerca, setRicerca] =
    useState('')

  const [stato, setStato] =
    useState('TUTTI')

  const [form, setForm] =
    useState(null)

  const [
    idModifica,
    setIdModifica
  ] = useState(null)

  const [
    versione,
    setVersione
  ] = useState(0)

  useEffect(() => {
    if (!token) {
      navigate('/', {
        replace: true
      })

      return
    }

    if (ruolo !== 'ADMIN') {
      navigate('/operaio', {
        replace: true
      })

      return
    }

    const controller =
      new AbortController()

    richiesta(
      `/${endpoint}`,
      token,
      {
        signal:
          controller.signal
      }
    )
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error(
            'Formato elenco non valido.'
          )
        }

        setElementi(data)
      })
      .catch((error) => {
        if (
          !controller.signal.aborted
        ) {
          setErrore(
            error.message
          )
        }
      })
      .finally(() => {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false)
        }
      })

    if (posizioneIniziale) {
      richiesta(
        '/luoghi/attivi',
        token,
        {
          signal:
            controller.signal
        }
      )
        .then((data) => {
          if (
            !Array.isArray(data)
          ) {
            throw new Error(
              'Formato elenco luoghi non valido.'
            )
          }

          setLuoghi(data)
        })
        .catch((error) => {
          if (
            !controller.signal.aborted
          ) {
            setErroreSecondario(
              error.message
            )
          }
        })
    }

    if (gestioneUtente) {
      richiesta(
        '/mezzi/attivi',
        token,
        {
          signal:
            controller.signal
        }
      )
        .then((data) => {
          if (
            !Array.isArray(data)
          ) {
            throw new Error(
              'Formato elenco mezzi non valido.'
            )
          }

          setMezzi(data)
        })
        .catch((error) => {
          if (
            !controller.signal.aborted
          ) {
            setErroreSecondario(
              error.message
            )
          }
        })
    }

    return () => {
      controller.abort()
    }
  }, [
    navigate,
    token,
    ruolo,
    versione
  ])

  const aggiorna = () => {
    setErrore('')
    setErroreSecondario('')
    setLoading(true)

    setVersione(
      (valore) =>
        valore + 1
    )
  }

  const leggiValore = (
    elemento,
    campo
  ) => {
    if (
      gestioneUtente &&
      campo.nome === 'mezzoId'
    ) {
      return (
        elemento?.mezzoId ??
        elemento?.mezzo?.id ??
        ''
      )
    }

    const nomeRisposta =
      campo.nomeRisposta ||
      campo.nome

    return (
      elemento?.[
        nomeRisposta
      ] ?? ''
    )
  }

  const apriForm = (
    elemento = null
  ) => {
    setErroreForm('')
    setMessaggio('')

    setIdModifica(
      elemento?.id ?? null
    )

    const valori =
      Object.fromEntries(
        campi.map(
          (campo) => {
            if (
              campo.soloCreazione &&
              elemento
            ) {
              return [
                campo.nome,
                ''
              ]
            }

            return [
              campo.nome,
              leggiValore(
                elemento,
                campo
              )
            ]
          }
        )
      )

    let luogoId = ''

    if (
      posizioneIniziale &&
      elemento
    ) {
      luogoId =
        elemento
          .posizioneIniziale
          ?.id ??
        elemento
          .posizioneInizialeId ??
        ''
    }

    setForm({
      ...valori,

      attivo:
        elemento?.attivo ??
        true,

      luogoId:
        String(
          luogoId || ''
        )
    })
  }

  const validaDuplicato = (
    payload
  ) => {
    if (!campoUnivoco) {
      return false
    }

    const config =
      campi.find(
        (campo) =>
          campo.nome ===
          campoUnivoco
      )

    const nomeRisposta =
      config?.nomeRisposta ||
      campoUnivoco

    const valoreNuovo =
      String(
        payload[
          config?.nomePayload ||
          campoUnivoco
        ] ?? ''
      )
        .trim()
        .toLocaleLowerCase(
          'it'
        )

    return elementi.some(
      (elemento) =>
        elemento.id !==
          idModifica &&
        String(
          elemento[
            nomeRisposta
          ] ?? ''
        )
          .trim()
          .toLocaleLowerCase(
            'it'
          ) ===
          valoreNuovo
    )
  }

  const salva = (
    event
  ) => {
    event.preventDefault()

    if (salvataggio) {
      return
    }

    setErroreForm('')
    setMessaggio('')

    const payload = {}

    for (
      const campo of campi
    ) {
      if (
        campo.soloCreazione &&
        idModifica !== null
      ) {
        continue
      }

      if (
        campo.soloModifica &&
        idModifica === null
      ) {
        continue
      }

      let valore =
        form[
          campo.nome
        ]

      if (
        campo.tipo ===
        'checkbox'
      ) {
        payload[
          campo.nomePayload ||
            campo.nome
        ] =
          Boolean(valore)

        continue
      }

      valore =
        String(
          valore ?? ''
        ).trim()

      const obbligatorio =
        typeof campo.obbligatorio ===
        'function'
          ? campo.obbligatorio(
              idModifica
            )
          : campo.obbligatorio

      if (
        obbligatorio &&
        !valore
      ) {
        setErroreForm(
          `Inserisci ${campo.label.toLowerCase()}.`
        )

        return
      }

      if (
        !valore &&
        campo.nonInviareSeVuoto
      ) {
        continue
      }

      const nomePayload =
        campo.nomePayload ||
        campo.nome

      if (
        campo.numero &&
        valore
      ) {
        payload[
          nomePayload
        ] =
          Number(valore)
      } else {
        payload[
          nomePayload
        ] =
          campo.maiuscolo
            ? valore.toUpperCase()
            : valore
      }
    }

    if (
      gestioneUtente
    ) {
      if (
        payload.ruolo ===
        'ADMIN'
      ) {
        payload.mezzoId =
          null
      } else {
        payload.mezzoId =
          form.mezzoId
            ? Number(
                form.mezzoId
              )
            : null
      }
    }

    if (
      validaDuplicato(
        payload
      )
    ) {
      setErroreForm(
        campoUnivoco ===
          'nickname'
          ? 'Il nickname è già utilizzato.'
          : 'Esiste già un elemento con lo stesso codice o la stessa targa.'
      )

      return
    }

    if (
      posizioneIniziale &&
      idModifica === null
    ) {
      if (!form.luogoId) {
        setErroreForm(
          'Seleziona la posizione iniziale.'
        )

        return
      }

      payload
        .posizioneInizialeId =
        Number(
          form.luogoId
        )
    }

    if (
      !gestioneUtente
    ) {
      payload.attivo =
        form.attivo
    }

    setSalvataggio(true)

    const percorso =
      idModifica === null
        ? `/${endpoint}`
        : `/${endpoint}/${idModifica}`

    const metodo =
      idModifica === null
        ? 'POST'
        : 'PUT'

    richiesta(
      percorso,
      token,
      {
        method: metodo,
        body:
          JSON.stringify(
            payload
          )
      }
    )
      .then(() => {
        if (
          gestioneUtente &&
          idModifica !== null
        ) {
          const utenteOriginale =
            elementi.find(
              (elemento) =>
                elemento.id ===
                idModifica
            )

          if (
            utenteOriginale &&
            utenteOriginale.attivo !==
              form.attivo
          ) {
            const azione =
              form.attivo
                ? 'attiva'
                : 'disattiva'

            return richiesta(
              `/utenti/${idModifica}/${azione}`,
              token,
              {
                method: 'PUT'
              }
            )
          }
        }

        return null
      })
      .then(() => {
        setMessaggio(
          `${singolare} ${
            idModifica ===
            null
              ? 'creato'
              : 'aggiornato'
          } correttamente.`
        )

        setForm(null)
        setIdModifica(null)

        aggiorna()
      })
      .catch((error) => {
        setErroreForm(
          error.message
        )
      })
      .finally(() => {
        setSalvataggio(false)
      })
  }

  const annullaForm = () => {
    setForm(null)
    setIdModifica(null)
    setErroreForm('')
  }

  const etichettaMezzo = (
    mezzo
  ) => {
    return [
      mezzo.targa,
      mezzo.modello ||
        mezzo.descrizione
    ]
      .filter(Boolean)
      .join(' - ')
  }

  const valoreTabella = (
    elemento,
    campo
  ) => {
    if (
      gestioneUtente &&
      campo.nome === 'mezzoId'
    ) {
      if (
        elemento.mezzo &&
        typeof elemento.mezzo ===
          'object'
      ) {
        return etichettaMezzo(
          elemento.mezzo
        )
      }

      const mezzo =
        mezzi.find(
          (item) =>
            String(item.id) ===
            String(
              elemento.mezzoId
            )
        )

      return mezzo
        ? etichettaMezzo(
            mezzo
          )
        : 'Non assegnato'
    }

    if (
      campo.nome === 'ruolo'
    ) {
      return (
        elemento.ruolo ===
        'ADMIN'
          ? 'Amministratore'
          : 'Operaio'
      )
    }

    return (
      leggiValore(
        elemento,
        campo
      ) || '-'
    )
  }

  const campiTabella =
    campi.filter(
      (campo) =>
        !campo.nascondiTabella
    )

  const filtrati =
    elementi
      .filter(
        (elemento) => {
          if (
            stato ===
            'TUTTI'
          ) {
            return true
          }

          if (
            stato ===
            'ATTIVI'
          ) {
            return (
              elemento.attivo ===
              true
            )
          }

          return (
            elemento.attivo ===
            false
          )
        }
      )
      .filter(
        (elemento) => {
          const testo =
            ricerca
              .trim()
              .toLocaleLowerCase(
                'it'
              )

          if (!testo) {
            return true
          }

          const contenuto =
            campiTabella
              .map(
                (campo) =>
                  valoreTabella(
                    elemento,
                    campo
                  )
              )
              .join(' ')
              .toLocaleLowerCase(
                'it'
              )

          return contenuto.includes(
            testo
          )
        }
      )
      .sort((a, b) => {
        const primoCampo =
          campiTabella[0]

        return String(
          valoreTabella(
            a,
            primoCampo
          )
        ).localeCompare(
          String(
            valoreTabella(
              b,
              primoCampo
            )
          ),
          'it',
          {
            numeric: true
          }
        )
      })

  return (
    <div className="min-vh-100 bg-light">

      <Navbar />

      <main className="container py-4">

        <div className="d-flex flex-wrap gap-2 mb-4">

          <button
            className="btn btn-outline-dark"
            onClick={() =>
              navigate('/admin')
            }
          >
           📊 Dashboard
          </button>

          <button
            className="btn btn-outline-primary"
            onClick={() =>
              navigate(
                '/admin/viaggi'
              )
            }
          >
           🧾 Scheda giornaliera
          </button>

          <button
            className="btn btn-outline-danger"
            onClick={() =>
              navigate(
                '/admin/posizioni'
              )
            }
          >
           📍 Posizione cassoni
          </button>

          <button
            className="btn btn-warning"
            onClick={() =>
              navigate(
                '/admin/anagrafiche'
              )
            }
          >
           📋 Anagrafiche
          </button>

        </div>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

          <div>

            <h1 className="h3 mb-1">
              Anagrafiche{' '}
              {titolo.toLowerCase()}
            </h1>

            <p className="text-muted mb-0">
              Gestisci{' '}
              {titolo.toLowerCase()}.
            </p>

          </div>

          <button
            className="btn btn-primary"
            disabled={
              loading ||
              salvataggio ||
              form !== null ||
              Boolean(errore)
            }
            onClick={() =>
              apriForm()
            }
          >
            Nuovo{' '}
            {singolare.toLowerCase()}
          </button>

        </div>

        {errore && (
          <div className="alert alert-danger">
            {errore}
          </div>
        )}

        {erroreSecondario && (
          <div className="alert alert-warning">
            {erroreSecondario}
          </div>
        )}

        {messaggio && (
          <div className="alert alert-success">
            {messaggio}
          </div>
        )}

        {form && (

          <section className="card shadow-sm mb-4">

            <div className="card-body">

              <h2 className="h5 mb-3">
                {idModifica ===
                null
                  ? 'Nuovo'
                  : 'Modifica'}{' '}
                {singolare.toLowerCase()}
              </h2>

              <form
                onSubmit={salva}
              >

                <fieldset
                  disabled={
                    salvataggio
                  }
                >

                  <div className="row g-3">

                    {campi.map(
                      (campo) => {
                        if (
                          campo.soloCreazione &&
                          idModifica !==
                            null
                        ) {
                          return null
                        }

                        if (
                          campo.soloModifica &&
                          idModifica ===
                            null
                        ) {
                          return null
                        }

                        if (
                          campo.tipo ===
                          'select'
                        ) {
                          return (
                            <div
                              className="col-md-6"
                              key={
                                campo.nome
                              }
                            >

                              <label className="form-label">
                                {campo.label}
                              </label>

                              <select
                                className="form-select"
                                value={
                                  form[
                                    campo.nome
                                  ] ?? ''
                                }
                                disabled={
                                  campo.nome ===
                                    'mezzoId' &&
                                  gestioneUtente &&
                                  form.ruolo ===
                                    'ADMIN'
                                }
                                onChange={(
                                  event
                                ) =>
                                  setForm({
                                    ...form,
                                    [campo.nome]:
                                      event
                                        .target
                                        .value
                                  })
                                }
                              >

                                {campo.nome ===
                                'mezzoId' ? (
                                  <>
                                    <option value="">
                                      Nessun mezzo
                                    </option>

                                    {mezzi.map(
                                      (
                                        mezzo
                                      ) => (
                                        <option
                                          key={
                                            mezzo.id
                                          }
                                          value={
                                            mezzo.id
                                          }
                                        >
                                          {etichettaMezzo(
                                            mezzo
                                          )}
                                        </option>
                                      )
                                    )}
                                  </>
                                ) : (
                                  campo.opzioni?.map(
                                    (
                                      opzione
                                    ) => (
                                      <option
                                        key={
                                          opzione.valore
                                        }
                                        value={
                                          opzione.valore
                                        }
                                      >
                                        {
                                          opzione.label
                                        }
                                      </option>
                                    )
                                  )
                                )}

                              </select>

                            </div>
                          )
                        }

                        return (
                          <div
                            className="col-md-6"
                            key={
                              campo.nome
                            }
                          >

                            <label className="form-label">
                              {campo.label}
                            </label>

                            <input
                              className="form-control"
                              type={
                                campo.tipo ||
                                'text'
                              }
                              value={
                                form[
                                  campo.nome
                                ] ?? ''
                              }
                              onChange={(
                                event
                              ) =>
                                setForm({
                                  ...form,
                                  [campo.nome]:
                                    event
                                      .target
                                      .value
                                })
                              }
                            />

                            {campo.nome ===
                              'password' &&
                              idModifica !==
                                null && (
                                <div className="form-text">
                                  Lascia vuoto
                                  per mantenere
                                  la password
                                  attuale.
                                </div>
                              )}

                          </div>
                        )
                      }
                    )}

                    {posizioneIniziale &&
                      idModifica ===
                        null && (

                        <div className="col-md-6">

                          <label className="form-label">
                            Posizione iniziale
                          </label>

                          <select
                            className="form-select"
                            required
                            value={
                              form.luogoId ??
                              ''
                            }
                            onChange={(
                              event
                            ) =>
                              setForm({
                                ...form,
                                luogoId:
                                  event
                                    .target
                                    .value
                              })
                            }
                          >
                            <option value="">
                              Seleziona luogo
                            </option>

                            {luoghi.map(
                              (
                                luogo
                              ) => (
                                <option
                                  key={
                                    luogo.id
                                  }
                                  value={
                                    luogo.id
                                  }
                                >
                                  {
                                    luogo.nome
                                  }
                                  {luogo.indirizzo
                                    ? ` - ${luogo.indirizzo}`
                                    : ''}
                                </option>
                              )
                            )}
                          </select>

                        </div>

                      )}

                    {gestioneUtente &&
                      idModifica !==
                        null && (

                        <div className="col-12">

                          <div className="form-check">

                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="utente-attivo"
                              checked={
                                form.attivo ??
                                true
                              }
                              onChange={(
                                event
                              ) =>
                                setForm({
                                  ...form,
                                  attivo:
                                    event
                                      .target
                                      .checked
                                })
                              }
                            />

                            <label
                              className="form-check-label"
                              htmlFor="utente-attivo"
                            >
                              Utente attivo
                            </label>

                          </div>

                          <div className="form-text">
                            Un utente
                            disattivato non
                            potrà effettuare
                            nuovi accessi.
                          </div>

                        </div>

                      )}

                    {!gestioneUtente && (

                      <div className="col-12">

                        <div className="form-check">

                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={
                              form.attivo ??
                              true
                            }
                            onChange={(
                              event
                            ) =>
                              setForm({
                                ...form,
                                attivo:
                                  event
                                    .target
                                    .checked
                              })
                            }
                          />

                          <label className="form-check-label">
                            Attivo
                          </label>

                        </div>

                      </div>

                    )}

                  </div>

                  {erroreForm && (
                    <div className="alert alert-danger mt-3">
                      {erroreForm}
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-3">

                    <button
                      className="btn btn-success"
                      type="submit"
                    >
                      {salvataggio
                        ? 'Salvataggio...'
                        : 'Salva'}
                    </button>

                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={
                        annullaForm
                      }
                    >
                      Annulla
                    </button>

                  </div>

                </fieldset>

              </form>

            </div>

          </section>

        )}

        <section className="card shadow-sm">

          <div className="card-body">

            <div className="row g-3 mb-4">

              <div className="col-md-7">

                <label className="form-label">
                  Cerca
                </label>

                <input
                  className="form-control"
                  type="search"
                  value={ricerca}
                  onChange={(event) =>
                    setRicerca(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="col-md-3">

                <label className="form-label">
                  Stato
                </label>

                <select
                  className="form-select"
                  value={stato}
                  onChange={(event) =>
                    setStato(
                      event.target.value
                    )
                  }
                >
                  <option value="TUTTI">
                    Tutti
                  </option>

                  <option value="ATTIVI">
                    Attivi
                  </option>

                  <option value="INATTIVI">
                    Disattivati
                  </option>
                </select>

              </div>

              <div className="col-md-2 d-flex align-items-end">

                <button
                  className="btn btn-outline-primary w-100"
                  onClick={aggiorna}
                >
                  Aggiorna
                </button>

              </div>

            </div>

            {loading ? (

              <div className="text-center py-4">
                <span className="spinner-border" />
              </div>

            ) : filtrati.length ===
              0 ? (

              <p className="text-muted">
                Nessun elemento trovato.
              </p>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead>

                    <tr>

                      {campiTabella.map(
                        (campo) => (
                          <th
                            key={
                              campo.nome
                            }
                          >
                            {campo.label}
                          </th>
                        )
                      )}

                      <th>
                        Stato
                      </th>

                      <th>
                        Azioni
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filtrati.map(
                      (elemento) => (

                        <tr
                          key={
                            elemento.id
                          }
                        >

                          {campiTabella.map(
                            (campo) => (

                              <td
                                key={
                                  campo.nome
                                }
                              >
                                {valoreTabella(
                                  elemento,
                                  campo
                                )}
                              </td>

                            )
                          )}

                          <td>

                            <span
                              className={
                                elemento.attivo
                                  ? 'badge bg-success'
                                  : 'badge bg-secondary'
                              }
                            >
                              {elemento.attivo
                                ? 'Attivo'
                                : 'Disattivato'}
                            </span>

                          </td>

                          <td>

                            <button
                              className="btn btn-outline-primary btn-sm"
                              disabled={
                                form !==
                                null
                              }
                              onClick={() =>
                                apriForm(
                                  elemento
                                )
                              }
                            >
                              Modifica
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  )
}

export default AnagraficheMezzi