'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  ligaOptions,
  equipoOptions,
  temporadaOptions,
  marcaOptions,
  resolveTermId,
} from '@/lib/wc-terms-mvp'
import { loadCachedTerms, matchCachedTermId } from '@/lib/wc/term-cache'

export type ActionState = {
  error?: string
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function str(fd: FormData, key: string): string | null {
  return (fd.get(key) as string | null)?.trim() || null
}

function req(fd: FormData, key: string): string {
  return (fd.get(key) as string | null)?.trim() ?? ''
}

function num(fd: FormData, key: string): number | null {
  const v = (fd.get(key) as string | null)?.trim()
  if (!v || isNaN(Number(v))) return null
  return Number(v)
}

function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === 'on'
}

function snapshotValues(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {}
  fd.forEach((val, key) => {
    if (typeof val === 'string') out[key] = val
  })
  return out
}

// ── createInventoryItem ───────────────────────────────────────────────────────

export async function createInventoryItem(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  if (wsError || !workspace) {
    return {
      error: 'No hay workspace configurado para este usuario. Contacta con soporte.',
      values: snapshotValues(formData),
    }
  }

  const referencia = req(formData, 'referencia')
  const equipoDisplay = req(formData, 'equipo_display')
  const temporadaDisplay = req(formData, 'temporada_display')
  const talla = req(formData, 'talla')
  const condicion = req(formData, 'condicion')
  const productType = req(formData, 'product_type') || 'Shirt'
  const authenticityType = req(formData, 'authenticity_type') || 'Replica'
  const costeRaw = req(formData, 'coste')
  const fechaCompra = req(formData, 'fecha_compra')

  const fieldErrors: Record<string, string> = {}

  if (!referencia) fieldErrors.referencia = 'Obligatorio'
  if (!equipoDisplay) fieldErrors.equipo_display = 'Obligatorio'
  if (!temporadaDisplay) fieldErrors.temporada_display = 'Obligatoria'
  if (!talla) fieldErrors.talla = 'Obligatoria'
  if (!condicion) fieldErrors.condicion = 'Obligatoria'
  if (!productType) fieldErrors.product_type = 'Obligatorio'
  if (!authenticityType) fieldErrors.authenticity_type = 'Obligatoria'
  if (!costeRaw || isNaN(Number(costeRaw)) || Number(costeRaw) < 0)
    fieldErrors.coste = 'Debe ser un número positivo'
  if (!fechaCompra) fieldErrors.fecha_compra = 'Obligatoria'

  const precioObjetivoRaw = str(formData, 'precio_objetivo')
  if (
    precioObjetivoRaw !== null &&
    (isNaN(Number(precioObjetivoRaw)) || Number(precioObjetivoRaw) < 0)
  ) {
    fieldErrors.precio_objetivo = 'Debe ser un número positivo'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values: snapshotValues(formData) }
  }

  // Resolve WC term IDs from display labels against the Supabase taxonomy cache
  // (S023A/S023B) — unmatched terms stored as ''. marca has no synced WC taxonomy
  // and keeps resolving against the local presentation map (always '' today).
  const ligaDisplay = str(formData, 'liga_display')
  const marcaDisplay = str(formData, 'marca_display')
  const jugadorDisplay = str(formData, 'jugador_display')
  const shirtVersion = req(formData, 'shirt_version') || 'Home'
  const sleeveLength = req(formData, 'sleeve_length') || 'Short Sleeve'

  const cachedTerms = await loadCachedTerms(supabase, ['pa_liga', 'pa_equipo', 'pa_ano'])
  const ligaTermId = ligaDisplay ? matchCachedTermId(cachedTerms.pa_liga, ligaDisplay, ligaOptions) : ''
  const equipoTermId = matchCachedTermId(cachedTerms.pa_equipo, equipoDisplay, equipoOptions)
  const temporadaTermId = matchCachedTermId(cachedTerms.pa_ano, temporadaDisplay, temporadaOptions)
  const marcaTermId = marcaDisplay ? resolveTermId(marcaOptions, marcaDisplay) : ''

  // es_replica derived from authenticity_type; 'Replica' is the stored value for "Original retail / Fan version"
  const esReplica = authenticityType === 'Replica' || authenticityType === 'Original retail / Fan version'

  const { data: item, error: itemError } = await supabase
    .from('inventory_items')
    .insert({
      workspace_id: workspace.id,
      owner_id: user.id,
      referencia,
      fecha_compra: fechaCompra,
      coste: Number(costeRaw),
      precio_objetivo: precioObjetivoRaw ? Number(precioObjetivoRaw) : null,
      proveedor: str(formData, 'proveedor'),
      notas_compra: str(formData, 'notas_compra'),
      notas_internas: str(formData, 'notas_internas'),
    })
    .select('id')
    .single()

  if (itemError || !item) {
    return {
      error: `Error al guardar el item: ${itemError?.message ?? 'error desconocido'}`,
      values: snapshotValues(formData),
    }
  }

  const { error: shirtError } = await supabase.from('football_shirt_details').insert({
    item_id: item.id,
    workspace_id: workspace.id,
    owner_id: user.id,
    product_type: productType,
    shirt_version: shirtVersion,
    authenticity_type: authenticityType,
    sleeve_length: sleeveLength,
    sponsor: str(formData, 'sponsor'),
    liga: ligaTermId || null,
    liga_display: ligaDisplay,
    equipo: equipoTermId,
    equipo_display: equipoDisplay,
    temporada: temporadaTermId,
    temporada_display: temporadaDisplay,
    talla,
    marca: marcaTermId || null,
    marca_display: marcaDisplay,
    condicion,
    jugador: jugadorDisplay ? '' : null,
    jugador_display: jugadorDisplay,
    numero_dorsal: str(formData, 'numero_dorsal'),
    nombre_dorsal: str(formData, 'nombre_dorsal'),
    tiene_parches: bool(formData, 'tiene_parches'),
    parches_descripcion: str(formData, 'parches_descripcion'),
    tiene_etiquetas: bool(formData, 'tiene_etiquetas'),
    es_match_worn: bool(formData, 'es_match_worn'),
    es_replica: esReplica,
    largo_cm: num(formData, 'largo_cm'),
    ancho_cm: num(formData, 'ancho_cm'),
    condicion_notas: str(formData, 'condicion_notas'),
    autenticidad: str(formData, 'autenticidad'),
  })

  if (shirtError) {
    return {
      error: `Item guardado pero falló el detalle de camiseta: ${shirtError.message}`,
      values: snapshotValues(formData),
    }
  }

  redirect(`/inventory/${item.id}`)
}

