import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { AppLogo } from '@/src/components/common/AppLogo';

export default function ContactPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simular envío
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

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

      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Info Side */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Contacta con nuestros <span className="text-indigo-400">Especialistas</span></h1>
              <p className="text-lg text-slate-400 leading-relaxed">
                Ya sea que necesites una demostración de la plataforma, asesoría tecnológica para tu campaña, o soporte técnico premium, nuestro equipo está listo para ayudarte.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-shrink-0 items-center justify-center text-indigo-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-1">Centro de Operaciones Tecnológicas</h4>
                  <p className="text-slate-400">Torre Empresarial, Bogotá D.C.<br/>Colombia</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex flex-shrink-0 items-center justify-center text-purple-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-1">Correo Electrónico</h4>
                  <p className="text-slate-400">contacto@software-electoral.com</p>
                  <p className="text-slate-400">soporte@software-electoral.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-shrink-0 items-center justify-center text-emerald-400">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-1">Línea Corporativa</h4>
                  <p className="text-slate-400">+57 (300) 123-4567</p>
                  <p className="text-slate-500 text-sm mt-1">Lunes a Viernes, 8:00 AM - 6:00 PM (COT)</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 border border-white/10 p-8 rounded-3xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                  <Send className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">¡Mensaje Enviado!</h3>
                <p className="text-slate-400 mb-8">Un asesor de tecnología electoral se pondrá en contacto contigo en las próximas 24 horas hábiles.</p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="border-white/10 text-white">
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300">Nombre Completo</label>
                  <Input required placeholder="Tu nombre" className="bg-slate-950/50 border-white/5 focus:border-indigo-500 h-12" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-300">Correo Corporativo</label>
                    <Input required type="email" placeholder="correo@ejemplo.com" className="bg-slate-950/50 border-white/5 focus:border-indigo-500 h-12" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-300">Teléfono (opcional)</label>
                    <Input type="tel" placeholder="+57 300 000 0000" className="bg-slate-950/50 border-white/5 focus:border-indigo-500 h-12" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300">Organización o Campaña</label>
                  <Input required placeholder="Nombre de la campaña o partido" className="bg-slate-950/50 border-white/5 focus:border-indigo-500 h-12" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300">¿Cómo podemos ayudarte?</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-slate-950/50 border border-white/5 focus:border-indigo-500 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="Describe tus necesidades tecnológicas..."
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-base font-semibold"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                  {!isSubmitting && <Send className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm">
        <p>© 2026 Software Electoral. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
