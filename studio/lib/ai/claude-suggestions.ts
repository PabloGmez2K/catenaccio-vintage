import Anthropic from '@anthropic-ai/sdk'
import type { SuggestionContext } from './suggestion-context'

export const PROMPT_VERSION = 'studio_s022b_v1'

const FALLBACK_MODEL = 'claude-sonnet-4-6'

export type ClaudeRawSuggestion = {
  titulo_seo: string
  descripcion_larga: string
  precio_sugerido: number | null
  notas_tasacion: string
  model_confidence: 'alta' | 'media' | 'baja'
}

export type ClaudeSuggestionResult =
  | { ok: true; data: ClaudeRawSuggestion; model_used: string }
  | { ok: false; error: string }

function buildPrompt(ctx: SuggestionContext): string {
  const lines: string[] = [
    'Eres un experto en camisetas de fútbol vintage y mercado de coleccionismo deportivo.',
    'Tu tarea es generar una sugerencia estructurada para la siguiente camiseta de fútbol.',
    '',
    'DATOS DE LA CAMISETA (contexto de producto):',
    JSON.stringify(ctx, null, 2),
    '',
    'INSTRUCCIONES:',
    '- Genera un título SEO en inglés, estilo catálogo vintage. Formato: "YYYY-YY Club Version Shirt (Talla)". Si hay jugador y dorsal, añade " - APELLIDO #N" antes de la talla.',
    '- Genera una descripción larga en español, lista para WooCommerce. Incluye contexto histórico de la temporada/equipo, descripción de la camiseta, estado de conservación. Tono profesional, vintage football, comercial. Sin markdown, sin HTML.',
    '- Sugiere un precio de mercado en euros (número). Si no tienes suficiente contexto para una estimación razonada, devuelve null.',
    '- Escribe notas internas de tasación (para uso privado del vendedor, no copy público). Incluye tu razonamiento de precio, comparables de mercado que conozcas, y cualquier factor que afecte al valor.',
    '- Indica tu nivel de confianza en la sugerencia: "alta", "media" o "baja".',
    '',
    'RESTRICCIONES CRÍTICAS:',
    '- No inventes procedencia, historial de partido ni certificado de autenticidad.',
    '- No afirmes "match worn" o "player issue" salvo que el campo es_match_worn o authenticity_type lo indique explícitamente.',
    '- No incluyas el coste ni información comercial interna.',
    '- Si faltan datos clave, redacta con prudencia.',
    '- No incluyas markdown ni texto fuera del JSON.',
    '',
    'Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:',
    '{',
    '  "titulo_seo": "string",',
    '  "descripcion_larga": "string",',
    '  "precio_sugerido": number | null,',
    '  "notas_tasacion": "string",',
    '  "model_confidence": "alta" | "media" | "baja"',
    '}',
  ]
  return lines.join('\n')
}

export async function generateClaudeSuggestion(
  ctx: SuggestionContext
): Promise<ClaudeSuggestionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'ANTHROPIC_API_KEY no configurada en servidor' }
  }

  const model = process.env.ANTHROPIC_MODEL || FALLBACK_MODEL

  let client: Anthropic
  try {
    client = new Anthropic({ apiKey })
  } catch {
    return { ok: false, error: 'Error al inicializar cliente Anthropic' }
  }

  let rawText: string
  try {
    const message = await client.messages.create({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildPrompt(ctx) }],
    })
    const block = message.content[0]
    if (block.type !== 'text') {
      return { ok: false, error: 'Respuesta inesperada de Claude (no text block)' }
    }
    rawText = block.text
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido al llamar a Claude'
    return { ok: false, error: `Error de API Anthropic: ${msg}` }
  }

  // Robust JSON parsing: strip code fences if present
  let jsonText = rawText.trim()
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) jsonText = fenceMatch[1].trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    return { ok: false, error: 'Claude devolvió una respuesta que no es JSON válido' }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'Respuesta de Claude no es un objeto JSON' }
  }

  const obj = parsed as Record<string, unknown>

  const titulo_seo = typeof obj.titulo_seo === 'string' ? obj.titulo_seo : null
  const descripcion_larga = typeof obj.descripcion_larga === 'string' ? obj.descripcion_larga : null
  const notas_tasacion = typeof obj.notas_tasacion === 'string' ? obj.notas_tasacion : ''
  const raw_confidence = obj.model_confidence
  const model_confidence: 'alta' | 'media' | 'baja' =
    raw_confidence === 'alta' || raw_confidence === 'media' || raw_confidence === 'baja'
      ? raw_confidence
      : 'baja'

  let precio_sugerido: number | null = null
  if (obj.precio_sugerido !== null && obj.precio_sugerido !== undefined) {
    const n = Number(obj.precio_sugerido)
    if (!isNaN(n) && n >= 0) precio_sugerido = n
  }

  if (!titulo_seo || !descripcion_larga) {
    return { ok: false, error: 'Claude no devolvió titulo_seo o descripcion_larga válidos' }
  }

  return {
    ok: true,
    data: { titulo_seo, descripcion_larga, precio_sugerido, notas_tasacion, model_confidence },
    model_used: model,
  }
}