// ── updateInventoryItem ───────────────────────────────────────────────────────

export async function updateInventoryItem(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const itemId = req(formData, 'item_id')
  if (!itemId) {
    return { error: 'ID de item inválido.' }
  }

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  if (wsError || !workspace) {
    return {
      error: 'No hay workspace configurado para este usuario.',
      values: snapshotValues(formData),
    }
  }

  const referencia = req(formData, 'referencia')
  const equipoDisplay = req(formData, 'equipo_display')
  const temporadaDisplay = req(formData, 'temporada_display')
  const talla = req(formData, 'talla')
  const condicion = req(formData, 'condicion')
  const productType = req(formData, 'product_type') || 'Shirt'
  const authenticityType = req(formData, 'authenticity_type') || 'Replica'
  const costeRaw = req(formData, 'coste')
  const fechaCompra = req(formData, 'fecha_compra')

  const fieldErrors: Record<string, string> = {}

  if (!referencia) fieldErrors.referencia = 'Obligatorio'
  if (!equipoDisplay) fieldErrors.equipo_display = 'Obligatorio'
  if (!temporadaDisplay) fieldErrors.temporada_display = 'Obligatoria'
  if (!talla) fieldErrors.talla = 'Obligatoria'
  if (!condicion) fieldErrors.condicion = 'Obligatoria'
  if (!productType) fieldErrors.product_type = 'Obligatorio'
  if (!authenticityType) fieldErrors.authenticity_type = 'Obligatoria'
  if (!costeRaw || isNaN(Number(costeRaw)) || Number(costeRaw) < 0)
    fieldErrors.coste = 'Debe ser un número positivo'
  if (!fechaCompra) fieldErrors.fecha_compra = 'Obligatoria'

  const precioObjetivoRaw = str(formData, 'precio_objetivo')
  if (
    precioObjetivoRaw !== null &&
    (isNaN(Number(precioObjetivoRaw)) || Number(precioObjetivoRaw) < 0)
  ) {
    fieldErrors.precio_objetivo = 'Debe ser un número positivo'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values: snapshotValues(formData) }
  }

  const ligaDisplay = str(formData, 'liga_display')
  const marcaDisplay = str(formData, 'marca_display')
  const jugadorDisplay = str(formData, 'jugador_display')
  const shirtVersion = req(formData, 'shirt_version') || 'Home'
  const sleeveLength = req(formData, 'sleeve_length') || 'Short Sleeve'

  const cachedTerms = await loadCachedTerms(supabase, ['pa_liga', 'pa_equipo', 'pa_ano'])
  const ligaTermId = ligaDisplay ? matchCachedTermId(cachedTerms.pa_liga, ligaDisplay, ligaOptions) : ''
  const equipoTermId = matchCachedTermId(cachedTerms.pa_equipo, equipoDisplay, equipoOptions)
  const temporadaTermId = matchCachedTermId(cachedTerms.pa_ano, temporadaDisplay, temporadaOptions)
  const marcaTermId = marcaDisplay ? resolveTermId(marcaOptions, marcaDisplay) : ''

  const esReplica = authenticityType === 'Replica' || authenticityType === 'Original retail / Fan version'

  // Update inventory_items — RLS + owner_id check prevents cross-user edits
  const { error: itemError } = await supabase
    .from('inventory_items')
    .update({
      referencia,
      fecha_compra: fechaCompra,
      coste: Number(costeRaw),
      precio_objetivo: precioObjetivoRaw ? Number(precioObjetivoRaw) : null,
      proveedor: str(formData, 'proveedor'),
      notas_compra: str(formData, 'notas_compra'),
      notas_internas: str(formData, 'notas_internas'),
    })
    .eq('id', itemId)
    .eq('owner_id', user.id)

  if (itemError) {
    return {
      error: `Error al actualizar el item: ${itemError.message}`,
      values: snapshotValues(formData),
    }
  }

  // Update football_shirt_details — verify ownership via owner_id + RLS
  const { data: detailData, error: detailError } = await supabase
    .from('football_shirt_details')
    .update({
      product_type: productType,
      shirt_version: shirtVersion,
      authenticity_type: authenticityType,
      sleeve_length: sleeveLength,
      sponsor: str(formData, 'sponsor'),
      liga: ligaTermId || null,
      liga_display: ligaDisplay,
      equipo: equipoTermId,
      equipo_display: equipoDisplay,
      temporada: temporadaTermId,
      temporada_display: temporadaDisplay,
      talla,
      marca: marcaTermId || null,
      marca_display: marcaDisplay,
      condicion,
      jugador: jugadorDisplay ? '' : null,
      jugador_display: jugadorDisplay,
      numero_dorsal: str(formData, 'numero_dorsal'),
      nombre_dorsal: str(formData, 'nombre_dorsal'),
      tiene_parches: bool(formData, 'tiene_parches'),
      parches_descripcion: str(formData, 'parches_descripcion'),
      tiene_etiquetas: bool(formData, 'tiene_etiquetas'),
      es_match_worn: bool(formData, 'es_match_worn'),
      es_replica: esReplica,
      largo_cm: num(formData, 'largo_cm'),
      ancho_cm: num(formData, 'ancho_cm'),
      condicion_notas: str(formData, 'condicion_notas'),
      autenticidad: str(formData, 'autenticidad'),
    })
    .eq('item_id', itemId)
    .eq('owner_id', user.id)
    .select('id')
    .single()

  if (detailError || !detailData) {
    return {
      error: detailError?.code === 'PGRST116'
        ? 'El item no tiene datos de camiseta asociados. Contacta con soporte para reparar el registro.'
        : `Error al actualizar el detalle: ${detailError?.message ?? 'error desconocido'}`,
      values: snapshotValues(formData),
    }
  }

  redirect(`/inventory/${itemId}`)
}
