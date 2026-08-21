import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { ArrowLeft, FileText, Lock, ShieldAlert } from 'lucide-react';
import { AppLogo } from '@/src/components/common/AppLogo';

type Tab = 'terms' | 'privacy' | 'security';

export default function LegalPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('terms');

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
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="md:w-64 flex-shrink-0">
          <div className="sticky top-28 space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-4">Centro Legal</h3>
            <button
              onClick={() => setActiveTab('terms')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'terms' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Términos de Servicio
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'privacy' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              Políticas de Privacidad
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'security' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Seguridad y Cumplimiento
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 bg-slate-900 border border-white/5 p-8 md:p-12 rounded-3xl prose prose-invert max-w-none"
        >
          {activeTab === 'terms' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-6">Términos y Condiciones de Servicio</h1>
              <p className="text-slate-400 mb-8">Última actualización: Agosto 2026</p>
              
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Aceptación de los Términos</h2>
              <p className="text-slate-300">
                Al acceder y utilizar el Software Electoral Premium ("la Plataforma"), usted acepta estar sujeto a estos términos de servicio. 
                El uso de la Plataforma está restringido exclusivamente a propósitos lícitos relacionados con la gestión de campañas, administración territorial y análisis electoral dentro del marco legal vigente de la jurisdicción aplicable.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Niveles de Servicio (SLA)</h2>
              <p className="text-slate-300">
                Garantizamos un tiempo de disponibilidad (uptime) del 99.9% anual para los servicios críticos, excluyendo ventanas de mantenimiento programadas. En el día de las elecciones ("Día D"), la plataforma opera en un entorno de alta redundancia, asegurando escalabilidad elástica para manejar picos de tráfico extremos.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Responsabilidades del Usuario</h2>
              <p className="text-slate-300">
                El cliente es el único responsable de la veracidad, licitud y legitimidad de los datos ingresados en la Plataforma. Queda estrictamente prohibido utilizar el sistema para prácticas de suplantación, alteración fraudulenta de información, o cualquier actividad que atente contra la transparencia electoral.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-6">Políticas de Privacidad y Tratamiento de Datos</h1>
              <p className="text-slate-400 mb-8">Última actualización: Agosto 2026</p>

              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-8">
                <p className="text-purple-300 text-sm m-0">
                  Operamos bajo los más estrictos estándares de protección de datos personales (incluyendo regulaciones tipo Habeas Data y directrices inspiradas en el GDPR).
                </p>
              </div>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Recopilación de Información</h2>
              <p className="text-slate-300">
                La plataforma recopila información con el fin de optimizar la gestión territorial y electoral. Esto incluye, pero no se limita a, datos censales, información de contacto de líderes, y métricas de desempeño organizativo ingresados por los administradores de cada campaña.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Aislamiento de Datos</h2>
              <p className="text-slate-300">
                Bajo ninguna circunstancia los datos de una campaña, partido o cliente son compartidos, cruzados o accesibles por otros usuarios de la Plataforma. Cada cliente opera en un entorno lógico (tenant) herméticamente aislado.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Derechos del Titular</h2>
              <p className="text-slate-300">
                Proporcionamos las herramientas técnicas para que nuestros clientes (los responsables del tratamiento) puedan garantizar a los ciudadanos los derechos de conocer, actualizar, rectificar o eliminar sus datos personales almacenados en el sistema.
              </p>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-6">Seguridad y Cumplimiento</h1>
              <p className="text-slate-400 mb-8">Última actualización: Agosto 2026</p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Cifrado de Grado Militar</h2>
              <p className="text-slate-300">
                Toda la información transmitida hacia y desde la plataforma está protegida mediante encriptación TLS 1.3 de extremo a extremo. Los datos almacenados ("Data at Rest") son resguardados en bases de datos utilizando el estándar de cifrado avanzado AES-256.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Arquitectura Zero-Trust</h2>
              <p className="text-slate-300">
                Implementamos un modelo de seguridad "Zero-Trust". Todo acceso, ya sea desde una red externa o interna, es rigurosamente autenticado, autorizado y auditado de forma continua. El Control de Acceso Basado en Roles (RBAC) garantiza que los usuarios solo accedan a los módulos e información estrictamente necesarios.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Auditorías e Infraestructura</h2>
              <p className="text-slate-300">
                La plataforma se somete a auditorías de seguridad (Penetration Testing) de forma regular. Nuestra infraestructura está alojada en entornos Cloud con certificaciones de seguridad globales (ISO 27001, SOC 2 Nivel II), asegurando protección contra ataques DDoS y pérdida de datos.
              </p>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm">
        <p>© 2026 Software Electoral. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
