import React, { useState } from 'react';
import { 
  Eye, 
  Plus, 
  Search, 
  Download, 
  CheckCircle2, 
  X, 
  Save, 
  AlertCircle, 
  MapPin, 
  Award,
  Filter,
  Shield,
  RefreshCw,
  Sliders,
  Compass,
  Signal,
  Trash2,
  Edit2,
  Loader2,
  FileText,
  Users
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { Witness } from '@/src/types';

// Mock Witnesses to match the exact mockup dashboard data
const MOCK_WITNESSES = [
  {
    id: 'mock-1',
    nombre: 'Mateo Botero López',
    cedula: '1018998877',
    telefono: '+57 311 456 7890',
    email: 'mateo.botero@gmail.com',
    puestoVotacion: 'Colegio Marco Fidel Suárez',
    mesa: 'Mesa 12',
    comuna: 'Comuna 10 (La Candelaria)',
    tipoTestigo: 'PRINCIPAL',
    estadoAcreditacion: 'ACREDITADO',
    distancia: 28,
    ping: 'Hace 1 min',
    bateria: 92,
    formularioLink: 'Formulario E-16 Aprobado',
    partido: 'Partido Liberal Colombiano'
  },
  {
    id: 'mock-2',
    nombre: 'Sofia Castro Restrepo',
    cedula: '1022334455',
    telefono: '+57 300 987 6543',
    email: 'sofia.castro@gmail.com',
    puestoVotacion: 'Universidad UPB',
    mesa: 'Mesa 04',
    comuna: 'Comuna 11 (Laureles)',
    tipoTestigo: 'REMANENTE',
    estadoAcreditacion: 'PENDIENTE',
    distancia: 320,
    ping: 'Hace 4 min',
    bateria: 58,
    formularioLink: 'Formulario E-16 En Trámite',
    partido: 'Partido Alianza Verde'
  },
  {
    id: 'mock-3',
    nombre: 'Jorge Andrés Hoyos',
    cedula: '1033445566',
    telefono: '+57 320 123 4567',
    email: 'jorge.hoyos@gmail.com',
    puestoVotacion: 'I.E. Pedro Justo Berrío',
    mesa: 'Mesa 15',
    comuna: 'Comuna 16 (Belén)',
    tipoTestigo: 'PRINCIPAL',
    estadoAcreditacion: 'ACREDITADO',
    distancia: 42,
    ping: 'Hace 2 min',
    bateria: 85,
    formularioLink: 'Formulario E-16 Aprobado',
    partido: 'Centro Democrático'
  },
  {
    id: 'mock-4',
    nombre: 'Valeria Gómez Ortiz',
    cedula: '1044556677',
    telefono: '+57 315 678 9012',
    email: 'valeria.gomez@gmail.com',
    puestoVotacion: 'Plaza de Toros La Macarena',
    mesa: 'Mesa 01',
    comuna: 'Comuna 11 (Laureles)',
    tipoTestigo: 'GENERAL',
    estadoAcreditacion: 'PENDIENTE',
    distancia: 110,
    ping: 'Hace 8 min',
    bateria: 74,
    formularioLink: 'Formulario E-16 En Trámite',
    partido: 'Nuevo Liberalismo'
  }
];

const COVERAGE_MATRIX = [
  { puesto: 'Colegio Marco Fidel Suárez', mesas: 28, comuna: 'Comuna 10 (La Candelaria)' },
  { puesto: 'Universidad UPB', mesas: 35, comuna: 'Comuna 11 (Laureles)' },
  { puesto: 'I.E. Pedro Justo Berrío', mesas: 22, comuna: 'Comuna 16 (Belén)' },
  { puesto: 'I.E. INEM José Félix de Restrepo', mesas: 40, comuna: 'Comuna 14 (El Poblado)' },
  { puesto: 'Plaza de Toros La Macarena', mesas: 18, comuna: 'Comuna 11 (Laureles)' },
  { puesto: 'I.E. Diego Echavarría Misas', mesas: 25, comuna: 'Comuna 5 (Castilla)' },
  { puesto: 'Colegio San José de las Vegas', mesas: 30, comuna: 'Comuna 14 (El Poblado)' }
];

export default function AdminWitnessesPage() {
  const { user, client } = useAuth();
  const { witnesses: dbWitnesses, refresh, loading } = useAdministrativeData();

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [partidoFilter, setPartidoFilter] = useState('ALL');
  const [puestoFilter, setPuestoFilter] = useState('ALL');

  // Geofencing Parameter States
  const [cercoRadio, setCercoRadio] = useState(150);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [seguimientoHabilitado, setSeguimientoHabilitado] = useState(true);
  const [toleranciaTiempo, setToleranciaTiempo] = useState('15 Minutos (Recomendado)');
  const [disparoAlerta, setDisparoAlerta] = useState(true);
  const [radarPuesto, setRadarPuesto] = useState('Colegio Marco Fidel Suárez - Comuna 10 (La Candelaria)');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
    puestoVotacion: '',
    mesa: '',
    tipoTestigo: 'PRINCIPAL' as 'PRINCIPAL' | 'REMANENTE' | 'GENERAL',
    estadoAcreditacion: 'ACREDITADO' as 'PENDIENTE' | 'ACREDITADO' | 'RECHAZADO',
    partido: 'Partido Liberal Colombiano'
  });

  // Extract Party from observations or fallback
  const getWitnessParty = (w: Witness) => {
    if (w.observaciones && w.observaciones.startsWith('Partido:')) {
      return w.observaciones.replace('Partido:', '').split(';')[0].trim();
    }
    return 'Otro / Independiente';
  };

  // Compile and merge mock + database witnesses
  const allWitnesses = [
    ...MOCK_WITNESSES,
    ...dbWitnesses.map(w => ({
      id: w.id,
      nombre: w.nombre,
      cedula: w.cedula,
      telefono: w.telefono || 'Sin teléfono',
      email: w.email || 'Sin email',
      puestoVotacion: w.puesto || 'Sin puesto asignado',
      mesa: w.mesa ? `Mesa ${String(w.mesa).replace(/\D/g, '')}` : 'General',
      comuna: w.zona || 'Comuna General',
      tipoTestigo: w.observaciones?.includes('Tipo:') 
        ? w.observaciones.split('Tipo:')[1].split(';')[0].trim() 
        : 'PRINCIPAL',
      estadoAcreditacion: w.estado === 'ACREDITADO' ? 'ACREDITADO' : 'PENDIENTE',
      distancia: (parseInt(w.cedula) % 420) + 15, // Deterministic mock distance for DB witnesses
      ping: 'Hace 3 min',
      bateria: (parseInt(w.cedula) % 45) + 55, // Deterministic mock battery
      formularioLink: w.estado === 'ACREDITADO' ? 'Formulario E-16 Aprobado' : 'Formulario E-16 En Trámite',
      partido: getWitnessParty(w)
    }))
  ];

  // Filters mapping
  const filteredWitnesses = allWitnesses.filter(w => {
    const matchSearch = w.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.cedula.includes(searchTerm) ||
      w.puestoVotacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPartido = partidoFilter === 'ALL' || w.partido === partidoFilter;
    const matchPuesto = puestoFilter === 'ALL' || w.puestoVotacion === puestoFilter;
    return matchSearch && matchPartido && matchPuesto;
  });

  // Coverage statistics counts
  const totalWitnessesCount = allWitnesses.length;
  const accreditedWitnessesCount = allWitnesses.filter(w => w.estadoAcreditacion === 'ACREDITADO').length;

  const getPartyCount = (partyName: string) => {
    return allWitnesses.filter(w => w.partido === partyName).length;
  };

  const getPartyAccreditedCount = (partyName: string) => {
    return allWitnesses.filter(w => w.partido === partyName && w.estadoAcreditacion === 'ACREDITADO').length;
  };

  const getAssignedCount = (puestoName: string) => {
    return allWitnesses.filter(w => w.puestoVotacion === puestoName).length;
  };

  // Helper to map DB roles/states
  const getRoleLabel = (tipo: string) => {
    if (tipo === 'PRINCIPAL') return 'Testigo de Mesa (E-16)';
    if (tipo === 'REMANENTE') return 'Testigo Rematador / Coordinador de Puesto';
    return 'Testigo de Escrutinio Municipal';
  };

  // Save/Edit Witness Handler
  const handleSaveWitness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.cedula.trim()) {
      setMessage({ text: 'Nombre y Cédula son obligatorios', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const clientId = user?.tenantId || client?.id;
      const serialObservations = `Partido: ${form.partido}; Tipo: ${form.tipoTestigo};`;

      if (editingId && !editingId.startsWith('mock-')) {
        // Edit existing witness in database
        const { error } = await supabase
          .from('witnesses')
          .update({
            nombre: form.nombre.trim(),
            cedula: form.cedula.trim(),
            telefono: form.telefono.trim(),
            email: form.email.trim(),
            puesto: form.puestoVotacion.trim(),
            mesa: form.mesa.trim(),
            estado: form.estadoAcreditacion === 'ACREDITADO' ? 'ACREDITADO' : 'PENDIENTE',
            observaciones: serialObservations
          })
          .eq('id', editingId);

        if (error) throw error;
        setMessage({ text: 'Testigo electoral actualizado con éxito', type: 'success' });
      } else {
        // Insert new witness in database
        const { error } = await supabase.from('witnesses').insert([
          {
            client_id: clientId,
            nombre: form.nombre.trim(),
            cedula: form.cedula.trim(),
            telefono: form.telefono.trim(),
            email: form.email.trim(),
            puesto: form.puestoVotacion.trim(),
            mesa: form.mesa.trim(),
            estado: form.estadoAcreditacion === 'ACREDITADO' ? 'ACREDITADO' : 'PENDIENTE',
            observaciones: serialObservations
          }
        ]);

        if (error) throw error;
        setMessage({ text: 'Testigo electoral registrado con éxito', type: 'success' });
      }

      await refresh();
      setForm({
        nombre: '',
        cedula: '',
        telefono: '',
        email: '',
        puestoVotacion: '',
        mesa: '',
        tipoTestigo: 'PRINCIPAL',
        estadoAcreditacion: 'ACREDITADO',
        partido: 'Partido Liberal Colombiano'
      });
      setEditingId(null);
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
      }, 800);
    } catch (err: any) {
      console.error('Error saving witness:', err);
      setMessage({ text: err.message || 'Error al guardar testigo', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Delete Witness Handler
  const handleDeleteWitness = async (id: string) => {
    if (id.startsWith('mock-')) {
      alert('Los registros de prueba incluidos en la visualización no pueden ser eliminados permanentemente.');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este testigo electoral?')) return;

    try {
      const { error } = await supabase.from('witnesses').delete().eq('id', id);
      if (error) throw error;
      await refresh();
    } catch (err: any) {
      console.error('Error deleting witness:', err);
      alert('Ocurrió un error al intentar eliminar el testigo.');
    }
  };

  // Edit Button Trigger
  const startEditWitness = (w: any) => {
    if (w.id.startsWith('mock-')) {
      alert('Los registros de prueba incluidos en la visualización no son editables.');
      return;
    }
    setEditingId(w.id);
    setForm({
      nombre: w.nombre,
      cedula: w.cedula,
      telefono: w.telefono === 'Sin teléfono' ? '' : w.telefono,
      email: w.email === 'Sin email' ? '' : w.email,
      puestoVotacion: w.puestoVotacion,
      mesa: w.mesa.replace('Mesa ', ''),
      tipoTestigo: w.tipoTestigo,
      estadoAcreditacion: w.estadoAcreditacion,
      partido: w.partido
    });
    setIsModalOpen(true);
  };

  // Export CSV
  const exportWitnessesCSV = () => {
    if (allWitnesses.length === 0) return;

    const headers = 'Nombre,Cedula,Telefono,Email,PuestoVotacion,Mesa,Partido,TipoTestigo,EstadoAcreditacion\n';
    const rows = allWitnesses.map(w => 
      `"${w.nombre}","${w.cedula}","${w.telefono}","${w.email}","${w.puestoVotacion}","${w.mesa}","${w.partido}","${w.tipoTestigo}","${w.estadoAcreditacion}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `testigos_electorales_E16_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Gestión & Configuración de Lista de Testigos Electorales (E-16)
            </h2>
            <p className="text-xs text-slate-400">
              Asignación territorial de mesas por partido político o movimiento significativo según los puestos consignados en la campaña creada.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end xl:self-center font-sans">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Campaña Activa: Creada
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </span>
          <button
            onClick={exportWitnessesCSV}
            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            Exportar Formulario E-16
          </button>
        </div>
      </div>

      {/* 2. Campaign Summary Card */}
      <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Campaña Configurada: Alcaldía de Medellín (Antioquia) - Dr. Javier Méndez
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Circunscripción Municipal | 7 Puestos de Votación Clave Consignados | 198 Mesas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 text-slate-300 text-xs font-black border border-white/10">
            Total Testigos: <span className="text-indigo-400 font-black">{totalWitnessesCount}</span>
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 text-emerald-400 text-xs font-black border border-emerald-500/20">
            Acreditados: <span className="text-emerald-400 font-black">{accreditedWitnessesCount}</span>
          </span>
        </div>
      </div>

      {/* 3. Partidos Políticos Summary Section */}
      <div className="space-y-2.5">
        <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-2 pl-1">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          Resumen de Testigos por Partido Político o Movimiento Significativo
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Partido Liberal Colombiano', short: 'Liberal' },
            { name: 'Partido Alianza Verde', short: 'Alianza Verde' },
            { name: 'Centro Democrático', short: 'Centro Democ.' },
            { name: 'Nuevo Liberalismo', short: 'Nuevo Lib.' }
          ].map((party) => {
            const count = getPartyCount(party.name);
            const okCount = getPartyAccreditedCount(party.name);
            return (
              <div key={party.name} className="bg-slate-950/45 border border-white/5 p-4 rounded-2xl flex items-center justify-between shadow-md">
                <div className="space-y-1">
                  <span className="text-xs font-black text-white">{party.name}</span>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Acreditación E-16:{' '}
                    <span className={okCount === count && count > 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {okCount} de {count} OK
                    </span>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[10px] font-black">
                  {count} Testigos
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. GPS Geofencing Monitoring Panel */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-slate-950/70 border-b border-white/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 animate-pulse">
              <Signal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">
                SISTEMA DE SEGUIMIENTO A TESTIGOS POR CERCO PERIMETRAL (GEOREFERENCIACIÓN GPS)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoreo perimetral en tiempo real el Día E con radio de distancia editable por puesto de votación y alertas por abandono de zona.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-[10px] font-black text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              GEOCERCA ACTIVA
            </span>
            <button
              onClick={() => setSeguimientoHabilitado(!seguimientoHabilitado)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 transition-all ${
                seguimientoHabilitado 
                  ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' 
                  : 'bg-slate-900 border border-white/10 text-slate-400'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${seguimientoHabilitado ? 'animate-spin' : ''}`} />
              {seguimientoHabilitado ? 'Seguimiento Habilitado' : 'Seguimiento Inactivo'}
            </button>
            <button
              onClick={() => setIsPanelVisible(!isPanelVisible)}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-[10px] font-black text-indigo-300 flex items-center gap-1.5 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              {isPanelVisible ? 'Ocultar Panel' : 'Mostrar Panel'}
            </button>
          </div>
        </div>

        {isPanelVisible && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-900/20">
            {/* Left Column - Geofence adjustment parameters */}
            <div className="lg:col-span-5 space-y-4 bg-slate-950/30 p-4 border border-white/5 rounded-2xl">
              <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Ajuste de Parámetros del Cerco Perimetral
              </h4>

              {/* Slider for meters */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-400">Radio del Cerco Perimetral (Metros):</label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      value={cercoRadio} 
                      onChange={(e) => setCercoRadio(Math.min(500, Math.max(50, parseInt(e.target.value) || 50)))}
                      className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1 w-16 text-center text-xs text-white outline-none font-mono"
                    />
                    <span className="text-xs text-slate-400">m</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="500" 
                  value={cercoRadio} 
                  onChange={(e) => setCercoRadio(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                {/* Presets */}
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[
                    { val: 50, label: '50m\n(Mesas)' },
                    { val: 100, label: '100m\n(Puesto)' },
                    { val: 150, label: '150m\n(Estándar)' },
                    { val: 300, label: '300m\n(Manzana)' },
                    { val: 500, label: '500m\n(Zona)' }
                  ].map(preset => (
                    <button
                      key={preset.val}
                      onClick={() => setCercoRadio(preset.val)}
                      className={`text-[9px] font-bold p-1 rounded-lg border text-center transition-all ${
                        cercoRadio === preset.val
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                          : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/15'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time tolerance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tiempo Tol. Fuera de Cerco</label>
                  <select
                    value={toleranciaTiempo}
                    onChange={(e) => setToleranciaTiempo(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="5 Minutos">5 Minutos</option>
                    <option value="10 Minutos">10 Minutos</option>
                    <option value="15 Minutos (Recomendado)">15 Minutos (Recomendado)</option>
                    <option value="30 Minutos">30 Minutos</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Alerta al Centro Mando</label>
                  <label className="flex items-center gap-2 p-2 bg-slate-900 border border-white/10 rounded-xl cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={disparoAlerta} 
                      onChange={(e) => setDisparoAlerta(e.target.checked)}
                      className="rounded border-white/10 text-indigo-600 focus:ring-0 focus:ring-offset-0 accent-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs text-slate-300 font-semibold select-none">Disparo Automático Día E</span>
                  </label>
                </div>
              </div>

              {/* Polling Station Radar selection */}
              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inspeccionar Puesto de Votación en Radar:</label>
                <select
                  value={radarPuesto}
                  onChange={(e) => setRadarPuesto(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {COVERAGE_MATRIX.map((item) => (
                    <option key={item.puesto} value={`${item.puesto} - ${item.comuna}`}>
                      {item.puesto} - {item.comuna}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column - Visual GPS Radar widget */}
            <div className="lg:col-span-7 bg-slate-950/30 p-4 border border-white/5 rounded-2xl flex flex-col sm:flex-row gap-5">
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <div className="flex justify-between items-center w-full">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    Radar de Cobertura GPS: {radarPuesto.split(' - ')[0]}
                  </h4>
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] font-mono">
                    Radio Actual: {cercoRadio}m
                  </span>
                </div>

                {/* Radar graphics */}
                <div className="relative w-48 h-48 rounded-full border border-slate-800/80 flex items-center justify-center bg-slate-950/60 overflow-hidden shadow-inner">
                  {/* Dynamic Cerco range visual overlay */}
                  <div 
                    className="absolute rounded-full border border-indigo-500/30 bg-indigo-500/10 transition-all duration-300"
                    style={{
                      width: `${(cercoRadio / 500) * 100}%`,
                      height: `${(cercoRadio / 500) * 100}%`,
                    }}
                  />

                  {/* Concentric rings */}
                  <div className="absolute w-[80%] h-[80%] rounded-full border border-slate-800/40 pointer-events-none" />
                  <div className="absolute w-[60%] h-[60%] rounded-full border border-slate-800/40 pointer-events-none" />
                  <div className="absolute w-[40%] h-[40%] rounded-full border border-slate-800/40 pointer-events-none" />
                  <div className="absolute w-[20%] h-[20%] rounded-full border border-slate-800/40 pointer-events-none" />

                  {/* Sweep scan line */}
                  {seguimientoHabilitado && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-500/5 to-transparent rounded-full animate-[spin_6s_linear_infinite] pointer-events-none" />
                  )}

                  {/* Center Station Pin */}
                  <div className="z-10 p-1.5 rounded-full bg-slate-950 border border-slate-700 shadow-md">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                  </div>

                  {/* Floating Witness markers T1, T2, T3, T4 */}
                  {/* T1 (Mateo) - 28m */}
                  <div 
                    className={`absolute z-20 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border shadow-lg transition-all duration-500 ${
                      28 <= cercoRadio 
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20' 
                        : 'bg-rose-500 text-white border-rose-400 shadow-rose-500/20'
                    }`}
                    style={{ top: '35%', left: '30%' }}
                    title="T1 - Mateo Botero (28m)"
                  >
                    T1
                  </div>

                  {/* T2 (Sofia) - 320m */}
                  <div 
                    className={`absolute z-20 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border shadow-lg transition-all duration-500 ${
                      320 <= cercoRadio 
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20' 
                        : 'bg-rose-500 text-white border-rose-400 shadow-rose-500/20'
                    }`}
                    style={{ top: '80%', left: '60%' }}
                    title="T2 - Sofia Castro (320m)"
                  >
                    T2
                  </div>

                  {/* T3 (Jorge) - 42m */}
                  <div 
                    className={`absolute z-20 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border shadow-lg transition-all duration-500 ${
                      42 <= cercoRadio 
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20' 
                        : 'bg-rose-500 text-white border-rose-400 shadow-rose-500/20'
                    }`}
                    style={{ top: '20%', left: '55%' }}
                    title="T3 - Jorge Andrés Hoyos (42m)"
                  >
                    T3
                  </div>

                  {/* T4 (Valeria) - 110m */}
                  <div 
                    className={`absolute z-20 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border shadow-lg transition-all duration-500 ${
                      110 <= cercoRadio 
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20' 
                        : 'bg-rose-500 text-white border-rose-400 shadow-rose-500/20'
                    }`}
                    style={{ top: '60%', left: '20%' }}
                    title="T4 - Valeria Gómez (110m)"
                  >
                    T4
                  </div>
                </div>

                <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-400" />
                    Dentro Cerco
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-400" />
                    Fuera Cerco
                  </span>
                </div>
              </div>

              {/* Monitored Witnesses List right column */}
              <div className="flex-1 flex flex-col justify-between space-y-2.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-white/5 pb-1">
                  Testigos Monitoreados en Puesto:
                </span>
                
                <div className="space-y-2 flex-1 max-h-[160px] overflow-y-auto pr-1">
                  {allWitnesses.map((w) => {
                    const isWithin = w.distancia <= cercoRadio;
                    return (
                      <div key={w.id} className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-white/5 shadow-sm">
                        <div>
                          <p className="text-[11px] font-black text-white leading-tight">{w.nombre}</p>
                          <span className={`text-[9px] font-bold ${isWithin ? 'text-emerald-400' : 'text-rose-400'}`}>
                            Distancia: {w.distancia}m
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${
                            isWithin 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {isWithin ? 'DENTRO' : 'FUERA'}
                          </span>
                          <button 
                            onClick={() => alert(`Recargando ubicación GPS para ${w.nombre}...`)}
                            className="text-slate-400 hover:text-white p-0.5 rounded bg-slate-800 hover:bg-slate-700"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Search, Filter, and Action Row */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Nombre, Cédula o Puesto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={partidoFilter}
          onChange={(e) => setPartidoFilter(e.target.value)}
          className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 w-full md:w-auto font-sans"
        >
          <option value="ALL">Todos los Partidos/Movimientos</option>
          <option value="Partido Liberal Colombiano">Partido Liberal Colombiano</option>
          <option value="Partido Alianza Verde">Partido Alianza Verde</option>
          <option value="Centro Democrático">Centro Democrático</option>
          <option value="Nuevo Liberalismo">Nuevo Liberalismo</option>
          <option value="Otro / Independiente">Otro / Independiente</option>
        </select>

        <select
          value={puestoFilter}
          onChange={(e) => setPuestoFilter(e.target.value)}
          className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 w-full md:w-auto font-sans"
        >
          <option value="ALL">Todos los Puestos de Votación</option>
          {COVERAGE_MATRIX.map(m => (
            <option key={m.puesto} value={m.puesto}>{m.puesto}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setEditingId(null);
            setForm({
              nombre: '',
              cedula: '',
              telefono: '',
              email: '',
              puestoVotacion: '',
              mesa: '',
              tipoTestigo: 'PRINCIPAL',
              estadoAcreditacion: 'ACREDITADO',
              partido: 'Partido Liberal Colombiano'
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
          Inscribir Nuevo Testigo
        </button>
      </div>

      {/* 6. Witnesses Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5 font-bold">Testigo & Contacto</th>
                <th className="py-3.5 px-4 font-bold">Partido / Movimiento</th>
                <th className="py-3.5 px-4 font-bold">Rol</th>
                <th className="py-3.5 px-4 font-bold">Puesto & Mesa Asignada</th>
                <th className="py-3.5 px-4 font-bold">Cerco GPS ({cercoRadio}m)</th>
                <th className="py-3.5 px-4 font-bold">Acreditación Registraduría</th>
                <th className="py-3.5 px-4 font-bold text-center">Estado</th>
                <th className="py-3.5 px-5 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredWitnesses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-semibold">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        Cargando testigos electorales...
                      </span>
                    ) : (
                      'No se encontraron testigos electorales registrados.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredWitnesses.map((w) => {
                  const isWithin = w.distancia <= cercoRadio;
                  return (
                    <tr key={w.id} className="hover:bg-white/[0.015] transition-colors">
                      {/* Name & Contact */}
                      <td className="py-4 px-5">
                        <p className="font-black text-white text-xs">{w.nombre}</p>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">CC: {w.cedula}</span>
                        <span className="text-[10px] text-slate-500 font-semibold block">{w.telefono}</span>
                      </td>

                      {/* Party */}
                      <td className="py-4 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-white/5 text-slate-300">
                          {w.partido}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 text-slate-300 font-semibold">
                        {getRoleLabel(w.tipoTestigo)}
                      </td>

                      {/* Station & Table */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-white leading-snug">{w.puestoVotacion}</p>
                        <span className="text-[10px] text-indigo-400 font-bold block mt-0.5 font-mono">
                          {w.mesa} ({w.comuna})
                        </span>
                      </td>

                      {/* GPS Fence */}
                      <td className="py-4 px-4 font-mono">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          isWithin 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isWithin ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {isWithin ? `En Cerco (${w.distancia}m)` : `Fuera Cerco (${w.distancia}m)`}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium block mt-1 font-sans">
                          Ping: {w.ping} | Bat: {w.bateria}%
                        </span>
                      </td>

                      {/* Accreditation Support Document */}
                      <td className="py-4 px-4">
                        <a 
                          href="#"
                          onClick={(e) => { e.preventDefault(); alert('Visualizando soporte del formulario E-16...'); }}
                          className="text-indigo-400 hover:text-indigo-300 underline font-semibold flex items-center gap-1 text-[11px]"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {w.formularioLink}
                        </a>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          w.estadoAcreditacion === 'ACREDITADO'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {w.estadoAcreditacion === 'ACREDITADO' ? 'Acreditado' : 'Inscrito'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Recargar ubicación GPS"
                            onClick={() => alert(`Recargando geolocalización GPS para ${w.nombre}...`)}
                            className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/25 rounded-lg transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Editar Datos"
                            onClick={() => startEditWitness(w)}
                            disabled={w.id.startsWith('mock-')}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Eliminar Registro"
                            onClick={() => handleDeleteWitness(w.id)}
                            disabled={w.id.startsWith('mock-')}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/25 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Coverage Matrix */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-lg space-y-4">
        <h4 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wide">
          <MapPin className="w-4 h-4 text-indigo-400" />
          Matriz de Cobertura de Mesas en Puestos de Votación (Circunscripción Territorial)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {COVERAGE_MATRIX.map((c) => {
            const count = getAssignedCount(c.puesto);
            const isCovered = count > 0;
            return (
              <div key={c.puesto} className="bg-slate-950/50 border border-white/5 p-4 rounded-2xl space-y-3 shadow-md relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black text-white line-clamp-1">{c.puesto}</p>
                    <span className="text-[10px] text-slate-400 font-semibold">{c.comuna}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-[9px] font-mono text-slate-400">
                    {c.mesas} Mesas
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold">
                    Testigos Asignados: <span className="text-white font-black">{count}</span>
                  </span>
                  
                  <span className={`text-[10px] font-extrabold flex items-center gap-1 ${
                    isCovered ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {isCovered ? (
                      <>
                        Cubierto
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </>
                    ) : (
                      <>
                        Pendiente Asignar
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                {editingId ? 'Editar Testigo Electoral' : 'Registrar Testigo Electoral'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSaveWitness} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Jorge Ramírez"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cédula *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1098765432"
                    value={form.cedula}
                    onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej. 3156789012"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Ej. jorge@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Partido Político / Movimiento</label>
                  <select
                    value={form.partido}
                    onChange={(e) => setForm({ ...form, partido: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="Partido Liberal Colombiano">Partido Liberal Colombiano</option>
                    <option value="Partido Alianza Verde">Partido Alianza Verde</option>
                    <option value="Centro Democrático">Centro Democrático</option>
                    <option value="Nuevo Liberalismo">Nuevo Liberalismo</option>
                    <option value="Otro / Independiente">Otro / Independiente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rol / Tipo de Testigo</label>
                  <select
                    value={form.tipoTestigo}
                    onChange={(e) => setForm({ ...form, tipoTestigo: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="PRINCIPAL">Testigo de Mesa (E-16)</option>
                    <option value="REMANENTE">Testigo Rematador / Coordinador de Puesto</option>
                    <option value="GENERAL">Testigo de Escrutinio Municipal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Puesto de Votación</label>
                  <select
                    value={form.puestoVotacion}
                    onChange={(e) => setForm({ ...form, puestoVotacion: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="">Selecciona un puesto...</option>
                    {COVERAGE_MATRIX.map(m => (
                      <option key={m.puesto} value={m.puesto}>{m.puesto}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mesa Asignada</label>
                  <input
                    type="text"
                    placeholder="Ej. Mesa 12"
                    value={form.mesa}
                    onChange={(e) => setForm({ ...form, mesa: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estado de Acreditación CNE</label>
                <select
                  value={form.estadoAcreditacion}
                  onChange={(e) => setForm({ ...form, estadoAcreditacion: e.target.value as any })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                >
                  <option value="ACREDITADO">Acreditado Oficialmente</option>
                  <option value="PENDIENTE">Pendiente por Enviar / Inscrito</option>
                  <option value="RECHAZADO">Rechazado</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Guardando...' : 'Guardar Testigo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
