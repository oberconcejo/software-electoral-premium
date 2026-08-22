import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';

export interface NarrativeItem {
  id: string;
  topic: string;
  message: string;
}

export function useNarrative() {
  const [narrativeItems, setNarrativeItems] = useState<NarrativeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNarrative = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const res = await fetch('/api/strategy/narrative', { headers });
      if (res.ok) {
        const json = await res.json();
        setNarrativeItems(json.narrative || []);
      } else {
        setNarrativeItems([]);
      }
    } catch (err) {
      console.warn('Could not fetch Narrative from API:', err);
      setNarrativeItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNarrative();
  }, [fetchNarrative]);

  return {
    narrativeItems,
    loading,
    refresh: fetchNarrative
  };
}
