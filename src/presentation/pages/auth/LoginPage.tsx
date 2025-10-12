import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from  '../../assets/asopogua.png'
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
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="card shadow-lg" style={{ 
        width: '100%', 
        maxWidth: '400px'
      }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <img 
              src={Logo} 
              alt="Logo" 
              style={{ width: '150px', height: '150px', marginBottom: '20px' }}
            />
            <h4 className="text-primary">Iniciar sesión</h4>
            <p className="text-muted">Hogar de Ancianos</p>
          </div>
          
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input 
                className="form-control" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingrese su correo"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input 
                className="form-control" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
              />
            </div>
            <button className="btn btn-primary w-100" type="submit">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}