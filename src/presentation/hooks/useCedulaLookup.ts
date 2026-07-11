import { useState, useEffect, useRef, useCallback } from 'react'
import { personLookupService } from '../../services/personLookupService'

/* ─────────────────────────────────────────────────────────────
   Tipos públicos
───────────────────────────────────────────────────────────── */
export type CedulaKind   = 'nacional' | 'dimex' | 'nite' | 'unknown'
export type CedulaStatus = 'idle' | 'loading' | 'found' | 'notfound' | 'error'

export interface CedulaLookupResult {
  /** Estado actual de la consulta de identificación */
  status: CedulaStatus
  /** Tipo de cédula detectado */
  kind: CedulaKind
  /**
   * Cédula normalizada (solo dígitos + ceros rellenos para nacionales cortas).
   * Úsela para guardar y para mostrar el hint de corrección.
   */
  normalizedRaw: string
  /**
   * true cuando se detectaron 11-12 dígitos (DIMEX) y se está esperando
   * confirmación del usuario antes de continuar.
   */
  showForeignDialog: boolean
  /** Llame cuando el usuario confirme que SÍ es extranjero → el hook continúa. */
  confirmForeign: () => void
  /** Llame cuando el usuario diga que NO es extranjero → muestra aviso. */
  denyForeign: () => void
  /** Mensaje de ayuda para mostrar bajo el campo cédula */
  helperText: string
}

/* ─────────────────────────────────────────────────────────────
   Utilidades puras (exportadas para pruebas si se necesitan)
───────────────────────────────────────────────────────────── */

/**
 * Elimina todo excepto dígitos.
 */
export function cleanCedula(raw: string | undefined | null): string {
  return (raw ?? '').replace(/[^0-9]/g, '')
}

/**
 * Detecta el tipo de cédula basado en la cantidad de dígitos.
 *
 * | Dígitos | Tipo       |
 * |---------|------------|
 * | 9       | nacional   |
 * | 11-12   | dimex      |
 * | 10 (empieza con "3") | nite |
 * | 6-8     | posible nacional con ceros faltantes → 'nacional' |
 * | otros   | unknown    |
 */
export function detectCedulaKind(digits: string): CedulaKind {
  const len = digits.length
  if (len === 9) return 'nacional'
  if (len === 11 || len === 12) return 'dimex'
  if (len === 10 && digits.startsWith('3')) return 'nite'
  // 6-8 dígitos que empiezan con una provincia válida (1-9): probable nacional corta
  if (len >= 6 && len <= 8 && /^[1-9]/.test(digits)) return 'nacional'
  return 'unknown'
}

/**
 * Normaliza una cédula nacional costarricense cuando le faltan ceros.
 * Formato real: P-MMMM-NNNN  (1 + 4 + 4 = 9 dígitos)
 * El usuario omite ceros en la parte municipal (MMMM).
 *
 * Ejemplos:
 *   "12345678"  (8d) → "102345678"   (1 - 0234 - 5678)
 *   "1234567"   (7d) → "100234567"   (1 - 0023 - 4567)  ← pad 2 ceros
 *   "123456789" (9d) → sin cambio
 */
export function normalizeNacional(digits: string): string {
  if (digits.length === 9) return digits
  if (digits.length < 6 || digits.length > 8) return digits // no intentar
  const province  = digits[0]              // 1 dígito
  const sequence  = digits.slice(-4)       // últimos 4 = secuencia
  const muni      = digits.slice(1, -4)    // lo que queda = parte municipal
  const muniPad   = muni.padStart(4, '0')  // rellenar hasta 4 dígitos
  return province + muniPad + sequence
}

/** Convierte "JUAN PEREZ LEON" → "Juan Perez Leon" */
export function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

/* ─────────────────────────────────────────────────────────────
   Hook principal
───────────────────────────────────────────────────────────── */

/**
 * Hook que encapsula toda la lógica de validación y consulta
 * de cédulas contra el servicio de identificación (ver personLookupService).
 *
 * @param cedula       Valor actual del campo (puede tener guiones, espacios…)
 * @param onNameFound  Callback cuando se obtuvo el nombre; recibe (nombre, cedulaNormalizada)
 * @param opts.skipFirstRun  Si `true`, omite la primera ejecución del effect (útil en edición)
 */
