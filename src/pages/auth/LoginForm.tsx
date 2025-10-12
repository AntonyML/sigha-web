import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
  
      return
    }
    navigate('/virtualFiles')
  }

  return (
    <form onSubmit={submit} className="container py-4" style={{ maxWidth: 480 }}>
      <h4>Iniciar sesión</h4>
      <div className="mb-3">
        <label className="form-label">Correo</label>
        <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Contraseña</label>
        <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="btn btn-primary" type="submit">Entrar</button>
    </form>
  )
}