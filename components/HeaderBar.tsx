import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import AppsGrid from '@/components/AppsGrid'
import AvatarMenu from '@/components/AvatarMenu'
import { cookies } from 'next/headers'

export default async function HeaderBar() {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="header-logo" aria-label="Home">
          <span className="logo-text">Help</span>
        </Link>
        <div className="header-spacer" />
        <div className="header-actions" role="group" aria-label="Header actions">
          <AppsGrid />
          <AvatarMenu user={user ? {
            id: user.id,
            email: user.email || undefined,
            name: (user.user_metadata as any)?.name || (user.user_metadata as any)?.full_name || undefined,
            avatar_url: (user.user_metadata as any)?.avatar_url || (user.user_metadata as any)?.picture,
            provider: (user.app_metadata as any)?.provider,
          } : null} />
        </div>
      </div>
    </header>
  )
}



