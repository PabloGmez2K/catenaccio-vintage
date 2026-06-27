'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-brand">
          <span className="app-title">Catenaccio Studio</span>
          <span className="mvp-badge">MVP</span>
        </div>
        <nav className="app-nav">
          <Link href="/inventory" className="nav-link">
            Inventario
          </Link>
          <button onClick={handleSignOut} className="sign-out-btn">
            Salir
          </button>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
