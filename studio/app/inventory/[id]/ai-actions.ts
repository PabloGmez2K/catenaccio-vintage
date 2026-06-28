'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { buildSuggestionContext } from '@/lib/ai/suggestion-context'
import { generateClaudeSuggestion, PROMPT_VERSION } from '@/lib/ai/claude-suggestions'
import type { InventoryItemWithDetails } from '@/lib/types'

export type AiActionResult =
  | { ok: true }
  | { ok: false; error: string }

// ── generateAiSuggestion ──────────────────────────────────────────────────────

export async function generateAiSuggestion(itemId: string): Promise<AiActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, error: 'No autenticado' }
  }

  // Fetch item with shirt details — RLS ensures owner_id match
  const { data: item, error: fetchError } = await supabase
    .from('inventory_items')
    .select('*, football_shirt_details(*)')
    .eq('id', itemId)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !item) {
    return { ok: false, error: 'Item no encontrado o sin acceso' }
  }

  // Get workspace
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  if (wsError || !workspace) {
    return { ok: false, error: 'Workspace no encontrado' }
  }

  // Build sanitized context (no sensitive fields)
  const ctx = buildSuggestionContext(item as InventoryItemWithDetails)

  // Call Claude
  const result = await generateClaudeSuggestion(ctx)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  // Compute next version
  const { data: versions } = await supabase
    .from('ai_suggestions')
    .select('version')
    .eq('item_id', itemId)
    .order('version', { ascending: false })
    .limit(1)

  const nextVersion = versions && versions.length > 0 ? (versions[0].version as number) + 1 : 1

  // Insert suggestion — SHADOW_FIRST: never touches inventory_items or Woo
  const { data: suggestion, error: insertError } = await supabase
    .from('ai_suggestions')
    .insert({
      item_id: itemId,
      workspace_id: workspace.id,
      owner_id: user.id,
      version: nextVersion,
      status: 'generado',
      titulo_seo: result.data.titulo_seo,
      descripcion_larga: result.data.descripcion_larga,
      precio_sugerido: result.data.precio_sugerido,
      notas_tasacion: result.data.notas_tasacion,
      model_used: result.model_used,
      prompt_version: PROMPT_VERSION,
      input_context: ctx as Record<string, unknown>,
      model_confidence: result.data.model_confidence,
    })
    .select('id')
    .single()

  if (insertError || !suggestion) {
    return { ok: false, error: `Error al guardar sugerencia: ${insertError?.message ?? 'desconocido'}` }
  }

  // Lifecycle event (best-effort — do not fail if this errors)
  await supabase.from('item_lifecycle_events').insert({
    item_id: itemId,
    workspace_id: workspace.id,
    owner_id: user.id,
    event_type: 'ai_request',
    triggered_by: 'agente',
    payload: {
      suggestion_id: suggestion.id,
      version: nextVersion,
      model_used: result.model_used,
      prompt_version: PROMPT_VERSION,
    },
    notes: 'Claude suggestion generated in shadow mode',
  })

  revalidatePath(`/inventory/${itemId}`)
  return { ok: true }
}

// ── approveAiSuggestion ───────────────────────────────────────────────────────

export async function approveAiSuggestion(
  suggestionId: string,
  reviewNotes?: string
): Promise<AiActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { ok: false, error: 'No autenticado' }

  const { data: existing, error: fetchError } = await supabase
    .from('ai_suggestions')
    .select('id, item_id, workspace_id, version')
    .eq('id', suggestionId)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !existing) {
    return { ok: false, error: 'Sugerencia no encontrada o sin acceso' }
  }

  const { error: updateError } = await supabase
    .from('ai_suggestions')
    .update({
      status: 'aprobado',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes ?? null,
    })
    .eq('id', suggestionId)
    .eq('owner_id', user.id)

  if (updateError) {
    return { ok: false, error: `Error al aprobar: ${updateError.message}` }
  }

  await supabase.from('item_lifecycle_events').insert({
    item_id: existing.item_id,
    workspace_id: existing.workspace_id,
    owner_id: user.id,
    event_type: 'ai_approved',
    triggered_by: 'pablo',
    payload: { suggestion_id: suggestionId, version: existing.version },
  })

  revalidatePath(`/inventory/${existing.item_id}`)
  return { ok: true }
}

// ── rejectAiSuggestion ────────────────────────────────────────────────────────

export async function rejectAiSuggestion(
  suggestionId: string,
  reviewNotes?: string
): Promise<AiActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { ok: false, error: 'No autenticado' }

  const { data: existing, error: fetchError } = await supabase
    .from('ai_suggestions')
    .select('id, item_id, workspace_id, version')
    .eq('id', suggestionId)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !existing) {
    return { ok: false, error: 'Sugerencia no encontrada o sin acceso' }
  }

  const { error: updateError } = await supabase
    .from('ai_suggestions')
    .update({
      status: 'rechazado',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes ?? null,
    })
    .eq('id', suggestionId)
    .eq('owner_id', user.id)

  if (updateError) {
    return { ok: false, error: `Error al rechazar: ${updateError.message}` }
  }

  await supabase.from('item_lifecycle_events').insert({
    item_id: existing.item_id,
    workspace_id: existing.workspace_id,
    owner_id: user.id,
    event_type: 'ai_rejected',
    triggered_by: 'pablo',
    payload: { suggestion_id: suggestionId, version: existing.version },
  })

  revalidatePath(`/inventory/${existing.item_id}`)
  return { ok: true }
}

// ── editAndApproveAiSuggestion ────────────────────────────────────────────────

export type EditAndApproveFields = {
  titulo_seo?: string
  descripcion_larga?: string
  precio_sugerido?: number | null
  notas_tasacion?: string
  review_notes?: string
}

export async function editAndApproveAiSuggestion(
  suggestionId: string,
  fields: EditAndApproveFields
): Promise<AiActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { ok: false, error: 'No autenticado' }

  const { data: existing, error: fetchError } = await supabase
    .from('ai_suggestions')
    .select('id, item_id, workspace_id, version')
    .eq('id', suggestionId)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !existing) {
    return { ok: false, error: 'Sugerencia no encontrada o sin acceso' }
  }

  const updatePayload: Record<string, unknown> = {
    status: 'editado_aprobado',
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  }

  if (fields.titulo_seo !== undefined) updatePayload.titulo_seo = fields.titulo_seo
  if (fields.descripcion_larga !== undefined) updatePayload.descripcion_larga = fields.descripcion_larga
  if (fields.precio_sugerido !== undefined) updatePayload.precio_sugerido = fields.precio_sugerido
  if (fields.notas_tasacion !== undefined) updatePayload.notas_tasacion = fields.notas_tasacion
  if (fields.review_notes !== undefined) updatePayload.review_notes = fields.review_notes

  const { error: updateError } = await supabase
    .from('ai_suggestions')
    .update(updatePayload)
    .eq('id', suggestionId)
    .eq('owner_id', user.id)

  if (updateError) {
    return { ok: false, error: `Error al editar y aprobar: ${updateError.message}` }
  }

  await supabase.from('item_lifecycle_events').insert({
    item_id: existing.item_id,
    workspace_id: existing.workspace_id,
    owner_id: user.id,
    event_type: 'ai_edited_approved',
    triggered_by: 'pablo',
    payload: { suggestion_id: suggestionId, version: existing.version },
  })

  revalidatePath(`/inventory/${existing.item_id}`)
  return { ok: true }
}
