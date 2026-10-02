import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:3001/api'
const nuovoUtente = () => ({ nome: '', cognome: '', nickname: '', password: '', ruolo: 'OPERAIO', mezzoId: '' })

async function richiesta(percorso, token, opzioni = {}) {
  const response = await fetch(`${API}${percorso}`, {
    ...opzioni,
    headers: { Authorization: `Bearer ${token}`, ...(opzioni.body ? { 'Content-Type': 'application/json' } : {}) },
  })
  const testo = await response.text()
  let data
  try { data = testo ? JSON.parse(testo) : null } catch { data = testo }
  if (!response.ok) {
    throw new Error(response.status === 401 ? 'Sessione scaduta. Accedi nuovamente.' :
      (typeof data === 'string' ? data : data?.message || data?.messaggio) || 'Operazione non riuscita.')
  }
  return data
}

function AnagraficheUtenti() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const ruolo = localStorage.getItem('ruolo')
  const [utenti, setUtenti] = useState([])
  const [mezzi, setMezzi] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvataggio, setSalvataggio] = useState(false)
  const [errore, setErrore] = useState('')
  const [erroreForm, setErroreForm] = useState('')
  const [erroreMezzi, setErroreMezzi] = useState('')
  const [messaggio, setMessaggio] = useState('')
  const [ricerca, setRicerca] = useState('')
  const [filtroRuolo, setFiltroRuolo] = useState('TUTTI')
  const [form, setForm] = useState(null)
  const [idModifica, setIdModifica] = useState(null)
  const [ricarica, setRicarica] = useState(0)

  useEffect(() => {
    if (!token) { navigate('/', { replace: true }); return }
    if (ruolo !== 'ADMIN') { navigate('/operaio', { replace: true }); return }
    const controller = new AbortController()
    richiesta('/utenti', token, { signal: controller.signal })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Formato elenco utenti non valido.')
        setUtenti(data)
      })
      .catch((error) => { if (!controller.signal.aborted) setErrore(error.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    richiesta('/mezzi/attivi', token, { signal: controller.signal })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Formato elenco mezzi non valido.')
        setMezzi(data)
      })
      .catch((error) => { if (!controller.signal.aborted) setErroreMezzi(error.message) })
    return () => controller.abort()
  }, [navigate, token, ruolo, ricarica])

  const aggiorna = () => {
    setErrore('')
    setErroreMezzi('')
    setLoading(true)
    setRicarica((valore) => valore + 1)
  }

  const apriForm = (utente) => {
    setIdModifica(utente?.id ?? null)
    setErroreForm('')
    setMessaggio('')
    setForm(utente ? {
      nome: utente.nome ?? '', cognome: utente.cognome ?? '', nickname: utente.nickname ?? '',
      password: '', ruolo: utente.ruolo, mezzoId: String(utente.mezzoId ?? utente.mezzo?.id ?? ''),
    } : nuovoUtente())
  }

  const salva = async (event) => {
    event.preventDefault()
    if (salvataggio) return
    setErroreForm('')
    const payload = {
      nome: form.nome.trim(), cognome: form.cognome.trim(), nickname: form.nickname.trim(),
      ruolo: form.ruolo, mezzoId: form.ruolo === 'OPERAIO' && form.mezzoId ? Number(form.mezzoId) : null,
    }
    if (!payload.nome || !payload.cognome || !payload.nickname) {
      setErroreForm('Inserisci nome, cognome e nickname.'); return
    }
    if (utenti.some((utente) => utente.id !== idModifica && utente.nickname?.toLowerCase() === payload.nickname.toLowerCase())) {
      setErroreForm('Il nickname è già utilizzato da un altro utente.'); return
    }
    if (idModifica === null && !form.password.trim()) {
      setErroreForm('Inserisci una password.'); return
    }
    if (form.password) payload.password = form.password
    setSalvataggio(true)
    try {
      await richiesta(idModifica === null ? '/utenti' : `/utenti/${idModifica}`, token, {
        method: idModifica === null ? 'POST' : 'PUT', body: JSON.stringify(payload),
      })
      setForm(null)
      setMessaggio(idModifica === null ? 'Utente creato.' : 'Utente aggiornato.')
      aggiorna()
    } catch (error) { setErroreForm(error.message) }
    finally { setSalvataggio(false) }
  }

  const etichettaMezzo = (mezzo) => [mezzo.targa, mezzo.descrizione].filter(Boolean).join(' - ') || `Mezzo ${mezzo.id}`
  const mezzoUtente = (utente) => {
    if (typeof utente.mezzo === 'string') return utente.mezzo
    const mezzo = utente.mezzo || mezzi.find((item) => String(item.id) === String(utente.mezzoId))
    return mezzo ? etichettaMezzo(mezzo) : utente.mezzoId ? `Mezzo ${utente.mezzoId}` : 'Non assegnato'
  }
  const filtrati = utenti.filter((utente) =>
    (filtroRuolo === 'TUTTI' || utente.ruolo === filtroRuolo) &&
    `${utente.nome} ${utente.cognome} ${utente.nickname} ${mezzoUtente(utente)}`.toLocaleLowerCase('it').includes(ricerca.trim().toLocaleLowerCase('it'))
  ).sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`, 'it'))

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand">Gestionale Cassoni</span>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white">{localStorage.getItem('nome')} {localStorage.getItem('cognome')}</span>
            <button className="btn btn-danger btn-sm" onClick={() => { localStorage.clear(); navigate('/') }}>Esci</button>
          </div>
        </div>
      </nav>
      <main className="container py-4">
        <div className="d-flex flex-wrap gap-2 mb-4">
          <button className="btn btn-outline-dark" onClick={() => navigate('/admin')}>Dashboard</button>
          <button className="btn btn-outline-primary" onClick={() => navigate('/admin/viaggi')}>Scheda giornaliera</button>
          <button className="btn btn-outline-danger" onClick={() => navigate('/admin/posizioni')}>Posizione cassoni</button>
          <button className="btn btn-warning" onClick={() => navigate('/admin/anagrafiche')}>Anagrafiche</button>
        </div>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div><h1 className="h3 mb-1">Anagrafiche utenti</h1><p className="text-muted mb-0">Gestisci operai, amministratori e mezzi assegnati.</p></div>
          <button className="btn btn-primary" disabled={loading || salvataggio || form !== null || Boolean(errore)} onClick={() => apriForm()}>Nuovo utente</button>
        </div>
        {errore && <div className="alert alert-danger" role="alert">{errore}</div>}
        {erroreMezzi && <div className="alert alert-warning" role="alert">Impossibile caricare i mezzi: {erroreMezzi}</div>}
        {messaggio && <div className="alert alert-success" role="status">{messaggio}</div>}
        {form && (
          <section className="card shadow-sm mb-4" aria-labelledby="titolo-form">
            <div className="card-body">
              <h2 className="h5 mb-3" id="titolo-form">{idModifica === null ? 'Nuovo utente' : 'Modifica utente'}</h2>
              <form onSubmit={salva}>
                <fieldset disabled={salvataggio}>
                  <div className="row g-3">
                    {['nome', 'cognome', 'nickname', 'password'].map((campo) => (
                      <div className="col-md-6" key={campo}>
                        <label className="form-label" htmlFor={`utente-${campo}`}>{campo.charAt(0).toUpperCase() + campo.slice(1)}</label>
                        <input id={`utente-${campo}`} className="form-control" type={campo === 'password' ? 'password' : 'text'}
                          autoComplete={campo === 'password' ? 'new-password' : campo === 'nickname' ? 'off' : campo === 'nome' ? 'given-name' : 'family-name'}
                          required={campo !== 'password' || idModifica === null} value={form[campo]}
                          onChange={(event) => setForm({ ...form, [campo]: event.target.value })} />
                        {campo === 'password' && idModifica !== null && <div className="form-text">Lascia vuoto per mantenere la password attuale.</div>}
                      </div>
                    ))}
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="utente-ruolo">Ruolo</label>
                      <select id="utente-ruolo" className="form-select" value={form.ruolo} onChange={(event) => setForm({ ...form, ruolo: event.target.value, mezzoId: event.target.value === 'ADMIN' ? '' : form.mezzoId })}>
                        <option value="OPERAIO">Operaio</option><option value="ADMIN">Amministratore</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="utente-mezzo">Mezzo assegnato</label>
                      <select id="utente-mezzo" className="form-select" value={form.mezzoId} disabled={form.ruolo !== 'OPERAIO' || Boolean(erroreMezzi)} onChange={(event) => setForm({ ...form, mezzoId: event.target.value })}>
                        <option value="">Nessun mezzo assegnato</option>
                        {form.mezzoId && !mezzi.some((mezzo) => String(mezzo.id) === form.mezzoId) && <option value={form.mezzoId}>Mezzo {form.mezzoId} (attualmente assegnato)</option>}
                        {mezzi.map((mezzo) => <option key={mezzo.id} value={mezzo.id}>{etichettaMezzo(mezzo)}</option>)}
                      </select>
                    </div>
                  </div>
                  {erroreForm && <div className="alert alert-danger mt-3" role="alert">{erroreForm}</div>}
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-success" type="submit">{salvataggio ? 'Salvataggio...' : 'Salva utente'}</button>
                    <button className="btn btn-outline-secondary" type="button" onClick={() => setForm(null)}>Annulla</button>
                  </div>
                </fieldset>
              </form>
            </div>
          </section>
        )}
        <section className="card shadow-sm" aria-label="Elenco utenti">
          <div className="card-body">
            <div className="row g-3 mb-4">
              <div className="col-md-7">
                <label htmlFor="ricerca-utenti" className="form-label">Cerca</label>
                <input id="ricerca-utenti" className="form-control" type="search" placeholder="Nome, cognome, nickname o mezzo" value={ricerca} onChange={(event) => setRicerca(event.target.value)} />
              </div>
              <div className="col-md-3">
                <label htmlFor="filtro-ruolo" className="form-label">Ruolo</label>
                <select id="filtro-ruolo" className="form-select" value={filtroRuolo} onChange={(event) => setFiltroRuolo(event.target.value)}>
                  <option value="TUTTI">Tutti</option><option value="OPERAIO">Operai</option><option value="ADMIN">Amministratori</option>
                </select>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button className="btn btn-outline-secondary w-100" disabled={loading || salvataggio} onClick={aggiorna}>Aggiorna</button>
              </div>
            </div>
            {loading ? <div className="text-center py-4" role="status"><span className="spinner-border" aria-hidden="true" /><p className="mt-2 mb-0">Caricamento utenti...</p></div> : errore ?
              <p className="text-muted mb-0">Premi Aggiorna per riprovare il caricamento.</p> : filtrati.length === 0 ?
              <p className="text-muted mb-0">{utenti.length === 0 ? 'Nessun utente presente. Aggiungi il primo utente.' : 'Nessun utente corrisponde ai filtri selezionati.'}</p> : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <caption>{filtrati.length} utenti su {utenti.length}</caption>
                    <thead><tr>{['Nome', 'Cognome', 'Nickname', 'Ruolo', 'Mezzo assegnato', 'Azioni'].map((titolo) => <th key={titolo} scope="col">{titolo}</th>)}</tr></thead>
                    <tbody>{filtrati.map((utente) => (
                      <tr key={utente.id}>
                        <td>{utente.nome}</td><td>{utente.cognome}</td><td>{utente.nickname}</td>
                        <td><span className={`badge ${utente.ruolo === 'ADMIN' ? 'bg-primary' : 'bg-secondary'}`}>{utente.ruolo === 'ADMIN' ? 'Amministratore' : 'Operaio'}</span></td>
                        <td>{mezzoUtente(utente)}</td>
                        <td><button className="btn btn-outline-primary btn-sm" disabled={salvataggio || form !== null} onClick={() => apriForm(utente)} aria-label={`Modifica ${utente.nome} ${utente.cognome}`}>Modifica</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default AnagraficheUtenti
