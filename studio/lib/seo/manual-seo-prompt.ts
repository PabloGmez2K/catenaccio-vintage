import type { SuggestionContext } from '@/lib/ai/suggestion-context'

export const MANUAL_PROMPT_VERSION = 'studio_manual_seo_v2'

// Builds the full SEO prompt for Pablo to copy and paste into ChatGPT / Claude.
// Input is the sanitized SuggestionContext — no coste, proveedor, notas_compra,
// ubicacion_fisica, notas_internas, owner_id, workspace_id, or secrets.
export function buildManualSeoPrompt(ctx: SuggestionContext): string {
  const lines: string[] = []

  // ── CONTEXTO DEL PROJECT CHATGPT ──────────────────────────────────────────
  lines.push('=== CONTEXTO DE ESTE PROMPT ===')
  lines.push('')
  lines.push('Este prompt viene de Catenaccio Studio (backoffice interno).')
  lines.push('')
  lines.push('Si estás en el Project ChatGPT "Catenaccio Vintage":')
  lines.push('  → Revisa primero las reglas actuales del repo antes de redactar.')
  lines.push('  → Documentos prioritarios a leer:')
  lines.push('      - docs/studio/STUDIO_SEO_CONTENT_RULES.md       ← REGLAS CANÓNICAS')
  lines.push('      - docs/studio/STUDIO_MANUAL_SEO_PROMPT_WORKFLOW_RESULT.md')
  lines.push('      - docs/studio/STUDIO_PRODUCT_FORM_MODELING_PLAYBOOK.md')
  lines.push('  → Si el repo ha cambiado desde tu última sesión, prioriza la versión actual del repo.')
  lines.push('')
  lines.push('Si no puedes leer GitHub (sesión fuera del Project):')
  lines.push('  → Usa las reglas incluidas en la sección REGLAS FALLBACK de este prompt.')
  lines.push('')
  lines.push('El resultado se pegará manualmente en Studio. Respeta el formato de salida exacto.')
  lines.push('')
  lines.push('=== FIN CONTEXTO ===')
  lines.push('')

  // ── ROL ───────────────────────────────────────────────────────────────────
  lines.push('ROL: Eres un redactor experto en camisetas de fútbol vintage y SEO para e-commerce.')
  lines.push('')

  // ── REGLAS FALLBACK (si no hay acceso a GitHub) ───────────────────────────
  lines.push('=== REGLAS FALLBACK (usar si no puedes leer el repo) ===')
  lines.push('')
  lines.push('TÍTULO (inglés, máx. 70 caracteres):')
  lines.push('  Formato: "YYYY-YY Club Version Shirt (Size)"')
  lines.push('  Ejemplo: "2007-09 PSV Away Shirt (XXL)"')
  lines.push('  Con jugador: "2005-06 Arsenal Home L/S Shirt - Henry #14 (L)"')
  lines.push('  Variantes: L/S para manga larga; GK Shirt para porteros.')
  lines.push('  No usar Match Worn / Player Issue / Authentic / Rare salvo que los datos lo indiquen.')
  lines.push('')
  lines.push('DESCRIPCIÓN LARGA (español, mín. 100 palabras, texto plano):')
  lines.push('  Estructura: identificación → diseño/detalles → conservación → talla/medidas → personalización → cierre comercial.')
  lines.push('  Tono: profesional, coleccionismo vintage, sin hipérboles ni historia inventada.')
  lines.push('  Si falta un dato: omitirlo, no inventarlo.')
  lines.push('')
  lines.push('PRECIO:')
  lines.push('  Valor de mercado vintage. No usar coste de compra. Si no hay base: "no aplica".')
  lines.push('')
  lines.push('CLAIMS SENSIBLES (no negociables):')
  lines.push('  - "Match Worn" solo si authenticity_type = match_worn.')
  lines.push('  - "Player Issue" solo si authenticity_type = player_issue.')
  lines.push('  - No afirmar certificado, procedencia, rareza extrema ni autenticidad reforzada sin dato.')
  lines.push('  - Parches/etiquetas/sponsor solo si constan en los campos tiene_parches / tiene_etiquetas / sponsor.')
  lines.push('  - No inventar comparables exactos de precio.')
  lines.push('')
  lines.push('EXCLUIR SIEMPRE del output:')
  lines.push('  coste, proveedor, notas_compra, ubicación física, carpeta local, notas internas,')
  lines.push('  owner_id, workspace_id, emails, secretos, nombres de sesiones de agente.')
  lines.push('')
  lines.push('=== FIN REGLAS FALLBACK ===')
  lines.push('')

  // ── RESTRICCIONES ─────────────────────────────────────────────────────────
  lines.push('RESTRICCIONES ESTRICTAS:')
  lines.push('- Usa SOLO los datos proporcionados. No inventes información.')
  lines.push('- No menciones precios de coste, proveedores ni procedencia.')
  lines.push('- Si un dato no está disponible, omítelo de forma natural.')
  lines.push('- No especules sobre autenticidad más allá de lo indicado.')
  lines.push('- El título debe estar en inglés.')
  lines.push('- La descripción larga debe estar en español.')
  lines.push('')
  lines.push('DATOS DE LA CAMISETA:')
  lines.push(`Referencia: ${ctx.referencia}`)
  lines.push(`Tipo de producto: ${ctx.product_type}`)

  if (ctx.equipo_display) lines.push(`Equipo: ${ctx.equipo_display}`)
  if (ctx.liga_display) lines.push(`Liga: ${ctx.liga_display}`)
  if (ctx.temporada_display) lines.push(`Temporada: ${ctx.temporada_display}`)

  lines.push(`Talla: ${ctx.talla}`)
  lines.push(`Condición: ${ctx.condicion}`)
  lines.push(`Autenticidad: ${ctx.authenticity_type}`)
  lines.push(`Manga: ${ctx.sleeve_length}`)

  if (ctx.shirt_version && ctx.shirt_version !== 'None' && ctx.shirt_version !== '') {
    lines.push(`Versión: ${ctx.shirt_version}`)
  }
  if (ctx.marca_display) lines.push(`Marca / fabricante: ${ctx.marca_display}`)
  if (ctx.sponsor) lines.push(`Sponsor: ${ctx.sponsor}`)

  if (ctx.jugador_display) lines.push(`Jugador: ${ctx.jugador_display}`)
  if (ctx.numero_dorsal) {
    const dorsal = ctx.nombre_dorsal
      ? `${ctx.numero_dorsal} (${ctx.nombre_dorsal})`
      : ctx.numero_dorsal
    lines.push(`Dorsal: ${dorsal}`)
  }

  const features: string[] = []
  if (ctx.tiene_parches) {
    features.push(
      ctx.parches_descripcion ? `Con parches (${ctx.parches_descripcion})` : 'Con parches'
    )
  }
  if (ctx.tiene_etiquetas) features.push('Con etiquetas originales')
  if (features.length > 0) lines.push(`Características especiales: ${features.join(', ')}`)

  if (ctx.condicion_notas) lines.push(`Notas de condición: ${ctx.condicion_notas}`)
  if (ctx.autenticidad) lines.push(`Notas de autenticidad: ${ctx.autenticidad}`)

  if (ctx.largo_cm || ctx.ancho_cm) {
    const medidas = [
      ctx.largo_cm ? `largo ${ctx.largo_cm} cm` : null,
      ctx.ancho_cm ? `ancho ${ctx.ancho_cm} cm` : null,
    ]
      .filter(Boolean)
      .join(', ')
    lines.push(`Medidas: ${medidas}`)
  }

  if (ctx.precio_objetivo) {
    lines.push(`Precio objetivo de venta (referencia de mercado): €${ctx.precio_objetivo}`)
  }

  lines.push('')
  lines.push('FORMATO DE SALIDA — responde exactamente con este formato, sin texto adicional:')
  lines.push('')
  lines.push('---TÍTULO WOO (en inglés, máx. 70 caracteres)---')
  lines.push('[escribe el título aquí]')
  lines.push('')
  lines.push('---DESCRIPCIÓN LARGA (en español, mínimo 100 palabras)---')
  lines.push('[escribe la descripción aquí]')
  lines.push('')
  lines.push('---PRECIO SUGERIDO (EUR, solo número o "no aplica")---')
  lines.push('[precio o "no aplica"]')
  lines.push('')
  lines.push('---NOTAS INTERNAS (opcional, para uso de Pablo, puede quedar vacío)---')
  lines.push('[notas o "ninguna"]')
  lines.push('')
  lines.push('CHECKLIST ANTES DE RESPONDER:')
  lines.push('[ ] Título en inglés, máximo 70 caracteres')
  lines.push('[ ] Descripción en español, mínimo 100 palabras')
  lines.push('[ ] No mencioné precios de coste ni procedencia')
  lines.push('[ ] No inventé datos que no figuraban en los datos de la camiseta')
  lines.push('[ ] Precio sugerido basado en valor de mercado vintage, no en coste')

  return lines.join('\n')
}
