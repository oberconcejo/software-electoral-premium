import React from 'react';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { MessageSquareQuote, Loader2 } from 'lucide-react';
import { useNarrative } from '@/src/hooks/useNarrative';

export function NarrativeSection() {
  const { narrativeItems, loading } = useNarrative();

  return (
    <Card className="rounded-[32px] bg-[#111114] border-white/5 p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Narrativa & Discurso</h3>
            <p className="text-xs text-slate-500 font-medium">Líneas discursivas, mensajes clave y argumentos centrales de campaña</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : narrativeItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {narrativeItems.map(item => (
            <div key={item.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="primary">{item.topic}</Badge>
              </div>
              <p className="text-sm text-slate-300 italic">"{item.message}"</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white/[0.01] rounded-[28px] border border-dashed border-white/5 space-y-3">
          <MessageSquareQuote className="w-12 h-12 text-slate-700 mx-auto" />
          <h4 className="text-lg font-bold text-slate-400">No hay información disponible todavía</h4>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Aún no se han configurado líneas discursivas. La narrativa se construye en función de los ejes de campaña.
          </p>
        </div>
      )}
    </Card>
  );
}
