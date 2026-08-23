import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  Vote, 
  CheckCircle2, 
  X, 
  Save, 
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { apiClient } from '@/src/lib/apiClient';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { useTerritory } from '@/src/hooks/useTerritory';
import { Leader, Voter } from '@/src/types';
import { queryVotingLocation } from '@/src/services/votingLocationService';

export default function AdminLeadersVotersPage() {
  const { user, client } = useAuth();
  const { leaders, voters, refresh, loading: loadingData } = useAdministrativeData();
  const { zones, subdivisions, loading: loadingTerritory, loadingSubdivisions, refreshSubdivisions } = useTerritory();
  
  const location = useLocation();
  const initialTab = location.pathname.includes('/votantes') ? 'voters' : 'leaders';
  const [activeTab, setActiveTab] = useState<'leaders' | 'voters'>(initialTab);

  useEffect(() => {
    if (location.pathname.includes('/votantes')) {
      setActiveTab('voters');
    } else if (location.pathname.includes('/lideres')) {
      setActiveTab('leaders');
    }
  }, [location.pathname]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComuna, setSelectedComuna] = useState<string>('ALL');
  const [selectedIntention, setSelectedIntention] = useState<string>('ALL');
  
  // Modals state
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [isVoterModalOpen, setIsVoterModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Leader Form
  const [leaderForm, setLeaderForm] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
    zoneId: '',
    subdivisionId: '',
    puesto: '',
    mesa: '',
    metaVotos: 50,
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Voter Form
  const [voterForm, setVoterForm] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
    zoneId: '',
    subdivisionId: '',
    puesto: '',
    mesa: '',
    liderId: '',
    intencion: 'Voto Seguro' as 'Voto Seguro' | 'Probable' | 'Indeciso' | 'En Contra'
  });

  const [isQuerying, setIsQuerying] = useState(false);

  const handleLookupVoterInfo = async () => {
    const doc = voterForm.cedula.trim().replace(/[\.\,\s\-]/g, '');
    if (!doc) {
      setMessage({ text: 'Por favor, ingresa un número de cédula válido.', type: 'error' });
      return;
    }

    setIsQuerying(true);
    setMessage(null);

    try {
      const response = await queryVotingLocation(doc);
      
      if (response.status === 'ENCONTRADO') {
        let matchedZoneId = '';
        
        // Try to match returned municipio to one of our zones
        if (response.municipio && response.municipio !== 'No disponible') {
          const match = zones.find(z => 
            z.nombre.toLowerCase().includes(response.municipio!.toLowerCase()) ||
            response.municipio!.toLowerCase().includes(z.nombre.toLowerCase())
          );
          if (match) {
            matchedZoneId = match.id;
            refreshSubdivisions();
          }
        }

        setVoterForm(prev => ({
          ...prev,
          nombre: response.nombreCompleto || '',
          puesto: response.puestoVotacion || '',
          mesa: response.mesa || '',
          zoneId: matchedZoneId || prev.zoneId
        }));
        
        setMessage({ text: 'Datos cargados exitosamente desde el censo electoral.', type: 'success' });
      } else {
        setMessage({ text: response.message || 'No se encontró información para esta cédula en la Registraduría.', type: 'error' });
      }
    } catch (err: any) {
      console.error('Error querying voting location:', err);
      setMessage({ text: 'Ocurrió un error al realizar la consulta. Inténtalo de nuevo.', type: 'error' });
    } finally {
      setIsQuerying(false);
    }
  };

  // Handle Zone Change for Forms
  const handleZoneChange = (type: 'leader' | 'voter', zoneId: string) => {
    if (type === 'leader') {
      setLeaderForm({ ...leaderForm, zoneId, subdivisionId: '' });
    } else {
      setVoterForm({ ...voterForm, zoneId, subdivisionId: '' });
    }
    
    if (zoneId) {
      refreshSubdivisions();
    }
  };

  // Filtered Leaders
  const filteredLeaders = leaders.filter(l => {
    const matchSearch = l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.cedula.includes(searchTerm) ||
      (l.barrio && l.barrio.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchComuna = selectedComuna === 'ALL' || l.comuna === selectedComuna;
    return matchSearch && matchComuna;
  });

  // Filtered Voters
  const filteredVoters = voters.filter(v => {
    const matchSearch = v.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cedula.includes(searchTerm) ||
      (v.barrio && v.barrio.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchComuna = selectedComuna === 'ALL' || v.comuna === selectedComuna;
    const matchIntention = selectedIntention === 'ALL' || v.intencion === selectedIntention;
    return matchSearch && matchComuna && matchIntention;
  });

  const handleSaveLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!leaderForm.nombre.trim() || !leaderForm.cedula.trim()) {
      setMessage({ text: 'Nombre y Cédula son obligatorios', type: 'error' });
      return;
    }

    if (!leaderForm.password) {
      setMessage({ text: 'La contraseña es obligatoria', type: 'error' });
      return;
    }

    if (!leaderForm.confirmPassword) {
      setMessage({ text: 'Confirma la contraseña', type: 'error' });
      return;
    }

    if (leaderForm.password !== leaderForm.confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }

    if (leaderForm.password.length < 6) {
      setMessage({ text: 'La contraseña debe tener al menos 6 caracteres', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/leaders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          nombre: leaderForm.nombre.trim(),
          cedula: leaderForm.cedula.trim(),
          telefono: leaderForm.telefono.trim(),
          email: leaderForm.email.trim(),
          zoneId: leaderForm.zoneId || null,
          subdivisionId: leaderForm.subdivisionId || null,
          puesto: leaderForm.puesto.trim(),
          mesa: leaderForm.mesa.trim(),
          metaVotos: Number(leaderForm.metaVotos) || 50,
          password: leaderForm.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar líder');
      }

      setMessage({ text: 'Líder registrado con éxito', type: 'success' });
      await refresh();
      setLeaderForm({
        nombre: '',
        cedula: '',
        telefono: '',
        email: '',
        zoneId: '',
        subdivisionId: '',
        puesto: '',
        mesa: '',
        metaVotos: 50,
        password: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        setIsLeaderModalOpen(false);
        setMessage(null);
      }, 800);
    } catch (err: any) {
      console.error('Error saving leader:', err);
      setMessage({ text: err.message || 'Error al guardar líder', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterForm.nombre.trim() || !voterForm.cedula.trim()) {
      setMessage({ text: 'Nombre y Cédula son obligatorios', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const clientId = user?.tenantId || client?.id;
      const selectedZone = zones.find(z => z.id === voterForm.zoneId);
      const selectedSub = subdivisions.find(s => s.id === voterForm.subdivisionId);

      const error = null;
      try { await apiClient.post('/api/voters/voters', {
          client_id: clientId,
          nombre: voterForm.nombre.trim(),
          cedula: voterForm.cedula.trim(),
          telefono: voterForm.telefono.trim(),
          email: voterForm.email.trim(),
          zone_id: voterForm.zoneId || null,
          subdivision_id: voterForm.subdivisionId || null,
          comuna: selectedZone?.nombre || '',
          barrio: selectedSub?.nombre || '',
          puesto: voterForm.puesto.trim(),
          mesa: voterForm.mesa.trim(),
          lider_id: voterForm.liderId ? voterForm.liderId : null,
          intencion: voterForm.intencion,
          status: 'ACTIVE'
        }); } catch (e) { console.error(e); }

      if (error) throw error;

      setMessage({ text: 'Votante registrado con éxito', type: 'success' });
      await refresh();
      setVoterForm({
        nombre: '',
        cedula: '',
        telefono: '',
        email: '',
        zoneId: '',
        subdivisionId: '',
        puesto: '',
        mesa: '',
        liderId: '',
        intencion: 'Voto Seguro'
      });
      setTimeout(() => {
        setIsVoterModalOpen(false);
        setMessage(null);
      }, 800);
    } catch (err: any) {
      console.error('Error saving voter:', err);
      setMessage({ text: err.message || 'Error al guardar votante', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = (type: 'leaders' | 'voters') => {
    const items = type === 'leaders' ? filteredLeaders : filteredVoters;
    if (items.length === 0) return;

    let headers = '';
    let rows = '';

    if (type === 'leaders') {
      headers = 'Nombre,Cedula,Telefono,Email,Comuna,Barrio,Puesto,Mesa,MetaVotos\n';
      rows = filteredLeaders.map(l => 
        `"${l.nombre}","${l.cedula}","${l.telefono || ''}","${l.email || ''}","${l.comuna || ''}","${l.barrio || ''}","${l.puesto || ''}","${l.mesa || ''}",${l.metaVotos}`
      ).join('\n');
    } else {
      headers = 'Nombre,Cedula,Telefono,Email,Comuna,Barrio,Puesto,Mesa,IntencionVoto\n';
      rows = filteredVoters.map(v => 
        `"${v.nombre}","${v.cedula}","${v.telefono || ''}","${v.email || ''}","${v.comuna || ''}","${v.barrio || ''}","${v.puesto || ''}","${v.mesa || ''}","${v.intencion}"`
      ).join('\n');
    }

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_electoral_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            {activeTab === 'leaders' ? 'Líderes Barriales' : 'Censo de Votantes'}
          </h2>
          <p className="text-xs text-slate-400">
            {activeTab === 'leaders' 
              ? 'Control de coordinadores comunitarios y asignación territorial.'
              : 'Registro de fidelización electoral y referidos.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(activeTab)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            Exportar CSV
          </button>
          {activeTab === 'leaders' ? (
            <button
              onClick={() => setIsLeaderModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              Nuevo Líder
            </button>
          ) : (
            <button
              onClick={() => setIsVoterModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              Nuevo Votante
            </button>
          )}
        </div>
      </div>


      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o barrio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {activeTab === 'voters' && (
          <select
            value={selectedIntention}
            onChange={(e) => setSelectedIntention(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
          >
            <option value="ALL">Todas las Intenciones</option>
            <option value="Voto Seguro">Voto Seguro</option>
            <option value="Probable">Probable</option>
            <option value="Indeciso">Indeciso</option>
            <option value="En Contra">En Contra</option>
          </select>
        )}
      </div>

      {/* Main Table View */}
      {activeTab === 'leaders' ? (
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Líder</th>
                  <th className="py-3 px-4 font-semibold">Cédula</th>
                  <th className="py-3 px-4 font-semibold">Contacto</th>
                  <th className="py-3 px-4 font-semibold">Ubicación</th>
                  <th className="py-3 px-4 font-semibold">Puesto / Mesa</th>
                  <th className="py-3 px-4 font-semibold text-center">Meta Votos</th>
                  <th className="py-3 px-4 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeaders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No se encontraron líderes registrados. Haz clic en "Nuevo Líder" para agregar uno.
                    </td>
                  </tr>
                ) : (
                  filteredLeaders.map((leader) => (
                    <tr key={leader.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {leader.nombre}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{leader.cedula}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {leader.telefono && <span className="block">{leader.telefono}</span>}
                        {leader.email && <span className="block text-[11px] text-slate-500">{leader.email}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {leader.comuna && <span className="font-semibold">{leader.comuna} - </span>}
                        {leader.barrio || 'Sin barrio'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {leader.puesto ? `${leader.puesto} (M: ${leader.mesa || 'General'})` : 'Por asignar'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-indigo-400">
                        {leader.metaVotos}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {leader.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Votante</th>
                  <th className="py-3 px-4 font-semibold">Cédula</th>
                  <th className="py-3 px-4 font-semibold">Teléfono</th>
                  <th className="py-3 px-4 font-semibold">Ubicación</th>
                  <th className="py-3 px-4 font-semibold">Puesto / Mesa</th>
                  <th className="py-3 px-4 font-semibold text-center">Intención</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredVoters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No se encontraron votantes registrados en el censo.
                    </td>
                  </tr>
                ) : (
                  filteredVoters.map((voter) => (
                    <tr key={voter.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {voter.nombre}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{voter.cedula}</td>
                      <td className="py-3.5 px-4 text-slate-400">{voter.telefono || 'Sin teléfono'}</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {voter.comuna && <span className="font-semibold">{voter.comuna} - </span>}
                        {voter.barrio || 'Sin barrio'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {voter.puesto ? `${voter.puesto} (M: ${voter.mesa || 'Todas'})` : 'Por verificar'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          voter.intencion === 'Voto Seguro' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : voter.intencion === 'Probable'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : voter.intencion === 'Indeciso'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {voter.intencion}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Leader Modal */}
      {isLeaderModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="relative w-full max-w-7xl w-[95vw] h-[95vh] flex flex-col bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden">
            {/* Glowing background highlights behind card */}
            <div className="absolute w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-24 -translate-x-24" />
            <div className="absolute w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none bottom-0 right-0 translate-x-32 translate-y-32" />
            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-15 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Registrar Nuevo Líder
                </h3>
              </div>
              <button onClick={() => setIsLeaderModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="relative z-10 flex-1 overflow-y-auto p-8">
              {message && (
                <div className={`p-4 mb-6 rounded-2xl text-sm flex items-center gap-3 shadow-lg ${
                  message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {message.text}
                </div>
              )}

              <form id="leader-form" onSubmit={handleSaveLeader} className="space-y-8">
                
                {/* Sección 1: Información Personal */}
                <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 sm:p-8">
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                    Sección 1: Información Personal
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Carlos Mendoza"
                        value={leaderForm.nombre}
                        onChange={(e) => setLeaderForm({ ...leaderForm, nombre: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Cédula de Ciudadanía *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 1098234567"
                        value={leaderForm.cedula}
                        onChange={(e) => setLeaderForm({ ...leaderForm, cedula: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Teléfono</label>
                      <input
                        type="tel"
                        placeholder="Ej. 3124567890"
                        value={leaderForm.telefono}
                        onChange={(e) => setLeaderForm({ ...leaderForm, telefono: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Correo Electrónico</label>
                      <input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={leaderForm.email}
                        onChange={(e) => setLeaderForm({ ...leaderForm, email: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 2: Ubicación */}
                <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 sm:p-8">
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                    Sección 2: Ubicación y Metas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Circunscripción / Municipio *</label>
                      <select
                        required
                        value={leaderForm.zoneId}
                        onChange={(e) => handleZoneChange('leader', e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                      >
                        <option value="">Seleccione circunscripción</option>
                        {zones.map(z => (
                          <option key={z.id} value={z.id}>{z.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Corregimiento / Vereda *</label>
                      <select
                        required
                        disabled={!leaderForm.zoneId || loadingSubdivisions}
                        value={leaderForm.subdivisionId}
                        onChange={(e) => setLeaderForm({ ...leaderForm, subdivisionId: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {!leaderForm.zoneId ? (
                          <option value="">Seleccione primero la circunscripción</option>
                        ) : loadingSubdivisions ? (
                          <option value="">Cargando corregimientos y veredas...</option>
                        ) : subdivisions.length === 0 ? (
                          <option value="">No hay corregimientos o veredas disponibles</option>
                        ) : (
                          <>
                            <option value="">Seleccione corregimiento o vereda</option>
                            <optgroup label="Corregimientos">
                              {subdivisions.filter(s => s.tipo === 'CORREGIMIENTO').map(s => (
                                <option key={s.id} value={s.id}>{s.nombre}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Veredas">
                              {subdivisions.filter(s => s.tipo === 'VEREDA').map(s => (
                                <option key={s.id} value={s.id}>{s.nombre}</option>
                              ))}
                            </optgroup>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Puesto de Votación</label>
                      <input
                        type="text"
                        placeholder="Ej. Colegio Santander"
                        value={leaderForm.puesto}
                        onChange={(e) => setLeaderForm({ ...leaderForm, puesto: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Meta de Votos Comprometida</label>
                      <input
                        type="number"
                        min={1}
                        value={leaderForm.metaVotos}
                        onChange={(e) => setLeaderForm({ ...leaderForm, metaVotos: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 3: Credenciales de Acceso */}
                <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 sm:p-8">
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                    Sección 3: Credenciales de Acceso
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Contraseña *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Ingrese una contraseña"
                          value={leaderForm.password}
                          onChange={(e) => setLeaderForm({ ...leaderForm, password: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Confirmar Contraseña *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          placeholder="Repita la contraseña"
                          value={leaderForm.confirmPassword}
                          onChange={(e) => setLeaderForm({ ...leaderForm, confirmPassword: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer with Actions */}
            <div className="relative z-10 flex items-center justify-end gap-4 px-8 py-5 border-t border-white/10 bg-slate-900/50">
              <button
                type="button"
                onClick={() => setIsLeaderModalOpen(false)}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="leader-form"
                disabled={saving}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold flex items-center gap-2 shadow-[0_10px_20px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_10px_20px_-10px_rgba(99,102,241,0.8)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Guardando...' : 'Guardar Líder'}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Create Voter Modal */}
      {isVoterModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="relative w-full max-w-7xl w-[95vw] h-[95vh] flex flex-col bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden">
            {/* Glowing background highlights behind card */}
            <div className="absolute w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-24 -translate-x-24" />
            <div className="absolute w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none bottom-0 right-0 translate-x-32 translate-y-32" />
            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-15 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="inline-flex p-3 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <Vote className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Registrar Nuevo Votante
                </h3>
              </div>
              <button onClick={() => setIsVoterModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="relative z-10 flex-1 overflow-y-auto p-8">
              {message && (
                <div className={`p-4 mb-6 rounded-2xl text-sm flex items-center gap-3 shadow-lg ${
                  message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {message.text}
                </div>
              )}

              <form id="voter-form" onSubmit={handleSaveVoter} className="space-y-8">
                
                {/* Sección 1: Información Básica */}
                <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 sm:p-8">
                  <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                    Información Básica
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Ana Lucía Gómez"
                        value={voterForm.nombre}
                        onChange={(e) => setVoterForm({ ...voterForm, nombre: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Cédula de Ciudadanía *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Ej. 1098456123"
                          value={voterForm.cedula}
                          onChange={(e) => setVoterForm({ ...voterForm, cedula: e.target.value })}
                          className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleLookupVoterInfo}
                          disabled={isQuerying || !voterForm.cedula}
                          className="px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
                        >
                          {isQuerying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Consultar'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Teléfono *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 3109876543"
                        value={voterForm.telefono}
                        onChange={(e) => setVoterForm({ ...voterForm, telefono: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Correo Electrónico</label>
                      <input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={voterForm.email}
                        onChange={(e) => setVoterForm({ ...voterForm, email: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Líder Asignado</label>
                      <select
                        value={voterForm.liderId}
                        onChange={(e) => setVoterForm({ ...voterForm, liderId: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="">Sin líder asignado (Registro Directo)</option>
                        {leaders.map(l => (
                          <option key={l.id} value={l.id}>{l.nombre} ({l.comuna || 'General'})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Intención de Voto</label>
                      <select
                        value={voterForm.intencion}
                        onChange={(e) => setVoterForm({ ...voterForm, intencion: e.target.value as any })}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="Voto Seguro">Voto Seguro</option>
                        <option value="Probable">Probable</option>
                        <option value="Indeciso">Indeciso</option>
                        <option value="En Contra">En Contra</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sección 2: Información Electoral */}
                <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 sm:p-8 relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                      Información Electoral
                    </h4>
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                      Información obtenida mediante consulta electoral
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">Zona Electoral / Municipio</label>
                      <input
                        type="text"
                        readOnly
                        placeholder="No consultado"
                        value={zones.find(z => z.id === voterForm.zoneId)?.nombre || ''}
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-sm text-slate-300 outline-none cursor-not-allowed opacity-80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">Corregimiento / Vereda</label>
                      <input
                        type="text"
                        readOnly
                        placeholder="No consultado"
                        value={subdivisions.find(s => s.id === voterForm.subdivisionId)?.nombre || ''}
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-sm text-slate-300 outline-none cursor-not-allowed opacity-80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">Puesto de Votación</label>
                      <input
                        type="text"
                        readOnly
                        placeholder="No consultado"
                        value={voterForm.puesto}
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-sm text-slate-300 outline-none cursor-not-allowed opacity-80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">Mesa Electoral</label>
                      <input
                        type="text"
                        readOnly
                        placeholder="No consultado"
                        value={voterForm.mesa}
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-sm text-slate-300 outline-none cursor-not-allowed opacity-80 font-mono"
                      />
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer with Actions */}
            <div className="relative z-10 flex items-center justify-end gap-4 px-8 py-5 border-t border-white/10 bg-slate-900/50">
              <button
                type="button"
                onClick={() => setIsVoterModalOpen(false)}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="voter-form"
                disabled={saving}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold flex items-center gap-2 shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_10px_20px_-10px_rgba(16,185,129,0.8)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Guardando...' : 'Guardar Votante'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
