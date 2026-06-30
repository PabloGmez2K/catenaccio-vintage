import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { ItemForm } from '@/components/ItemForm'
import { getCategorySelectorData } from '@/lib/wc/category-cache'

export default async function NewItemPage() {
  const supabase = await createClient()
  const { options, recommendedNames } = await getCategorySelectorData(supabase)

  return (
    <AppShell>
      <ItemForm categoryOptions={options} recommendedCategoryNames={recommendedNames} />
    </AppShell>
  )
}
