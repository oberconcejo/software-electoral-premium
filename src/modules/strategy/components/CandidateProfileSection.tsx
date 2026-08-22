import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2,
  Award,
  User,
  Building2,
  ShieldCheck,
  Camera,
} from 'lucide-react';
import { useCandidateProfile } from '@/src/hooks/useCandidateProfile';
import { SWOTSection } from './SWOTSection';

const CARGO_OPTIONS = [
  'Alcaldía Municipal/Distrital',
  'Gobernación Departamental',
  'Concejo Municipal/Distrital',
  'Asamblea Departamental',
  'Senado de la República',
  'Cámara de Representantes',
  'Junta Administradora Local (JAL)',
  'Presidencia de la República'
];

export function CandidateProfileSection() {
  const navigate = useNavigate();

  const {
    candidate,
    swot,
    loading,
    message,
    setMessage,
  } = useCandidateProfile();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <p className="text-sm text-slate-400">Cargando perfil estratégico del candidato...</p>
      </div>
    );
  }

  // Estado vacío: Cuando no existe un candidato registrado
  if (!candidate) {
    return (
      <div className="space-y-6 select-none">
        <div className="bg-[#0b1329] border border-cyan-500/20 rounded-3xl p-10 sm:p-14 text-center shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-lg mx-auto space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-teal-400 shadow-lg shadow-cyan-500/10">
              <User className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Perfil del Candidato
              </h2>
              <p className="text-sm font-semibold text-slate-300">
                No hay información del candidato registrada todavía.
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Registra primero el perfil del candidato desde Gestión Administrativa.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/gestion-administrativa/campana?tab=candidate')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                Registrar Perfil en Gestión Administrativa
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initials = candidate.nombre
    ? candidate.nombre.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : 'CA';

  return (
    <div className="space-y-8 select-none">
      {/* Alert Notification */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold border ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-white ml-4 font-bold"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* ÁREA 1 — INFORMACIÓN Y CONFIGURACIÓN COMPLETA DEL CANDIDATO */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Candidate Identification & Summary Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0b1329] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Avatar Section */}
            <div className="relative mx-auto w-28 h-28 mb-4">
              {candidate.foto_url ? (
                <img 
                  src={candidate.foto_url} 
                  alt={candidate.nombre}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 rounded-full object-cover border-2 border-teal-400 p-1 bg-slate-900 shadow-lg shadow-teal-500/10"
                />
              ) : (
                <div className="w-28 h-28 rounded-full border-2 border-teal-400 p-1 bg-gradient-to-br from-slate-900 to-[#06121f] shadow-lg shadow-teal-500/10 flex items-center justify-center text-teal-300 font-extrabold text-2xl tracking-wider">
                  {initials}
                </div>
              )}
            </div>

            {/* Identity Info */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-white tracking-tight">{candidate.nombre || 'Candidato sin nombre'}</h2>
              {candidate.nombre_politico && (
                <p className="text-xs font-semibold text-teal-400">{candidate.nombre_politico}</p>
              )}
            </div>

            {/* Official Candidacy Badge */}
            <div className="mt-4 flex items-center justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold shadow-inner">
                <Award className="w-3.5 h-3.5 text-teal-400" />
                <span>Candidato Oficial a {candidate.cargo || 'Cargo por Definir'}</span>
              </div>
            </div>

            {/* Meta Key-Values */}
            <div className="mt-6 pt-4 border-t border-cyan-500/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Territorio:</span>
                <span className="text-white font-bold">{candidate.territorio || 'No especificado'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Cédula de Ciudadanía:</span>
                <span className="text-teal-400 font-bold">{candidate.identificacion || 'No registrada'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Sello Inhabilidades:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {candidate.sello_inhabilidades || '100% Verificado'}
                </span>
              </div>
            </div>
          </div>

          {/* Left Column Secondary Card (Summary, Slogan, and DOFA Counts) */}
          <div className="bg-[#0b1329] border border-cyan-500/20 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                Eslogan de Campaña:
              </p>
              <p className="text-xs text-amber-200 font-semibold italic">
                {candidate.eslogan ? `"${candidate.eslogan}"` : 'Sin eslogan definido'}
              </p>
            </div>

            <div className="pt-2 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-1">
                Resumen Perfil Profesional:
              </p>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-normal">
                {candidate.resumen_profesional || 'Sin perfil profesional registrado'}
              </p>
            </div>

            <div className="pt-2 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-1">
                Reseña del Candidato:
              </p>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-normal">
                {candidate.resena || 'Sin reseña biográfica registrada'}
              </p>
            </div>

            {/* Quick DOFA Counters */}
            <div className="pt-3 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1 mb-2">
                <Clock className="w-3 h-3" /> Matriz DOFA Resumida:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-lg p-2 text-emerald-300 flex items-center justify-between">
                  <span>Fortalezas:</span>
                  <span className="font-bold">{swot.fortalezas.selectedVariables.length}</span>
                </div>
                <div className="bg-cyan-950/40 border border-cyan-500/20 rounded-lg p-2 text-cyan-300 flex items-center justify-between">
                  <span>Oportunidades:</span>
                  <span className="font-bold">{swot.oportunidades.selectedVariables.length}</span>
                </div>
                <div className="bg-amber-950/40 border border-amber-500/20 rounded-lg p-2 text-amber-300 flex items-center justify-between">
                  <span>Debilidades:</span>
                  <span className="font-bold">{swot.debilidades.selectedVariables.length}</span>
                </div>
                <div className="bg-rose-950/40 border border-rose-500/20 rounded-lg p-2 text-rose-300 flex items-center justify-between">
                  <span>Amenazas:</span>
                  <span className="font-bold">{swot.amenazas.selectedVariables.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Full Candidate Configuration View (Read Only) */}
        <div className="lg:col-span-8">
          <div className="bg-[#0b1329] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/10">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-extrabold text-white tracking-wide">
                  Datos del Perfil (Registrado en Administración)
                </h3>
              </div>
            </div>

            {/* Form Fields Grid - Read Only */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Nombre Completo */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nombre Completo (Registro CNE):
                </label>
                <div className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-slate-300">
                  {candidate.nombre}
                </div>
              </div>

              {/* Nombre Político / Seudónimo */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nombre Político / Seudónimo:
                </label>
                <div className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-slate-300">
                  {candidate.nombre_politico || '-'}
                </div>
              </div>

              {/* Cargo de Elección Popular */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cargo de Elección Popular al que Aspira:
                </label>
                <div className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-slate-300">
                  {candidate.cargo || '-'}
                </div>
              </div>

              {/* Partido / Coalición / Grupo Significativo */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Partido / Coalición / Grupo Significativo:
                </label>
                <div className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-slate-300">
                  {candidate.partido || '-'}
                </div>
              </div>

              {/* Municipio / Departamento */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Municipio / Departamento:
                </label>
                <div className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-slate-300">
                  {candidate.territorio || '-'}
                </div>
              </div>

              {/* Cédula de Ciudadanía */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cédula de Ciudadanía:
                </label>
                <div className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-slate-300">
                  {candidate.identificacion || '-'}
                </div>
              </div>

              {/* Eslogan Principal de Campaña */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Eslogan Principal de Campaña:
                </label>
                <div className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-slate-300">
                  {candidate.eslogan || '-'}
                </div>
              </div>

              {/* Resumen del Perfil Profesional */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Resumen del Perfil Profesional:
                </label>
                <div className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-slate-300 whitespace-pre-wrap min-h-[60px]">
                  {candidate.resumen_profesional || '-'}
                </div>
              </div>

              {/* Reseña del Candidato (Biografía & Trayectoria) */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Reseña del Candidato (Biografía & Trayectoria):
                </label>
                <div className="w-full bg-[#060c18] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-slate-300 whitespace-pre-wrap min-h-[60px]">
                  {candidate.resena || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ÁREA 2 — MATRIZ DOFA / SWOT DEL CANDIDATO (4 BLOQUES 2X2) */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2.5 pb-2">
          <Clock className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-extrabold text-white tracking-wide">
            Matriz DOFA / SWOT del Candidato
          </h3>
        </div>

        <SWOTSection />
      </div>

    </div>
  );
}
