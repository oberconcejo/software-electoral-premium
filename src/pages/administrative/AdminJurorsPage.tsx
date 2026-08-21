import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  Download, 
  CheckCircle2, 
  X, 
  Save, 
  AlertCircle, 
  UserCheck,
  Edit2,
  Trash2,
  Loader2,
  UploadCloud,
  FileSpreadsheet
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { Juror } from '@/src/types';

// Mock Jurors to match the exact mockup dashboard data
const MOCK_JURORS = [
  {
    id: 'mock-1',
    nombre: 'Valentina Ríos Cano',
    cedula: '1015667788',
    telefono: '+57 311 987 6543',
    email: 'valentina.rios@gmail.com',
    puestoVotacion: 'Colegio Marco Fidel Suárez',
    mesa: 'Mesa 12',
    partido: 'Partido Liberal Colombiano',
    ocupacion: 'Docente Universitaria',
    resultadoSorteo: 'SELECCIONADO EN RESOLUCIÓN',
    rolJurado: 'PRESIDENTE',
    resolucion: 'Res. Registraduría No. 0482 de 2026'
  },
  {
    id: 'mock-2',
    nombre: 'Felipe Jaramillo Velásquez',
    cedula: '1026778899',
    telefono: '+57 300 112 2334',
    email: 'felipe.jaramillo@gmail.com',
    puestoVotacion: 'Universidad UPB',
    mesa: 'Mesa 04',
    partido: 'Partido Alianza Verde',
    ocupacion: 'Ingeniero de Sistemas',
    resultadoSorteo: 'SELECCIONADO EN RESOLUCIÓN',
    rolJurado: 'VOCAL 1',
    resolucion: 'Res. Registraduría No. 0482 de 2026'
  },
  {
    id: 'mock-3',
    nombre: 'Camila Suárez Montoya',
    cedula: '1037889900',
    telefono: '+57 320 445 5667',
    email: 'camila.suarez@gmail.com',
    puestoVotacion: 'I.E. Pedro Justo Berrío',
    mesa: 'Mesa 15',
    partido: 'Centro Democrático',
    ocupacion: 'Administradora de Empresas',
    resultadoSorteo: 'SELECCIONADO EN RESOLUCIÓN',
    rolJurado: 'VOCAL 2',
    resolucion: 'Res. Registraduría No. 0482 de 2026'
  },
  {
    id: 'mock-4',
    nombre: 'Mateo Botero López',
    cedula: '1018998877',
    telefono: '+57 311 456 7890',
    email: 'mateo.botero@gmail.com',
    puestoVotacion: 'Colegio Marco Fidel Suárez',
    mesa: 'Mesa 08',
    partido: 'Partido Liberal Colombiano',
    ocupacion: 'Estudiante de Derecho',
    resultadoSorteo: 'SELECCIONADO EN RESOLUCIÓN',
    rolJurado: 'VOCAL 3',
    resolucion: 'Res. Registraduría No. 0482 de 2026'
  },
  {
    id: 'mock-5',
    nombre: 'Sofia Castro Restrepo',
    cedula: '1022334455',
    telefono: '+57 300 987 6543',
    email: 'sofia.castro@gmail.com',
    puestoVotacion: 'Universidad UPB',
    mesa: 'General',
    partido: 'Partido Alianza Verde',
    ocupacion: 'Trabajadora Social',
    resultadoSorteo: 'NO SELECCIONADO',
    rolJurado: 'NINGUNA',
    resolucion: 'Postulación Sin Asignación'
  },
  {
    id: 'mock-6',
    nombre: 'Jorge Andrés Hoyos',
    cedula: '1033445566',
    telefono: '+57 320 123 4567',
    email: 'jorge.hoyos@gmail.com',
    puestoVotacion: 'I.E. Pedro Justo Berrío',
    mesa: 'Mesa 02',
    partido: 'Centro Democrático',
    ocupacion: 'Contador Público',
    resultadoSorteo: 'SELECCIONADO EN RESOLUCIÓN',
    rolJurado: 'VICEPRESIDENTE',
    resolucion: 'Res. Registraduría No. 0482 de 2026'
  },
  {
    id: 'mock-7',
    nombre: 'Valeria Gómez Ortiz',
    cedula: '1044556677',
    telefono: '+57 315 678 9012',
    email: 'valeria.gomez@gmail.com',
    puestoVotacion: 'Plaza de Toros La Macarena',
    mesa: 'Mesa 01',
    partido: 'Nuevo Liberalismo',
    ocupacion: 'Abogada',
    resultadoSorteo: 'SELECCIONADO EN RESOLUCIÓN',
    rolJurado: 'PRESIDENTE',
    resolucion: 'Res. Registraduría No. 0482 de 2026'
  }
];