export function useCedulaLookup(
  cedula: string | undefined | null,
  onNameFound: (nombre: string, normalizedCedula: string) => void,
  opts?: { skipFirstRun?: boolean }
): CedulaLookupResult {
  const [status,            setStatus]            = useState<CedulaStatus>('idle')
  const [kind,              setKind]              = useState<CedulaKind>('unknown')
  const [normalizedRaw,     setNormalizedRaw]     = useState('')
  const [showForeignDialog, setShowForeignDialog] = useState(false)
  const [helperText,        setHelperText]        = useState('')
  const [pendingDimex,      setPendingDimex]      = useState('')  // dígitos DIMEX esperando confirmación

  const debounceRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRunRef  = useRef(true)

  /* ── Función que realiza la consulta de identificación ──── */
  const fetchIdentification = useCallback(async (digits: string) => {
    setStatus('loading')
    setHelperText('Consultando…')
    const result = await personLookupService.lookupByIdentification(digits)
    if (result.found && result.fullName) {
      const nombre = toTitleCase(result.fullName)
      onNameFound(nombre, digits)
      setStatus('found')
      setHelperText(`✓ Encontrado: ${nombre}`)
    } else {
      setStatus('notfound')
      setHelperText('No se encontró un registro asociado a este número.')
    }
  }, [onNameFound])

  /* ── Effect principal ────────────────────────────────────── */
  useEffect(() => {
    // Guardia para modo edición: saltear carga inicial
    if (opts?.skipFirstRun && isFirstRunRef.current) {
      isFirstRunRef.current = false
      return
    }
    isFirstRunRef.current = false

    const digits = cleanCedula(cedula)

    // Sin suficientes dígitos: resetear
    if (digits.length < 6) {
      setStatus('idle')
      setKind('unknown')
      setNormalizedRaw(digits)
      setHelperText('')
      setShowForeignDialog(false)
      return
    }

    const detectedKind = detectCedulaKind(digits)
    setKind(detectedKind)

    /* Caso DIMEX: pedir confirmación antes de continuar */
    if (detectedKind === 'dimex') {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setStatus('idle')
      setNormalizedRaw(digits)
      setPendingDimex(digits)
      setShowForeignDialog(true)
      setHelperText('Se detectó un número extranjero (DIMEX). Confirme si es correcto.')
      return
    }

    /* Caso NITE */
    if (detectedKind === 'nite') {
      setNormalizedRaw(digits)
      setHelperText('Cédula jurídica (NITE) detectada.')
      // También se podría consultar el nombre para NITE si el proveedor lo soporta
      return
    }

    /* Nacional (incluye cortas de 6-8 dígitos) */
    if (detectedKind === 'nacional') {
      const normalized = normalizeNacional(digits)
      setNormalizedRaw(normalized)
      if (normalized.length < 9) {
        setStatus('idle')
        setHelperText('Cédula incompleta, revise el número.')
        return
      }
      // Now we have exactly 9 digits (after normalization)
      if (normalized !== digits) {
        setHelperText(`Cédula normalizada a ${normalized} (ceros completados automáticamente)`)
      } else {
        setHelperText('') // clear any previous helper text
      }
      // Trigger debounced identification lookup for valid nacional cédulas
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setStatus('loading')
      debounceRef.current = setTimeout(() => fetchIdentification(normalized), 500)
      return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }

    /* Unknown */
    setStatus('idle')
    setNormalizedRaw(digits)
    setHelperText('Formato de cédula no reconocido.')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cedula])

  /* ── Handlers del diálogo de extranjero ─────────────────── */
  const confirmForeign = useCallback(() => {
    setShowForeignDialog(false)
    setHelperText('Cédula extranjera confirmada. Consultando…')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchIdentification(pendingDimex), 300)
  }, [pendingDimex, fetchIdentification])

  const denyForeign = useCallback(() => {
    setShowForeignDialog(false)
    setStatus('error')
    setHelperText('Por favor corrija el número de cédula. Los números nacionales tienen 9 dígitos.')
  }, [])

  return {
    status,
    kind,
    normalizedRaw,
    showForeignDialog,
    confirmForeign,
    denyForeign,
    helperText,
  }
}
