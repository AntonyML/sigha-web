import React, { useState, useEffect } from 'react'
import type { VirtualFile, ApiFamily, ApiMedication } from '../../../types/virtualFile'
import type { Program } from '../../../types/program'
import type { Vaccine } from '../../../types/vaccine'
import type { ClinicalCondition } from '../../../types/clinicalCondition'
import { defaultVirtualFile } from '../../../types/virtualFile'
import { useNavigate } from 'react-router-dom'
import { virtualFileService } from '../../../services/virtualFileService'
import { programService } from '../../../services/programService'
import { vaccineService } from '../../../services/vaccineService'
import { clinicalConditionService } from '../../../services/clinicalConditionService'
import { auditService } from '../../../services/auditService'

export default function CreateVirtualFile() {
  const [formData, setFormData] = useState<VirtualFile>(defaultVirtualFile)
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([])
  const [availableVaccines, setAvailableVaccines] = useState<Vaccine[]>([])
  const [availableClinicalConditions, setAvailableClinicalConditions] = useState<ClinicalCondition[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState<number>(1)
  const [selectedSubProgramId, setSelectedSubProgramId] = useState<number | null>(null)
  const [selectedVaccineIds, setSelectedVaccineIds] = useState<number[]>([])
  const [selectedClinicalConditionIds, setSelectedClinicalConditionIds] = useState<number[]>([])
  const navigate = useNavigate()

  // Obtener los subprogramas del programa seleccionado
  const currentProgram = availablePrograms.find(p => p.id === selectedProgramId)
  const availableSubPrograms = currentProgram?.subPrograms || []

  function onInputChange(field: keyof VirtualFile, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value } as VirtualFile))
  }

  // Función para manejar cambio de programa
  const handleProgramChange = (programId: number) => {
    setSelectedProgramId(programId)
    setSelectedSubProgramId(null) // Limpiar subprograma al cambiar de programa
  }

  // Cargar programas, vacunas y condiciones clínicas disponibles
  useEffect(() => {
    async function loadData() {
      try {
        const [programs, vaccines, clinicalConditions] = await Promise.all([
          programService.getAllPrograms(),
          vaccineService.getAllVaccines(),
          clinicalConditionService.getAllClinicalConditions()
        ])
        
        setAvailablePrograms(programs)
        setAvailableVaccines(vaccines)
        setAvailableClinicalConditions(clinicalConditions)
        
        // Seleccionar el primer programa por defecto
        if (programs.length > 0 && programs[0].id) {
          setSelectedProgramId(programs[0].id)
        }
        
        console.log('📋 Datos cargados:', { programs, vaccines, clinicalConditions })
      } catch (error) {
        console.error('❌ Error cargando datos:', error)
      }
    }
    
    loadData()
  }, [])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      console.log('📤 Enviando formulario:', formData)
      
      // Datos de familia de ejemplo (opcional) - basado en el ejemplo del backend
      const familyInfo: ApiFamily = {
        pf_identification: '1-9876-5432',
        pf_name: 'Familiar',
        pf_f_last_name: 'Apellido1',
        pf_s_last_name: 'Apellido2',
        pf_phone_number: '8234-5678',
        pf_email: 'familiar@email.com',
        pf_kinship: 'son'
      };
      
      // Medicamentos de ejemplo - estructura específica del backend
      const medications: ApiMedication[] = [
        {
          m_medication: 'Medicamento ejemplo',
          m_dosage: '1 tableta cada 12 horas',
          m_treatment_type: 'chronic'
        }
      ];
      
      // Crear el archivo virtual con programa, subprograma y vacunas seleccionadas
      const result = await virtualFileService.createVirtualFile(
        formData,
        familyInfo,
        medications,
        selectedProgramId,
        selectedVaccineIds,
        selectedSubProgramId
      );
      
      console.log('✅ Archivo virtual creado:', result);
      
      // Registrar creación en auditoría
      if (result && result.id) {
        await auditService.logCreate(
          'older_adult',
          result.id,
          {
            identification: formData.cedula,
            name: formData.nombreApellido,
            program: currentProgram?.pName || 'Desconocido'
          },
          `Nuevo expediente creado: ${formData.nombreApellido}`
        );
      }
      
      // Navegar de vuelta a la lista
      navigate('/virtualFiles');
    } catch (error) {
      console.error('❌ Error creando archivo virtual:', error);
      alert('Error al crear el archivo virtual. Por favor, inténtelo de nuevo.');
    }
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
          <div className="col-12 col-md-4">
            <label htmlFor="cedula" className="form-label">CÉDULA</label>
            <input id="cedula" className="form-control" value={formData.cedula}
              onChange={(e) => onInputChange('cedula', e.target.value)} placeholder="Número de cédula" />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="edad" className="form-label">EDAD</label>
            <input id="edad" type="text" className="form-control" readOnly value={formData.edad} />
          </div>
          <div className="col-12 col-md-4">
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
            {availableClinicalConditions.filter(condition => condition.ccName && condition.id).map((condition) => (
              <div className="col-6 col-md-3" key={condition.id}>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`clinical_condition_${condition.id}`}
                    checked={selectedClinicalConditionIds.includes(condition.id!)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedClinicalConditionIds(prev => [...prev, condition.id!])
                      } else {
                        setSelectedClinicalConditionIds(prev => prev.filter(id => id !== condition.id))
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor={`clinical_condition_${condition.id}`}>
                    {condition.ccName}
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="row mt-2">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <small className="form-text text-muted">
                {availableClinicalConditions.length} condición(es) clínica(s) disponible(s)
              </small>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setSelectedClinicalConditionIds([])}
              >
                <i className="bi bi-x-lg me-1"></i>
                Limpiar selección
              </button>
            </div>
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

        <div className="mb-4">
          <h6>PROGRAMA ASIGNADO</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Programa Principal</label>
              <select
                className="form-select"
                value={selectedProgramId}
                onChange={(e) => handleProgramChange(parseInt(e.target.value))}
              >
                <option value="">Seleccionar programa...</option>
                {availablePrograms.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.pName}
                  </option>
                ))}
              </select>
              <small className="form-text text-muted">
                Seleccione el programa principal al que pertenecerá el residente
              </small>
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Subprograma (Opcional)</label>
              <select
                className="form-select"
                value={selectedSubProgramId || ''}
                onChange={(e) => setSelectedSubProgramId(e.target.value ? parseInt(e.target.value) : null)}
                disabled={availableSubPrograms.length === 0}
              >
                <option value="">Sin subprograma</option>
                {availableSubPrograms.map((subProgram) => (
                  <option key={subProgram.id} value={subProgram.id}>
                    {subProgram.spName}
                  </option>
                ))}
              </select>
              <small className="form-text text-muted">
                {availableSubPrograms.length === 0 
                  ? 'El programa seleccionado no tiene subprogramas disponibles'
                  : `${availableSubPrograms.length} subprograma(s) disponible(s)`
                }
              </small>
            </div>
            
            <div className="col-12">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => window.open('/programs', '_blank')}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Gestionar Programas y Subprogramas
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h6>VACUNAS APLICADAS</h6>
          <div className="row">
            {availableVaccines.filter(vaccine => vaccine.vName && vaccine.id).map((vaccine) => (
              <div className="col-6 col-md-4 col-lg-3" key={vaccine.id}>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`vaccine_${vaccine.id}`}
                    checked={selectedVaccineIds.includes(vaccine.id!)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVaccineIds(prev => [...prev, vaccine.id!])
                      } else {
                        setSelectedVaccineIds(prev => prev.filter(id => id !== vaccine.id))
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor={`vaccine_${vaccine.id}`}>
                    {vaccine.vName}
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="row mt-2">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <small className="form-text text-muted">
                Marque las vacunas que ya ha recibido el residente
              </small>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => window.open('/vaccines', '_blank')}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Gestionar Vacunas
              </button>
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