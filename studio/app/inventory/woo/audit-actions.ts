'use server'

// WOO_WRITE_SYNC foundation - audit-page actions. One product per action.
//
// Only ONE action lives here: linkWooProductToStudio, which creates a Studio
// ficha for a web product that has none (Supabase-only write; the web is not
// touched). This is how the Woo catalog gets absorbed into the single inventory,
// one confirmed product at a time. No bulk import.

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { fetchWooProductDetail, type WooProductDetail } from '@/lib/wc/product-catalog'
import { mapWooStatusToMirror } from '@/lib/inventory/woo-diff'
import type { ItemStatus } from '@/lib/types'

export type WooAuditResult =
  | { ok: true; message: string; itemId?: string }
  | { ok: false; error: string }

const IMPORT_VERSION = 'woo_link_hydration_v1'

function metaText(meta: WooProductDetail['metaData'], key: string): string | null {
  const value = meta[key]
  if (typeof value === 'string') return value.trim() || null
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (Array.isArray(value)) {
    const first = value.find((v) => typeof v === 'string' || typeof v === 'number')
    return first != null ? String(first).trim() || null : null
  }
  return null
}

function inferSizeFromTitle(title: string): string | null {
  const match = title.match(/\(([A-Z0-9]{1,5}(?:\/[A-Z0-9]{1,5})?)\)\s*$/i)
  return match ? match[1].toUpperCase() : null
}

function attributeOption(live: WooProductDetail, slugOrName: string): string | null {
  const needle = slugOrName.toLowerCase()
  const attr = live.attributes.find((a) => {
    const slug = a.slug?.toLowerCase() ?? ''
    const name = a.name.toLowerCase()
    return slug === needle || slug.endsWith(`_${needle}`) || name === needle
  })
  return attr?.options[0] ?? null
}

function initialStudioStatus(live: WooProductDetail): ItemStatus {
  if (live.status === 'publish') {
    return live.stockStatus === 'outofstock' ? 'reservada' : 'publicada_web'
  }
  return 'borrador_web'
}

function stockSummary(live: WooProductDetail): string {
  if (live.stockStatus === 'instock') {
    return live.manageStock && live.stockQuantity != null
      ? `en stock (${live.stockQuantity})`
      : 'en stock'
  }
  if (live.stockStatus === 'outofstock') return 'agotado'
  if (live.stockStatus === 'onbackorder') return 'en reserva'
  return 'desconocido'
}

function buildInternalNotes(live: WooProductDetail, inferredSize: string | null): string {
  const price = live.regularPrice ?? live.price
  const lines = [
    `Ficha creada desde Woo (${IMPORT_VERSION}).`,
    'Coste pendiente tras importacion desde Woo: el 0 tecnico no es coste real.',
    `Web al importar: estado ${live.status}, stock ${stockSummary(live)}${
      price != null ? `, precio EUR ${price.toFixed(2)}` : ''
    }.`,
  ]

  if (live.status === 'publish' && live.stockStatus === 'outofstock') {
    lines.push('Revisar: la web esta publicada pero agotada; Studio no la marca como activa normal.')
  }
  if (live.imageSrc) {
    lines.push('Imagen web disponible desde Woo; no se ha copiado a Fotos Studio.')
  }
  if (inferredSize) {
    lines.push(`Talla inferida del titulo: ${inferredSize}. Revisar antes de publicar cambios.`)
  }
  if (live.categories.length > 0) {
    lines.push(`Categorias Woo: ${live.categories.map((c) => c.name).join(', ')}.`)
  }
  if (live.attributes.length > 0) {
    lines.push(
      `Atributos Woo: ${live.attributes
        .map((a) => `${a.name}${a.options.length > 0 ? `=${a.options.join('/')}` : ''}`)
        .join('; ')}.`
    )
  }

  const usefulMetaKeys = ['liga', 'equipo', 'ano_temporada', 'talla', 'condicion', 'jugador'].filter(
    (key) => metaText(live.metaData, key) != null
  )
  if (usefulMetaKeys.length > 0) {
    lines.push(`Meta Woo importable detectada: ${usefulMetaKeys.join(', ')}.`)
  }

  lines.push('Pendiente de completar/revisar: coste real, fecha de compra real y detalles que Woo no aporte con evidencia.')
  return lines.join('\n')
}

