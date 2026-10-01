import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [errore, setErrore] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    setErrore('')
    setLoading(true)

    fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nickname,
        password
      })
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((messaggio) => {
            throw new Error(messaggio)
          })
        }

        return response.json()
      })
      .then((data) => {
        localStorage.setItem('token', data.token)
        localStorage.setItem('nome', data.nome)
        localStorage.setItem('cognome', data.cognome)
        localStorage.setItem('ruolo', data.ruolo)

        if (data.ruolo === 'ADMIN') {
          navigate('/admin')
        } else {
          navigate('/operaio')
        }
      })
      .catch((error) => {
        setErrore(
          error.message || 'Errore durante il login'
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center">
      <div
        className="card shadow p-4"
        style={{
          width: '100%',
          maxWidth: '420px'
        }}
      >
        <h2 className="text-center mb-4">
          Gestionale Cassoni
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Nickname
            </label>

            <input
              type="text"
              className="form-control"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Inserisci nickname"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci password"
              required
            />
          </div>

          {errore && (
            <div className="alert alert-danger">
              {errore}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login