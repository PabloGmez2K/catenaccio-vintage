'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { createInventoryItem, type ActionState } from '@/app/inventory/actions'

const TODAY = new Date().toISOString().slice(0, 10)

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Única']
const CONDICIONES = ['Mint', 'Excelente', 'Muy buena', 'Buena', 'Aceptable']

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <span className="field-error">{msg}</span>
}

export function ItemForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createInventoryItem,
    {}
  )

  const fe = state.fieldErrors ?? {}

  return (
    <div className="item-form-page">
      <Link href="/inventory" className="back-link">
        ← Volver al inventario
      </Link>
      <h2>Nueva camiseta</h2>

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
        {/* ── Datos internos ── */}
        <section className="form-section">
          <h3>Datos internos</h3>

          <div className={`form-field ${fe.referencia ? 'has-error' : ''}`}>
            <label htmlFor="referencia">
              Referencia / Título <span className="required">*</span>
            </label>
            <input
              id="referencia"
              name="referencia"
              type="text"
              placeholder="Real Madrid Home 2001-02 (L)"
              autoFocus
            />
            <FieldError msg={fe.referencia} />
          </div>

          <div className="form-field">
            <label htmlFor="descripcion_base">Descripción / Notas de compra</label>
            <textarea
              id="descripcion_base"
              name="descripcion_base"
              rows={3}
              placeholder="Detalles de la compra, procedencia, estado al adquirir…"
            />
          </div>

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
                placeholder="0.00"
              />
              <FieldError msg={fe.coste} />
            </div>

            <div className={`form-field ${fe.precio_objetivo ? 'has-error' : ''}`}>
              <label htmlFor="precio_objetivo">
                Precio objetivo (€) <span className="required">*</span>
              </label>
              <input
                id="precio_objetivo"
                name="precio_objetivo"
                type="number"
                min="0"
                step="0.01"
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
                defaultValue={TODAY}
              />
              <FieldError msg={fe.fecha_compra} />
            </div>

            <div className="form-field">
              <label htmlFor="proveedor">Proveedor</label>
              <input
                id="proveedor"
                name="proveedor"
                type="text"
                placeholder="Wallapop, rastro, particular…"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="notas">Notas internas</label>
            <textarea
              id="notas"
              name="notas"
              rows={2}
              placeholder="Notas privadas para Pablo…"
            />
          </div>
        </section>

        {/* ── Atributos camiseta ── */}
        <section className="form-section">
          <h3>Atributos de la camiseta</h3>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="liga_display">Liga (nombre)</label>
              <input
                id="liga_display"
                name="liga_display"
                type="text"
                placeholder="La Liga, Premier League…"
              />
            </div>
            <div className="form-field">
              <label htmlFor="liga">Liga (term ID WC)</label>
              <input
                id="liga"
                name="liga"
                type="text"
                placeholder="ID provisional o vacío"
              />
            </div>
          </div>

          <div className="form-row">
            <div className={`form-field ${fe.equipo ? 'has-error' : ''}`}>
              <label htmlFor="equipo_display">
                Equipo <span className="required">*</span>
              </label>
              <input
                id="equipo_display"
                name="equipo_display"
                type="text"
                placeholder="Real Madrid, Barcelona…"
              />
              <FieldError msg={fe.equipo} />
            </div>
            <div className={`form-field ${fe.equipo ? 'has-error' : ''}`}>
              <label htmlFor="equipo">Equipo (term ID WC)</label>
              <input
                id="equipo"
                name="equipo"
                type="text"
                placeholder="ID provisional o nombre"
              />
            </div>
          </div>

          <div className="form-row">
            <div className={`form-field ${fe.temporada ? 'has-error' : ''}`}>
              <label htmlFor="temporada_display">
                Temporada <span className="required">*</span>
              </label>
              <input
                id="temporada_display"
                name="temporada_display"
                type="text"
                placeholder="2001-02, 2014-15…"
              />
              <FieldError msg={fe.temporada} />
            </div>
            <div className={`form-field ${fe.temporada ? 'has-error' : ''}`}>
              <label htmlFor="temporada">Temporada (term ID WC)</label>
              <input
                id="temporada"
                name="temporada"
                type="text"
                placeholder="ID provisional o nombre"
              />
            </div>
          </div>

          <div className="form-row">
            <div className={`form-field ${fe.talla ? 'has-error' : ''}`}>
              <label htmlFor="talla">
                Talla <span className="required">*</span>
              </label>
              <select id="talla" name="talla" defaultValue="">
                <option value="" disabled>
                  Seleccionar…
                </option>
                {TALLAS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <FieldError msg={fe.talla} />
            </div>

            <div className={`form-field ${fe.condicion ? 'has-error' : ''}`}>
              <label htmlFor="condicion">
                Condición <span className="required">*</span>
              </label>
              <select id="condicion" name="condicion" defaultValue="">
                <option value="" disabled>
                  Seleccionar…
                </option>
                {CONDICIONES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <FieldError msg={fe.condicion} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="marca_display">Marca</label>
              <input
                id="marca_display"
                name="marca_display"
                type="text"
                placeholder="Adidas, Nike, Umbro…"
              />
            </div>
            <div className="form-field">
              <label htmlFor="marca">Marca (term ID WC)</label>
              <input
                id="marca"
                name="marca"
                type="text"
                placeholder="ID provisional o vacío"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="jugador_display">Jugador</label>
              <input
                id="jugador_display"
                name="jugador_display"
                type="text"
                placeholder="Zidane, Ronaldo…"
              />
            </div>
            <div className="form-field">
              <label htmlFor="jugador">Jugador (term ID WC)</label>
              <input
                id="jugador"
                name="jugador"
                type="text"
                placeholder="ID provisional o vacío"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="numero_dorsal">Número dorsal</label>
              <input
                id="numero_dorsal"
                name="numero_dorsal"
                type="text"
                placeholder="5, 10…"
              />
            </div>
            <div className="form-field">
              <label htmlFor="nombre_dorsal">Nombre dorsal</label>
              <input
                id="nombre_dorsal"
                name="nombre_dorsal"
                type="text"
                placeholder="ZIDANE, RONALDO…"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="largo_cm">Largo (cm)</label>
              <input
                id="largo_cm"
                name="largo_cm"
                type="number"
                min="0"
                step="0.1"
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
              placeholder="Manchas, desgastes, detalles específicos…"
            />
          </div>

          <div className="form-field">
            <label htmlFor="autenticidad">Autenticidad</label>
            <input
              id="autenticidad"
              name="autenticidad"
              type="text"
              placeholder="Original, replica, player issue…"
            />
          </div>

          <div className="form-checkboxes">
            <label className="checkbox-label">
              <input type="checkbox" name="tiene_parches" />
              Tiene parches
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="tiene_etiquetas" />
              Tiene etiquetas
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="es_match_worn" />
              Match worn
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="es_replica" />
              Es réplica
            </label>
          </div>

          <div className="form-field">
            <label htmlFor="parches_descripcion">Descripción de parches</label>
            <input
              id="parches_descripcion"
              name="parches_descripcion"
              type="text"
              placeholder="LFP, Champions League…"
            />
          </div>
        </section>

        <div className="form-actions">
          <Link href="/inventory" className="btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? 'Guardando…' : 'Guardar camiseta'}
          </button>
        </div>
      </form>
    </div>
  )
}