export async function linkWooProductToStudio(productId: number): Promise<WooAuditResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false, error: 'No autenticado.' }

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single()
  if (wsError || !workspace) return { ok: false, error: 'Workspace no encontrado.' }

  const { data: existing } = await supabase
    .from('inventory_items')
    .select('id, referencia')
    .eq('wc_product_id', productId)
    .limit(1)
  if (existing && existing.length > 0) {
    return { ok: false, error: `Este producto ya esta vinculado a "${existing[0].referencia}".` }
  }

  const liveResult = await fetchWooProductDetail(productId)
  if (!liveResult.ok) {
    return { ok: false, error: `No se pudo leer el producto: ${liveResult.message}` }
  }
  const live = liveResult.product
  if (live.status === 'trash') {
    return { ok: false, error: 'El producto esta en la papelera de la web; restauralo antes de vincularlo.' }
  }

  const referencia = live.name.trim().slice(0, 200) || `Producto web ${live.id}`
  const now = new Date().toISOString()
  const inferredSize = inferSizeFromTitle(referencia)
  const importedSize = metaText(live.metaData, 'talla') ?? inferredSize ?? ''
  const importedCondition = metaText(live.metaData, 'condicion') ?? ''
  const importedTeam = metaText(live.metaData, 'equipo') ?? ''
  const importedSeason = metaText(live.metaData, 'ano_temporada') ?? ''
  const importedLeague = metaText(live.metaData, 'liga')
  const importedPlayer = metaText(live.metaData, 'jugador')
  const category = live.categories.find((cat) => cat.id > 0) ?? null
  const initialStatus = initialStudioStatus(live)
  const webPrice = live.regularPrice ?? live.price

  const { data: inserted, error: insertError } = await supabase
    .from('inventory_items')
    .insert({
      workspace_id: workspace.id,
      owner_id: user.id,
      referencia,
      item_type: 'football_shirt',
      status: initialStatus,
      // The schema requires cost/date. They are technical placeholders on Woo import;
      // UI copy treats this cost as pending, not as real margin input.
      fecha_compra: now.slice(0, 10),
      coste: 0,
      precio_publicado_web: webPrice,
      photo_status: 'sin_hacer',
      wc_product_id: live.id,
      wc_status: mapWooStatusToMirror(live.status),
      wc_last_sync_at: now,
      wc_payload_snapshot: {
        source: IMPORT_VERSION,
        imported_at: now,
        woo: {
          id: live.id,
          status: live.status,
          stock_status: live.stockStatus,
          stock_quantity: live.stockQuantity,
          manage_stock: live.manageStock,
          price: live.price,
          regular_price: live.regularPrice,
          sale_price: live.salePrice,
          permalink: live.permalink,
          image_src: live.imageSrc,
          categories: live.categories,
          attributes: live.attributes,
          meta_subset: {
            liga: importedLeague,
            equipo: importedTeam || null,
            ano_temporada: importedSeason || null,
            talla: importedSize || null,
            condicion: importedCondition || null,
            jugador: importedPlayer,
          },
        },
      },
      notas_internas: buildInternalNotes(live, inferredSize),
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    const friendly = insertError?.message?.includes('duplicate key')
      ? 'Este producto ya esta vinculado a otra ficha.'
      : insertError?.message ?? 'error desconocido'
    return { ok: false, error: `No se pudo crear la ficha: ${friendly}` }
  }

  const { error: detailsError } = await supabase.from('football_shirt_details').insert({
    item_id: inserted.id,
    workspace_id: workspace.id,
    owner_id: user.id,
    liga: importedLeague || null,
    liga_display: attributeOption(live, 'liga'),
    equipo: importedTeam,
    equipo_display: attributeOption(live, 'equipo'),
    temporada: importedSeason,
    temporada_display: attributeOption(live, 'ano'),
    talla: importedSize,
    condicion: importedCondition,
    categoria: category?.id ?? null,
    categoria_display: category?.name ?? null,
    jugador: importedPlayer || null,
    jugador_display: attributeOption(live, 'jugador'),
  })
  if (detailsError) {
    await supabase.from('inventory_items').delete().eq('id', inserted.id).eq('owner_id', user.id)
    return { ok: false, error: `No se pudo crear la ficha completa: ${detailsError.message}` }
  }

  const { error: eventError } = await supabase.from('item_lifecycle_events').insert({
    item_id: inserted.id,
    workspace_id: workspace.id,
    owner_id: user.id,
    event_type: 'created_from_woo',
    to_status: initialStatus,
    triggered_by: 'pablo',
    payload: {
      wc_product_id: live.id,
      estado_web: live.status,
      stock_web: live.stockStatus,
      precio_web: webPrice,
      imagen_web_disponible: live.imageSrc != null,
      import_version: IMPORT_VERSION,
    },
    notes: 'Ficha creada desde el catalogo web (vincular producto existente). La web no se ha modificado.',
  })
  if (eventError) {
    console.warn(`[woo-audit] created_from_woo event failed for item ${inserted.id}: ${eventError.message}`)
  }

  revalidatePath('/inventory')
  revalidatePath('/inventory/woo')
  return {
    ok: true,
    message:
      live.status === 'publish' && live.stockStatus === 'outofstock'
        ? `Ficha creada y vinculada: "${referencia}". La web esta agotada; revisa si debe quedar vendida o reponerse.`
        : `Ficha creada y vinculada: "${referencia}". Completa coste y revisa los datos importados.`,
    itemId: inserted.id,
  }
}
