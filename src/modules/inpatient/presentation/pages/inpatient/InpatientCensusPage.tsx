import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bed,
  BedDouble,
  Building2,
  Users,
  CheckCircle2,
  Plus,
  Search,
  ArrowRightLeft,
  X,
  DoorOpen,
} from 'lucide-react';
import {
  inpatientService,
  type FacilityRoomItem,
  type PatientBedAssignmentItem,
} from '@/infrastructure/api/services/inpatientService';
import { virtualFileService } from '@/infrastructure/api/services/virtualFileService';
import type { VirtualFile } from '@/shared/types/virtualFile';
import { useFeedbackWithNotifications } from '@/shared/hooks/useFeedbackWithNotifications';

export default function InpatientCensusPage() {
  const [rooms, setRooms] = useState<FacilityRoomItem[]>([]);
  const [assignments, setAssignments] = useState<PatientBedAssignmentItem[]>([]);
  const [residents, setResidents] = useState<VirtualFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [wingFilter, setWingFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'FULL'>('ALL');

  // Modals
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // New Room Form
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    name: '',
    floorWing: 'Ala Norte',
    capacity: 2,
    isActive: true,
  });

  // Assign Bed Form
  const [assignForm, setAssignForm] = useState<{
    idOlderAdult: number | '';
    idRoom: number | '';
    bedLabel: string;
    notes: string;
  }>({
    idOlderAdult: '',
    idRoom: '',
    bedLabel: 'Cama 1',
    notes: '',
  });

  const feedback = useFeedbackWithNotifications();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [roomsData, assignmentsData, residentsData] = await Promise.all([
        inpatientService.getRooms(false),
        inpatientService.getAllCurrentAssignments(),
        virtualFileService.getAllVirtualFiles().catch(() => []),
      ]);
      setRooms(roomsData);
      setAssignments(assignmentsData);
      setResidents(residentsData);
    } catch (err) {
      console.error(err);
      feedback.error('Error al sincronizar datos del censo residencial', 'Error');
    } finally {
      setLoading(false);
    }
  }, [feedback]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) loadData();
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  // Unique wings for filter
  const uniqueWings = useMemo(() => {
    const wings = new Set<string>();
    rooms.forEach((r) => {
      if (r.floorWing) wings.add(r.floorWing);
    });
    return Array.from(wings);
  }, [rooms]);

  // Map assignments by room
  const assignmentsByRoom = useMemo(() => {
    const map = new Map<number, PatientBedAssignmentItem[]>();
    assignments.forEach((a) => {
      const list = map.get(a.idRoom) || [];
      list.push(a);
      map.set(a.idRoom, list);
    });
    return map;
  }, [assignments]);

  // Global metrics
  const totalCapacity = useMemo(() => rooms.reduce((sum, r) => sum + (r.capacity || 0), 0), [rooms]);
  const totalOccupied = assignments.length;
  const totalFree = Math.max(0, totalCapacity - totalOccupied);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Wing filter
      if (wingFilter !== 'ALL' && room.floorWing !== wingFilter) return false;

      const roomAssigned = assignmentsByRoom.get(room.id) || [];
      const isFull = roomAssigned.length >= room.capacity;

      // Availability filter
      if (availabilityFilter === 'AVAILABLE' && isFull) return false;
      if (availabilityFilter === 'FULL' && !isFull) return false;

      // Search term filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesRoom =
          room.roomNumber.toLowerCase().includes(term) ||
          room.name.toLowerCase().includes(term) ||
          (room.floorWing && room.floorWing.toLowerCase().includes(term));

        const matchesResident = roomAssigned.some((a) => {
          const name = `${a.olderAdult?.oaName || ''} ${a.olderAdult?.oaFLastName || ''}`.toLowerCase();
          const id = (a.olderAdult?.oaIdentification || '').toLowerCase();
          return name.includes(term) || id.includes(term);
        });

        if (!matchesRoom && !matchesResident) return false;
      }

      return true;
    });
  }, [rooms, wingFilter, availabilityFilter, searchTerm, assignmentsByRoom]);

  // Handlers
  const handleOpenAssignModal = (prefillRoomId?: number, prefillBedLabel?: string, prefillResidentId?: number) => {
    setAssignForm({
      idOlderAdult: prefillResidentId || '',
      idRoom: prefillRoomId || (rooms.length > 0 ? rooms[0].id : ''),
      bedLabel: prefillBedLabel || 'Cama 1',
      notes: '',
    });
    setShowAssignModal(true);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.roomNumber.trim() || !roomForm.name.trim()) {
      feedback.error('El número de habitación y el nombre son obligatorios', 'Validación');
      return;
    }

    try {
      await inpatientService.createRoom({
        roomNumber: roomForm.roomNumber.trim(),
        name: roomForm.name.trim(),
        floorWing: roomForm.floorWing.trim(),
        capacity: Number(roomForm.capacity) || 1,
        isActive: roomForm.isActive,
      });
      feedback.success(`Habitación ${roomForm.roomNumber} creada exitosamente`, 'Habitación Registrada');
      setShowRoomModal(false);
      setRoomForm({
        roomNumber: '',
        name: '',
        floorWing: 'Ala Norte',
        capacity: 2,
        isActive: true,
      });
      loadData();
    } catch (err) {
      console.error(err);
      feedback.error('No se pudo registrar la habitación', 'Error');
    }
  };

  const handleAssignBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.idOlderAdult || !assignForm.idRoom) {
      feedback.error('Debe seleccionar tanto el residente como la habitación', 'Validación');
      return;
    }

    try {
      await inpatientService.assignBed({
        idOlderAdult: Number(assignForm.idOlderAdult),
        idRoom: Number(assignForm.idRoom),
        bedLabel: assignForm.bedLabel.trim() || 'Cama 1',
        notes: assignForm.notes.trim() || undefined,
      });
      feedback.success('Cama asignada y registrada en el censo con éxito', 'Asignación Confirmada');
      setShowAssignModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      feedback.error('No se pudo asignar la cama al residente', 'Error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Censo Residencial y Mapa de Camas</h1>
              <p className="text-sm text-gray-500">
                Pabellones, habitaciones y asignación de camas para personas adultas mayores (Estándar GNU Health)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRoomModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
          >
            <DoorOpen className="w-4 h-4 text-gray-500" />
            Nueva Habitación
          </button>
          <button
            onClick={() => handleOpenAssignModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Asignar / Reubicar Cama
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Habitaciones</span>
            <DoorOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{rooms.length}</div>
          <p className="text-xs text-gray-500 mt-1">Registradas activas</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Capacidad Total</span>
            <BedDouble className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCapacity}</div>
          <p className="text-xs text-gray-500 mt-1">Plazas de internamiento</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Camas Ocupadas</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{totalOccupied}</div>
          <p className="text-xs text-gray-500 mt-1">Adultos mayores alojados</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Camas Libres</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{totalFree}</div>
          <p className="text-xs text-gray-500 mt-1">Disponibilidad inmediata</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Ocupación Global</span>
            <span className="font-bold text-indigo-600">{occupancyRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className={`h-2.5 rounded-full ${
                occupancyRate > 90 ? 'bg-rose-500' : occupancyRate > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, occupancyRate)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{totalOccupied} de {totalCapacity} plazas en uso</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por habitación, residente o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Wing Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Pabellón / Ala:</span>
            <select
              value={wingFilter}
              onChange={(e) => setWingFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todas las Áreas</option>
              {uniqueWings.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Disponibilidad:</span>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as 'ALL' | 'AVAILABLE' | 'FULL')}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todas las habitaciones</option>
              <option value="AVAILABLE">Con camas disponibles</option>
              <option value="FULL">Habitaciones llenas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando censo residencial y habitaciones...</div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <DoorOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No se encontraron habitaciones</h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm || wingFilter !== 'ALL' || availabilityFilter !== 'ALL'
              ? 'Pruebe ajustando los filtros o el término de búsqueda.'
              : 'Empiece registrando una habitación para habilitar la asignación de camas.'}
          </p>
          <button
            onClick={() => setShowRoomModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Crear Primera Habitación
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const roomAssignments = assignmentsByRoom.get(room.id) || [];
            const occupiedCount = roomAssignments.length;
            const isFull = occupiedCount >= room.capacity;

            // Generate slots for each bed according to room capacity
            const bedSlots = Array.from({ length: room.capacity }, (_, idx) => {
              const assigned = roomAssignments[idx];
              const defaultLabel = `Cama ${idx + 1}`;
              return {
                slotIndex: idx,
                defaultLabel,
                assignment: assigned || null,
              };
            });

            return (
              <div
                key={room.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 transition-all"
              >
                {/* Room Header */}
                <div className="p-4 border-b bg-gray-50 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">Hab. {room.roomNumber}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isFull
                            ? 'bg-rose-100 text-rose-800'
                            : occupiedCount > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isFull ? 'Completa' : `${room.capacity - occupiedCount} libre(s)`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">{room.name}</p>
                    {room.floorWing && (
                      <p className="text-xs text-gray-400 mt-0.5">{room.floorWing}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-gray-500">
                      {occupiedCount} / {room.capacity}
                    </span>
                    <p className="text-[10px] text-gray-400 uppercase">Camas</p>
                  </div>
                </div>

                {/* Bed Slots */}
                <div className="p-4 space-y-3 flex-1">
                  {bedSlots.map((slot) => {
                    if (slot.assignment) {
                      const olderAdult = slot.assignment.olderAdult;
                      return (
                        <div
                          key={slot.assignment.id}
                          className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 flex items-start justify-between gap-3 text-sm"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                              <Bed className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>{slot.assignment.bedLabel || slot.defaultLabel}</span>
                            </div>
                            <div className="text-xs text-gray-700 font-medium">
                              {olderAdult
                                ? `${olderAdult.oaName || ''} ${olderAdult.oaFLastName || ''}`
                                : `Residente #${slot.assignment.idOlderAdult}`}
                            </div>
                            {olderAdult?.oaIdentification && (
                              <div className="text-[11px] text-gray-500">
                                Cédula: {olderAdult.oaIdentification}
                              </div>
                            )}
                            {slot.assignment.notes && (
                              <div className="text-[11px] text-gray-500 italic mt-0.5">
                                &quot;{slot.assignment.notes}&quot;
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() =>
                              handleOpenAssignModal(
                                room.id,
                                slot.assignment?.bedLabel || slot.defaultLabel,
                                slot.assignment?.idOlderAdult
                              )
                            }
                            title="Reubicar o cambiar cama de este residente"
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    }

                    // Empty slot
                    return (
                      <div
                        key={slot.slotIndex}
                        className="p-3 rounded-lg border border-dashed border-gray-200 hover:border-emerald-300 bg-gray-50/50 flex items-center justify-between gap-3 text-sm transition-colors"
                      >
                        <div className="flex items-center gap-2 text-gray-500">
                          <Bed className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-medium text-xs text-gray-700">{slot.defaultLabel}</span>
                          <span className="text-[11px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Disponible
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenAssignModal(room.id, slot.defaultLabel)}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Asignar
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Nueva Habitación */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Registrar Nueva Habitación</h3>
              </div>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Número o Código de Habitación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 101, A-12, PB-04"
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Nombre Descriptivo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Habitación Doble Asistida"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Pabellón / Ala / Piso
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Ala Norte, Piso 1"
                    value={roomForm.floorWing}
                    onChange={(e) => setRoomForm({ ...roomForm, floorWing: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Capacidad (Camas) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveRoom"
                  checked={roomForm.isActive}
                  onChange={(e) => setRoomForm({ ...roomForm, isActive: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="isActiveRoom" className="text-sm text-gray-700">
                  Habitación habilitada e inmediatamente disponible
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Guardar Habitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Asignar / Reubicar Cama */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-200">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Asignar o Reubicar Cama</h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignBed} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Persona Adulta Mayor (Residente) *
                </label>
                <select
                  required
                  value={assignForm.idOlderAdult}
                  onChange={(e) => setAssignForm({ ...assignForm, idOlderAdult: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="">-- Seleccione un residente --</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombreApellido} - Céd: {r.cedula}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Habitación Destino *
                  </label>
                  <select
                    required
                    value={assignForm.idRoom}
                    onChange={(e) => setAssignForm({ ...assignForm, idRoom: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="">-- Seleccione habitación --</option>
                    {rooms.map((rm) => {
                      const count = (assignmentsByRoom.get(rm.id) || []).length;
                      return (
                        <option key={rm.id} value={rm.id}>
                          Hab. {rm.roomNumber} ({rm.floorWing || rm.name}) - {count}/{rm.capacity} ocupadas
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Etiqueta de Cama *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Cama 1, Cama A, Cama Ventana"
                    value={assignForm.bedLabel}
                    onChange={(e) => setAssignForm({ ...assignForm, bedLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Notas de Ubicación o Cuidados Especiales
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej: Requiere cama articulada cerca de la puerta, barandillas protectoras elevadas..."
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
