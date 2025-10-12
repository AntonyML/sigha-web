
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { FormData } from '../../../types/formData'
import { defaultFormData } from '../../../types/formData'

export default function EditVirtualFile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [loading, setLoading] = useState<boolean>(true)

  // Mock "fetch" — reemplaza por servicio real cuando esté disponible
  useEffect(() => {
    console.log('EditVirtualFile mounted, id=', id)
    if (!id) {
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(() => {
      const mock: FormData = {
        ...defaultFormData,
        fecha: new Date().toISOString().slice(0, 10),
        cedula: `ID-${id}`,
        nombreApellido: 'Paciente Ejemplo',
        edad: '75',
        fechaNacimiento: '1950-01-01',
        estadoCivil: 'viudo',
        vivienda: 'Propia',
        anosEscolaridad: '6',
        trabajoPrevio: 'jubilacion',
        programa: 'programa1',
        zonaProcedencia: 'Zona A',
        cantHijos: '2',
        familiarACargo: 'María',
        vinculo: 'Hija',
        telefono: '0987654321',
        ingresoHogar: '500',
        email: 'paciente@ejemplo.com',
        ta: '120/80',
        peso: '70',
        talla: '170',
        imc: '24.2',
        hta: true,
        dbt: false,
        dislip: false,
        irc: false,
        cardioIsq: false,
        acv: false,
        amputacion: false,
        tabaquismo: false,
        alcoholismo: false,
        parkinson: false,
        demencia: false,
        prostatismo: false,
        incontinenciaUrinaria: false,
        caidasFrecuentes: false,
        neoplasias: false,
        neoplasiasDetalle: '',
        otrasCondiciones: '',
        rcvg: '<10%',
        vacunaCt: false,
        vacunaHepB: false,
        vacunaGripe: true,
        vacunaNeumococo: false,
        dificultadesVision: 'NO',
        problemasAudicion: 'NO'
      }
      setFormData(mock)
      setLoading(false)
    }, 300)
    return () => clearTimeout(t)
  }, [id])

  function onInputChange(field: keyof FormData, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value } as FormData))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Guardar virtual file (mock):', id, formData)
    // TODO: llamar servicio real para guardar
    navigate('/virtualFiles')
  }

  // Manejo cuando no hay id en la ruta
  if (!id) {
    return (
      <div className="container py-4">
        <h3 className="mb-3">ID no proporcionado</h3>
        <p>No se encontró el identificador del expediente. Puedes crear uno nuevo o volver a la lista.</p>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => navigate('/virtualFiles/new')}>Crear nuevo</button>
          <button className="btn btn-secondary" onClick={() => navigate('/virtualFiles')}>Volver a la lista</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="container py-4">Cargando registro...</div>
  }

  return (
    <div className="container py-4">
      <h3 className="mb-3">Editar Expediente Virtual {id ? `#${id}` : ''}</h3>
      <form onSubmit={handleSubmit}>
        {/* Reutiliza la misma estructura de campos que CreateVirtualFile */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-3">
            <label htmlFor="fecha" className="form-label">FECHA</label>
            <input id="fecha" type="date" className="form-control"
              value={formData.fecha} onChange={(e) => onInputChange('fecha', e.target.value)} />
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="cedula" className="form-label">CÉDULA</label>
            <input id="cedula" className="form-control" value={formData.cedula}
              onChange={(e) => onInputChange('cedula', e.target.value)} placeholder="Número de cédula" />
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="edad" className="form-label">EDAD</label>
            <input id="edad" type="text" className="form-control" readOnly value={formData.edad} />
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="fechaNacimiento" className="form-label">FECHA NACIMIENTO</label>
            <input id="fechaNacimiento" type="date" className="form-control"
              value={formData.fechaNacimiento}
              onChange={(e) => {
                onInputChange('fechaNacimiento', e.target.value)
                const fd = e.target.value ? new Date(e.target.value) : null
                if (fd) {
                  const diff = Date.now() - fd.getTime()
                  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
                  onInputChange('edad', String(age))
                } else {
                  onInputChange('edad', '')
                }
              }} />
          </div>
        </div>

        {/* Resto de campos (idénticos a CreateVirtualFile) */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <label htmlFor="nombreApellido" className="form-label">NOMBRE Y APELLIDO</label>
            <input id="nombreApellido" className="form-control"
              value={formData.nombreApellido} onChange={(e) => onInputChange('nombreApellido', e.target.value)} placeholder="Nombre completo" />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="estadoCivil" className="form-label">ESTADO CIVIL</label>
            <select id="estadoCivil" className="form-select" value={formData.estadoCivil}
              onChange={(e) => onInputChange('estadoCivil', e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="soltero">Soltero(a)</option>
              <option value="casado">Casado(a)</option>
              <option value="viudo">Viudo(a)</option>
              <option value="divorciado">Divorciado(a)</option>
              <option value="union-libre">Unión Libre</option>
            </select>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <label className="form-label">VIVIENDA</label>
            <input className="form-control" value={formData.vivienda} onChange={(e) => onInputChange('vivienda', e.target.value)} />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label">AÑOS DE ESCOLARIDAD</label>
            <input type="number" className="form-control" value={formData.anosEscolaridad}
              onChange={(e) => onInputChange('anosEscolaridad', e.target.value)} />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label">TRABAJO PREVIO</label>
            <select className="form-select" value={formData.trabajoPrevio} onChange={(e) => onInputChange('trabajoPrevio', e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="jubilacion">Jubilación</option>
              <option value="pension">Pensión</option>
              <option value="otros">Otros</option>
            </select>
          </div>
        </div>

        <hr />

        <div className="row g-3 mb-3">
          <div className="col-12 col-md-3">
            <label className="form-label">TA (mmHg)</label>
            <input className="form-control" value={formData.ta} onChange={(e) => onInputChange('ta', e.target.value)} placeholder="120/80" />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">PESO (kg)</label>
            <input type="number" step="0.1" className="form-control" value={formData.peso}
              onChange={(e) => onInputChange('peso', e.target.value)} placeholder="70.5" />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">TALLA (cm)</label>
            <input type="number" className="form-control" value={formData.talla}
              onChange={(e) => onInputChange('talla', e.target.value)} placeholder="170" />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">IMC</label>
            <input readOnly className="form-control" value={formData.imc} placeholder="Calculado automáticamente" />
          </div>
        </div>

        {/* Condiciones médicas (checkboxes) */}
        <div className="mb-3">
          <h6>Condiciones Médicas</h6>
          <div className="row">
            {[
              ['hta', 'HTA'],
              ['dbt', 'DBT'],
              ['dislip', 'DISLIP'],
              ['irc', 'IRC'],
              ['cardioIsq', 'CARDIO ISQ'],
              ['acv', 'ACV'],
              ['amputacion', 'AMPUTACIÓN'],
              ['tabaquismo', 'TABAQUISMO'],
              ['alcoholismo', 'ALCOHOLISMO'],
              ['parkinson', 'PARKINSON'],
              ['demencia', 'DEMENCIA'],
              ['prostatismo', 'PROSTATISMO'],
              ['incontinenciaUrinaria', 'INCONTINENCIA URINARIA'],
              ['caidasFrecuentes', 'CAÍDAS FRECUENTES'],
              ['neoplasias', 'NEOPLASIAS']
            ].map(([key, label]) => (
              <div className="col-6 col-md-3" key={String(key)}>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id={String(key)}
                    checked={!!(formData as any)[String(key)]}
                    onChange={(e) => onInputChange(key as keyof FormData, e.target.checked)} />
                  <label className="form-check-label" htmlFor={String(key)}>{label}</label>
                </div>
              </div>
            ))}
          </div>

          {(formData as any).neoplasias && (
            <div className="mt-3">
              <label className="form-label">¿Cuál?</label>
              <input className="form-control" value={formData.neoplasiasDetalle}
                onChange={(e) => onInputChange('neoplasiasDetalle', e.target.value)} />
            </div>
          )}

          <div className="mt-3">
            <label className="form-label">OTROS</label>
            <input className="form-control" value={formData.otrasCondiciones}
              onChange={(e) => onInputChange('otrasCondiciones', e.target.value)} />
          </div>
        </div>

        {/* RCVG / Vacunación / Visión / Audición (igual que create) */}
        <div className="mb-4">
          <h6>RCVG</h6>
          <div className="d-flex flex-wrap gap-3">
            {[
              ['<10%', 'Menos de 10%'],
              ['e/10 y 20%', 'Entre 10 y 20%'],
              ['e/20 y 30%', 'Entre 20 y 30%'],
              ['e/30 y 40%', 'Entre 30 y 40%'],
              ['>40%', 'Más de 40%']
            ].map(([value, label]) => (
              <div className="form-check me-3" key={String(value)}>
                <input className="form-check-input" type="radio" name="rcvg" id={`rcvg_${String(value)}`}
                  value={String(value)} checked={formData.rcvg === value}
                  onChange={(e) => onInputChange('rcvg', e.target.value)} />
                <label className="form-check-label" htmlFor={`rcvg_${String(value)}`}>{label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h6>VACUNACIÓN</h6>
          <div className="row">
            {[
              ['vacunaCt', 'cT'],
              ['vacunaHepB', 'Hep B'],
              ['vacunaGripe', 'Gripe'],
              ['vacunaNeumococo', 'Neumococo']
            ].map(([key, label]) => (
              <div className="col-6 col-md-3" key={String(key)}>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id={String(key)}
                    checked={!!(formData as any)[String(key)]}
                    onChange={(e) => onInputChange(key as keyof FormData, e.target.checked)} />
                  <label className="form-check-label" htmlFor={String(key)}>{label}</label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h6>VISIÓN</h6>
          <div className="d-flex gap-4">
            <div className="form-check">
              <input className="form-check-input" type="radio" id="visionSi" name="vision" value="SI"
                checked={formData.dificultadesVision === 'SI'}
                onChange={(e) => onInputChange('dificultadesVision', e.target.value)} />
              <label className="form-check-label" htmlFor="visionSi">SI</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="radio" id="visionNo" name="vision" value="NO"
                checked={formData.dificultadesVision === 'NO'}
                onChange={(e) => onInputChange('dificultadesVision', e.target.value)} />
              <label className="form-check-label" htmlFor="visionNo">NO</label>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h6>AUDICIÓN</h6>
          <div className="d-flex gap-4">
            <div className="form-check">
              <input className="form-check-input" type="radio" id="audicionSi" name="audicion" value="SI"
                checked={formData.problemasAudicion === 'SI'}
                onChange={(e) => onInputChange('problemasAudicion', e.target.value)} />
              <label className="form-check-label" htmlFor="audicionSi">SI</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="radio" id="audicionNo" name="audicion" value="NO"
                checked={formData.problemasAudicion === 'NO'}
                onChange={(e) => onInputChange('problemasAudicion', e.target.value)} />
              <label className="form-check-label" htmlFor="audicionNo">NO</label>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary"><i className="bi bi-save me-2"></i>Guardar</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/virtualFiles')}> <i className="bi bi-arrow-left me-2"></i>Regresar</button>
        </div>
      </form>
    </div>
  )
}
