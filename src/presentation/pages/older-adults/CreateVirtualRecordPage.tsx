import React, { useState, useEffect } from 'react'
import type { VirtualFile } from '../../../types/virtualFile'
import { defaultVirtualFile } from '../../../types/virtualFile'
import { useNavigate } from 'react-router-dom'

export default function CreateVirtualFile() {
  const [formData, setFormData] = useState<VirtualFile>(defaultVirtualFile)
  const navigate = useNavigate()

  function onInputChange(field: keyof VirtualFile, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value } as VirtualFile))
  }

  useEffect(() => {
    if (formData.peso && formData.talla) {
      const peso = parseFloat(formData.peso)
      const talla = parseFloat(formData.talla) / 100 
      if (!isNaN(peso) && !isNaN(talla) && talla > 0) {
        const imc = (peso / (talla * talla)).toFixed(2)
        setFormData(prev => ({ ...prev, imc }))
      }
    }
  }, [formData.peso, formData.talla])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Formulario enviado:', formData)
    // Aquí enviar datos al server
  }

  return (
    <div className="container py-4">
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">DATOS PERSONALES</h3>
          <button className="btn btn-secondary" onClick={() => navigate('/virtualFiles')}>
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </button>
        </div>
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

        <h3 className="mb-3">ANTECEDENTES CLÍNICOS</h3>

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
                    onChange={(e) => onInputChange(key as keyof VirtualFile, e.target.checked)} />
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
                    onChange={(e) => onInputChange(key as keyof VirtualFile, e.target.checked)} />
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