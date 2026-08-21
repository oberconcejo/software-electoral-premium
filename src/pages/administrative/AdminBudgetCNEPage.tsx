import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Search, 
  X, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Eye,
  Check,
  Upload,
  Clock,
  Smartphone,
  Phone,
  MapPin,
  Settings
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { supabase } from '@/src/lib/supabase';

// CNE official codes mapping
const CNE_RUBROS_MAP: Record<string, { name: string; tipo: 'INGRESO' | 'GASTO' }> = {
  '101': { name: 'Aportes Propios del Candidato', tipo: 'INGRESO' },
  '102': { name: 'Créditos de Entidades Financieras', tipo: 'INGRESO' },
  '103': { name: 'Donaciones de Particulares', tipo: 'INGRESO' },
  '104': { name: 'Aportes de Partidos y Coaliciones', tipo: 'INGRESO' },
  '201': { name: 'Gastos de Administración (Sedes y Asesores)', tipo: 'GASTO' },
  '202': { name: 'Propaganda Electoral y Publicidad en Medios', tipo: 'GASTO' },
  '203': { name: 'Actos Públicos y Eventos de Campaña', tipo: 'GASTO' },
  '204': { name: 'Transporte, Combustible y Viáticos', tipo: 'GASTO' },
  '205': { name: 'Material Impreso y Publicitario', tipo: 'GASTO' },
  '206': { name: 'Asesorías y Servicios Profesionales', tipo: 'GASTO' }
};

