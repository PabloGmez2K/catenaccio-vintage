'use server'

// S025 backoffice — local lifecycle actions. Supabase-only, owner_id + RLS enforced.
// NO Woo calls, NO hard delete, NO publish. Soft archive flips status to 'archivada'
// and records the prior status in the immutable audit trail so restore is non-destructive.

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type LifecycleResult = { ok: true } | { ok: false; error: string }

export async function archiveItem(itemId: string): Promise<LifecycleResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false, error: 'No autenticado.' }

  const { data: item, error: loadError } = await supabase
    .from('inventory_items')
    .select('status, workspace_id')
    .eq('id', itemId)
    .eq('owner_id', user.id)
    .single()
  if (loadError || !item) return { ok: false, error: 'Item no encontrado o sin acceso.' }
  if (item.status === 'archivada') return { ok: true } // idempotent

  const { error: updateError } = await supabase
    .from('inventory_items')
    .update({ status: 'archivada' })
    .eq('id', itemId)
    .eq('owner_id', user.id)
  if (updateError) return { ok: false, error: updateError.message }

  // Immutable audit: keep the prior status so restore can return the item to it.
  // Best-effort — the archive already succeeded; a failed event must not surface as an error.
  const { error: eventError } = await supabase.from('item_lifecycle_events').insert({
    item_id: itemId,
    workspace_id: item.workspace_id,
    owner_id: user.id,
    event_type: 'archived',
    from_status: item.status,
    to_status: 'archivada',
    triggered_by: 'pablo',
    notes: 'Archivado local desde el backoffice (soft archive, sin borrar nada en Woo).',
  })
  if (eventError) {
    console.warn(`[lifecycle] archive event failed for item ${itemId}: ${eventError.message}`)
  }

  revalidatePath('/inventory')
  return { ok: true }
}

export async function restoreItem(itemId: string): Promise<LifecycleResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false, error: 'No autenticado.' }

  const { data: item, error: loadError } = await supabase
    .from('inventory_items')
    .select('status, workspace_id')
    .eq('id', itemId)
    .eq('owner_id', user.id)
    .single()
  if (loadError || !item) return { ok: false, error: 'Item no encontrado o sin acceso.' }
  if (item.status !== 'archivada') return { ok: true } // nothing to restore

  // Recover the status the item had before it was archived, from the audit trail.
  const { data: events } = await supabase
    .from('item_lifecycle_events')
    .select('from_status')
    .eq('item_id', itemId)
    .eq('event_type', 'archived')
    .eq('to_status', 'archivada')
    .order('created_at', { ascending: false })
    .limit(1)
  const priorStatus = events?.[0]?.from_status ?? 'comprada'

  const { error: updateError } = await supabase
    .from('inventory_items')
    .update({ status: priorStatus })
    .eq('id', itemId)
    .eq('owner_id', user.id)
  if (updateError) return { ok: false, error: updateError.message }

  const { error: eventError } = await supabase.from('item_lifecycle_events').insert({
    item_id: itemId,
    workspace_id: item.workspace_id,
    owner_id: user.id,
    event_type: 'status_change',
    from_status: 'archivada',
    to_status: priorStatus,
    triggered_by: 'pablo',
    notes: 'Restaurado desde archivo (soft archive revertido).',
  })
  if (eventError) {
    console.warn(`[lifecycle] restore event failed for item ${itemId}: ${eventError.message}`)
  }

  revalidatePath('/inventory')
  return { ok: true }
}
