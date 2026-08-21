import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';

export interface TerritorialZone {
  id: string;
  clientId: string;
  nombre: string;
  lideresCount: number;
  votantesCount: number;
  metaVotos: number;
  cobertura: number;
  coordenadasX: number;
  coordenadasY: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface TerritorialSubdivision {
  id: string;
  zoneId: string;
  clientId: string;
  nombre: string;
  tipo: 'CORREGIMIENTO' | 'VEREDA';
  createdAt?: string;
}

import { useQueryCache } from '@/src/hooks/useQueryCache';
import { useOptimisticMutation } from '@/src/hooks/useOptimisticMutation';

export function useTerritory() {
  const { user } = useAuth();
  const clientId = user?.tenantId;

  const { data: zones, isLoading: loading, error, refetch: refresh } = useQueryCache<TerritorialZone[]>(
    `territory_zones_${clientId}`,
    async () => {
      if (!supabase || !clientId) return [];
      const { data, error: fetchError } = await supabase
        .from('territorial_zones')
        .select('*')
        .eq('client_id', clientId)
        .order('nombre');

      if (fetchError) throw fetchError;
      
      return (data || []).map(z => ({
        id: z.id,
        clientId: z.client_id,
        nombre: z.nombre,
        lideresCount: z.lideres_count || 0,
        votantesCount: z.votantes_count || 0,
        metaVotos: z.meta_votos || 0,
        cobertura: z.cobertura || 0,
        coordenadasX: z.coordenadas_x || 0,
        coordenadasY: z.coordenadas_y || 0,
        status: z.status || 'ACTIVE'
      }));
    },
    { enabled: !!clientId, ttl: 24 * 60 * 60 * 1000 } // Cache for 24h
  );

  const { data: subdivisions, isLoading: loadingSubdivisions, refetch: refreshSubdivisions } = useQueryCache<TerritorialSubdivision[]>(
    `territory_subdivisions_${clientId}`,
    async () => {
      if (!supabase || !clientId) return [];
      const { data, error: fetchError } = await supabase
        .from('territorial_subdivisions')
        .select('*')
        .eq('client_id', clientId)
        .order('nombre');

      if (fetchError) throw fetchError;

      return (data || []).map(s => ({
        id: s.id,
        zoneId: s.zone_id,
        clientId: s.client_id,
        nombre: s.nombre,
        tipo: s.tipo,
        createdAt: s.created_at
      }));
    },
    { enabled: !!clientId, ttl: 24 * 60 * 60 * 1000 } // Cache for 24h
  );

  const { mutate: addZone } = useOptimisticMutation<TerritorialZone, Omit<TerritorialZone, 'id' | 'clientId'>>(
    async (zone) => {
      if (!supabase || !clientId) throw new Error('No client ID');

      const dbZone = {
        nombre: zone.nombre,
        lideres_count: zone.lideresCount,
        votantes_count: zone.votantesCount,
        meta_votos: zone.metaVotos,
        cobertura: zone.cobertura,
        coordenadas_x: zone.coordenadasX,
        coordenadas_y: zone.coordenadasY,
        status: zone.status,
        client_id: clientId
      };

      const { data, error: addError } = await supabase
        .from('territorial_zones')
        .insert([dbZone])
        .select()
        .single();

      if (addError) throw addError;
      
      return {
        id: data.id,
        clientId: data.client_id,
        nombre: data.nombre,
        lideresCount: data.lideres_count,
        votantesCount: data.votantes_count,
        metaVotos: data.meta_votos,
        cobertura: data.cobertura,
        coordenadasX: data.coordenadas_x,
        coordenadasY: data.coordenadas_y,
        status: data.status
      };
    },
    {
      cacheKey: `territory_zones_${clientId}`,
      updater: (oldData: TerritorialZone[] = [], vars) => {
        return [...oldData, { ...vars, id: `temp-${Date.now()}`, clientId: clientId! }];
      }
    }
  );

  return {
    zones: zones || [],
    subdivisions: subdivisions || [],
    loading,
    loadingSubdivisions,
    error: error ? error.message : null,
    refresh,
    refreshSubdivisions,
    addZone
  };
}
