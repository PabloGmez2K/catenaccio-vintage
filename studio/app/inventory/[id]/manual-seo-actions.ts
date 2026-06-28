'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { buildSuggestionContext } from '@/lib/ai/suggestion-context'
import { MANUAL_PROMPT_VERSION } from '@/lib/seo/manual-seo-prompt'
import type { InventoryItemWithDetails } from '@/lib/types'
import type { AiActionResult } from './ai-actions'

export type ManualSeoFields = {
  titulo_seo: string
  descripcion_larga: string
  precio_sugerido?: number | null
  notas_tasacion?: string
}

// Saves manually written SEO content (from an external AI like ChatGPT / Claude.ai)
// into ai_suggestions as status='editado_aprobado'. Never calls any API.
// Never touches inventory_items, football_shirt_details, or WooCommerce.
export async function saveManualSeoContent(
  itemId: string,
  fields: ManualSeoFields
): Promise<AiActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { ok: false, error: 'No autenticado' }

  const { data: item, error: fetchError } = await supabase
    .from('inventory_items')
    .select('*, football_shirt_details(*)')
    .eq('id', itemId)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !item) {
    return { ok: false, error: 'Item no encontrado o sin acceso' }
  }

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  if (wsError || !workspace) return { ok: false, error: 'Workspace no encontrado' }

  const ctx = buildSuggestionContext(item as InventoryItemWithDetails)

  const { data: versions } = await supabase
    .from('ai_suggestions')
    .select('version')
    .eq('item_id', itemId)
    .order('version', { ascending: false })
    .limit(1)

  const nextVersion =
    versions && versions.length > 0 ? (versions[0].version as number) + 1 : 1

  const { data: suggestion, error: insertError } = await supabase
    .from('ai_suggestions')
    .insert({
      item_id: itemId,
      workspace_id: workspace.id,
      owner_id: user.id,
      version: nextVersion,
      status: 'editado_aprobado',
      titulo_seo: fields.titulo_seo,
      descripcion_larga: fields.descripcion_larga,
      precio_sugerido: fields.precio_sugerido ?? null,
      notas_tasacion: fields.notas_tasacion ?? null,
      model_used: 'manual_external_agent',
      prompt_version: MANUAL_PROMPT_VERSION,
      input_context: ctx as Record<string, unknown>,
      model_confidence: null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: 'Manual SEO content saved from copied prompt workflow',
    })
    .select('id')
    .single()

  if (insertError || !suggestion) {
    return {
      ok: false,
      error: `Error al guardar contenido: ${insertError?.message ?? 'desconocido'}`,
    }
  }

  await supabase.from('item_lifecycle_events').insert({
    item_id: itemId,
    workspace_id: workspace.id,
    owner_id: user.id,
    event_type: 'manual_seo_content_saved',
    triggered_by: 'pablo',
    payload: {
      suggestion_id: suggestion.id,
      version: nextVersion,
      prompt_version: MANUAL_PROMPT_VERSION,
    },
    notes: 'Manual SEO content saved from copied prompt workflow',
  })

  revalidatePath(`/inventory/${itemId}`)
  return { ok: true }
}