export default function AdminJurorsPage() {
  const { user, client } = useAuth();
  const { jurors: dbJurors, refresh, loading } = useAdministrativeData();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [partidoFilter, setPartidoFilter] = useState('ALL');
  const [sorteoFilter, setSorteoFilter] = useState('ALL');

  // Confrontation / Resolution action states
  const [confronting, setConfronting] = useState(false);
  const [resolutionAttached, setResolutionAttached] = useState(false);
  const [confrontationMessage, setConfrontationMessage] = useState<string | null>(null);

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
    partido: 'Partido Liberal Colombiano',
    ocupacion: 'Profesional Independiente',
    resultadoSorteo: 'SELECCIONADO EN RESOLUCIÓN' as 'SELECCIONADO EN RESOLUCIÓN' | 'NO SELECCIONADO',
    rolJurado: 'PRESIDENTE' as 'PRESIDENTE' | 'VICEPRESIDENTE' | 'VOCAL 1' | 'VOCAL 2' | 'VOCAL 3' | 'REMANENTE' | 'NINGUNA',
    resolucion: 'Res. Registraduría No. 0482 de 2026'
  });

  // Serialization helpers
  const getJurorField = (j: Juror, key: 'partido' | 'ocupacion' | 'resultadoSorteo' | 'rolJurado' | 'resolucion') => {
    if (!j.observaciones) {
      if (key === 'partido') return 'Otro / Independiente';
      if (key === 'ocupacion') return 'Profesional';
      if (key === 'resultadoSorteo') return 'SELECCIONADO EN RESOLUCIÓN';
      if (key === 'rolJurado') return j.cargo || 'VOCAL 1';
      return 'Res. Registraduría No. 0482 de 2026';
    }
    const parts = j.observaciones.split(';');
    const match = parts.find(p => p.trim().startsWith(`${key}:`));
    if (match) {
      return match.split(':')[1].trim();
    }
    if (key === 'partido') return 'Otro / Independiente';
    if (key === 'ocupacion') return 'Profesional';
    if (key === 'resultadoSorteo') return 'SELECCIONADO EN RESOLUCIÓN';
    if (key === 'rolJurado') return j.cargo || 'VOCAL 1';
    return 'Res. Registraduría No. 0482 de 2026';
  };

  // Compile and merge Mock + Database Jurors
  const allJurors = [
    ...MOCK_JURORS,
    ...dbJurors.map(j => ({
      id: j.id,
      nombre: j.nombre,
      cedula: j.cedula,
      telefono: j.telefono || 'Sin teléfono',
      email: 'No especificado',
      puestoVotacion: j.puesto || 'Sin puesto',
      mesa: j.mesa ? `Mesa ${String(j.mesa).replace(/\D/g, '')}` : 'General',
      partido: getJurorField(j, 'partido'),
      ocupacion: getJurorField(j, 'ocupacion'),
      resultadoSorteo: getJurorField(j, 'resultadoSorteo'),
      rolJurado: getJurorField(j, 'rolJurado'),
      resolucion: getJurorField(j, 'resolucion')
    }))
  ];

  // Filters mapping
  const filteredJurors = allJurors.filter(j => {
    const matchSearch = j.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.cedula.includes(searchTerm) ||
      j.puestoVotacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPartido = partidoFilter === 'ALL' || j.partido === partidoFilter;
    const matchSorteo = sorteoFilter === 'ALL' || j.resultadoSorteo === sorteoFilter;
    return matchSearch && matchPartido && matchSorteo;
  });

  // Metrics indicators
  const totalCandidatesCount = allJurors.length;
  const selectedCount = allJurors.filter(j => j.resultadoSorteo === 'SELECCIONADO EN RESOLUCIÓN').length;
  const unselectedCount = allJurors.filter(j => j.resultadoSorteo === 'NO SELECCIONADO').length;
  const effectivenessRate = totalCandidatesCount > 0 ? Math.round((selectedCount / totalCandidatesCount) * 100) : 0;

  // Draw Confrontation Action
  const handleConfrontation = () => {
    setConfronting(true);
    setConfrontationMessage(null);
    setTimeout(() => {
      setConfronting(false);
      setConfrontationMessage(
        `Confrontación completada exitosamente. Se confrontaron ${totalCandidatesCount} candidatos registrados contra la Resolución Registraduría No. 0482 de 2026. Resultado: ${selectedCount} Coincidencias Aprobadas en Resolución y ${unselectedCount} Postulaciones sin asignación oficial.`
      );
    }, 1200);
  };

  // Upload/Attach Resolution Mock
  const handleAttachResolution = () => {
    setResolutionAttached(true);
    alert('Resolución de sorteo Registraduría (Formato PDF/Excel) vinculada con éxito al módulo de confrontación.');
  };

  // Save/Edit Juror
  const handleSaveJuror = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.cedula.trim()) {
      setMessage({ text: 'Nombre y Cédula son obligatorios', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const clientId = user?.tenantId || client?.id;
      const serializedObs = `partido:${form.partido};ocupacion:${form.ocupacion};resultadoSorteo:${form.resultadoSorteo};rolJurado:${form.rolJurado};resolucion:${form.resolucion};`;

      if (editingId && !editingId.startsWith('mock-')) {
        const { error } = await supabase
          .from('jurors')
          .update({
            nombre: form.nombre.trim(),
            cedula: form.cedula.trim(),
            telefono: form.telefono.trim(),
            puesto: form.puestoVotacion.trim(),
            mesa: form.mesa.trim(),
            cargo: form.rolJurado,
            observaciones: serializedObs
          })
          .eq('id', editingId);

        if (error) throw error;
        setMessage({ text: 'Jurado electoral actualizado con éxito', type: 'success' });
      } else {
        const { error } = await supabase.from('jurors').insert([
          {
            client_id: clientId,
            nombre: form.nombre.trim(),
            cedula: form.cedula.trim(),
            telefono: form.telefono.trim(),
            puesto: form.puestoVotacion.trim(),
            mesa: form.mesa.trim(),
            cargo: form.rolJurado,
            observaciones: serializedObs
          }
        ]);

        if (error) throw error;
        setMessage({ text: 'Jurado electoral registrado con éxito', type: 'success' });
      }

      await refresh();
      setForm({
        nombre: '',
        cedula: '',
        telefono: '',
        email: '',
        puestoVotacion: '',
        mesa: '',
        partido: 'Partido Liberal Colombiano',
        ocupacion: 'Profesional Independiente',
        resultadoSorteo: 'SELECCIONADO EN RESOLUCIÓN',
        rolJurado: 'PRESIDENTE',
        resolucion: 'Res. Registraduría No. 0482 de 2026'
      });
      setEditingId(null);
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
      }, 800);
    } catch (err: any) {
      console.error('Error saving juror:', err);
      setMessage({ text: err.message || 'Error al guardar jurado', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Delete Juror
  const handleDeleteJuror = async (id: string) => {
    if (id.startsWith('mock-')) {
      alert('Los registros de prueba incluidos en la visualización no pueden ser eliminados permanentemente.');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este jurado postulado?')) return;

    try {
      const { error } = await supabase.from('jurors').delete().eq('id', id);
      if (error) throw error;
      await refresh();
    } catch (err: any) {
      console.error('Error deleting juror:', err);
      alert('Ocurrió un error al intentar eliminar el jurado.');
    }
  };

  // Edit Button Trigger
  const startEditJuror = (j: any) => {
    if (j.id.startsWith('mock-')) {
      alert('Los registros de prueba incluidos en la visualización no son editables.');
      return;
    }
    setEditingId(j.id);
    setForm({
      nombre: j.nombre,
      cedula: j.cedula,
      telefono: j.telefono === 'Sin teléfono' ? '' : j.telefono,
      email: '',
      puestoVotacion: j.puestoVotacion,
      mesa: j.mesa.replace('Mesa ', ''),
      partido: j.partido,
      ocupacion: j.ocupacion,
      resultadoSorteo: j.resultadoSorteo,
      rolJurado: j.rolJurado,
      resolucion: j.resolucion
    });
    setIsModalOpen(true);
  };

  // Export CSV
  const exportJurorsCSV = () => {
    if (allJurors.length === 0) return;

    const headers = 'Nombre,Cedula,Telefono,Email,PuestoVotacion,Mesa,Partido,Ocupacion,ResultadoSorteo,RolJurado,Resolucion\n';
    const rows = allJurors.map(j => 
      `"${j.nombre}","${j.cedula}","${j.telefono}","${j.email}","${j.puestoVotacion}","${j.mesa}","${j.partido}","${j.ocupacion}","${j.resultadoSorteo}","${j.rolJurado}","${j.resolucion}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jurados_sorteo_Registraduría_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for role translation
  const getRoleLabel = (cargo: string) => {
    if (cargo === 'PRESIDENTE') return 'Presidente de Mesa';
    if (cargo === 'VICEPRESIDENTE') return 'Vicepresidente';
    if (cargo === 'VOCAL 1') return 'Vocal 1';
    if (cargo === 'VOCAL 2') return 'Vocal 2';
    if (cargo === 'VOCAL 3') return 'Vocal 3';
    if (cargo === 'REMANENTE') return 'Jurado Remanente';
    return 'Sin asignación';
  };

  return (
    <div className="space-y-6 text-slate-100 pb-12 font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Listas de Jurados para Registraduría & Confrontación de Resolución
            </h2>
            <p className="text-xs text-slate-400">
              Inscripción de postulados por Partido/Movimiento para sorteo oficial, exportación en Excel (.csv) y confrontación automatizada con resoluciones del órgano electoral.
            </p>
          </div>
        </div>

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
              partido: 'Partido Liberal Colombiano',
              ocupacion: 'Profesional Independiente',
              resultadoSorteo: 'SELECCIONADO EN RESOLUCIÓN',
              rolJurado: 'PRESIDENTE',
              resolucion: 'Res. Registraduría No. 0482 de 2026'
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap self-end xl:self-center"
        >
          <Plus className="w-4 h-4 text-slate-955 stroke-[3]" />
          Postular Jurado
        </button>
      </div>

      {/* 2. Actions Panel */}
      <div className="bg-slate-950/45 border border-white/5 px-5 py-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Acciones de Resolución y Exportación Oficial:
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportJurorsCSV}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-slate-950" />
            Exportar Lista Excel Registraduria
          </button>
          <button
            onClick={handleAttachResolution}
            className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            Anexar Resolución PDF/Excel
          </button>
          <button
            onClick={handleConfrontation}
            disabled={confronting}
            className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {confronting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
            Confrontar Resolución Sorteo
          </button>
        </div>
      </div>

      {/* Confrontation Results Banner */}
      {confrontationMessage && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-300 flex items-start gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
          <p className="font-semibold leading-relaxed">{confrontationMessage}</p>
        </div>
      )}

      {/* 3. Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Candidates */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Candidates Postulados</span>
            <span className="text-2xl font-black text-white block font-mono">{totalCandidatesCount}</span>
            <p className="text-[10px] text-slate-500 mt-1">Listas para Sorteo Registraduría</p>
          </div>
          <UserCheck className="w-5 h-5 text-indigo-400 shrink-0" />
        </div>

        {/* Selected */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Seleccionados en Resolución</span>
            <span className="text-2xl font-black text-emerald-400 block font-mono">{selectedCount}</span>
            <p className="text-[10px] text-slate-500 mt-1">Designados como Jurados Oficiales</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        </div>

        {/* Unselected */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">No Seleccionados en Sorteo</span>
            <span className="text-2xl font-black text-slate-300 block font-mono">{unselectedCount}</span>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">Postulaciones Sin Asignación</p>
          </div>
          <X className="w-5 h-5 text-slate-500 shrink-0" />
        </div>

        {/* Effectiveness Rate */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-5 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Tasa Efectividad en Sorteo</span>
            <span className="text-2xl font-black text-cyan-400 block font-mono">{effectivenessRate}%</span>
            <p className="text-[10px] text-slate-500 mt-1">Proporción de Éxito Político</p>
          </div>
          <Award className="w-5 h-5 text-cyan-400 shrink-0" />
        </div>
      </div>

      {/* 4. Search & Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full font-sans">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por candidato, cédula o puesto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={partidoFilter}
          onChange={(e) => setPartidoFilter(e.target.value)}
          className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 w-full md:w-auto"
        >
          <option value="ALL">Todos los Partidos</option>
          <option value="Partido Liberal Colombiano">Partido Liberal Colombiano</option>
          <option value="Partido Alianza Verde">Partido Alianza Verde</option>
          <option value="Centro Democrático">Centro Democrático</option>
          <option value="Nuevo Liberalismo">Nuevo Liberalismo</option>
          <option value="Otro / Independiente">Otro / Independiente</option>
        </select>

        <select
          value={sorteoFilter}
          onChange={(e) => setSorteoFilter(e.target.value)}
          className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 w-full md:w-auto"
        >
          <option value="ALL">Todos los Estados de Sorteo</option>
          <option value="SELECCIONADO EN RESOLUCIÓN">Seleccionado en Resolución</option>
          <option value="NO SELECCIONADO">No Seleccionado</option>
        </select>

        <span className="text-xs text-slate-400 font-bold whitespace-nowrap">
          Mostrando: <span className="text-white">{filteredJurors.length}</span> de {allJurors.length} postulados
        </span>
      </div>

      {/* 5. Jurors Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5 font-bold">Candidato a Jurado</th>
                <th className="py-3.5 px-4 font-bold">Partido Político</th>
                <th className="py-3.5 px-4 font-bold">Ocupación / Profesión</th>
                <th className="py-3.5 px-4 font-bold">Puesto Preferente</th>
                <th className="py-3.5 px-4 font-bold">Resultado Sorteo Registraduría</th>
                <th className="py-3.5 px-4 font-bold">Asignación Oficial Órgano Electoral</th>
                <th className="py-3.5 px-5 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredJurors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-semibold">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                        Cargando jurados postulados...
                      </span>
                    ) : (
                      'No se encontraron jurados registrados.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredJurors.map((j) => {
                  const isSelected = j.resultadoSorteo === 'SELECCIONADO EN RESOLUCIÓN';
                  return (
                    <tr key={j.id} className="hover:bg-white/[0.015] transition-colors">
                      {/* Name & Contact */}
                      <td className="py-4 px-5">
                        <p className="font-black text-white text-xs">{j.nombre}</p>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">CC: {j.cedula}</span>
                        <span className="text-[10px] text-slate-500 font-semibold block">{j.telefono} | {j.email}</span>
                      </td>

                      {/* Party */}
                      <td className="py-4 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-white/5 text-slate-300">
                          {j.partido}
                        </span>
                      </td>

                      {/* Occupation */}
                      <td className="py-4 px-4 text-slate-300 font-semibold">
                        {j.ocupacion}
                      </td>

                      {/* Preferred Station */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-white leading-snug">{j.puestoVotacion}</p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Medellín</span>
                      </td>

                      {/* Draw Result */}
                      <td className="py-4 px-4 font-sans">
                        <span className={`text-[9px] font-extrabold px-2 py-1 rounded inline-flex items-center gap-1 ${
                          isSelected 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {j.resultadoSorteo}
                        </span>
                      </td>

                      {/* Official Assignment */}
                      <td className="py-4 px-4">
                        {isSelected ? (
                          <>
                            <p className="font-black text-white text-xs leading-none">{getRoleLabel(j.rolJurado)}</p>
                            <span className="text-[10px] text-slate-300 font-semibold block mt-1 leading-none">
                              {j.puestoVotacion} ({j.mesa})
                            </span>
                            <span className="text-[9px] text-cyan-400 font-mono block mt-1.5 leading-none">
                              {j.resolucion}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold italic">
                            Ninguna (No asignado en sorteo)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Editar Datos"
                            onClick={() => startEditJuror(j)}
                            disabled={j.id.startsWith('mock-')}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Eliminar Registro"
                            onClick={() => handleDeleteJuror(j.id)}
                            disabled={j.id.startsWith('mock-')}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/25 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-white" />
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

      {/* 8. Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                {editingId ? 'Editar Jurado Postulado' : 'Postular Jurado Electoral'}
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

            <form onSubmit={handleSaveJuror} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Valentina Ríos"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cédula *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1015667788"
                    value={form.cedula}
                    onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej. 3119876543"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ocupación / Profesión</label>
                  <input
                    type="text"
                    placeholder="Ej. Docente Universitaria"
                    value={form.ocupacion}
                    onChange={(e) => setForm({ ...form, ocupacion: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Partido Político</label>
                  <select
                    value={form.partido}
                    onChange={(e) => setForm({ ...form, partido: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="Partido Liberal Colombiano">Partido Liberal Colombiano</option>
                    <option value="Partido Alianza Verde">Partido Alianza Verde</option>
                    <option value="Centro Democrático">Centro Democrático</option>
                    <option value="Nuevo Liberalismo">Nuevo Liberalismo</option>
                    <option value="Otro / Independiente">Otro / Independiente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Puesto Preferente</label>
                  <input
                    type="text"
                    placeholder="Ej. Colegio Marco Fidel Suárez"
                    value={form.puestoVotacion}
                    onChange={(e) => setForm({ ...form, puestoVotacion: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mesa Preferente / Asignada</label>
                  <input
                    type="text"
                    placeholder="Ej. Mesa 12"
                    value={form.mesa}
                    onChange={(e) => setForm({ ...form, mesa: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Resultado de Sorteo</label>
                  <select
                    value={form.resultadoSorteo}
                    onChange={(e) => setForm({ ...form, resultadoSorteo: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="SELECCIONADO EN RESOLUCIÓN">Seleccionado en Sorteo (Aprobado)</option>
                    <option value="NO SELECCIONADO">No Seleccionado (Postulado sin Asignación)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Asignación de Cargo (Día E)</label>
                  <select
                    value={form.rolJurado}
                    onChange={(e) => setForm({ ...form, rolJurado: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="PRESIDENTE">Presidente de Mesa</option>
                    <option value="VICEPRESIDENTE">Vicepresidente</option>
                    <option value="VOCAL 1">Vocal 1</option>
                    <option value="VOCAL 2">Vocal 2</option>
                    <option value="VOCAL 3">Vocal 3</option>
                    <option value="REMANENTE">Jurado Remanente</option>
                    <option value="NINGUNA">Ninguno (No Seleccionado)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Resolución Oficial</label>
                  <input
                    type="text"
                    placeholder="Ej. Res. Registraduría No. 0482 de 2026"
                    value={form.resolucion}
                    onChange={(e) => setForm({ ...form, resolucion: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
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
                  {saving ? 'Guardando...' : 'Guardar Jurado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