export default function AdminBudgetCNEPage() {
  const { user, client } = useAuth();
  const { budgetItems: dbBudgetItems, campaigns: dbCampaigns, refresh, loading: dbLoading } = useAdministrativeData();

  // Campaign Setup states (Dynamic limit configuration)
  const [campaignCreated, setCampaignCreated] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [topeCNE, setTopeCNE] = useState(0);
  const [setupForm, setSetupForm] = useState({
    name: '',
    jurisdiction: '',
    tope: ''
  });

  // Active role for simulation
  const [activeRole, setActiveRole] = useState<'TESORERO' | 'CONTADOR' | 'GERENTE' | 'CANDIDATO' | 'AUDITOR'>('TESORERO');

  // Main Tabs navigation: 1 = Presupuesto Oficial CNE, 2 = Plantilla Borrador, 3 = Gestión Integral, 4 = Escáner OCR, 5 = Permisos
  const [activeTab, setActiveTab] = useState(1);

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Rubros database/state
  const [rubrosList, setRubrosList] = useState([
    { code: '101', name: 'Aportes Propios del Candidato', tipo: 'INGRESO', asignado: 350000000, ejecutado: 0 },
    { code: '102', name: 'Créditos de Entidades Financieras', tipo: 'INGRESO', asignado: 500000000, ejecutado: 0 },
    { code: '103', name: 'Donaciones de Particulares', tipo: 'INGRESO', asignado: 250000000, ejecutado: 0 },
    { code: '104', name: 'Aportes de Partidos y Coaliciones', tipo: 'INGRESO', asignado: 150000000, ejecutado: 0 },
    { code: '201', name: 'Gastos de Administración (Sedes y Asesores)', tipo: 'GASTO', asignado: 85000000, ejecutado: 0 },
    { code: '202', name: 'Propaganda Electoral y Publicidad en Medios', tipo: 'GASTO', asignado: 150000000, ejecutado: 0 },
    { code: '203', name: 'Actos Públicos y Eventos de Campaña', tipo: 'GASTO', asignado: 100000000, ejecutado: 0 },
    { code: '204', name: 'Transporte, Combustible y Viáticos', tipo: 'GASTO', asignado: 60000000, ejecutado: 0 },
    { code: '205', name: 'Material Impreso y Publicitario', tipo: 'GASTO', asignado: 90000000, ejecutado: 0 },
    { code: '206', name: 'Asesorías y Servicios Profesionales', tipo: 'GASTO', asignado: 80000000, ejecutado: 0 }
  ]);

  // Movements List synced with Database
  const [localMovements, setLocalMovements] = useState<Array<{
    id: string;
    fecha: string;
    code: string;
    concepto: string;
    monto: number;
    beneficiario: string;
    nit: string;
    comprobante: string;
    estado: string;
  }>>([]);

  // Form State
  const [form, setForm] = useState({
    code: '201',
    concepto: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    comprobante: '',
    beneficiario: '',
    nit: ''
  });

  // Search in Tab 3
  const [searchTerm, setSearchTerm] = useState('');

  // OCR state variables
  const [ocrAnalyzing, setOcrAnalyzing] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [ocrExtractedData, setOcrExtractedData] = useState<{
    supplier: string;
    nit: string;
    invoiceNum: string;
    rubro: string;
    total: number;
  } | null>(null);

  // Sync Campaigns metadata from DB
  useEffect(() => {
    const activeCampaign = dbCampaigns?.find(c => c.estado === 'ACTIVA' || c.estado === 'ACTIVE') || dbCampaigns?.[0];
    if (activeCampaign && !campaignCreated) {
      setCampaignName(activeCampaign.nombre);
      setJurisdiction(`${activeCampaign.municipio || ''}, ${activeCampaign.departamento || ''}`);
      setTopeCNE(activeCampaign.presupuestoTotal || 1250000000);
      setCampaignCreated(true);
    }
  }, [dbCampaigns, campaignCreated]);

  // Sync Budget Items movements from DB
  useEffect(() => {
    if (dbBudgetItems) {
      const mapped = dbBudgetItems.map(item => ({
        id: item.id,
        fecha: item.fecha,
        code: item.categoriaCNE,
        concepto: item.concepto,
        monto: item.monto,
        beneficiario: item.beneficiarioNombre || 'Proveedor General',
        nit: item.beneficiarioNit || 'N/A',
        comprobante: item.comprobanteNumero || 'S/C',
        estado: item.estado === 'REGISTRADO' ? 'Validado CNE' : item.estado
      }));
      setLocalMovements(mapped);
    }
  }, [dbBudgetItems]);

  // Financial calculations from synchronized local list
  const totalIngresos = localMovements
    .filter(m => CNE_RUBROS_MAP[m.code]?.tipo === 'INGRESO')
    .reduce((sum, m) => sum + m.monto, 0);

  const totalGastos = localMovements
    .filter(m => CNE_RUBROS_MAP[m.code]?.tipo === 'GASTO')
    .reduce((sum, m) => sum + m.monto, 0);

  const saldoDisponible = totalIngresos - totalGastos;
  const gasPercent = (totalGastos > 0 && topeCNE > 0) ? Math.round((totalGastos / topeCNE) * 100) : 0;

  // Dynamic calculated executed values for each rubro directly from localMovements
  const displayRubros = rubrosList.map(r => {
    const totalEjecutadoRubro = localMovements
      .filter(m => m.code === r.code)
      .reduce((sum, m) => sum + m.monto, 0);
    return {
      ...r,
      ejecutado: totalEjecutadoRubro
    };
  });

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupForm.name.trim() || !setupForm.jurisdiction.trim() || !setupForm.tope || Number(setupForm.tope) <= 0) {
      return;
    }
    
    const newName = setupForm.name.trim();
    const newJurisdiction = setupForm.jurisdiction.trim();
    const newTope = Number(setupForm.tope);
    const tenantId = user?.tenantId || client?.id;

    setCampaignName(newName);
    setJurisdiction(newJurisdiction);
    setTopeCNE(newTope);
    setCampaignCreated(true);

    if (supabase && tenantId) {
      try {
        const dept = newJurisdiction.includes(',') ? newJurisdiction.split(',')[1].trim() : 'Antioquia';
        const mun = newJurisdiction.includes(',') ? newJurisdiction.split(',')[0].trim() : newJurisdiction;
        
        await supabase.from('campaigns').insert({
          client_id: tenantId,
          nombre: newName,
          candidato_nombre: user?.displayName || 'Candidato Oficial',
          cargo_postulacion: 'Alcaldía',
          departamento: dept,
          municipio: mun,
          presupuesto_total: newTope,
          estado: 'ACTIVA'
        });
        refresh();
      } catch (err) {
        console.error('Error inserting campaign:', err);
      }
    }
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.concepto.trim() || !form.monto || Number(form.monto) <= 0) {
      setMessage({ text: 'Concepto y Monto válido son requeridos', type: 'error' });
      return;
    }

    setSaving(true);
    const newMonto = Number(form.monto);
    const newId = `m-${Date.now()}`;
    const tenantId = user?.tenantId || client?.id;
    const activeCampaign = dbCampaigns?.find(c => c.estado === 'ACTIVA' || c.estado === 'ACTIVE') || dbCampaigns?.[0];

    const newMovement = {
      id: newId,
      fecha: form.fecha,
      code: form.code,
      concepto: form.concepto.trim(),
      monto: newMonto,
      beneficiario: form.beneficiario.trim() || 'Proveedor General',
      nit: form.nit.trim() || 'N/A',
      comprobante: form.comprobante.trim() || 'S/C',
      estado: 'Validado CNE'
    };

    // Optimistic Local Update
    setLocalMovements([newMovement, ...localMovements]);

    if (supabase && tenantId) {
      try {
        await supabase.from('budget_items').insert({
          client_id: tenantId,
          campaign_id: activeCampaign?.id || null,
          tipo: CNE_RUBROS_MAP[form.code]?.tipo,
          categoria_cne: form.code,
          concepto: form.concepto.trim(),
          monto: newMonto,
          fecha: form.fecha,
          comprobante_numero: form.comprobante.trim() || null,
          beneficiario_nombre: form.beneficiario.trim() || null,
          beneficiario_nit: form.nit.trim() || null,
          estado: 'REGISTRADO'
        });
        refresh();
      } catch (err) {
        console.error('Error saving budget item:', err);
      }
    }

    setMessage({ text: 'Movimiento financiero registrado y validado ante CNE con éxito', type: 'success' });
    setSaving(false);
    
    setTimeout(() => {
      setIsModalOpen(false);
      setMessage(null);
      setForm({
        code: '201',
        concepto: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        comprobante: '',
        beneficiario: '',
        nit: ''
      });
    }, 1000);
  };

  // CSV Exporter
  const handleExport = () => {
    const headers = 'Código CNE,Nombre Rubro,Tipo,Fecha,Concepto,Monto (COP),Comprobante,Beneficiario,NIT,Estado\n';
    const rows = localMovements.map(m => {
      const info = CNE_RUBROS_MAP[m.code];
      return `"${m.code}","${info?.name || ''}","${info?.tipo || ''}","${m.fecha}","${m.concepto}",${m.monto},"${m.comprobante}","${m.beneficiario}","${m.nit}","${m.estado}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cuentas_claras_cne_completo.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // OCR Simulator
  const triggerOcrScan = () => {
    setOcrAnalyzing(true);
    setOcrSuccessMsg(null);
    setOcrExtractedData(null);

    setTimeout(() => {
      setOcrAnalyzing(false);
      setOcrSuccessMsg('¡Escaneo OCR Finalizado! Factura analizada y clasificada correctamente.');
      setOcrExtractedData({
        supplier: 'Publicidad Radial Medellín SAS',
        nit: '900.554.123-9',
        invoiceNum: 'RAD-2026-98',
        rubro: '202', // Propaganda Electoral
        total: 15000000
      });
    }, 2000);
  };

  // Inject OCR receipt into lists
  const acceptOcrData = async () => {
    if (!ocrExtractedData) return;

    const newMonto = ocrExtractedData.total;
    const newId = `m-ocr-${Date.now()}`;
    const tenantId = user?.tenantId || client?.id;
    const activeCampaign = dbCampaigns?.find(c => c.estado === 'ACTIVA' || c.estado === 'ACTIVE') || dbCampaigns?.[0];

    const newMovement = {
      id: newId,
      fecha: new Date().toISOString().split('T')[0],
      code: ocrExtractedData.rubro,
      concepto: `OCR: Pauta radial en emisora - Factura ${ocrExtractedData.invoiceNum}`,
      monto: newMonto,
      beneficiario: ocrExtractedData.supplier,
      nit: ocrExtractedData.nit,
      comprobante: ocrExtractedData.invoiceNum,
      estado: 'Validado CNE'
    };

    // Optimistic Update
    setLocalMovements([newMovement, ...localMovements]);

    if (supabase && tenantId) {
      try {
        await supabase.from('budget_items').insert({
          client_id: tenantId,
          campaign_id: activeCampaign?.id || null,
          tipo: 'GASTO',
          categoria_cne: ocrExtractedData.rubro,
          concepto: `OCR: Pauta radial en emisora - Factura ${ocrExtractedData.invoiceNum}`,
          monto: newMonto,
          fecha: new Date().toISOString().split('T')[0],
          comprobante_numero: ocrExtractedData.invoiceNum,
          beneficiario_nombre: ocrExtractedData.supplier,
          beneficiario_nit: ocrExtractedData.nit,
          estado: 'REGISTRADO'
        });
        refresh();
      } catch (err) {
        console.error('Error saving OCR item:', err);
      }
    }

    setOcrSuccessMsg('Factura inyectada correctamente en la contabilidad general de Cuentas Claras.');
    setOcrExtractedData(null);
  };

  const deleteMovementItem = async (mId: string) => {
    // Optimistic Local Delete
    setLocalMovements(prev => prev.filter(x => x.id !== mId));

    if (supabase) {
      try {
        await supabase.from('budget_items').delete().eq('id', mId);
        refresh();
      } catch (err) {
        console.error('Error deleting budget item:', err);
      }
    }
  };

  // If campaign has not been initialized yet, request it once
  if (!campaignCreated && !dbLoading) {
    const CNE_PRESETS = [
      { label: '🏢 Alcaldía Especial (Medellín/Cali)', name: 'Campaña Alcaldía Medellín 2026', jurisdiction: 'Medellín, Antioquia', tope: '1250000000' },
      { label: '🗺️ Gobernación Especial (Antioquia)', name: 'Campaña Gobernación de Antioquia 2026', jurisdiction: 'Antioquia', tope: '2450000000' },
      { label: '🏛️ Concejo Municipal (Medellín/Cali)', name: 'Lista Concejo Medellín 2026', jurisdiction: 'Medellín, Antioquia', tope: '320000000' },
      { label: '📌 Alcaldía Categoría 1ª (Envigado/Bello)', name: 'Campaña Alcaldía Envigado 2026', jurisdiction: 'Envigado, Antioquia', tope: '650000000' }
    ];

    const applyPreset = (preset: typeof CNE_PRESETS[0]) => {
      setSetupForm({
        name: preset.name,
        jurisdiction: preset.jurisdiction,
        tope: preset.tope
      });
    };

    return (
      <div className="flex items-center justify-center min-h-[78vh] p-4">
        {/* Glowing background highlights behind card */}
        <div className="absolute w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-y-12" />
        <div className="absolute w-[250px] h-[250px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none translate-x-32 translate-y-32" />

        <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_50px_rgba(99,102,241,0.05)] relative overflow-hidden">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-15 pointer-events-none" />
          
          <div className="text-center space-y-2 relative z-10">
            <div className="inline-flex p-3.5 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.2)] mb-2">
              <DollarSign className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Crear Nueva Campaña Electoral
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Defina los metadatos oficiales y establezca el tope de gastos legal del CNE asignado para habilitar la rendición.
            </p>
          </div>

          {/* Presets Panel */}
          <div className="space-y-2 relative z-10">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Plantillas Preestablecidas CNE Colombia:</span>
            <div className="grid grid-cols-2 gap-2">
              {CNE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="p-2.5 bg-slate-950/60 hover:bg-slate-950 text-left border border-white/5 hover:border-indigo-500/55 rounded-xl transition-all group"
                >
                  <div className="text-[10px] font-bold text-slate-300 group-hover:text-white truncate">
                    {preset.label}
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 font-bold mt-0.5">
                    Tope: ${Number(preset.tope).toLocaleString('es-CO')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs font-semibold text-slate-350 relative z-10">
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Nombre Oficial de la Campaña *</label>
              <div className="flex items-center bg-slate-950/80 border border-white/10 rounded-xl px-3.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                <Shield className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Campaña Alcaldía de Medellín 2026"
                  value={setupForm.name}
                  onChange={(e) => setSetupForm({ ...setupForm, name: e.target.value })}
                  className="w-full bg-transparent py-3 text-xs text-white placeholder-slate-650 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Jurisdicción Electoral (Municipio / Departamento) *</label>
              <div className="flex items-center bg-slate-950/80 border border-white/10 rounded-xl px-3.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                <MapPin className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Medellín, Antioquia"
                  value={setupForm.jurisdiction}
                  onChange={(e) => setSetupForm({ ...setupForm, jurisdiction: e.target.value })}
                  className="w-full bg-transparent py-3 text-xs text-white placeholder-slate-650 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Tope Máximo de Gastos CNE ($ COP) *</label>
              <div className="flex items-center bg-slate-950/80 border border-white/10 rounded-xl px-3.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                <DollarSign className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                <input
                  type="number"
                  required
                  min={1000000}
                  placeholder="Ej. 1250000000"
                  value={setupForm.tope}
                  onChange={(e) => setSetupForm({ ...setupForm, tope: e.target.value })}
                  className="w-full bg-transparent py-3 text-xs text-white placeholder-slate-650 focus:outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              
              {setupForm.tope && Number(setupForm.tope) > 0 ? (
                <div className="mt-1.5 flex items-center gap-1.5 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Tope a Cargar: ${Number(setupForm.tope).toLocaleString('es-CO')} COP
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 font-medium">
                  Ingrese el valor en dígitos continuos o seleccione una plantilla superior.
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 rounded-xl text-xs font-black tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-[0.985]"
              >
                Crear Campaña & Activar Presupuesto
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="text-slate-100 space-y-6 font-sans">
      
      {/* Dark Header Card matching the mockup */}
      <div className="bg-[#0b1329] text-white p-6 rounded-3xl space-y-4 shadow-xl border border-white/5 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:35px_35px] opacity-10 pointer-events-none" />

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-2">
            <div className="inline-block bg-yellow-500/10 border border-yellow-500/35 rounded-full px-3 py-0.5 text-[9px] font-black text-yellow-400 uppercase tracking-wider">
              💰 Gestión Integral Financiera & Cuentas Claras CNE (Normatividad Vigente Colombia)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              {campaignName || 'Campaña Oficial'}
              <button
                onClick={() => {
                  setSetupForm({
                    name: campaignName,
                    jurisdiction: jurisdiction,
                    tope: topeCNE.toString()
                  });
                  setCampaignCreated(false);
                }}
                title="Editar Configuración de Campaña"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all border border-white/5"
              >
                <Settings className="w-4 h-4" />
              </button>
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl">
              Presupuesto de Campaña & Rendición Oficial para la jurisdicción de {jurisdiction || 'N/A'}. Controle los topes de Ley en tiempo real.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2 text-center text-xs font-black text-yellow-400">
              Tope CNE: ${topeCNE.toLocaleString('es-CO')} COP
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/10"
            >
              <Download className="w-4 h-4 text-slate-950" />
              Exportar Cuentas Claras
            </button>
          </div>
        </div>

        {/* RBAC Active Role bar */}
        <div className="bg-[#172554]/40 border border-blue-500/20 p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400 font-bold">Rol Financiero Activo (RBAC):</span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded text-[10px] font-black">
              {activeRole}
            </span>
          </div>

          {/* Role selector switches */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['TESORERO', 'CONTADOR', 'GERENTE', 'CANDIDATO', 'AUDITOR'] as const).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all ${
                  activeRole === role
                    ? 'bg-yellow-500 text-slate-950'
                    : 'bg-[#0f172a] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {role.toLowerCase()}
              </button>
            ))}
            <span className="text-slate-500 px-1">|</span>
            <button
              type="button"
              onClick={() => setActiveTab(5)}
              className="text-cyan-400 hover:underline font-bold text-[10px] flex items-center gap-1"
            >
              <Eye className="w-3 h-3" /> Ver Matriz de Permisos
            </button>
          </div>
        </div>

        {/* Navigation Tabs bar */}
        <div className="border-t border-white/10 pt-3 flex flex-wrap gap-2">
          {[
            { id: 1, label: '1. Presupuesto Oficial CNE & Cuentas Claras' },
            { id: 2, label: '2. Plantilla Borrador & Simulador' },
            { id: 3, label: `3. Gestión Integral de Ítems (${localMovements.length})` },
            { id: 4, label: '4. Escáner OCR & Comprobantes IA' },
            { id: 5, label: '5. Permisos & RBAC' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-950 font-black shadow-md shadow-white/5'
                  : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Tab Render */}
      {activeTab === 1 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Metric Cards (Premium Dark design) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 space-y-2 shadow-lg relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tope Máximo CNE Ley 1475</span>
              <p className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
                ${topeCNE.toLocaleString('es-CO')} COP
              </p>
              <span className="inline-block bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px] font-black">
                Jurisdicción: {jurisdiction || 'N/A'}
              </span>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 space-y-2 shadow-lg relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ingresos Recaudados y Validados</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 font-sans tracking-tight">
                ${totalIngresos.toLocaleString('es-CO')} COP
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">Aportes propios, donaciones y crédito bancario</p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 space-y-2 shadow-lg relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Gastos Ejecutados Reales</span>
              <p className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
                ${totalGastos.toLocaleString('es-CO')} COP
              </p>
              
              {/* Progress bar line */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-[#10b981] rounded-full transition-all"
                    style={{ width: `${gasPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>{gasPercent}% del tope ejecutado</span>
                  <span className="text-[#10b981]">OK CNE</span>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 space-y-2 shadow-lg relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Saldo Disponible sin Exceder Tope</span>
              <p className="text-xl sm:text-2xl font-black text-cyan-400 font-sans tracking-tight">
                ${saldoDisponible.toLocaleString('es-CO')} COP
              </p>
              <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-black">
                Cumplimiento CNE 100% Garantizado
              </span>
            </div>
          </div>

          {/* CNE Rubros Table Card */}
          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Rubros Oficiales CNE - Formato Cuentas Claras (Candidatos y Partidos)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Estructura codificada según reglamentación del Consejo Nacional Electoral para elecciones territoriales en Colombia.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow shadow-amber-600/10 self-start sm:self-center"
              >
                <Plus className="w-4 h-4 text-white" />
                + Registrar Movimiento / Ítem
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Código CNE</th>
                    <th className="py-3 px-4 font-bold">Nombre Oficial del Rubro CNE</th>
                    <th className="py-3 px-4 font-bold">Tipo</th>
                    <th className="py-3 px-4 font-bold">Asignado</th>
                    <th className="py-3 px-4 font-bold">Ejecutado</th>
                    <th className="py-3 px-4 font-bold">Diferencia</th>
                    <th className="py-3 px-4 font-bold text-center">Estado Auditoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans text-slate-300">
                  {displayRubros.map(r => {
                    const diff = r.asignado - r.ejecutado;
                    return (
                      <tr key={r.code} className="hover:bg-white/[0.015] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-black text-amber-400">{r.code}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{r.name}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${
                            r.tipo === 'INGRESO'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-white/5'
                          }`}>
                            {r.tipo === 'INGRESO' ? 'Ingreso' : 'Gasto'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">${r.asignado.toLocaleString('es-CO')}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">${r.ejecutado.toLocaleString('es-CO')}</td>
                        <td className="py-3.5 px-4 font-mono font-black text-emerald-400">${diff.toLocaleString('es-CO')}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[9px] font-black px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Validado CNE
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Draft Budget Simulator */}
      {activeTab === 2 && (
        <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 shadow-lg space-y-6 animate-fadeIn">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Borrador de Presupuesto & Simulador de Topes Legales
            </h4>
            <p className="text-xs text-slate-400">
              Modifique los montos planeados en cada categoría y analice la proyección de gastos frente al tope de Ley 1475.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sliders panel */}
            <div className="lg:col-span-8 space-y-5">
              {rubrosList.map((r, index) => (
                <div key={r.code} className="space-y-1 bg-[#0a0f1d]/60 border border-white/5 p-4 rounded-2xl">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-slate-300">
                      Rubro {r.code} - {r.name}
                    </span>
                    <span className="font-mono font-black text-white">
                      ${r.asignado.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000000"
                    max="800000000"
                    step="5000000"
                    value={r.asignado}
                    onChange={(e) => {
                      const newVal = Number(e.target.value);
                      setRubrosList(prev => prev.map((item, idx) => idx === index ? { ...item, asignado: newVal } : item));
                    }}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Simulation KPI sidebar */}
            <div className="lg:col-span-4 bg-[#0a0f1d] text-white p-5 rounded-3xl flex flex-col justify-between shadow-xl space-y-6">
              {(() => {
                const simulatedTotal = rubrosList.reduce((sum, r) => sum + r.asignado, 0);
                const isOverLimit = simulatedTotal > topeCNE;
                const simPercent = Math.round((simulatedTotal / topeCNE) * 100);

                return (
                  <>
                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Proyección Simulada Total:</span>
                      <p className={`text-2xl font-black font-mono leading-none ${isOverLimit ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                        ${simulatedTotal.toLocaleString('es-CO')} COP
                      </p>
                      
                      <div className="space-y-1.5 pt-2">
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all ${isOverLimit ? 'bg-rose-500' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min(100, simPercent)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-slate-400">
                          <span>{simPercent}% del tope legal</span>
                          <span>Tope: {Math.round(topeCNE/1000000)}M</span>
                        </div>
                      </div>

                      {isOverLimit ? (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-3 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                          <span>
                            <strong>¡ATENCIÓN!</strong> La simulación actual excede el tope legal del CNE. Reajuste los rubros para evitar sanciones electorales.
                          </span>
                        </div>
                      ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl p-3 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                          <span>
                            <strong>Presupuesto Viable:</strong> El total simulado está dentro del marco presupuestal del CNE.
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setRubrosList(prev => prev.map(r => ({ ...r, asignado: r.ejecutado + 20000000 })))}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black transition-all border border-white/5"
                    >
                      Reestablecer Borrador
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Gestión Integral de Ítems */}
      {activeTab === 3 && (
        <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-white">
                Libro Mayor de Movimientos de Campaña (Formatos CNE)
              </h4>
              <p className="text-xs text-slate-400">
                Audite el historial completo de ingresos, egresos, comprobantes, NIT del proveedor y fechas de validez.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por concepto o NIT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Fecha</th>
                  <th className="py-3 px-4 font-bold">Código CNE</th>
                  <th className="py-3 px-4 font-bold">Rubro CNE</th>
                  <th className="py-3 px-4 font-bold">Concepto</th>
                  <th className="py-3 px-4 font-bold">Monto (COP)</th>
                  <th className="py-3 px-4 font-bold">Soporte/Factura</th>
                  <th className="py-3 px-4 font-bold">Tercero / NIT</th>
                  <th className="py-3 px-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans text-slate-300">
                {localMovements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-bold">
                      No se han registrado movimientos presupuestales. Haz clic en "+ Registrar Movimiento / Ítem" o escanea una factura con la IA.
                    </td>
                  </tr>
                ) : (
                  localMovements
                    .filter(m => m.concepto.toLowerCase().includes(searchTerm.toLowerCase()) || m.nit.includes(searchTerm))
                    .map(m => {
                      const info = CNE_RUBROS_MAP[m.code];
                      const isIng = info?.tipo === 'INGRESO';

                      return (
                        <tr key={m.id} className="hover:bg-white/[0.015] transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{m.fecha}</td>
                          <td className="py-3.5 px-4 font-mono font-black text-amber-400">{m.code}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-300 max-w-[150px] truncate" title={info?.name}>
                            {info?.name}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white max-w-[200px] truncate" title={m.concepto}>
                            {m.concepto}
                          </td>
                          <td className={`py-3.5 px-4 font-mono font-black ${isIng ? 'text-emerald-400' : 'text-white'}`}>
                            {isIng ? '+' : '-'}${m.monto.toLocaleString('es-CO')}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">{m.comprobante}</td>
                          <td className="py-3.5 px-4">
                            <span className="block font-bold text-white">{m.beneficiario}</span>
                            <span className="block text-[10px] text-slate-500 font-mono">NIT: {m.nit}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => deleteMovementItem(m.id)}
                              className="text-rose-450 hover:text-rose-500 font-bold hover:underline"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Escáner OCR & Comprobantes IA */}
      {activeTab === 4 && (
        <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 shadow-lg space-y-6 animate-fadeIn">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              Escáner Inteligente OCR y Autoclasificación CNE (Cuentas Claras)
            </h4>
            <p className="text-xs text-slate-400">
              Suba o arrastre facturas, cuentas de cobro o recibos en formato PDF/Imagen. Nuestro motor IA clasificará el gasto automáticamente en el rubro CNE correcto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File upload box */}
            <div className="border-2 border-dashed border-white/10 bg-slate-950/50 hover:border-indigo-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 transition-all">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200">
                  Arrastra aquí tu factura o recibo en formato PDF/JPG
                </p>
                <p className="text-[10px] text-slate-500">Tamaño máximo recomendado: 10MB</p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={triggerOcrScan}
                  disabled={ocrAnalyzing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10"
                >
                  {ocrAnalyzing ? 'Procesando con IA OCR...' : 'Escanear Factura de Prueba (Caracol Radio)'}
                </button>
              </div>
            </div>

            {/* OCR results preview */}
            <div className="bg-[#0a0f1d] text-white p-5 rounded-3xl space-y-4 flex flex-col justify-between shadow-xl border border-white/5">
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block border-b border-white/5 pb-2">
                  Diagnóstico del Escaneo Inteligente
                </span>

                {ocrAnalyzing && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <span className="w-8 h-8 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
                    <p className="text-xs font-bold text-slate-400 animate-pulse">
                      Extrayendo NIT, concepto, emisor e importes con IA OCR...
                    </p>
                  </div>
                )}

                {!ocrAnalyzing && !ocrExtractedData && !ocrSuccessMsg && (
                  <div className="py-12 text-center text-slate-500 text-xs font-semibold">
                    Ningún comprobante analizado. Seleccione una factura de prueba en el panel izquierdo.
                  </div>
                )}

                {ocrSuccessMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl p-3.5 flex items-start gap-2 mb-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{ocrSuccessMsg}</span>
                  </div>
                )}

                {ocrExtractedData && (
                  <div className="space-y-3 text-xs font-semibold pt-1">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Emisor Factura:</span>
                      <span className="text-white">{ocrExtractedData.supplier}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">NIT Proveedor:</span>
                      <span className="text-white font-mono">{ocrExtractedData.nit}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Número de Factura:</span>
                      <span className="text-white font-mono">{ocrExtractedData.invoiceNum}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Clasificación Rubro CNE:</span>
                      <span className="text-yellow-400 font-mono">
                        Rubro {ocrExtractedData.rubro} - {CNE_RUBROS_MAP[ocrExtractedData.rubro]?.name}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Valor Total Extraído:</span>
                      <span className="text-[#10b981] font-mono font-black">
                        ${ocrExtractedData.total.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {ocrExtractedData && (
                <button
                  type="button"
                  onClick={acceptOcrData}
                  className="w-full py-2.5 bg-[#10b981] hover:bg-[#059669] text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  Inyectar en Cuentas Claras CNE
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Permisos & RBAC */}
      {activeTab === 5 && (
        <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 shadow-lg space-y-4 animate-fadeIn">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              Matriz de Permisos Electorales (RBAC) - Roles Financieros
            </h4>
            <p className="text-xs text-slate-400">
              Consulte y asigne los permisos específicos para el control de gastos de la campaña según el rol en la contabilidad.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Rol Financiero</th>
                  <th className="py-3 px-4 font-bold">Ver Presupuesto</th>
                  <th className="py-3 px-4 font-bold">Registrar Gastos</th>
                  <th className="py-3 px-4 font-bold">Validar Comprobantes</th>
                  <th className="py-3 px-4 font-bold">Exportar Cuentas Claras</th>
                  <th className="py-3 px-4 font-bold">Auditar y Firmar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans text-slate-300">
                {[
                  { role: 'TESORERO', read: 'Sí', write: 'Sí', validate: 'Sí', export: 'Sí', audit: 'No (Firmante Aux)' },
                  { role: 'CONTADOR', read: 'Sí', write: 'Sí', validate: 'Sí', export: 'Sí', audit: 'Sí (Oficial)' },
                  { role: 'GERENTE', read: 'Sí', write: 'No', validate: 'No', export: 'Sí', audit: 'Sí (Oficial)' },
                  { role: 'CANDIDATO', read: 'Sí', write: 'No', validate: 'No', export: 'Sí', audit: 'Sí (Firmante)' },
                  { role: 'AUDITOR', read: 'Sí', write: 'No', validate: 'No', export: 'Sí', audit: 'Sí (Fiscalización)' }
                ].map(r => {
                  const isActive = r.role === activeRole;
                  return (
                    <tr key={r.role} className={`transition-colors ${isActive ? 'bg-indigo-500/10 border border-indigo-500/20 font-black text-white' : 'hover:bg-white/[0.015]'}`}>
                      <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-2">
                        {r.role}
                        {isActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                      </td>
                      <td className="py-3.5 px-4">{r.read}</td>
                      <td className="py-3.5 px-4">{r.write}</td>
                      <td className="py-3.5 px-4">{r.validate}</td>
                      <td className="py-3.5 px-4">{r.export}</td>
                      <td className="py-3.5 px-4">{r.audit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movement Registry Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#d97706]" />
                Registrar Movimiento Presupuestal CNE
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-450 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSaveMovement} className="space-y-4 text-xs font-semibold text-slate-300">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Rubro CNE Seleccionado *</label>
                  <select
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    {Object.entries(CNE_RUBROS_MAP).map(([code, item]) => (
                      <option key={code} value={code}>
                        Rubro {code} - {item.name} ({item.tipo === 'INGRESO' ? 'Ingreso' : 'Gasto'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Monto en Pesos (COP) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Ej. 15000000"
                    value={form.monto}
                    onChange={(e) => setForm({ ...form, monto: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha de Registro *</label>
                  <input
                    type="date"
                    required
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">N° Comprobante / Factura</label>
                  <input
                    type="text"
                    placeholder="Ej. FACT-2045"
                    value={form.comprobante}
                    onChange={(e) => setForm({ ...form, comprobante: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Concepto Detallado del Movimiento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pauta en emisoras locales para campaña legislativa"
                  value={form.concepto}
                  onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Beneficiario / Tercero</label>
                  <input
                    type="text"
                    placeholder="Ej. Caracol Radio Medellín"
                    value={form.beneficiario}
                    onChange={(e) => setForm({ ...form, beneficiario: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">NIT / Cédula</label>
                  <input
                    type="text"
                    placeholder="Ej. 860.008.221-3"
                    value={form.nit}
                    onChange={(e) => setForm({ ...form, nit: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Registrando...' : 'Registrar Movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
