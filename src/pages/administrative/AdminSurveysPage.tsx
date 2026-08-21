import React, { useState } from 'react';
import { 
  BarChart3, 
  Plus, 
  Search, 
  CheckCircle2, 
  X, 
  Save, 
  AlertCircle, 
  Calendar, 
  Users, 
  FileText,
  PieChart,
  TrendingUp,
  Activity,
  MapPin,
  Globe,
  Sparkles,
  Calculator,
  Compass,
  Signal,
  Loader2,
  Sliders,
  Trash2,
  UserPlus,
  Smartphone,
  Phone,
  Clock
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useAdministrativeData } from '@/src/hooks/useAdministrativeData';
import { Survey } from '@/src/types';

// Mock Surveys to match the exact mockup dashboard data
const MOCK_SURVEYS = [
  {
    id: 'mock-1',
    codigo: 'ENC-2026-001',
    tipo: 'Tracking Poll',
    titulo: 'Primer Tracking Semanal de Intención de Voto Alcaldía',
    respuestasObtenidas: 840,
    tamanoMuestra: 1200,
    metodologia: 'Presencial (CAPI)',
    cobertura: 'Municipio Principal - 12 Comunas',
    estado: 'ACTIVA',
    fechaFin: '2026-09-15'
  },
  {
    id: 'mock-2',
    codigo: 'SND-2026-004',
    tipo: 'Sondeo Flash',
    titulo: 'Sondeo Digital de Percepción sobre Propuestas de Movilidad',
    respuestasObtenidas: 2150,
    tamanoMuestra: 2500,
    metodologia: 'Digital / WhatsApp',
    cobertura: 'Zonas Urbana y Metropolitana',
    estado: 'ACTIVA',
    fechaFin: '2026-09-05'
  },
  {
    id: 'mock-3',
    codigo: 'ENC-2026-002',
    tipo: 'Encuesta Temática',
    titulo: 'Estudio de Percepción y Prioridades en Seguridad Ciudadana',
    respuestasObtenidas: 600,
    tamanoMuestra: 600,
    metodologia: 'Presencial (CAPI)',
    cobertura: 'Comunas de Alta Prioridad',
    estado: 'CERRADA',
    fechaFin: '2026-08-10'
  },
  {
    id: 'mock-4',
    codigo: 'ENC-2026-003',
    tipo: 'Tracking Poll',
    titulo: 'Encuesta Telefónica de Imagen Favorable y Conocimiento',
    respuestasObtenidas: 0,
    tamanoMuestra: 1000,
    metodologia: 'Telefónica (CATI)',
    cobertura: 'Cobertura Metropolitana',
    estado: 'BORRADOR',
    fechaFin: '2026-10-01'
  }
];

// Mock Pollsters (Encuestadores)
// Mock Pollsters (Encuestadores)
const MOCK_POLLSTERS = [
  { 
    id: 'p-1', 
    nombre: 'Carlos Mario Mendoza', 
    cedula: '1032448912', 
    telefono: '+57 312 458 9012', 
    estado: 'ACTIVO', 
    cobertura: 'Comuna 1 - Centro Histórico', 
    avance: 38, 
    meta: 40, 
    bateria: 88, 
    lat: 44, 
    lng: 54, 
    location: '6.2442, -75.5812', 
    address: 'Calle 50 # 45-12, Parque Berrio', 
    precision: '±4.2m', 
    imei: '864201849281823', 
    code: 'CNE-ENC-2026-0891', 
    status: 'En Zona OK',
    time: 'Hace 3 min'
  },
  { 
    id: 'p-2', 
    nombre: 'Laura Restrepo Gómez', 
    cedula: '1017234901', 
    telefono: '+57 300 892 1104', 
    estado: 'META CUMPLIDA', 
    cobertura: 'Comuna 3 - Manrique / Noreste', 
    avance: 40, 
    meta: 40, 
    bateria: 95, 
    lat: 25, 
    lng: 48, 
    location: '6.2510, -75.5680', 
    address: 'Carrera 50 # 52-40, Prado Centro', 
    precision: '±3.5m', 
    imei: '864201049900548', 
    code: 'CNE-ENC-2026-0045', 
    status: 'En Zona OK',
    time: 'Hace 12 min'
  },
  { 
    id: 'p-3', 
    nombre: 'Andrés Felipe Silva', 
    cedula: '1020412890', 
    telefono: '+57 314 670 4421', 
    estado: 'EN RECORRIDO', 
    cobertura: 'Comuna 5 - Castilla / Sur', 
    avance: 29, 
    meta: 40, 
    bateria: 62, 
    lat: 50, 
    lng: 20, 
    location: '6.2410, -75.5890', 
    address: 'Calle 44 # 70-15, Laureles', 
    precision: '±5.1m', 
    imei: '864201049900222', 
    code: 'CNE-ENC-2026-0023', 
    status: 'Fuera de Perímetro',
    time: 'Hace 1 min',
    warning: 'Ubicación reportada a 850m fuera de la geocerca de Comuna 5'
  },
  { 
    id: 'p-4', 
    nombre: 'Diana Patricia Osorio', 
    cedula: '1044567890', 
    telefono: '+57 310 765 4321', 
    estado: 'EN RECORRIDO', 
    cobertura: 'Comuna 14 - El Poblado', 
    avance: 28, 
    meta: 40, 
    bateria: 67, 
    lat: 80, 
    lng: 65, 
    location: '6.2100, -75.5700', 
    address: 'Carrera 43A # 1-50, El Poblado', 
    precision: '±2.9m', 
    imei: '864201049900111', 
    code: 'CNE-ENC-2026-0078', 
    status: 'En Zona OK',
    time: 'Hace 8 min'
  },
  { 
    id: 'p-5', 
    nombre: 'Esteban Darío Muñoz', 
    cedula: '1055678901', 
    telefono: '+57 312 345 6789', 
    estado: 'ACTIVO', 
    cobertura: 'Comuna 7 - Robledo', 
    avance: 32, 
    meta: 40, 
    bateria: 78, 
    lat: 15, 
    lng: 35, 
    location: '6.2800, -75.5750', 
    address: 'Calle 100 # 65-10, Castilla', 
    precision: '±4.8m', 
    imei: '864201049900999', 
    code: 'CNE-ENC-2026-0089', 
    status: 'En Zona OK',
    time: 'Hace 2 min'
  },
  { 
    id: 'p-6', 
    nombre: 'Fanny Inés Salazar', 
    cedula: '1066789012', 
    telefono: '+57 317 890 1234', 
    estado: 'FUERA DE LÍNEA', 
    cobertura: 'Comuna 10 - La Candelaria', 
    avance: 12, 
    meta: 40, 
    bateria: 15, 
    lat: 58, 
    lng: 85, 
    location: '6.2450, -75.5600', 
    address: 'Calle 52 # 43-25, La Candelaria', 
    precision: '±6.2m', 
    imei: '864201049900444', 
    code: 'CNE-ENC-2026-0120', 
    status: 'Fuera de Perímetro',
    time: 'Hace 45 min'
  }
];

