interface Props {
  message?: string
}

export function ErrorState({ message }: Props) {
  return (
    <div className="error-state">
      <strong>Error al cargar datos</strong>
      {message && <p className="error-detail">{message}</p>}
      <p className="error-hint">
        Comprueba que <code>NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> están configuradas en{' '}
        <code>studio/.env.local</code> y que las políticas RLS permiten acceso
        con la sesión activa.
      </p>
    </div>
  )
}
