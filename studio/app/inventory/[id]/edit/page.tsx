import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { ErrorState } from '@/components/ErrorState'
import { ItemForm, type ItemFormDefaults } from '@/components/ItemForm'
import { getCategorySelectorData } from '@/lib/wc/category-cache'
import { loadTermOptions } from '@/lib/wc/term-options'

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, football_shirt_details(*)')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error?.code === 'PGRST116' || (!data && !error)) {
    notFound()
  }

  if (error) {
    return (
      <AppShell>
        <ErrorState message={error.message} />
      </AppShell>
    )
  }

  const shirt = data.football_shirt_details

  const [{ options: categoryOptions, recommendedNames }, termOptions] = await Promise.all([
    getCategorySelectorData(supabase),
    loadTermOptions(supabase, ['pa_liga', 'pa_equipo', 'pa_ano', 'pa_jugador']),
  ])

  const defaultValues: ItemFormDefaults = {
    referencia: data.referencia ?? '',
    coste: data.coste != null ? String(data.coste) : '',
    precio_objetivo: data.precio_objetivo != null ? String(data.precio_objetivo) : '',
    fecha_compra: data.fecha_compra ?? '',
    proveedor: data.proveedor ?? '',
    notas_compra: data.notas_compra ?? '',
    notas_internas: data.notas_internas ?? '',
    // Shirt fields — use defaults if shirt row exists
    liga_display: shirt?.liga_display ?? '',
    equipo_display: shirt?.equipo_display ?? shirt?.equipo ?? '',
    temporada_display: shirt?.temporada_display ?? shirt?.temporada ?? '',
    marca_display: shirt?.marca_display ?? '',
    talla: shirt?.talla ?? '',
    condicion: shirt?.condicion ?? '',
    categoria: shirt?.categoria != null ? String(shirt.categoria) : '',
    product_type: shirt?.product_type ?? 'Shirt',
    shirt_version: shirt?.shirt_version ?? 'Home',
    authenticity_type: shirt?.authenticity_type ?? 'Replica',
    sleeve_length: shirt?.sleeve_length ?? 'Short Sleeve',
    sponsor: shirt?.sponsor ?? '',
    jugador_display: shirt?.jugador_display ?? '',
    numero_dorsal: shirt?.numero_dorsal ?? '',
    nombre_dorsal: shirt?.nombre_dorsal ?? '',
    tiene_parches: shirt?.tiene_parches ?? false,
    parches_descripcion: shirt?.parches_descripcion ?? '',
    tiene_etiquetas: shirt?.tiene_etiquetas ?? false,
    es_match_worn: shirt?.es_match_worn ?? false,
    largo_cm: shirt?.largo_cm != null ? String(shirt.largo_cm) : '',
    ancho_cm: shirt?.ancho_cm != null ? String(shirt.ancho_cm) : '',
    condicion_notas: shirt?.condicion_notas ?? '',
    autenticidad: shirt?.autenticidad ?? '',
  }

  return (
    <AppShell>
      <ItemForm
        mode="edit"
        itemId={id}
        defaultValues={defaultValues}
        categoryOptions={categoryOptions}
        recommendedCategoryNames={recommendedNames}
        termOptions={termOptions}
      />
    </AppShell>
  )
}
