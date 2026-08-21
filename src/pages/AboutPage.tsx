import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { ArrowLeft, Target, Shield, Users, Award } from 'lucide-react';
import { AppLogo } from '@/src/components/common/AppLogo';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver
            </Button>
            <AppLogo size="sm" variant="indigo" withText title="SOFTWARE" />
          </div>
          <Button onClick={() => navigate('/solicitar-acceso')} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">
            Solicitar Acceso
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-slate-950/20" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
          >
            Liderazgo Electoral <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Impulsado por Datos</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto"
          >
            Transformamos campañas políticas e instituciones gubernamentales mediante análisis de datos predictivos e inteligencia artificial de vanguardia.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '+50', label: 'Campañas Exitosas' },
              { value: '10M+', label: 'Votantes Analizados' },
              { value: '99.9%', label: 'Uptime Garantizado' },
              { value: '10+', label: 'Años de Experiencia' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-12">
            <div>
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                <Target className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Nuestra Misión</h3>
              <p className="text-slate-400 leading-relaxed">
                Empoderar a líderes políticos y gestores gubernamentales con herramientas tecnológicas que garanticen una toma de decisiones precisa, estratégica y en tiempo real. Creemos que la política moderna debe basarse en la certeza de los datos y no solo en la intuición.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Máxima Seguridad</h3>
              <p className="text-slate-400 leading-relaxed">
                Entendemos que la información electoral es el activo más valioso de una campaña. Nuestra arquitectura Cloud certificada emplea cifrado de grado militar (AES-256) para proteger cada registro, asegurando privacidad total y cumplimiento normativo estricto.
              </p>
            </div>
          </div>
          
          <div className="space-y-12">
            <div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">El Equipo</h3>
              <p className="text-slate-400 leading-relaxed">
                Somos un grupo élite de estrategas políticos, científicos de datos y arquitectos de ciberseguridad. Combinamos la experiencia en el terreno ('barro') con la tecnología de última generación para construir software que realmente entiende las necesidades del Día D.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                <Award className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Nuestra Visión</h3>
              <p className="text-slate-400 leading-relaxed">
                Ser el estándar de oro e infraestructura tecnológica por defecto para cualquier proceso electoral en Latinoamérica, estableciendo nuevos límites de eficiencia organizativa y transparencia democrática.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer minimalista para páginas secundarias */}
      <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm">
        <p>© 2026 Software Electoral. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
