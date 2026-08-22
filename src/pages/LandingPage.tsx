import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLogo } from '@/src/components/common/AppLogo';
import { 
  testSupabaseConnection, 
  registerNewClient 
} from '@/src/lib/supabase';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  MapPin,
  Vote,
  BarChart3,
  CheckCircle2,
  Lock,
  Bot,
  ChevronDown,
  Star,
  Play,
  X,
  Menu,
  Target,
  Send,
  Check,
  Award,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTabDemo, setActiveTabDemo] = useState<'ai' | 'crm' | 'territory' | 'e14'>('ai');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'success' | 'info' }>>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Cinematic Scroll & Parallax
  const { scrollY } = useScroll();
  const navBackground = useTransform(scrollY, [0, 50], ["rgba(8,8,8,0)", "rgba(8,8,8,0.9)"]);
  const navBorder = useTransform(scrollY, [0, 50], ["rgba(255,255,255,0)", "rgba(255,255,255,0.05)"]);
  const navBackdropBlur = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(16px)"]);
  
  const blobY1 = useTransform(scrollY, [0, 1000], [0, 150]);
  const blobY2 = useTransform(scrollY, [0, 1000], [0, -150]);

  // Impact Calculator State
  const [votantesObjetivo, setVotantesObjetivo] = useState<number>(50000);
  const [lideresTerritorio, setLideresTerritorio] = useState<number>(120);

  // Impact Calculations
  const horasAhorradas = Math.round((votantesObjetivo / 1000) * 4.4 + lideresTerritorio * 1.0);
  const alcanceEstimado = (12.5 + (lideresTerritorio / 15) + (votantesObjetivo / 6250)).toFixed(1);

  // AI Demo State
  const [aiPromptInput, setAiPromptInput] = useState<string>('Estrategia de comunicación para votantes jóvenes indecisos');
  const [aiResponse, setAiResponse] = useState<string>(
    'Análisis Campaña Ganadora AI: Los jóvenes de 18-28 años en el sector urbano priorizan propuestas de empleo tecnológico y transporte sostenible. Se recomienda una campaña de video corto enfocada en 3 compromisos clave.'
  );
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  useEffect(() => {
    // Siempre iniciar en el top al recargar
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addNotification = (message: string, type: 'success' | 'info' = 'info') => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const handleSimulateAiPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput.trim()) return;
    setIsAiGenerating(true);
    setAiResponse('Procesando consulta estratégica con inteligencia artificial...');
    
    setTimeout(() => {
      setIsAiGenerating(false);
      
      const input = aiPromptInput.toLowerCase();
      let response = '';

      if (input.includes('joven') || input.includes('jóvenes')) {
        response = `Estrategia Generada para: "${aiPromptInput}":\n• Mensaje Fuerza: "El futuro se construye hoy, con tecnología y oportunidades".\n• Canal Recomendado: TikTok, Instagram Reels y torneos de E-sports locales.\n• Tasa de conversión proyectada: +22.4% sobre primer votante.`;
      } else if (input.includes('seguridad') || input.includes('crimen') || input.includes('delincuencia')) {
        response = `Estrategia Generada para: "${aiPromptInput}":\n• Mensaje Fuerza: "Recuperemos la tranquilidad de nuestros barrios con mano firme y tecnología".\n• Canal Recomendado: Grupos de WhatsApp vecinales, Facebook y reuniones comunitarias.\n• Tasa de conversión proyectada: +15.8% en zonas vulnerables.`;
      } else if (input.includes('mujer') || input.includes('madre')) {
        response = `Estrategia Generada para: "${aiPromptInput}":\n• Mensaje Fuerza: "Emprendimiento y apoyo directo a las madres cabeza de hogar".\n• Canal Recomendado: Radio local, Facebook Ads y talleres presenciales.\n• Tasa de conversión proyectada: +19.2% en mujeres de 30-50 años.`;
      } else if (input.includes('empleo') || input.includes('trabajo') || input.includes('econom')) {
        response = `Estrategia Generada para: "${aiPromptInput}":\n• Mensaje Fuerza: "Más inversión, menos trámites: Trabajo para todos".\n• Canal Recomendado: LinkedIn, cuñas radiales matutinas y vallas en zonas industriales.\n• Tasa de conversión proyectada: +17.5% en población económicamente activa.`;
      } else {
        response = `Estrategia Generada para: "${aiPromptInput}":\n• Mensaje Fuerza: "Propuestas concretas con impacto medible en tu comunidad".\n• Canal Recomendado: Redes sociales combinadas con volanteo focalizado (Puerta a Puerta).\n• Tasa de conversión proyectada: +18.4% sobre electorado neutro.`;
      }

      setAiResponse(response);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-clip">
      {/* Notifications */}
      <div className="fixed top-24 right-4 z-[100] space-y-2 pointer-events-none max-w-sm w-full">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-3.5 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md bg-emerald-950/90 text-emerald-200 border-emerald-500/50 pointer-events-auto flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="flex-1">{n.message}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          style={{ y: blobY1 }}
          className="absolute top-[-10%] left-[15%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[100px] opacity-60" 
        />
        <motion.div 
          style={{ y: blobY2 }}
          className="absolute bottom-[5%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-purple-600/10 blur-[110px] opacity-50" 
        />
      </div>

      {/* Header */}
      <motion.header 
        style={{ 
          backgroundColor: navBackground, 
          borderColor: navBorder,
          backdropFilter: navBackdropBlur,
          WebkitBackdropFilter: navBackdropBlur 
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b h-20 flex items-center justify-between px-6 lg:px-12 transition-colors duration-300"
      >
        <div className="flex items-center gap-3">
          <AppLogo 
            size="md" 
            variant="brand" 
            withText={true} 
            title="SOFTWARE" 
            onClick={() => navigate('/')} 
          />
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Producto</a>
          <a href="#demo" className="hover:text-white transition-colors">Demostración</a>
          <a href="#solutions" className="hover:text-white transition-colors">Soluciones</a>
          <a href="#pricing" className="hover:text-white transition-colors">Planes</a>
        </nav>

        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/select-module')}
            className="hidden sm:block px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-sm font-bold shadow-lg shadow-indigo-600/20 transition-colors"
          >
            Iniciar Sesión
          </motion.button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-[#080808] flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <AppLogo size="sm" variant="brand" withText={true} title="SOFTWARE" />
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-8 h-8" /></button>
            </div>
            <nav className="flex flex-col gap-8 text-2xl font-bold">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Producto</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)}>Demostración</a>
              <a href="#solutions" onClick={() => setMobileMenuOpen(false)}>Soluciones</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Planes</a>
            </nav>
            <div className="mt-auto pt-8">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/select-module');
                }}
                className="w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-base font-bold shadow-lg shadow-indigo-600/20 transition-all text-center"
              >
                Iniciar Sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        {/* Hero */}
        <section className="pt-36 pb-24 px-6 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95, y: 40 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8 flex flex-col items-center"
          >
            <motion.h1 
              initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] md:leading-[0.95]"
            >
              LA ESTRATEGIA <br className="hidden sm:block" /> 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">PARA GANAR</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed px-4 md:px-0"
            >
              Centraliza la gestión de votantes, territorialización de líderes, control financiero y monitoreo del Día D con tecnología de última generación.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 px-6 md:px-0"
            >
              <motion.button 
                whileHover={{ scale: 1.03, y: -2, boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/solicitar-acceso')} 
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center gap-3 transition-colors"
              >
                Solicitar Acceso <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.03, y: -2, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/select-module')} 
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 font-bold text-lg flex items-center justify-center gap-3 transition-colors"
              >
                Iniciar Sesión
              </motion.button>
            </motion.div>
          </motion.div>
        </section>

        {/* Marquee Continuous Left-to-Right */}
        <div className="py-12 border-y border-white/5 bg-white/[0.02] overflow-hidden w-full select-none relative">
          <motion.div
            className="flex w-max gap-12 text-slate-500 font-bold uppercase tracking-widest text-xs whitespace-nowrap"
            animate={{ x: ['-50%', '0%'] }}
            transition={{
              repeat: Infinity,
              ease: 'linear',
              duration: 90,
            }}
          >
            {Array(16).fill(null).map((_, i) => (
              <div key={i} className="flex items-center gap-4 flex-shrink-0">
                <Award className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>Alcaldías</span>
                <span>•</span>
                <span>Asambleas Territoriales</span>
                <span>•</span>
                <span>Senado</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bento Grid Features with Scroll-triggered entrance */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, filter: 'blur(10px)', y: 30 }}
            whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Diseñado para ganar en territorio</h2>
            <p className="text-slate-400 text-lg">Módulos integrales para cada aspecto de tu campaña electoral.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, filter: 'blur(10px)', y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
              viewport={{ once: false, margin: '-40px' }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, borderColor: 'rgba(99, 102, 241, 0.4)', boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.1)' }}
              className="sm:col-span-2 p-8 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 space-y-6 transition-colors group cursor-default"
            >
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
                <Bot className="w-12 h-12 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
              </motion.div>
              <h3 className="text-3xl font-bold group-hover:text-white transition-colors">Copiloto IA Político</h3>
              <p className="text-slate-400 text-lg leading-relaxed group-hover:text-slate-300 transition-colors">
                Genera discursos persuasivos, comunicados de prensa y contenido para redes alineado con tu programa de gobierno usando inteligencia artificial avanzada.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, filter: 'blur(10px)', y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
              viewport={{ once: false, margin: '-40px' }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, borderColor: 'rgba(168, 85, 247, 0.4)', boxShadow: '0 20px 40px -10px rgba(168, 85, 247, 0.1)' }}
              className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6 transition-colors group cursor-default"
            >
              <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}>
                <Users className="w-12 h-12 text-purple-500 group-hover:text-purple-400 transition-colors" />
              </motion.div>
              <h3 className="text-2xl font-bold group-hover:text-white transition-colors">CRM Votantes</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                Registra simpatizantes y asigna compromisos a líderes de barrio en tiempo real.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, filter: 'blur(10px)', y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
              viewport={{ once: false, margin: '-40px' }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, borderColor: 'rgba(236, 72, 153, 0.4)', boxShadow: '0 20px 40px -10px rgba(236, 72, 153, 0.1)' }}
              className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6 transition-colors group cursor-default"
            >
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 1 }}>
                <MapPin className="w-12 h-12 text-pink-500 group-hover:text-pink-400 transition-colors" />
              </motion.div>
              <h3 className="text-2xl font-bold group-hover:text-white transition-colors">Geolocalización</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                Mapas de calor en vivo que muestran el avance de votos objetivo por comuna.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, filter: 'blur(10px)', y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
              viewport={{ once: false, margin: '-40px' }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, borderColor: 'rgba(16, 185, 129, 0.4)', boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.1)' }}
              className="sm:col-span-2 p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6 transition-colors group cursor-default"
            >
              <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 0.2 }}>
                <Vote className="w-12 h-12 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
              </motion.div>
              <h3 className="text-3xl font-bold group-hover:text-white transition-colors">Día D & E-14 OCR</h3>
              <p className="text-slate-400 text-lg leading-relaxed group-hover:text-slate-300 transition-colors">
                Control total del escrutinio con captura fotográfica de actas E-14 y detección automática de discrepancias.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Demo Section with Scroll-triggered entrance */}
        <section id="demo" className="py-24 px-6 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto space-y-12">
            <motion.div 
              initial={{ opacity: 0, filter: 'blur(10px)', y: 30 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              viewport={{ once: false, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-center space-y-4"
            >
              <h2 className="text-4xl font-bold tracking-tight">Explora la plataforma</h2>
              <p className="text-slate-400 text-lg">Selecciona un módulo para ver cómo funciona.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, filter: 'blur(10px)', y: 25, scale: 0.95 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap justify-center gap-4"
            >
              {[
                { id: 'ai', label: 'Copiloto IA', icon: Bot },
                { id: 'crm', label: 'CRM & Líderes', icon: Users },
                { id: 'territory', label: 'Control Territorial', icon: MapPin },
                { id: 'e14', label: 'Escrutinio E-14', icon: Vote },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabDemo(tab.id as any)}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all ${
                    activeTabDemo === tab.id 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                    : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, filter: 'blur(15px)', y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 md:p-12 rounded-[3rem] bg-[#0c0c0c] border border-white/5 shadow-2xl min-h-[400px] overflow-hidden relative"
            >
              {activeTabDemo === 'ai' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400"><Bot className="w-6 h-6" /></div>
                    <div>
                      <h4 className="text-xl font-bold">Generador Estratégico</h4>
                      <p className="text-slate-500 text-sm">Prueba el motor de IA política</p>
                    </div>
                  </div>
                  <form onSubmit={handleSimulateAiPrompt} className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="text" 
                      value={aiPromptInput}
                      onChange={(e) => setAiPromptInput(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button className="px-8 py-4 rounded-2xl bg-indigo-600 font-bold hover:bg-indigo-500 transition-colors">
                      {isAiGenerating ? 'Generando...' : 'Consultar IA'}
                    </button>
                  </form>
                  <div className="p-6 rounded-2xl bg-black/80 border border-white/5 font-mono text-sm leading-relaxed text-indigo-300">
                    <p className="whitespace-pre-line">{aiResponse}</p>
                  </div>
                </motion.div>
              )}
              {activeTabDemo !== 'ai' && (
                <div className="flex items-center justify-center h-full text-slate-500 italic">
                  Visualización interactiva del módulo de {activeTabDemo.toUpperCase()}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section className="py-24 px-6 max-w-5xl mx-auto border-t border-white/5">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-3">
              Calcula el Impacto en Tu Campaña
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Proyecta el ahorro de tiempo y el alcance potencial usando nuestras herramientas.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[3rem]">
            {/* Controles */}
            <div className="space-y-8">
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-300 mb-4">
                  <span>Votantes Objetivo</span>
                  <span className="text-indigo-400">{votantesObjetivo.toLocaleString()}</span>
                </label>
                <input 
                  type="range" 
                  min="1000" 
                  max="100000" 
                  step="1000"
                  value={votantesObjetivo}
                  onChange={(e) => setVotantesObjetivo(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-white/10 h-2 rounded-lg appearance-none cursor-pointer" 
                />
              </div>
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-300 mb-4">
                  <span>Líderes de Territorio</span>
                  <span className="text-purple-400">{lideresTerritorio.toLocaleString()}</span>
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="500" 
                  step="10"
                  value={lideresTerritorio}
                  onChange={(e) => setLideresTerritorio(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-white/10 h-2 rounded-lg appearance-none cursor-pointer" 
                />
              </div>
            </div>
            {/* Resultados */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Horas de gestión ahorradas / mes</p>
                  <p className="text-3xl font-black text-white">+{horasAhorradas} hrs</p>
                </div>
                <BarChart3 className="w-10 h-10 text-indigo-500" />
              </div>
              <div className="p-6 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Aumento de alcance estimado</p>
                  <p className="text-3xl font-black text-white">{alcanceEstimado}%</p>
                </div>
                <Target className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Pasos de Despliegue */}
        <section className="py-24 px-6 bg-white/[0.02] border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-16 space-y-4"
            >
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-3">
                Despliegue en 4 Pasos Sencillos
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-purple-500/0"></div>
              {[
                { step: "01", title: "Configuración Inicial", desc: "Adaptamos la plataforma a tu estructura política y colores de campaña.", icon: ShieldCheck },
                { step: "02", title: "Entrenamiento IA", desc: "Cargamos tu plan de gobierno para que el copiloto responda como tú.", icon: Bot },
                { step: "03", title: "Registro Territorial", desc: "Tus líderes comienzan a mapear simpatizantes en tiempo real.", icon: MapPin },
                { step: "04", title: "Escrutinio Día D", desc: "Toma el control con recepción de E-14 desde cualquier smartphone.", icon: Vote },
              ].map((s, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative p-8 rounded-[2rem] bg-[#0c0c0c] border border-white/5 space-y-4 text-center z-10 hover:border-indigo-500/30 transition-colors"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-600/20 mb-6">
                    <s.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-3">
              Lo que Dicen Nuestros Clientes
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "Pasamos de tener 10,000 registros en Excel desorganizados a una base de datos centralizada. La IA nos ahorró semanas de trabajo en comunicaciones.", author: "Director de Campaña", role: "Alcaldía Capital", highlight: "+42% eficiencia" },
              { quote: "El módulo del Día D nos permitió detectar inconsistencias en 45 mesas antes de que terminara el preconteo oficial. El sistema de OCR es impresionante.", author: "Jefe de Debate", role: "Gobernación", highlight: "Cero fraude" },
              { quote: "Tener el mapa de calor en vivo nos permitió redirigir recursos en los últimos 3 días a las comunas donde estábamos débiles. Totalmente decisivo.", author: "Candidato", role: "Senado de la República", highlight: "Geolocalización exacta" },
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="text-indigo-400"><Star className="w-6 h-6 fill-indigo-400" /></div>
                  <p className="text-slate-300 italic">"{t.quote}"</p>
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">{t.highlight}</div>
                  <p className="font-bold text-white">{t.author}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Comparison Section */}
        <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
          <motion.div 
            initial={{ opacity: 0, filter: 'blur(10px)', y: 30 }}
            whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16 space-y-4"
          >

            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-3">
              La evolución de tu campaña
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Descubre por qué los métodos tradicionales fracasan y cómo nuestra plataforma te garantiza una ventaja competitiva frente a otros sistemas.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Antes */}
            <motion.div
              initial={{ opacity: 0, filter: 'blur(10px)', x: -40, scale: 0.95 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', x: 0, scale: 1 }}
              viewport={{ once: false, margin: '-40px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 md:p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 border border-white/10">
                  <X className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-300">Método Tradicional</h3>
              </div>
              <ul className="space-y-6">
                {[
                  "Hojas de cálculo fragmentadas o CRMs genéricos no adaptados a política.",
                  "Líderes de barrio sin seguimiento claro de metas ni geolocalización.",
                  "Estrategias de comunicación basadas en intuición, sin análisis de datos.",
                  "Día D caótico: recolección manual de E-14, lentitud y riesgo de fraude."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-slate-400">
                    <X className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Después */}
            <motion.div
              initial={{ opacity: 0, filter: 'blur(10px)', x: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', x: 0, scale: 1 }}
              viewport={{ once: false, margin: '-40px' }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 md:p-12 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/30 space-y-8 relative overflow-hidden"
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-purple-500/10 blur-[80px]" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">Con SOFTWARE</h3>
              </div>
              <ul className="space-y-6 relative z-10">
                {[
                  "CRM Electoral especializado: bases de datos consolidadas, limpias y seguras.",
                  "Mapas de calor en tiempo real para dominar cada comuna y barrio.",
                  "Copiloto IA: discursos segmentados y análisis DOFA automáticos.",
                  "Blindaje electoral: Lectura OCR inmediata de actas y consolidación."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-slate-200 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Pricing/Planes Section */}
        <section id="pricing" className="py-24 px-6 bg-white/[0.02] border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-16 space-y-4"
            >

              <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-3">
                Inversión estratégica para tu victoria
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Licencias flexibles multi-tenant adaptadas a tus necesidades, integrando herramientas tecnológicas de última generación.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {[
                {
                  name: "Plan Básico",
                  price: "$1.490.000",
                  period: "COP / mes",
                  description: "Funcionalidades esenciales para estructurar y gestionar tu equipo de trabajo territorial.",
                  popular: false,
                  features: [
                    "CRM de Votantes & Simpatizantes",
                    "Estructura Territorial Básica",
                    "Mapeo de Comunas y Zonas",
                    "Soporte Estándar por Ticket",
                    "Habilitado para 5 usuarios activos"
                  ],
                  buttonText: "Comenzar Plan Básico",
                  buttonLink: "/solicitar-acceso",
                  gradientBorder: "border-white/5 hover:border-indigo-500/30"
                },
                {
                  name: "Plan Profesional",
                  price: "$3.890.000",
                  period: "COP / mes",
                  description: "Herramientas avanzadas de inteligencia de datos y automatización para una gestión integral.",
                  popular: true,
                  features: [
                    "CRM de Votantes ilimitado",
                    "Copiloto IA (Persuasión y DOFA)",
                    "Módulo de Geolocalización Avanzado",
                    "Módulo de Testigos y Jurados Día D",
                    "Soporte 24/7 prioritario",
                    "Usuarios y líderes ilimitados"
                  ],
                  buttonText: "Adquirir Plan Profesional",
                  buttonLink: "/solicitar-acceso",
                  gradientBorder: "border-purple-500/40 shadow-purple-950/20 shadow-2xl scale-105"
                },
                {
                  name: "Plan Élite",
                  price: "Personalizado",
                  period: "Cotizar solución",
                  description: "Solución de alto rendimiento con recursos dedicados, IA personalizada y soporte especializado.",
                  popular: false,
                  features: [
                    "Servidor de base de datos dedicada",
                    "Integraciones de sistemas personalizadas",
                    "Copiloto IA con entrenamiento propio",
                    "Escrutinio OCR en tiempo real",
                    "Soporte de ingenieros en campo",
                    "Acuerdo de nivel de servicio (SLA)"
                  ],
                  buttonText: "Contactar Consultor",
                  buttonLink: "/solicitar-acceso",
                  gradientBorder: "border-white/5 hover:border-pink-500/30"
                }
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, filter: 'blur(10px)', y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
                  viewport={{ once: false, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ 
                    y: -8, 
                    scale: plan.popular ? 1.05 : 1.02,
                    boxShadow: plan.popular ? '0 30px 60px -15px rgba(99, 102, 241, 0.25)' : '0 20px 40px -10px rgba(0,0,0,0.5)'
                  }}
                  className={`p-8 rounded-[2.5rem] bg-[#08090d] flex flex-col justify-between relative transition-colors duration-300 ${plan.gradientBorder} border ${
                    plan.popular ? "z-10 bg-[#0e0f18] border-indigo-500/30" : "border-white/5"
                  }`}
                >
                  {plan.popular && (
                    <motion.span 
                      animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-600 border border-indigo-400/30 px-4 py-1.5 rounded-full shadow-lg shadow-indigo-600/30"
                    >
                      RECOMENDADO
                    </motion.span>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-2 py-4 border-y border-white/5">
                      <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{plan.price}</span>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{plan.period}</span>
                    </div>

                    <ul className="space-y-3.5 pt-4">
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-3 text-xs text-slate-300 font-medium">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(plan.buttonLink)}
                      className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors duration-200 cursor-pointer text-center ${
                        plan.popular 
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30" 
                          : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                      }`}
                    >
                      {plan.buttonText}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ with Scroll-triggered entrance */}
        <section className="py-24 px-6 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-bold text-center mb-12"
          >
            Preguntas Frecuentes
          </motion.h2>
          <div className="space-y-4">
            {[
              { q: '¿Es compatible con la normativa CNE?', a: 'Sí, incluye módulos específicos de contabilidad y reportes que cumplen con los formatos del Consejo Nacional Electoral.' },
              { q: '¿Cómo protegen la privacidad de los datos?', a: 'Utilizamos encriptación AES-256 y aislamiento total multi-inquilino. Tus datos son 100% privados.' },
              { q: '¿Funciona sin conexión a internet?', a: 'La plataforma está optimizada para la nube, pero el módulo territorial permite captura offline y sincronización posterior.' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl bg-white/5 border border-white/10 p-6"
              >
                <h4 className="font-bold text-lg mb-3">{item.q}</h4>
                <p className="text-slate-400">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-24 px-6 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-40px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="p-12 md:p-16 rounded-[3rem] bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-[#080808] border border-indigo-500/20 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                ¿Listo para Llevar Tu Campaña al Siguiente Nivel?
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                Únete a los líderes que ya están usando la inteligencia artificial y la gestión de datos para asegurar su victoria electoral.
              </p>
              <div className="pt-4">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/solicitar-acceso')}
                  className="px-10 py-5 rounded-full bg-indigo-600 text-white font-black text-lg transition-all"
                >
                  Agendar Demostración Ahora
                </motion.button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <motion.footer 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: '-40px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="py-16 px-6 border-t border-white/5 bg-[#050505] relative z-10"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start">
            {/* Bloque 1: Software Electoral */}
            <div className="md:col-span-6 space-y-3">
              <AppLogo 
                size="sm" 
                variant="brand" 
                withText={true} 
                title="SOFTWARE" 
                subtitle="Suite de Inteligencia & Gestión Electoral" 
              />
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm pt-1">
                La suite definitiva para la gestión moderna de campañas electorales de alto nivel.
              </p>
            </div>

            {/* Bloque 2: Módulos */}
            <div className="md:col-span-3 space-y-3">
              <div className="h-8 flex items-center">
                <h4 className="font-bold text-sm text-white uppercase tracking-wider">Módulos del Sistema</h4>
              </div>
              <nav className="flex flex-col gap-2.5 text-slate-400 text-sm pt-1">
                <a href="#features" className="hover:text-white transition-colors">Gestión Administrativa</a>
                <a href="#features" className="hover:text-white transition-colors">Gestión Estratégica</a>
                <a href="#features" className="hover:text-white transition-colors">Gestión Territorial</a>
              </nav>
            </div>

            {/* Bloque 3: Soporte y Legal */}
            <div className="md:col-span-3 space-y-3">
              <div className="h-8 flex items-center">
                <h4 className="font-bold text-sm text-white uppercase tracking-wider">Soporte y Legal</h4>
              </div>
              <nav className="flex flex-col gap-2.5 text-slate-400 text-sm pt-1">
                <Link to="/legal" className="hover:text-white transition-colors">Protección de Datos (Ley 1581)</Link>
                <Link to="/contacto" className="hover:text-white transition-colors">Línea de Soporte 24/7</Link>
                <Link to="/sobre-nosotros" className="hover:text-white transition-colors">Acerca del Proyecto</Link>
              </nav>
            </div>
          </div>

          {/* Línea divisoria y Derechos Reservados */}
          <div className="mt-14 pt-8 border-t border-white/5 text-center text-slate-500 text-xs font-semibold uppercase tracking-widest">
            © 2026 SOFTWARE ELECTORAL • TODOS LOS DERECHOS RESERVADOS
          </div>
        </div>
      </motion.footer>

      {/* Botón Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 z-50 border border-white/10"
            aria-label="Volver arriba"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
