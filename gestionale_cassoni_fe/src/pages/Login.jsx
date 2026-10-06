import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [errore, setErrore] = useState('')
  const [loading, setLoading] = useState(false)

  const login = (e) => {
    e.preventDefault()

    setErrore('')
    setLoading(true)

    fetch('https://gestionale-cassoni.onrender.com/auth/login', {
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
          return response.text().then((testo) => {
            throw new Error(testo)
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
        setErrore(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="text-center mb-4">

          <img
            src="/Logo.png"
            alt="MC Trasporti - Gruppo Calafato"
            className="login-logo"
          />

        </div>

        <h1 className="h4 text-center mb-4">
          Accesso gestionale
        </h1>

        {errore && (
          <div className="alert alert-danger">
            {errore}
          </div>
        )}

        <form onSubmit={login}>

          <div className="mb-3">

            <label className="form-label">
              Nickname
            </label>

            <input
              type="text"
              className="form-control"
              value={nickname}
              onChange={(e) =>
                setNickname(e.target.value)
              }
              required
            />

          </div>

          <div className="mb-4">

            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2"
            disabled={loading}
          >
            {loading
              ? 'Accesso...'
              : 'Accedi'}
          </button>

        </form>

      </div>

    </div>
  )
}

export default Login