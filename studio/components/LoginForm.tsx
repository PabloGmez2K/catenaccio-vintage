'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

const missingEnv =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (missingEnv) {
    return (
      <div className="login-form env-warning">
        <strong>Configuración incompleta</strong>
        <p>
          Crea <code>studio/.env.local</code> copiando <code>.env.example</code>{' '}
          y rellena <code>NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </p>
        <p>
          Consulta <code>docs/studio/STUDIO_MVP_LOCAL_RUNBOOK.md</code>.
        </p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="login-form">
        <div className="form-success">
          <strong>Enlace enviado</strong>
          <p>Revisa tu email y haz clic en el enlace para acceder.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-form">
      <h2>Acceder</h2>
      <p className="login-hint">
        Introduce tu email para recibir un enlace de acceso.
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="pablo@ejemplo.com"
          required
          disabled={loading}
          autoComplete="email"
        />
        <button type="submit" disabled={loading || !email}>
          {loading ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>
      {error && <div className="form-error">{error}</div>}
    </div>
  )
}