export default function AdminSurveysPage() {
  const { user, client } = useAuth();
  const { surveys: dbSurveys, refresh, loading } = useAdministrativeData();

  // Active Tab: 1 = Panel de Estudios, 2 = Gestión de Encuestadores, 3 = Monitoreo GPS, 4 = Diseñador IA, 5 = Calculadora Muestral, 6 = Inteligencia & IA
  const [activeTab, setActiveTab] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('ALL');
  const [selectedPollsterId, setSelectedPollsterId] = useState('p-1');
  const [mapStyle, setMapStyle] = useState('Oscuro CNE');
  const [mapZoom, setMapZoom] = useState(15);
  const [isDigitalIdOpen, setIsDigitalIdOpen] = useState(false);
  const [pollstersList, setPollstersList] = useState(MOCK_POLLSTERS);
  const [pollsterSearchTerm, setPollsterSearchTerm] = useState('');
  const [selectedStudyFilter, setSelectedStudyFilter] = useState('ALL');

  // Modal pollster registration state
  const [isPollsterModalOpen, setIsPollsterModalOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Survey Form
  const [surveyForm, setSurveyForm] = useState({
    titulo: '',
    descripcion: '',
    tamanoMuestra: 500,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '2026-09-30',
    estado: 'ACTIVA' as 'BORRADOR' | 'ACTIVA' | 'CERRADA',
    metodologia: 'Presencial (CAPI)',
    cobertura: 'Municipio Principal'
  });

  // Pollster Form
  const [pollsterForm, setPollsterForm] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
    estudioAsignado: 'ENC-2026-001 - Primer Tracking Semanal de Intención de Voto Alcaldía',
    cobertura: '',
    metaDiaria: 40,
    imei: '',
    password: ''
  });

  // AI Survey Designer States
  const [aiTopic, setAiTopic] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  const [designerForm, setDesignerForm] = useState({
    titulo: '',
    tipoInvestigacion: 'Intención de Voto',
    metodologia: 'Presencial / Domiciliaria (CAPI)',
    tamanoMuestra: 1000,
    cobertura: 'Municipio - Comunas 1 a 10',
    newQuestionText: ''
  });

  const [designerQuestions, setDesignerQuestions] = useState<any[]>([]);

  // Sample Size Calculator States
  const [populationSize, setPopulationSize] = useState(100000);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [marginOfError, setMarginOfError] = useState(3.0);

  // Compile and merge Mock + Database surveys
  const allSurveys = [
    ...MOCK_SURVEYS,
    ...dbSurveys.map(s => ({
      id: s.id,
      codigo: `ENC-${s.id.slice(0, 4).toUpperCase()}`,
      tipo: s.tamanoMuestra > 1000 ? 'Estudio Nacional' : 'Sondeo Local',
      titulo: s.titulo,
      respuestasObtenidas: s.respuestasObtenidas || 0,
      tamanoMuestra: s.tamanoMuestra || 500,
      metodologia: s.descripcion?.includes('Método:') ? s.descripcion.split('Método:')[1].split(';')[0].trim() : 'Presencial (CAPI)',
      cobertura: s.descripcion?.includes('Cobertura:') ? s.descripcion.split('Cobertura:')[1].split(';')[0].trim() : 'Municipio Principal',
      estado: s.estado || 'ACTIVA',
      fechaFin: s.fechaFin || 'Vigente'
    }))
  ];

  // Filtering surveys list
  const filteredSurveys = allSurveys.filter(s => {
    const matchSearch = s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cobertura.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = estadoFilter === 'ALL' || s.estado === estadoFilter;
    return matchSearch && matchEstado;
  });

  // Save survey handler
  const handleSaveSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyForm.titulo.trim()) {
      setMessage({ text: 'El título de la encuesta es obligatorio', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const clientId = user?.tenantId || client?.id;
      const serialDesc = `${surveyForm.descripcion}; Método: ${surveyForm.metodologia}; Cobertura: ${surveyForm.cobertura};`;

      const { error } = await supabase.from('surveys').insert([
        {
          client_id: clientId,
          titulo: surveyForm.titulo.trim(),
          descripcion: serialDesc,
          tamano_muestra: Number(surveyForm.tamanoMuestra) || 500,
          respuestas_obtenidas: 0,
          fecha_inicio: surveyForm.fechaInicio,
          fecha_fin: surveyForm.fechaFin,
          estado: surveyForm.estado
        }
      ]);

      if (error) throw error;

      setMessage({ text: 'Encuesta creada con éxito', type: 'success' });
      await refresh();
      setSurveyForm({
        titulo: '',
        descripcion: '',
        tamanoMuestra: 500,
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: '2026-09-30',
        estado: 'ACTIVA',
        metodologia: 'Presencial (CAPI)',
        cobertura: 'Municipio Principal'
      });
      setTimeout(() => {
        setIsSurveyModalOpen(false);
        setMessage(null);
      }, 800);
    } catch (err: any) {
      console.error('Error saving survey:', err);
      setMessage({ text: err.message || 'Error al guardar encuesta', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Save pollster mock handler
  const handleSavePollster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollsterForm.nombre || !pollsterForm.cedula || !pollsterForm.telefono || !pollsterForm.cobertura || !pollsterForm.imei || !pollsterForm.password) {
      alert('Por favor complete todos los campos obligatorios (*)');
      return;
    }
    alert(`Encuestador de Campo ${pollsterForm.nombre} registrado con éxito.\nCódigo Estudio: ${pollsterForm.estudioAsignado.split(' - ')[0]}\nIMEI: ${pollsterForm.imei}\nContraseña: ${pollsterForm.password}`);
    setPollsterForm({
      nombre: '',
      cedula: '',
      telefono: '',
      email: '',
      estudioAsignado: 'ENC-2026-001 - Primer Tracking Semanal de Intención de Voto Alcaldía',
      cobertura: '',
      metaDiaria: 40,
      imei: '',
      password: ''
    });
    setIsPollsterModalOpen(false);
  };

  // Generate AI Questions Mock handler
  const handleGenerateAiQuestions = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      setIsGeneratingAi(false);
      setDesignerQuestions([
        {
          id: 'q-1',
          num: 'P1',
          text: 'Si las elecciones a la Alcaldía fueran el día de hoy, ¿por cuál de los siguientes candidatos votaría usted?',
          type: 'CANDIDATE_MATRIX',
          options: [
            'Nuestro Candidato (Campaña Ganadora)',
            'Candidato Oposición A',
            'Candidato Oposición B',
            'Voto en Blanco',
            'No Sabe / No Responde'
          ]
        },
        {
          id: 'q-2',
          num: 'P2',
          text: '¿Qué tan seguro está de su voto para las próximas elecciones?',
          type: 'MULTIPLE_CHOICE',
          options: [
            'Completamente Seguro',
            'Probable que cambie',
            'Muy Indeciso',
            'No asistiré a votar'
          ]
        }
      ]);
    }, 1000);
  };

  // Save survey from designer handler
  const handleSaveDesignerSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designerForm.titulo.trim()) {
      alert('Por favor ingrese el Título del Estudio');
      return;
    }
    
    setSaving(true);
    try {
      const clientId = user?.tenantId || client?.id;
      const serialDesc = `Tipo: ${designerForm.tipoInvestigacion}; Método: ${designerForm.metodologia}; Cobertura: ${designerForm.cobertura}; AI_Generated: true;`;

      const { error } = await supabase.from('surveys').insert([
        {
          client_id: clientId,
          titulo: designerForm.titulo.trim(),
          descripcion: serialDesc,
          tamano_muestra: Number(designerForm.tamanoMuestra) || 1000,
          respuestas_obtenidas: 0,
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estado: 'BORRADOR'
        }
      ]);

      if (error) throw error;

      alert(`Encuesta "${designerForm.titulo}" guardada como BORRADOR con éxito.`);
      await refresh();
      
      // Clear designer form
      setDesignerForm({
        titulo: '',
        tipoInvestigacion: 'Intención de Voto',
        metodologia: 'Presencial / Domiciliaria (CAPI)',
        tamanoMuestra: 1000,
        cobertura: 'Municipio - Comunas 1 a 10',
        newQuestionText: ''
      });
      setDesignerQuestions([]);
      setActiveTab(1); // Go back to studies grid
    } catch (err: any) {
      console.error('Error saving designer survey:', err);
      alert(err.message || 'Error al guardar la encuesta');
    } finally {
      setSaving(false);
    }
  };

  // Sample Size formula calculator
  const calculateSampleSize = () => {
    const N = populationSize;
    const e = marginOfError / 100;
    const P = 0.5;
    const Q = 0.5;
    
    // Z value mapping
    let Z = 1.96; // 95% default
    if (confidenceLevel === 90) Z = 1.645;
    if (confidenceLevel === 99) Z = 2.576;

    const numerator = (Z * Z) * P * Q * N;
    const denominator = (e * e) * (N - 1) + (Z * Z) * P * Q;

    return Math.ceil(numerator / denominator);
  };

  return (
    <div className="space-y-6 text-slate-100 pb-12 font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Gestión y Configuración de Encuestas y Sondeos
            </h2>
            <p className="text-xs text-slate-400">
              Módulo de Investigación Electoral, Clima Político, Monitoreo GPS en Vivo y Diagnóstico asistido por Inteligencia Artificial
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end xl:self-center">
          <button
            onClick={() => setIsPollsterModalOpen(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-955 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
          >
            <Users className="w-4 h-4 text-slate-950" />
            + Registrar Encuestador
          </button>
          <button
            onClick={() => setActiveTab(4)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            + Nueva Encuesta
          </button>
          <button
            onClick={() => setActiveTab(3)}
            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center"
          >
            <Compass className="w-4 h-4" />
            Mapa GPS en Vivo
          </button>
        </div>
      </div>

      {/* 2. Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Estudios Activos */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4 space-y-1 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estudios Activos</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white font-mono">{allSurveys.filter(s => s.estado === 'ACTIVA').length}</span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold leading-none">
              2 en campo
            </span>
          </div>
        </div>

        {/* Encuestadores Registrados */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4 space-y-1 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Encuestadores Registrados</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white font-mono">6</span>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold leading-none">
              100% CNE
            </span>
          </div>
        </div>

        {/* Monitoreo GPS */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4 space-y-1 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monitoreo GPS en Vivo</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white font-mono">5 / 6</span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold leading-none">
              En Perímetro
            </span>
          </div>
        </div>

        {/* Margen Error */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4 space-y-1 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Margen Error Prom.</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-yellow-400 font-mono">± 2.5%</span>
            <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold leading-none">
              Conf. 95%
            </span>
          </div>
        </div>

        {/* Auditoría IA */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4 space-y-1 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auditoría IA Muestral</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-400 font-mono">98.7%</span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold leading-none">
              Confiabilidad
            </span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-1">
        {[
          { id: 1, label: `Panel de Estudios y Sondeos (${allSurveys.length})` },
          { id: 2, label: `Gestión de Encuestadores (${pollstersList.length})` },
          { id: 3, label: 'Monitoreo GPS y Geocercas en Vivo' },
          { id: 4, label: '+ Diseñador con IA' },
          { id: 5, label: 'Calculadora Muestral' },
          { id: 6, label: 'Inteligencia & IA' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/40 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Tab Contents */}
      {activeTab === 1 && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por título, código o municipio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => alert('Realizando auditoría de calidad asistida por IA sobre las muestras recolectadas...')}
                className="px-4 py-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 border border-violet-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Auditoría de Calidad IA
              </button>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-sans"
              >
                <option value="ALL">Estado: Todos los estados</option>
                <option value="ACTIVA">Activas / En campo</option>
                <option value="BORRADOR">Borrador</option>
                <option value="CERRADA">Cerradas</option>
              </select>
            </div>
          </div>

          {/* Grid of Surveys */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSurveys.length === 0 ? (
              <div className="md:col-span-2 py-12 text-center text-slate-500 font-semibold">
                No se encontraron encuestas registradas.
              </div>
            ) : (
              filteredSurveys.map((s) => {
                const progress = s.tamanoMuestra > 0 
                  ? Math.min(100, Math.round((s.respuestasObtenidas / s.tamanoMuestra) * 100))
                  : 0;

                return (
                  <div key={s.id} className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-4 hover:border-white/15 transition-all shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-[9px] font-black font-mono">
                          {s.codigo}
                        </span>
                        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[9px] font-bold">
                          {s.tipo}
                        </span>
                      </div>
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${
                        s.estado === 'ACTIVA' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : s.estado === 'CERRADA'
                          ? 'bg-slate-800 text-slate-500 border border-white/5'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {s.estado === 'ACTIVA' ? 'EN CAMPO' : s.estado}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-white leading-tight">{s.titulo}</h3>

                    {/* Progress slider */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-baseline justify-between text-xs font-semibold">
                        <span className="text-slate-400">Avance Muestral:</span>
                        <span className="text-white font-mono">
                          <span className="font-black text-white">{s.respuestasObtenidas}</span> / {s.tamanoMuestra}{' '}
                          <span className="text-indigo-400 font-black">({progress}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2.5 border-t border-white/5 font-semibold">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        {s.metodologia}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {s.cobertura}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-5 font-sans">
          {/* Header Banner */}
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Gestión y Padrón de Encuestadores de Campo
                </h4>
                <p className="text-xs text-slate-400">
                  Registro de datos personales, asignación de zonas, metas de campo e identificación CNE
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPollsterModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 self-start md:self-center"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              + Registrar Nuevo Encuestador
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-slate-900/30 border border-white/5 p-3 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nombre, cédula o comuna..."
                value={pollsterSearchTerm}
                onChange={(e) => setPollsterSearchTerm(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
              />
            </div>

            {/* Filter by Study select */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={selectedStudyFilter}
                onChange={(e) => setSelectedStudyFilter(e.target.value)}
                className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Filtrar por Estudio: Todos los estudios</option>
                <option value="TRACKING">Primer Tracking Semanal de Intención de Voto Alcaldía</option>
                <option value="CERRADO">Otros estudios históricos</option>
              </select>
            </div>
          </div>

          {/* Grid of Cards */}
          {(() => {
            const filteredPollsters = pollstersList.filter(p => {
              const matchesSearch = p.nombre.toLowerCase().includes(pollsterSearchTerm.toLowerCase()) ||
                                    p.cedula.includes(pollsterSearchTerm) ||
                                    p.cobertura.toLowerCase().includes(pollsterSearchTerm.toLowerCase());
              return matchesSearch;
            });

            if (filteredPollsters.length === 0) {
              return (
                <div className="py-12 text-center text-slate-500 font-semibold">
                  No se encontraron encuestadores con los filtros seleccionados.
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredPollsters.map(p => {
                  const avatarInitials = p.nombre.split(' ').map(n => n[0]).join('').substring(0, 2);
                  const progressPct = Math.round((p.avance / p.meta) * 100);

                  return (
                    <div
                      key={p.id}
                      className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 space-y-4 hover:border-white/15 transition-all shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Header Details */}
                        <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="h-10 w-10 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center font-black text-sm">
                              {avatarInitials}
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-black text-white leading-tight">{p.nombre}</p>
                              <span className="text-[10px] text-cyan-400 font-bold block mt-1 leading-none">
                                CC: {p.cedula}
                              </span>
                            </div>
                          </div>

                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                            p.estado === 'META CUMPLIDA'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : p.estado === 'EN RECORRIDO'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : p.estado === 'ACTIVO'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {p.estado}
                          </span>
                        </div>

                        {/* Assigned Study Box */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-cyan-400 uppercase tracking-wider block">Estudio Asignado:</span>
                          <p className="text-xs text-white font-semibold">
                            Primer Tracking Semanal de Intención de Voto Alcaldía
                          </p>
                        </div>

                        {/* Meta progress */}
                        <div className="space-y-1.5">
                          <div className="flex items-baseline justify-between text-xs font-semibold">
                            <span className="text-slate-400">Avance Diario de Meta:</span>
                            <span className="text-white font-mono font-black">
                              {p.avance} / {p.meta} <span className="text-[#10b981] font-mono">({progressPct}%)</span>
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Detail sub-card metadata */}
                        <div className="bg-[#0a0f1d]/80 border border-slate-800 rounded-xl p-3.5 grid grid-cols-2 gap-y-2 gap-x-2 text-[10px] text-slate-300 font-semibold">
                          <span className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                            {p.cobertura.split(' - ')[0]}
                          </span>
                          <span className="flex items-center gap-1.5 truncate">
                            <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            Bat: {p.bateria}%
                          </span>
                          <span className="flex items-center gap-1.5 truncate">
                            <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            {p.telefono.split(' ')[1] || p.telefono}
                          </span>
                          <span className="flex items-center gap-1.5 truncate">
                            <Clock className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                            {p.time}
                          </span>
                        </div>

                        {/* Geofence outside alert banner */}
                        {p.warning && (
                          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold rounded-xl p-2.5 flex items-start gap-2 animate-pulse mt-2">
                            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                            <span>{p.warning}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons footer */}
                      <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3.5 mt-2.5">
                        <button
                          type="button"
                          onClick={() => { setSelectedPollsterId(p.id); setIsDigitalIdOpen(true); }}
                          className="px-3 py-1.5 bg-[#0f172a] hover:bg-slate-800 border border-white/10 rounded-xl text-[10px] font-black text-cyan-300 flex items-center gap-1 transition-all"
                        >
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          Carnet CNE
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => { setSelectedPollsterId(p.id); setActiveTab(3); }}
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-[10px] font-black text-emerald-300 flex items-center gap-1 transition-all"
                          >
                            <Compass className="w-3.5 h-3.5 text-emerald-400" />
                            Ver GPS
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setPollstersList(pollstersList.filter(x => x.id !== p.id))}
                            className="p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 text-rose-400 rounded-xl transition-all"
                            title="Eliminar encuestador"
                          >
                            <Trash2 className="w-4 h-4 text-rose-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 3 && (
        <div className="space-y-5 font-sans">
          {/* Header Banner */}
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
                <MapPin className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Centro de Monitoreo GPS y Geocercas en Tiempo Real
                </h4>
                <p className="text-xs text-slate-400">
                  Visualización espacial de encuestadores en campo, perímetro de geocercas y verificación anti-fraude
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <select
                className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Monitorear Encuesta: Todas las encuestas en campo</option>
                <option value="ENC-2026-001">Monitorear: ENC-2026-001 - Primer Tracking</option>
                <option value="SND-2026-004">Monitorear: SND-2026-004 - Sondeo Digital</option>
              </select>
            </div>
          </div>

          {/* Map & Details Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            {/* Map Geoportal Panel (8 cols) */}
            <div className="xl:col-span-8 bg-slate-950/20 border border-white/5 rounded-2xl p-4 space-y-4 flex flex-col justify-between shadow-xl">
              {/* Geoportal Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Geoportal Territorial CNE</span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase animate-pulse">
                    GPS Real Activo
                  </span>
                </div>

                {/* Map style buttons */}
                <div className="flex items-center gap-1 bg-[#0a0f1d] border border-white/5 p-1 rounded-xl">
                  {['Oscuro CNE', 'Urbano OSM', 'Satélite HD'].map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setMapStyle(style)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                        mapStyle === style
                          ? 'bg-[#0f172a] text-cyan-400 border border-cyan-500/10'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>

                {/* Legend count */}
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    En Perímetro (5)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                    Fuera (1)
                  </span>
                </div>
              </div>

              {/* Map Canvas */}
              <div className="relative h-96 bg-[#0a0f1d] border border-slate-800/80 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                {/* Visual Street grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-15" />
                
                {/* Grid Street block mock overlay text */}
                <div className="absolute inset-0 select-none pointer-events-none opacity-20 font-mono text-[9px] font-black text-slate-600">
                  <span className="absolute top-[20%] left-[20%] uppercase">Laureles Estadio</span>
                  <span className="absolute top-[40%] left-[60%] uppercase">La Candelaria</span>
                  <span className="absolute top-[75%] left-[30%] uppercase">Calle 33</span>
                  <span className="absolute top-[10%] left-[50%] uppercase">Prado Centro</span>
                </div>

                {/* Geofence circular shapes */}
                <div className="absolute w-64 h-64 rounded-full border border-cyan-500/10 bg-cyan-500/5 animate-[pulse_6s_infinite]" style={{ top: '15%', left: '15%' }} />
                <div className="absolute w-80 h-80 rounded-full border border-indigo-500/5 bg-indigo-500/5" style={{ top: '5%', left: '35%' }} />

                {/* Zoom controls widget */}
                <div className="absolute left-4 top-4 z-20 flex flex-col bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden shadow-md">
                  <button
                    type="button"
                    onClick={() => setMapZoom(Math.min(18, mapZoom + 1))}
                    className="w-8 h-8 flex items-center justify-center font-black text-white hover:bg-slate-800 text-xs border-b border-white/5"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapZoom(Math.max(12, mapZoom - 1))}
                    className="w-8 h-8 flex items-center justify-center font-black text-white hover:bg-slate-800 text-xs"
                  >
                    -
                  </button>
                </div>

                {/* Blinking Pin markers for each pollster */}
                {MOCK_POLLSTERS.map(p => {
                  const isActive = p.id === selectedPollsterId;
                  const isOutside = p.status === 'Fuera de Perímetro';

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPollsterId(p.id)}
                      className="absolute z-20 transition-all focus:outline-none flex flex-col items-center"
                      style={{ 
                        top: `${p.lat}%`, 
                        left: `${p.lng}%` 
                      }}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 shadow-md ${
                        isActive 
                          ? 'bg-cyan-500 text-slate-950 scale-125 ring-4 ring-cyan-400/20' 
                          : isOutside 
                          ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400 animate-pulse'
                          : 'bg-[#0f172a] text-cyan-400 hover:bg-slate-800'
                      }`}>
                        <span className="text-[10px] font-black">{p.nombre[0]}</span>
                      </span>
                      {isActive && (
                        <span className="mt-1 bg-slate-950/90 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded border border-white/15 whitespace-nowrap shadow">
                          {p.nombre.split(' ')[0]} ({p.avance}/{p.meta})
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Map copyright footer */}
                <div className="absolute right-2 bottom-2 bg-slate-950/80 px-2 py-0.5 rounded border border-white/5 text-[9px] text-slate-500 font-mono">
                  Leaflet | © OpenStreetMap © CARTO
                </div>
              </div>

              {/* Geoportal Footer Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-400 font-bold border-t border-white/5 pt-3">
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  Sincronización GPS activa con satélite en tiempo real
                </span>
                <span>
                  Coordenadas Centro: 6.2442 | -75.5812 (Medellín, CO) - Zoom {mapZoom}x
                </span>
              </div>
            </div>

            {/* Selected Pollster Details Panel (4 cols) */}
            <div className="xl:col-span-4 bg-slate-950/20 border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4">
              {(() => {
                const pollster = MOCK_POLLSTERS.find(p => p.id === selectedPollsterId) || MOCK_POLLSTERS[0];
                const isZoneOk = pollster.status === 'En Zona OK';

                return (
                  <>
                    <div className="space-y-4">
                      {/* Avatar & Title */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="h-10 w-10 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center font-black text-sm">
                            {pollster.nombre[0]}
                          </span>
                          <div>
                            <p className="text-xs sm:text-sm font-black text-white leading-tight">{pollster.nombre}</p>
                            <span className="text-[10px] text-cyan-400 font-bold block mt-1 leading-none">
                              CC: {pollster.cedula}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${
                          isZoneOk 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 animate-pulse'
                        }`}>
                          {pollster.status}
                        </span>
                      </div>

                      {/* GPS coordinates details */}
                      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-3.5 space-y-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Ubicación GPS Exacta:</span>
                        <p className="text-xs font-black text-white font-mono">{pollster.location}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{pollster.address}</p>
                      </div>

                      {/* GPS Precision & Battery */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-3.5 space-y-1">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Precisión GPS:</span>
                          <p className="text-xs font-black text-white font-mono">{pollster.precision}</p>
                        </div>
                        <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-3.5 space-y-1">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Nivel de Batería:</span>
                          <p className="text-xs font-black text-white font-mono flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${pollster.bateria > 20 ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'}`} />
                            {pollster.bateria}%
                          </p>
                        </div>
                      </div>

                      {/* Details lines */}
                      <div className="space-y-3 pt-2 text-xs font-semibold">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>IMEI Dispositivo:</span>
                          <span className="text-white font-mono">{pollster.imei}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Código Acreditación CNE:</span>
                          <span className="text-cyan-400 font-mono">{pollster.code}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 border-t border-white/5 pt-3">
                          <span>Encuestas Realizadas:</span>
                          <span className="text-white font-mono font-black">
                            {pollster.avance} / {pollster.meta} ({Math.round((pollster.avance / pollster.meta) * 100)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDigitalIdOpen(true)}
                      className="w-full px-4 py-2.5 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-inner"
                    >
                      <Users className="w-4 h-4" />
                      Ver Carnet Digital CNE
                    </button>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Digital Credential Modal Overlay */}
          {isDigitalIdOpen && (() => {
            const p = MOCK_POLLSTERS.find(x => x.id === selectedPollsterId) || MOCK_POLLSTERS[0];
            return (
              <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-[#0f172a] border border-white/15 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center font-sans border-t-4 border-t-cyan-500">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Credencial Digital CNE</span>
                    <button onClick={() => setIsDigitalIdOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Photo Placeholder */}
                  <div className="mx-auto w-24 h-24 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-lg relative overflow-hidden">
                    <span className="text-2xl font-black text-cyan-400">{p.nombre[0]}</span>
                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                  </div>

                  <div className="space-y-1.5">
                    <h5 className="text-sm sm:text-base font-black text-white">{p.nombre}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold font-mono">CC: {p.cedula}</p>
                    <span className="inline-block bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 rounded-md px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider">
                      ENCUESTADOR CNE
                    </span>
                  </div>

                  {/* Barcode representation */}
                  <div className="bg-white p-3.5 rounded-xl space-y-1 shadow-inner max-w-[240px] mx-auto">
                    {/* Simulated barcode lines */}
                    <div className="flex justify-between h-8 bg-slate-950 items-center overflow-hidden px-1">
                      <div className="w-0.5 h-full bg-white mr-[1px]" />
                      <div className="w-1.5 h-full bg-white mr-[2px]" />
                      <div className="w-0.5 h-full bg-white mr-[1px]" />
                      <div className="w-2.5 h-full bg-white mr-[2px]" />
                      <div className="w-0.5 h-full bg-white mr-[1px]" />
                      <div className="w-1 h-full bg-white mr-[1px]" />
                      <div className="w-0.5 h-full bg-white mr-[2px]" />
                      <div className="w-2 h-full bg-white mr-[1px]" />
                      <div className="w-0.5 h-full bg-white mr-[1px]" />
                      <div className="w-1.5 h-full bg-white mr-[2px]" />
                      <div className="w-0.5 h-full bg-white" />
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono font-bold block">{p.code}</span>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal max-w-xs mx-auto">
                    Esta credencial autoriza al portador a realizar sondeos de opinión en vía pública bajo la reglamentación del Consejo Nacional Electoral.
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 4 && (
        <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl space-y-6 shadow-xl max-w-5xl mx-auto font-sans">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                  Diseñador y Generador Asistido por IA
                </h4>
                <p className="text-xs text-slate-400">
                  Configure los parámetros del estudio y genere cuestionarios electorales con Inteligencia Artificial
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateAiQuestions}
              disabled={isGeneratingAi}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generando Preguntas...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Generar Preguntas con IA
                </>
              )}
            </button>
          </div>

          {/* Form Parameters */}
          <form onSubmit={handleSaveDesignerSurvey} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-black text-cyan-400">Título del Estudio / Sondeo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Tracking Poll Semanal Comuna 4 y 5"
                  value={designerForm.titulo}
                  onChange={(e) => setDesignerForm({ ...designerForm, titulo: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-cyan-400">Tipo de Investigación *</label>
                <select
                  value={designerForm.tipoInvestigacion}
                  onChange={(e) => setDesignerForm({ ...designerForm, tipoInvestigacion: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Intención de Voto">Intención de Voto</option>
                  <option value="Clima Político">Clima Político</option>
                  <option value="Percepción Temática">Percepción Temática</option>
                  <option value="Evaluación de Gestión">Evaluación de Gestión</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-cyan-400">Metodología de Recolección *</label>
                <select
                  value={designerForm.metodologia}
                  onChange={(e) => setDesignerForm({ ...designerForm, metodologia: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Presencial / Domiciliaria (CAPI)">Presencial / Domiciliaria (CAPI)</option>
                  <option value="Telefónica (CATI)">Telefónica (CATI)</option>
                  <option value="Digital / Redes Sociales">Digital / Redes Sociales</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-black text-cyan-400">Muestra Objetivo (n) *</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={designerForm.tamanoMuestra}
                  onChange={(e) => setDesignerForm({ ...designerForm, tamanoMuestra: Number(e.target.value) || 0 })}
                  className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-cyan-400">Cobertura Territorial *</label>
                <input
                  type="text"
                  required
                  placeholder="Municipio - Comunas 1 a 10"
                  value={designerForm.cobertura}
                  onChange={(e) => setDesignerForm({ ...designerForm, cobertura: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-400">Parámetros Estadísticos Sugeridos</label>
                <div className="w-full bg-[#0a0f1d]/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs flex justify-between items-center h-10 select-none">
                  <span className="font-bold text-emerald-400">Confianza: 95%</span>
                  <span className="font-bold text-emerald-400">
                    Margen: ±{(98 / Math.sqrt(designerForm.tamanoMuestra || 1000)).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Questions Bank section */}
            <div className="border-t border-white/5 pt-4 space-y-4">
              <div className="flex justify-between items-baseline">
                <h5 className="text-xs sm:text-sm font-black text-white flex items-center gap-1">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Cuestionario y Banco de Preguntas ({designerQuestions.length})
                </h5>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  Generadas según estándares CNE
                </span>
              </div>

              {/* Questions list */}
              {designerQuestions.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-white/5 rounded-2xl bg-slate-950/20 text-slate-500 text-xs font-semibold leading-relaxed">
                  El cuestionario está vacío. Haz clic en el botón superior "Generar Preguntas con IA" para diseñar un banco de preguntas en base a los parámetros especificados.
                </div>
              ) : (
                <div className="space-y-3">
                  {designerQuestions.map((q, qIndex) => (
                    <div key={q.id || qIndex} className="bg-slate-950/30 border border-white/5 p-4 rounded-xl flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <span className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded text-[10px] font-black leading-none shrink-0 h-6 w-7 flex items-center justify-center font-mono">
                          {q.num || `P${qIndex + 1}`}
                        </span>
                        <div className="space-y-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">{q.text}</p>
                          <span className="text-[9px] text-cyan-400 font-mono font-bold block">
                            TIPO: {q.type}
                          </span>
                          
                          {/* Options Bullet list */}
                          <ul className="space-y-1 text-xs text-slate-400 font-semibold pl-1">
                            {q.options.map((opt: string, optIdx: number) => (
                              <li key={optIdx} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
                                {opt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setDesignerQuestions(designerQuestions.filter(x => x.id !== q.id));
                        }}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Custom Question bar */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Escriba el enunciado de una nueva pregunta para el estudio..."
                  value={designerForm.newQuestionText}
                  onChange={(e) => setDesignerForm({ ...designerForm, newQuestionText: e.target.value })}
                  className="flex-1 bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!designerForm.newQuestionText.trim()) return;
                    setDesignerQuestions([
                      ...designerQuestions,
                      {
                        id: `q-custom-${Date.now()}`,
                        num: `P${designerQuestions.length + 1}`,
                        text: designerForm.newQuestionText.trim(),
                        type: 'MULTIPLE_CHOICE',
                        options: ['Opción A', 'Opción B', 'Opción C']
                      }
                    ]);
                    setDesignerForm({ ...designerForm, newQuestionText: '' });
                  }}
                  className="px-4 py-2.5 bg-slate-900 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 text-cyan-400" />
                  Agregar Pregunta
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setActiveTab(1)}
                className="px-6 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-black transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-slate-955 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-955 stroke-[3]" />
                {saving ? 'Guardando...' : 'Guardar Encuesta en Borrador'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 5 && (
        <div className="bg-slate-950/30 border border-white/5 p-5 rounded-2xl space-y-4 max-w-2xl mx-auto">
          <h4 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
            <Calculator className="w-4.5 h-4.5 text-indigo-400" />
            Calculadora Científica de Tamaño de Muestra Electoral
          </h4>
          <p className="text-xs text-slate-400">
            Calcula la cantidad óptima de encuestas necesarias para cumplir con los estándares estadísticos de margen de error y nivel de confianza elegidos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Tamaño Universo (N):</label>
              <input
                type="number"
                value={populationSize}
                onChange={(e) => setPopulationSize(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Nivel de Confianza:</label>
              <select
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="90">90% (Z = 1.645)</option>
                <option value="95">95% (Z = 1.96)</option>
                <option value="99">99% (Z = 2.576)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Margen de Error (E):</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-white/10 rounded-xl px-3 py-2">
                <input
                  type="number"
                  step="0.1"
                  value={marginOfError}
                  onChange={(e) => setMarginOfError(Math.min(15, Math.max(0.5, parseFloat(e.target.value) || 0.5)))}
                  className="bg-transparent border-0 outline-none p-0 w-12 text-xs text-white font-mono"
                />
                <span className="text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 shadow-md">
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase">Muestra Requerida Sugerida</span>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Con un margen de error del <span className="text-indigo-400 font-bold">{marginOfError}%</span> y un nivel de confianza del <span className="text-indigo-400 font-bold">{confidenceLevel}%</span>.
              </p>
            </div>
            <span className="text-3xl font-black text-indigo-400 font-mono">
              {calculateSampleSize()} <span className="text-xs text-slate-400 block text-right font-semibold">Casos</span>
            </span>
          </div>
        </div>
      )}

      {activeTab === 6 && (
        <div className="bg-slate-950/30 border border-white/5 p-5 rounded-2xl space-y-4 max-w-2xl mx-auto">
          <h4 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
            Diagnóstico Predictivo Clima de Opinión (Inteligencia Artificial)
          </h4>
          <p className="text-xs text-slate-400">
            Análisis predictivo de tendencias electorales y clima político a partir de la ponderación histórica del censo y los sondeos del tracking poll.
          </p>

          <div className="space-y-3 pt-2 font-sans text-xs text-slate-300">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
              <span className="font-bold text-white block">1. Diagnóstico de Intención de Voto (Consolidado IA):</span>
              <p className="text-slate-400 mt-1">
                La proyección estima un crecimiento estable en la intención de voto hacia la candidatura (+2.3% proyectado) debido a respuestas favorables asociadas al tema de movilidad urbana.
              </p>
            </div>
            
            <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
              <span className="font-bold text-white block">2. Alerta de Sesgo Muestral detectado:</span>
              <p className="text-slate-400 mt-1">
                La auditoría de calidad IA detecta una ligera sobre-representación de muestras masculinas en la Comuna 10 (La Candelaria). Se recomienda ajustar la cuota presencial para equilibrar balance socio-demográfico.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 8. Create Survey Modal */}
      {isSurveyModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Crear Nuevo Sondeo de Opinión
              </h3>
              <button onClick={() => setIsSurveyModalOpen(false)} className="text-slate-400 hover:text-white">
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

            <form onSubmit={handleSaveSurvey} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Título del Sondeo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sondeo de Intención - Septiembre"
                    value={surveyForm.titulo}
                    onChange={(e) => setSurveyForm({ ...surveyForm, titulo: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Metodología de Recolección</label>
                  <select
                    value={surveyForm.metodologia}
                    onChange={(e) => setSurveyForm({ ...surveyForm, metodologia: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="Presencial (CAPI)">Presencial (CAPI)</option>
                    <option value="Digital / WhatsApp">Digital / WhatsApp</option>
                    <option value="Telefónica (CATI)">Telefónica (CATI)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tamaño de Muestra</label>
                  <input
                    type="number"
                    min={10}
                    value={surveyForm.tamanoMuestra}
                    onChange={(e) => setSurveyForm({ ...surveyForm, tamanoMuestra: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cobertura Territorial</label>
                  <input
                    type="text"
                    placeholder="Ej. Zonas Urbana y Metropolitana"
                    value={surveyForm.cobertura}
                    onChange={(e) => setSurveyForm({ ...surveyForm, cobertura: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción / Ficha Técnica</label>
                <textarea
                  rows={2}
                  placeholder="Universo de votantes, confiabilidad..."
                  value={surveyForm.descripcion}
                  onChange={(e) => setSurveyForm({ ...surveyForm, descripcion: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={surveyForm.fechaInicio}
                    onChange={(e) => setSurveyForm({ ...surveyForm, fechaInicio: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={surveyForm.fechaFin}
                    onChange={(e) => setSurveyForm({ ...surveyForm, fechaFin: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estado</label>
                  <select
                    value={surveyForm.estado}
                    onChange={(e) => setSurveyForm({ ...surveyForm, estado: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-sans"
                  >
                    <option value="BORRADOR">Borrador</option>
                    <option value="ACTIVA">En Campo (Activa)</option>
                    <option value="CERRADA">Cerrada</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSurveyModalOpen(false)}
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
                  {saving ? 'Guardando...' : 'Crear Sondeo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Create Pollster Modal */}
      {isPollsterModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Registrar Nuevo Encuestador de Campo
              </h3>
              <button onClick={() => setIsPollsterModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePollster} className="space-y-4">
              {/* Nombre Completo */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-cyan-400">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Esteban Morales"
                  value={pollsterForm.nombre}
                  onChange={(e) => setPollsterForm({ ...pollsterForm, nombre: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Cédula y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-cyan-400">Cédula de Ciudadanía *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 1032890123"
                    value={pollsterForm.cedula}
                    onChange={(e) => setPollsterForm({ ...pollsterForm, cedula: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-black text-cyan-400">Teléfono Móvil *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: +57 312 450 9988"
                    value={pollsterForm.telefono}
                    onChange={(e) => setPollsterForm({ ...pollsterForm, telefono: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-cyan-400">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ejemplo@campanaganadora.co"
                  value={pollsterForm.email}
                  onChange={(e) => setPollsterForm({ ...pollsterForm, email: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Estudio y Zona */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-cyan-400">Estudio / Sondeo Asignado *</label>
                  <select
                    value={pollsterForm.estudioAsignado}
                    onChange={(e) => setPollsterForm({ ...pollsterForm, estudioAsignado: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="ENC-2026-001 - Primer Tracking Semanal de Intención de Voto Alcaldía">
                      ENC-2026-001 - Primer Tracking Sem
                    </option>
                    <option value="SND-2026-004 - Sondeo Digital de Percepción sobre Propuestas de Movilidad">
                      SND-2026-004 - Sondeo Digital de P
                    </option>
                    <option value="ENC-2026-002 - Estudio de Percepción y Prioridades en Seguridad Ciudadana">
                      ENC-2026-002 - Estudio de Percepci
                    </option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-black text-cyan-400">Zona / Comuna Asignada *</label>
                  <input
                    type="text"
                    required
                    placeholder="Comuna 1 - Centro Histórico"
                    value={pollsterForm.cobertura}
                    onChange={(e) => setPollsterForm({ ...pollsterForm, cobertura: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Meta Diaria e IMEI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-cyan-400">Meta Diaria (Encuestas) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pollsterForm.metaDiaria}
                    onChange={(e) => setPollsterForm({ ...pollsterForm, metaDiaria: Number(e.target.value) || 0 })}
                    className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-black text-cyan-400">IMEI / Dispositivo *</label>
                  <input
                    type="text"
                    required
                    placeholder="864201049900548"
                    value={pollsterForm.imei}
                    onChange={(e) => setPollsterForm({ ...pollsterForm, imei: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Contraseña de Acceso */}
              <div className="space-y-1 border-t border-white/5 pt-3">
                <label className="block text-xs font-black text-cyan-400">Contraseña de Acceso *</label>
                <input
                  type="password"
                  required
                  placeholder="Crear contraseña para acceso (ej. ••••••••)"
                  value={pollsterForm.password}
                  onChange={(e) => setPollsterForm({ ...pollsterForm, password: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsPollsterModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-black transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[3]" />
                  Guardar Encuestador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
