import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { ItemForm } from '@/components/ItemForm'
import { getCategorySelectorData } from '@/lib/wc/category-cache'
import { loadTermOptions } from '@/lib/wc/term-options'

export default async function NewItemPage() {
  const supabase = await createClient()
  const [{ options, recommendedNames }, termOptions] = await Promise.all([
    getCategorySelectorData(supabase),
    loadTermOptions(supabase, ['pa_liga', 'pa_equipo', 'pa_ano', 'pa_jugador']),
  ])

  return (
    <AppShell>
      <ItemForm
        categoryOptions={options}
        recommendedCategoryNames={recommendedNames}
        termOptions={termOptions}
      />
    </AppShell>
  )
}
