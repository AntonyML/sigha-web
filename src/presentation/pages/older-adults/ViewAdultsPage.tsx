import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components'
import type { FormData } from '../../../types/formData'
import { defaultFormData } from '../../../types/formData'

export default function ViewAdultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [loading, setLoading] = useState<boolean>(true)

  // Mock "fetch" — reemplaza por servicio real cuando esté disponible
  useEffect(() => {
    console.log('ViewAdultsPage mounted, id=', id)
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
        nombreApellido: id === '1' ? 'Juan Pérez' : 'María López',
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

  // Manejo cuando no hay id en la ruta
  if (!id) {
    return (
      <div className="container py-4">
        <h3 className="mb-3">ID no proporcionado</h3>
        <p>No se encontró el identificador del expediente.</p>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/virtualFiles')}>Volver a la lista</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="container py-4">Cargando información del paciente...</div>
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Expediente Virtual #{id}</h2>
          <p className="text-muted mb-0">{formData.nombreApellido}</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/virtualFiles')}>
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </Button>
          <Button variant="primary" onClick={() => navigate(`/virtualFiles/edit/${id}`)}>
            <i className="bi bi-pencil-square me-2"></i>
            Editar
          </Button>
        </div>
      </div>

      {/* Información Personal */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">📋 Datos Personales</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3">
              <strong>Fecha de registro:</strong>
              <p className="mb-0">{formData.fecha ? new Date(formData.fecha).toLocaleDateString() : 'No especificada'}</p>
            </div>
            <div className="col-md-3 mb-3">
              <strong>Cédula:</strong>
              <p className="mb-0">{formData.cedula || 'No especificada'}</p>
            </div>
            <div className="col-md-3 mb-3">
              <strong>Edad:</strong>
              <p className="mb-0">{formData.edad || 'No especificada'}</p>
            </div>
            <div className="col-md-3 mb-3">
              <strong>Fecha de nacimiento:</strong>
              <p className="mb-0">{formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toLocaleDateString() : 'No especificada'}</p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>Nombre completo:</strong>
              <p className="mb-0">{formData.nombreApellido || 'No especificado'}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Estado civil:</strong>
              <p className="mb-0">{formData.estadoCivil || 'No especificado'}</p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <strong>Vivienda:</strong>
              <p className="mb-0">{formData.vivienda || 'No especificada'}</p>
            </div>
            <div className="col-md-4 mb-3">
              <strong>Años de escolaridad:</strong>
              <p className="mb-0">{formData.anosEscolaridad || 'No especificado'}</p>
            </div>
            <div className="col-md-4 mb-3">
              <strong>Trabajo previo:</strong>
              <p className="mb-0">{formData.trabajoPrevio || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">📞 Información de Contacto</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <strong>Familiar a cargo:</strong>
              <p className="mb-0">{formData.familiarACargo || 'No especificado'}</p>
            </div>
            <div className="col-md-4 mb-3">
              <strong>Vínculo:</strong>
              <p className="mb-0">{formData.vinculo || 'No especificado'}</p>
            </div>
            <div className="col-md-4 mb-3">
              <strong>Teléfono:</strong>
              <p className="mb-0">{formData.telefono || 'No especificado'}</p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>Email:</strong>
              <p className="mb-0">{formData.email || 'No especificado'}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Zona de procedencia:</strong>
              <p className="mb-0">{formData.zonaProcedencia || 'No especificada'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Antecedentes Clínicos */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">🏥 Antecedentes Clínicos</h5>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3 mb-3">
              <strong>Tensión arterial:</strong>
              <p className="mb-0">{formData.ta || 'No registrada'}</p>
            </div>
            <div className="col-md-3 mb-3">
              <strong>Peso:</strong>
              <p className="mb-0">{formData.peso ? `${formData.peso} kg` : 'No registrado'}</p>
            </div>
            <div className="col-md-3 mb-3">
              <strong>Talla:</strong>
              <p className="mb-0">{formData.talla ? `${formData.talla} cm` : 'No registrada'}</p>
            </div>
            <div className="col-md-3 mb-3">
              <strong>IMC:</strong>
              <p className="mb-0">{formData.imc || 'No calculado'}</p>
            </div>
          </div>

          <h6 className="mb-3">Condiciones Médicas</h6>
          <div className="row">
            <div className="col-md-6">
              <ul className="list-unstyled">
                <li>✅ HTA: {formData.hta ? 'Sí' : 'No'}</li>
                <li>✅ Diabetes: {formData.dbt ? 'Sí' : 'No'}</li>
                <li>✅ Dislipidemia: {formData.dislip ? 'Sí' : 'No'}</li>
                <li>✅ IRC: {formData.irc ? 'Sí' : 'No'}</li>
                <li>✅ Cardiopatía isquémica: {formData.cardioIsq ? 'Sí' : 'No'}</li>
                <li>✅ ACV: {formData.acv ? 'Sí' : 'No'}</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="list-unstyled">
                <li>✅ Amputación: {formData.amputacion ? 'Sí' : 'No'}</li>
                <li>✅ Tabaquismo: {formData.tabaquismo ? 'Sí' : 'No'}</li>
                <li>✅ Alcoholismo: {formData.alcoholismo ? 'Sí' : 'No'}</li>
                <li>✅ Parkinson: {formData.parkinson ? 'Sí' : 'No'}</li>
                <li>✅ Demencia: {formData.demencia ? 'Sí' : 'No'}</li>
                <li>✅ Neoplasias: {formData.neoplasias ? 'Sí' : 'No'}</li>
              </ul>
            </div>
          </div>

          {formData.neoplasias && formData.neoplasiasDetalle && (
            <div className="row">
              <div className="col-12">
                <strong>Detalle de neoplasias:</strong>
                <p className="mb-0">{formData.neoplasiasDetalle}</p>
              </div>
            </div>
          )}

          {formData.otrasCondiciones && (
            <div className="row">
              <div className="col-12">
                <strong>Otras condiciones:</strong>
                <p className="mb-0">{formData.otrasCondiciones}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vacunas */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">💉 Esquema de Vacunación</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <ul className="list-unstyled">
                <li>✅ COVID-19: {formData.vacunaCt ? 'Sí' : 'No'}</li>
                <li>✅ Hepatitis B: {formData.vacunaHepB ? 'Sí' : 'No'}</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="list-unstyled">
                <li>✅ Gripe: {formData.vacunaGripe ? 'Sí' : 'No'}</li>
                <li>✅ Neumococo: {formData.vacunaNeumococo ? 'Sí' : 'No'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluación Funcional */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">🔍 Evaluación Funcional</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <strong>RCVG:</strong>
              <p className="mb-0">{formData.rcvg || 'No evaluado'}</p>
            </div>
            <div className="col-md-4 mb-3">
              <strong>Dificultades de visión:</strong>
              <p className="mb-0">{formData.dificultadesVision || 'No evaluado'}</p>
            </div>
            <div className="col-md-4 mb-3">
              <strong>Problemas de audición:</strong>
              <p className="mb-0">{formData.problemasAudicion || 'No evaluado'}</p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <ul className="list-unstyled">
                <li>✅ Prostatismo: {formData.prostatismo ? 'Sí' : 'No'}</li>
                <li>✅ Incontinencia urinaria: {formData.incontinenciaUrinaria ? 'Sí' : 'No'}</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="list-unstyled">
                <li>✅ Caídas frecuentes: {formData.caidasFrecuentes ? 'Sí' : 'No'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}