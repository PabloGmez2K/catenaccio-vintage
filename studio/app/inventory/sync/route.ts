import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { syncWcTaxonomyCache } from '@/lib/wc/taxonomy-sync'

export const dynamic = 'force-dynamic'

// Opening this URL in a browser is not a screen: the operative sync UI lives in
// Auditoría web (TaxonomySyncPanel). Redirect humans there instead of a 405.
export async function GET() {
  redirect('/inventory/woo#sync-taxonomias')
}

export async function POST() {
  const result = await syncWcTaxonomyCache()

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        code: result.code,
        message: result.message,
        wc_get_called: result.wcGetCalled,
        wc_post_called: result.wcPostCalled,
      },
      { status: result.code === 'auth_required' ? 401 : 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    summary: result.summary,
    wc_get_called: result.summary.wcGetCalled,
    wc_post_called: result.summary.wcPostCalled,
  })
}
