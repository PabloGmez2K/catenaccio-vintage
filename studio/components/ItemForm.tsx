'use client'

import { useState, useMemo, useEffect, useActionState } from 'react'
import Link from 'next/link'
import { buildTitle } from '@/lib/title-builder'
import {
  ligaOptions,
  equipoOptions,
  temporadaOptions,
  marcaOptions,
  tallaOptions,
  condicionOptions,
  productTypeOptions,
  shirtVersionOptions,
  authenticityTypeOptions,
  sleeveLengthOptions,
  getTitleLabel,
} from '@/lib/wc-terms-mvp'
import {
  createInventoryItem,
  updateInventoryItem,
  type ActionState,
} from '@/app/inventory/actions'

const TODAY = new Date().toISOString().slice(0, 10)

export interface ItemFormDefaults {
  referencia?: string
  liga_display?: string
  equipo_display?: string
  temporada_display?: string
  marca_display?: string
  talla?: string
  condicion?: string
  product_type?: string
  shirt_version?: string
  authenticity_type?: string
  sleeve_length?: string
  sponsor?: string
  jugador_display?: string
  numero_dorsal?: string
  nombre_dorsal?: string
  tiene_parches?: boolean
  parches_descripcion?: string
  tiene_etiquetas?: boolean
  es_match_worn?: boolean
  largo_cm?: string
  ancho_cm?: string
  condicion_notas?: string
  autenticidad?: string
  coste?: string
  precio_objetivo?: string
  fecha_compra?: string
  proveedor?: string
  notas_compra?: string
  notas_internas?: string
}

interface ItemFormProps {
  mode?: 'create' | 'edit'
  itemId?: string
  defaultValues?: ItemFormDefaults
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <span className="field-error">{msg}</span>
}

