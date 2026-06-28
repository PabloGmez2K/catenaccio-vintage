'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ActionState = {
  error?: string
  fieldErrors?: Record<string, string>
}

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
      error:
        'No hay workspace configurado para este usuario. Contacta con soporte.',
    }
  }

  const str = (key: string) =>
    (formData.get(key) as string | null)?.trim() || null
  const req = (key: string) =>
    (formData.get(key) as string | null)?.trim() ?? ''
  const num = (key: string) => {
    const v = (formData.get(key) as string | null)?.trim()
    if (!v || isNaN(Number(v))) return null
    return Number(v)
  }
  const bool = (key: string) => formData.get(key) === 'on'

  const referencia = req('referencia')
  const costeRaw = req('coste')
  const precioObjetivoRaw = req('precio_objetivo')
  const fechaCompra = req('fecha_compra')
  const equipo = req('equipo')
  const temporada = req('temporada')
  const talla = req('talla')
  const condicion = req('condicion')

  const fieldErrors: Record<string, string> = {}

  if (!referencia) fieldErrors.referencia = 'Obligatorio'
  if (!costeRaw || isNaN(Number(costeRaw)) || Number(costeRaw) < 0)
    fieldErrors.coste = 'Debe ser un número positivo'
  if (
    !precioObjetivoRaw ||
    isNaN(Number(precioObjetivoRaw)) ||
    Number(precioObjetivoRaw) < 0
  )
    fieldErrors.precio_objetivo = 'Debe ser un número positivo'
  if (!fechaCompra) fieldErrors.fecha_compra = 'Obligatoria'
  if (!equipo) fieldErrors.equipo = 'Obligatorio'
  if (!temporada) fieldErrors.temporada = 'Obligatoria'
  if (!talla) fieldErrors.talla = 'Obligatoria'
  if (!condicion) fieldErrors.condicion = 'Obligatoria'

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  const { data: item, error: itemError } = await supabase
    .from('inventory_items')
    .insert({
      workspace_id: workspace.id,
      owner_id: user.id,
      referencia,
      fecha_compra: fechaCompra,
      coste: Number(costeRaw),
      precio_objetivo: Number(precioObjetivoRaw),
      proveedor: str('proveedor'),
      notas_compra: str('descripcion_base'),
      notas_internas: str('notas'),
    })
    .select('id')
    .single()

  if (itemError || !item) {
    return {
      error: `Error al guardar el item: ${itemError?.message ?? 'error desconocido'}`,
    }
  }

  const { error: shirtError } = await supabase
    .from('football_shirt_details')
    .insert({
      item_id: item.id,
      workspace_id: workspace.id,
      owner_id: user.id,
      liga: str('liga'),
      liga_display: str('liga_display'),
      equipo,
      equipo_display: str('equipo_display'),
      temporada,
      temporada_display: str('temporada_display'),
      talla,
      marca: str('marca'),
      marca_display: str('marca_display'),
      condicion,
      jugador: str('jugador'),
      jugador_display: str('jugador_display'),
      numero_dorsal: str('numero_dorsal'),
      nombre_dorsal: str('nombre_dorsal'),
      tiene_parches: bool('tiene_parches'),
      parches_descripcion: str('parches_descripcion'),
      tiene_etiquetas: bool('tiene_etiquetas'),
      es_match_worn: bool('es_match_worn'),
      es_replica: bool('es_replica'),
      largo_cm: num('largo_cm'),
      ancho_cm: num('ancho_cm'),
      condicion_notas: str('condicion_notas'),
      autenticidad: str('autenticidad'),
    })

  if (shirtError) {
    return {
      error: `Item guardado (ID: ${item.id}) pero falló el detalle de camiseta: ${shirtError.message}`,
    }
  }

  redirect(`/inventory/${item.id}`)
}
