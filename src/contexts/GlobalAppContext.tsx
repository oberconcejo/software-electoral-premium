import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';

export interface Campaign {
  id: string;
  nombre: string;
  [key: string]: any;
}

export interface Candidate {
  id: string;
  nombre: string;
  nombre_politico?: string;
  cargo?: string;
  partido?: string;
  territorio?: string;
  departamento?: string;
  municipio?: string;
  identificacion?: string;
  eslogan?: string;
  resumen_profesional?: string;
  resena?: string;
  foto_url?: string;
  sello_inhabilidades?: string;
  [key: string]: any;
}

interface GlobalAppState {
  activeCampaign: Campaign | null;
  activeCandidate: Candidate | null;
  setActiveCampaign: (campaign: Campaign | null) => void;
  setActiveCandidate: (candidate: Candidate | null) => void;
  loading: boolean;
  refreshGlobalData: () => Promise<void>;
}

const GlobalAppContext = createContext<GlobalAppState | undefined>(undefined);

export function GlobalAppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchGlobalData = useCallback(async () => {
    if (!user) {
      setActiveCampaign(null);
      setActiveCandidate(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Fetch Candidate
      try {
        const res = await fetch('/api/strategy/candidate', { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.candidate && (json.candidate.nombre || json.candidate.identificacion || json.candidate.cargo)) {
            const raw = json.candidate;
            const meta = raw.redes_sociales || {};
            setActiveCandidate({
              id: raw.id,
              client_id: raw.client_id,
              nombre: raw.nombre || '',
              nombre_politico: meta.nombre_politico || '',
              cargo: raw.cargo || '',
              partido: raw.partido || '',
              territorio: raw.territorio || (meta.municipio && meta.departamento ? `${meta.municipio}, ${meta.departamento}` : meta.departamento || ''),
              departamento: meta.departamento || raw.departamento || '',
              municipio: meta.municipio || raw.municipio || '',
              identificacion: raw.identificacion || '',
              eslogan: meta.eslogan || raw.propuesta_valor || '',
              resumen_profesional: meta.resumen_profesional || raw.perfil_profesional || '',
              resena: meta.resena || '',
              foto_url: raw.foto_url || '',
              sello_inhabilidades: meta.sello_inhabilidades || '100% Verificado'
            });
          } else {
            setActiveCandidate(null);
          }
        }
      } catch (err) {
        console.warn('Could not fetch candidate from API:', err);
      }
      
      // Fetch Campaign - placeholder to fetch later if there is an endpoint
      // activeCampaign could be loaded here. For now it is left null until implemented.
      
    } catch (error) {
      console.error('Error fetching global app data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGlobalData();
  }, [fetchGlobalData]);

  return (
    <GlobalAppContext.Provider value={{
      activeCampaign,
      activeCandidate,
      setActiveCampaign,
      setActiveCandidate,
      loading,
      refreshGlobalData: fetchGlobalData
    }}>
      {children}
    </GlobalAppContext.Provider>
  );
}

export const useGlobalApp = () => {
  const context = useContext(GlobalAppContext);
  if (context === undefined) {
    throw new Error('useGlobalApp must be used within a GlobalAppProvider');
  }
  return context;
};
