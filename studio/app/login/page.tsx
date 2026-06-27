import { LoginForm } from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="login-page">
      <header className="login-header">
        <h1>Catenaccio Studio</h1>
        <span className="mvp-badge">MVP</span>
      </header>
      <main className="login-main">
        <LoginForm />
      </main>
    </div>
  )
}
