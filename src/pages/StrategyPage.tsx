import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles,
  MapPin, 
  FileText, 
  User, 
  UploadCloud, 
  ShieldAlert, 
  MessageSquareQuote, 
  Radio, 
  BarChart3, 
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Award,
  BookOpen,
  Briefcase,
  Share2,
  Trash2,
  Clock
} from 'lucide-react';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';
import { SWOTSection } from '@/src/modules/strategy/components/SWOTSection';
import { CandidateProfileSection } from '@/src/modules/strategy/components/CandidateProfileSection';
import { TerritorialDiagnostic } from '@/src/modules/strategy/components/TerritorialDiagnostic';
import { GovProgramSection } from '@/src/modules/strategy/components/GovProgramSection';
import { Diagnostic360Section } from '@/src/modules/strategy/components/Diagnostic360Section';
import { CommunicationsSection } from '@/src/modules/strategy/components/CommunicationsSection';
import { DataAnalysisSection } from '@/src/modules/strategy/components/DataAnalysisSection';
import { AgendaCalendarSection } from '@/src/modules/strategy/components/AgendaCalendarSection';
import { NarrativeSection } from '@/src/modules/strategy/components/NarrativeSection';

type StrategyTab = 
  | 'diagnostic360'
  | 'territorial'
  | 'govProgram'
  | 'candidateProfile'
  | 'cvAnalysis'
  | 'swot'
  | 'narrative'
  | 'comms'
  | 'dataAnalysis'
  | 'calendar';

export default function StrategyPage() {
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as StrategyTab) || 'diagnostic360';

  return (
    <div className="space-y-6 pb-12">
      {/* Tab Content Driven from Vertical Sidebar */}
      <AnimatePresence mode="wait">
        {/* 1. Diagnóstico 360° AI */}
        {activeTab === 'diagnostic360' && (
          <motion.div
            key="diagnostic360"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Diagnostic360Section />
          </motion.div>
        )}

        {/* 2. Diagnóstico Territorial */}
        {activeTab === 'territorial' && (
          <motion.div
            key="territorial"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <TerritorialDiagnostic />
          </motion.div>
        )}

        {/* 3. Programa de Gobierno */}
        {activeTab === 'govProgram' && (
          <motion.div
            key="govProgram"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <GovProgramSection />
          </motion.div>
        )}

        {/* 4. Perfil del Candidato */}
        {activeTab === 'candidateProfile' && (
          <motion.div
            key="candidateProfile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <CandidateProfileSection />
          </motion.div>
        )}

        {/* 5. Carga & Análisis CV */}
        {activeTab === 'cvAnalysis' && (
          <motion.div
            key="cvAnalysis"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="rounded-[32px] bg-[#111114] border-white/5 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Carga & Análisis CV</h3>
                    <p className="text-xs text-slate-500 font-medium">Extracción de trayectoria, habilidades y validación de perfil</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-[#090a10]/60 border border-white/[0.04] p-12 flex flex-col items-center justify-center text-center min-h-[300px] space-y-3">
                <div className="w-14 h-14 flex items-center justify-center text-slate-600 mb-2">
                  <UploadCloud className="w-12 h-12 stroke-[1.25]" />
                </div>
                <h3 className="text-lg font-bold text-slate-300">Funcionalidad en desarrollo</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  El módulo de análisis automático de CV con Inteligencia Artificial estará disponible en la próxima versión.
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 6. Matriz DOFA / SWOT AI */}
        {activeTab === 'swot' && (
          <motion.div
            key="swot"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <Card className="rounded-[32px] bg-[#111114] border-white/5 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Matriz DOFA / SWOT AI</h3>
                    <p className="text-xs text-slate-500 font-medium">Fortalezas, Oportunidades, Debilidades y Amenazas electorales</p>
                  </div>
                </div>
              </div>

              <SWOTSection />
            </Card>
          </motion.div>
        )}

        {/* 7. Narrativa & Discurso */}
        {activeTab === 'narrative' && (
          <motion.div
            key="narrative"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <NarrativeSection />
          </motion.div>
        )}

        {/* 8. Comunicación & Redes */}
        {activeTab === 'comms' && (
          <motion.div
            key="comms"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <CommunicationsSection />
          </motion.div>
        )}

        {/* 9. Análisis de Datos AI */}
        {activeTab === 'dataAnalysis' && (
          <motion.div
            key="dataAnalysis"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <DataAnalysisSection />
          </motion.div>
        )}

        {/* 10. Agenda & Calendario */}
        {activeTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <AgendaCalendarSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