export function ItemForm({
  mode = 'create',
  itemId,
  defaultValues = {},
}: ItemFormProps) {
  const serverAction = mode === 'edit' ? updateInventoryItem : createInventoryItem
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    serverAction,
    {}
  )

  const fe = state.fieldErrors ?? {}

  // ── Controlled form state ────────────────────────────────────────────────

  const [ligaDisplay, setLigaDisplay] = useState(defaultValues.liga_display ?? '')
  const [equipoDisplay, setEquipoDisplay] = useState(defaultValues.equipo_display ?? '')
  const [temporadaDisplay, setTemporadaDisplay] = useState(defaultValues.temporada_display ?? '')
  const [marcaDisplay, setMarcaDisplay] = useState(defaultValues.marca_display ?? '')
  const [talla, setTalla] = useState(defaultValues.talla ?? '')
  const [condicion, setCondicion] = useState(defaultValues.condicion ?? '')
  const [productType, setProductType] = useState(defaultValues.product_type ?? 'Shirt')
  const [shirtVersion, setShirtVersion] = useState(defaultValues.shirt_version ?? 'Home')
  const [authenticityType, setAuthenticityType] = useState(
    defaultValues.authenticity_type ?? 'Replica'
  )
  const [sleeveLength, setSleeveLength] = useState(defaultValues.sleeve_length ?? 'Short Sleeve')
  const [sponsor, setSponsor] = useState(defaultValues.sponsor ?? '')
  const [jugadorDisplay, setJugadorDisplay] = useState(defaultValues.jugador_display ?? '')
  const [numeroDorsal, setNumeroDorsal] = useState(defaultValues.numero_dorsal ?? '')
  const [nombreDorsal, setNombreDorsal] = useState(defaultValues.nombre_dorsal ?? '')
  const [tieneParches, setTieneParches] = useState(defaultValues.tiene_parches ?? false)
  const [parchesDescripcion, setParchesDescripcion] = useState(
    defaultValues.parches_descripcion ?? ''
  )
  const [tieneEtiquetas, setTieneEtiquetas] = useState(defaultValues.tiene_etiquetas ?? false)
  const [esMatchWorn, setEsMatchWorn] = useState(defaultValues.es_match_worn ?? false)
  const [largoCm, setLargoCm] = useState(defaultValues.largo_cm ?? '')
  const [anchoCm, setAnchoCm] = useState(defaultValues.ancho_cm ?? '')
  const [condicionNotas, setCondicionNotas] = useState(defaultValues.condicion_notas ?? '')
  const [autenticidad, setAutenticidad] = useState(defaultValues.autenticidad ?? '')
  const [coste, setCoste] = useState(defaultValues.coste ?? '')
  const [precioObjetivo, setPrecioObjetivo] = useState(defaultValues.precio_objetivo ?? '')
  const [fechaCompra, setFechaCompra] = useState(defaultValues.fecha_compra ?? TODAY)
  const [proveedor, setProveedor] = useState(defaultValues.proveedor ?? '')
  const [notasCompra, setNotasCompra] = useState(defaultValues.notas_compra ?? '')
  const [notasInternas, setNotasInternas] = useState(defaultValues.notas_internas ?? '')

  // ── Title autogeneration ─────────────────────────────────────────────────

  const [referencia, setReferencia] = useState(defaultValues.referencia ?? '')
  const [titleIsManual, setTitleIsManual] = useState(!!defaultValues.referencia)

  const computedTitle = useMemo(
    () =>
      buildTitle({
        season: temporadaDisplay,
        team: getTitleLabel(equipoOptions, equipoDisplay),
        productType,
        shirtVersion,
        authenticityType: getTitleLabel(authenticityTypeOptions, authenticityType),
        sleeveLength,
        player: jugadorDisplay,
        number: numeroDorsal,
        size: talla,
      }),
    [
      temporadaDisplay,
      equipoDisplay,
      productType,
      shirtVersion,
      authenticityType,
      sleeveLength,
      jugadorDisplay,
      numeroDorsal,
      talla,
    ]
  )

  useEffect(() => {
    if (!titleIsManual) {
      setReferencia(computedTitle)
    }
  }, [computedTitle, titleIsManual])

  const regenerateTitle = () => {
    setTitleIsManual(false)
    setReferencia(computedTitle)
  }

  const isShirt = productType === 'Shirt'

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="item-form-page">
      <Link href="/inventory" className="back-link">
        ← Volver al inventario
      </Link>
      <h2>{mode === 'edit' ? 'Editar camiseta' : 'Nueva camiseta'}</h2>

      {state.error && (
        <div className="form-error" role="alert">
          {state.error}
        </div>
      )}
      {Object.keys(fe).length > 0 && (
        <div className="form-error" role="alert">
          Hay campos obligatorios sin completar. Revisa el formulario.
        </div>
      )}

      <form action={formAction} className="item-form">
        {mode === 'edit' && itemId && (
          <input type="hidden" name="item_id" value={itemId} />
        )}

        {/* ── Título ───────────────────────────────────────────────────── */}
        <section className="form-section">
          <h3>Título / referencia</h3>

          {referencia && (
            <div className="title-preview">
              <span className="title-preview-label">Vista previa:</span>
              <span className="title-preview-value">{referencia}</span>
            </div>
          )}

          <div className={`form-field ${fe.referencia ? 'has-error' : ''}`}>
            <label htmlFor="referencia">
              Título{' '}
              <span className="required">*</span>
              {titleIsManual && <span className="manual-badge"> · Manual</span>}
            </label>
            <div className="title-input-row">
              <input
                id="referencia"
                name="referencia"
                type="text"
                value={referencia}
                onChange={(e) => {
                  setReferencia(e.target.value)
                  setTitleIsManual(true)
                }}
                placeholder="Se autogenera desde los campos del formulario"
              />
              <button
                type="button"
                className="btn-regenerate"
                onClick={regenerateTitle}
                title="Regenerar título desde los campos del formulario"
              >
                ↺ Regenerar
              </button>
            </div>
            <FieldError msg={fe.referencia} />
          </div>
        </section>

        {/* ── 1. Identificación y catálogo ─────────────────────────────── */}
        <section className="form-section">
          <h3>Identificación y catálogo</h3>

          <div className="form-field">
            <label htmlFor="liga_display">Liga</label>
            <input
              id="liga_display"
              name="liga_display"
              type="text"
              list="liga-list"
              value={ligaDisplay}
              onChange={(e) => setLigaDisplay(e.target.value)}
              placeholder="LaLiga, Premier League, Sin liga / Selección nacional…"
              autoComplete="off"
            />
            <datalist id="liga-list">
              {ligaOptions.map((o) => (
                <option key={o.label} value={o.label} />
              ))}
            </datalist>
            <p className="field-help">
              Para selecciones nacionales, usa Liga = Sin liga / Selección nacional y Equipo = España, Francia, Brasil, Argentina…
            </p>
            <p className="field-help">
              Si no aparece en la lista, puedes escribirlo. Studio lo guardará como pendiente de mapeo para Woo.
            </p>
          </div>

          <div className={`form-field ${fe.equipo_display ? 'has-error' : ''}`}>
            <label htmlFor="equipo_display">
              Equipo <span className="required">*</span>
            </label>
            <input
              id="equipo_display"
              name="equipo_display"
              type="text"
              list="equipo-list"
              value={equipoDisplay}
              onChange={(e) => setEquipoDisplay(e.target.value)}
              placeholder="FC Barcelona, Real Madrid, Ajax…"
              autoComplete="off"
            />
            <datalist id="equipo-list">
              {equipoOptions.map((o) => (
                <option key={o.label} value={o.label} />
              ))}
            </datalist>
            <FieldError msg={fe.equipo_display} />
            <p className="field-help">
              Si no aparece en la lista, puedes escribirlo. Studio lo guardará como pendiente de mapeo para Woo.
            </p>
          </div>

          <div className={`form-field ${fe.temporada_display ? 'has-error' : ''}`}>
            <label htmlFor="temporada_display">
              Temporada <span className="required">*</span>
            </label>
            <input
              id="temporada_display"
              name="temporada_display"
              type="text"
              list="temporada-list"
              value={temporadaDisplay}
              onChange={(e) => setTemporadaDisplay(e.target.value)}
              placeholder="2001-02, 2014-15…"
              autoComplete="off"
            />
            <datalist id="temporada-list">
              {temporadaOptions.map((o) => (
                <option key={o.label} value={o.label} />
              ))}
            </datalist>
            <FieldError msg={fe.temporada_display} />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="marca_display">Marca</label>
              <input
                id="marca_display"
                name="marca_display"
                type="text"
                list="marca-list"
                value={marcaDisplay}
                onChange={(e) => setMarcaDisplay(e.target.value)}
                placeholder="Adidas, Nike, Umbro…"
                autoComplete="off"
              />
              <datalist id="marca-list">
                {marcaOptions.map((o) => (
                  <option key={o.label} value={o.label} />
                ))}
              </datalist>
              <p className="field-help">
                Si no aparece en la lista, puedes escribirla. Studio la guardará como pendiente de mapeo para Woo.
              </p>
            </div>

            <div className={`form-field ${fe.talla ? 'has-error' : ''}`}>
              <label htmlFor="talla">
                Talla <span className="required">*</span>
              </label>
              <select
                id="talla"
                name="talla"
                value={talla}
                onChange={(e) => setTalla(e.target.value)}
              >
                <option value="">— Seleccionar —</option>
                {tallaOptions.map((o) => (
                  <option key={o.label} value={o.label}>
                    {o.label}
                  </option>
                ))}
              </select>
              <FieldError msg={fe.talla} />
            </div>
          </div>

          <div className={`form-field ${fe.condicion ? 'has-error' : ''}`}>
            <label htmlFor="condicion">
              Condición <span className="required">*</span>
            </label>
            <select
              id="condicion"
              name="condicion"
              value={condicion}
              onChange={(e) => setCondicion(e.target.value)}
            >
              <option value="">— Seleccionar —</option>
              {condicionOptions.map((o) => (
                <option key={o.label} value={o.label}>
                  {o.label}
                </option>
              ))}
            </select>
            <FieldError msg={fe.condicion} />
          </div>
        </section>

        {/* ── 2. Especificación del producto ───────────────────────────── */}
        <section className="form-section">
          <h3>Especificación del producto</h3>

          <div className="form-row">
            <div className={`form-field ${fe.product_type ? 'has-error' : ''}`}>
              <label htmlFor="product_type">
                Tipo <span className="required">*</span>
              </label>
              <select
                id="product_type"
                name="product_type"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              >
                {productTypeOptions.map((o) => (
                  <option key={o.label} value={o.label}>
                    {o.label}
                  </option>
                ))}
              </select>
              <FieldError msg={fe.product_type} />
            </div>

            <div className={`form-field ${fe.authenticity_type ? 'has-error' : ''}`}>
              <label htmlFor="authenticity_type">
                Autenticidad <span className="required">*</span>
              </label>
              <select
                id="authenticity_type"
                name="authenticity_type"
                value={authenticityType}
                onChange={(e) => setAuthenticityType(e.target.value)}
              >
                {authenticityTypeOptions.map((o) => (
                  <option key={o.label} value={o.value ?? o.label}>
                    {o.label}
                  </option>
                ))}
              </select>
              <FieldError msg={fe.authenticity_type} />
              <p className="field-help">
                Usa <strong>Original</strong> para una camiseta original vendida al público — no significa falsa. Solo usa Player Issue, Match Issue o Match Worn si tienes indicios o prueba clara. Si dudas, usa <strong>No determinado</strong> y deja notas de autenticidad.
              </p>
            </div>
          </div>

          {isShirt && (
            <div className="form-row">
              <div className={`form-field ${fe.shirt_version ? 'has-error' : ''}`}>
                <label htmlFor="shirt_version">
                  Versión <span className="required">*</span>
                </label>
                <select
                  id="shirt_version"
                  name="shirt_version"
                  value={shirtVersion}
                  onChange={(e) => setShirtVersion(e.target.value)}
                >
                  {shirtVersionOptions.map((o) => (
                    <option key={o.label} value={o.label}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <FieldError msg={fe.shirt_version} />
              </div>

              <div className={`form-field ${fe.sleeve_length ? 'has-error' : ''}`}>
                <label htmlFor="sleeve_length">
                  Manga <span className="required">*</span>
                </label>
                <select
                  id="sleeve_length"
                  name="sleeve_length"
                  value={sleeveLength}
                  onChange={(e) => setSleeveLength(e.target.value)}
                >
                  {sleeveLengthOptions.map((o) => (
                    <option key={o.label} value={o.label}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <FieldError msg={fe.sleeve_length} />
              </div>
            </div>
          )}

          {/* Hidden fields for non-shirt types so FormData always has values */}
          {!isShirt && (
            <>
              <input type="hidden" name="shirt_version" value="None" />
              <input type="hidden" name="sleeve_length" value={sleeveLength} />
            </>
          )}

          <div className="form-field">
            <label htmlFor="sponsor">Patrocinador / sponsor</label>
            <input
              id="sponsor"
              name="sponsor"
              type="text"
              value={sponsor}
              onChange={(e) => setSponsor(e.target.value)}
              placeholder="Fly Emirates, Bwin, Sharp…"
            />
          </div>
        </section>

        {/* ── 3. Personalización y detalles vintage ────────────────────── */}
        <section className="form-section">
          <h3>Personalización y detalles vintage</h3>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="jugador_display">Jugador</label>
              <input
                id="jugador_display"
                name="jugador_display"
                type="text"
                value={jugadorDisplay}
                onChange={(e) => setJugadorDisplay(e.target.value)}
                placeholder="Raúl, Zidane, Henry…"
              />
            </div>
            <div className="form-field">
              <label htmlFor="numero_dorsal">Número dorsal</label>
              <input
                id="numero_dorsal"
                name="numero_dorsal"
                type="text"
                value={numeroDorsal}
                onChange={(e) => setNumeroDorsal(e.target.value)}
                placeholder="7, 10, 14…"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="nombre_dorsal">Nombre en dorsal</label>
            <input
              id="nombre_dorsal"
              name="nombre_dorsal"
              type="text"
              value={nombreDorsal}
              onChange={(e) => setNombreDorsal(e.target.value)}
              placeholder="RAÚL, ZIDANE, HENRY…"
            />
          </div>

          <div className="form-checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="tiene_parches"
                checked={tieneParches}
                onChange={(e) => setTieneParches(e.target.checked)}
              />
              Tiene parches
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="tiene_etiquetas"
                checked={tieneEtiquetas}
                onChange={(e) => setTieneEtiquetas(e.target.checked)}
              />
              Con etiquetas originales
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="es_match_worn"
                checked={esMatchWorn}
                onChange={(e) => setEsMatchWorn(e.target.checked)}
              />
              Match worn (documentado)
            </label>
          </div>

          {tieneParches && (
            <div className="form-field">
              <label htmlFor="parches_descripcion">Descripción de parches</label>
              <input
                id="parches_descripcion"
                name="parches_descripcion"
                type="text"
                value={parchesDescripcion}
                onChange={(e) => setParchesDescripcion(e.target.value)}
                placeholder="LFP, Champions League, Copa del Rey…"
              />
            </div>
          )}
          {!tieneParches && (
            <input
              type="hidden"
              name="parches_descripcion"
              value={parchesDescripcion}
            />
          )}

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="largo_cm">Largo (cm)</label>
              <input
                id="largo_cm"
                name="largo_cm"
                type="number"
                min="0"
                step="0.1"
                value={largoCm}
                onChange={(e) => setLargoCm(e.target.value)}
                placeholder="72.5"
              />
            </div>
            <div className="form-field">
              <label htmlFor="ancho_cm">Ancho (cm)</label>
              <input
                id="ancho_cm"
                name="ancho_cm"
                type="number"
                min="0"
                step="0.1"
                value={anchoCm}
                onChange={(e) => setAnchoCm(e.target.value)}
                placeholder="55.0"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="condicion_notas">Notas de condición</label>
            <textarea
              id="condicion_notas"
              name="condicion_notas"
              rows={2}
              value={condicionNotas}
              onChange={(e) => setCondicionNotas(e.target.value)}
              placeholder="Manchas, desgastes, detalles específicos…"
            />
          </div>

          <div className="form-field">
            <label htmlFor="autenticidad">Notas de autenticidad</label>
            <input
              id="autenticidad"
              name="autenticidad"
              type="text"
              value={autenticidad}
              onChange={(e) => setAutenticidad(e.target.value)}
              placeholder="COA, etiqueta Teka, certificado, comprada en tienda oficial…"
            />
          </div>
        </section>

        {/* ── 4. Datos internos ────────────────────────────────────────── */}
        <section className="form-section">
          <h3>Datos internos</h3>

          <div className="form-row">
            <div className={`form-field ${fe.coste ? 'has-error' : ''}`}>
              <label htmlFor="coste">
                Coste (€) <span className="required">*</span>
              </label>
              <input
                id="coste"
                name="coste"
                type="number"
                min="0"
                step="0.01"
                value={coste}
                onChange={(e) => setCoste(e.target.value)}
                placeholder="0.00"
              />
              <FieldError msg={fe.coste} />
            </div>

            <div className="form-field">
              <label htmlFor="precio_objetivo">Precio objetivo (€)</label>
              <input
                id="precio_objetivo"
                name="precio_objetivo"
                type="number"
                min="0"
                step="0.01"
                value={precioObjetivo}
                onChange={(e) => setPrecioObjetivo(e.target.value)}
                placeholder="0.00"
              />
              <FieldError msg={fe.precio_objetivo} />
            </div>
          </div>

          <div className="form-row">
            <div className={`form-field ${fe.fecha_compra ? 'has-error' : ''}`}>
              <label htmlFor="fecha_compra">
                Fecha de compra <span className="required">*</span>
              </label>
              <input
                id="fecha_compra"
                name="fecha_compra"
                type="date"
                value={fechaCompra}
                onChange={(e) => setFechaCompra(e.target.value)}
              />
              <FieldError msg={fe.fecha_compra} />
            </div>

            <div className="form-field">
              <label htmlFor="proveedor">Proveedor</label>
              <input
                id="proveedor"
                name="proveedor"
                type="text"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                placeholder="Wallapop, rastro, particular…"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="notas_compra">Notas de compra</label>
            <textarea
              id="notas_compra"
              name="notas_compra"
              rows={2}
              value={notasCompra}
              onChange={(e) => setNotasCompra(e.target.value)}
              placeholder="Procedencia, estado al adquirir…"
            />
          </div>

          <div className="form-field">
            <label htmlFor="notas_internas">Notas internas</label>
            <textarea
              id="notas_internas"
              name="notas_internas"
              rows={2}
              value={notasInternas}
              onChange={(e) => setNotasInternas(e.target.value)}
              placeholder="Notas privadas de Pablo…"
            />
          </div>
        </section>

        <div className="form-actions">
          <Link href="/inventory" className="btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending
              ? 'Guardando…'
              : mode === 'edit'
                ? 'Guardar cambios'
                : 'Guardar camiseta'}
          </button>
        </div>
      </form>
    </div>
  )
}
