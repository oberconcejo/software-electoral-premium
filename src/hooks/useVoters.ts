import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useQueryCache } from '@/src/hooks/useQueryCache';
import { CacheManager } from '@/src/lib/cacheManager';

export interface Voter {
  id: string;
  client_id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  email?: string;
  comuna: string;
  puesto: string;
  mesa: number;
  intencion: 'Voto Seguro' | 'Simpatizante' | 'Indeciso' | 'Opositor';
  lider_id?: string;
  lider_nombre?: string;
  created_at: string;
}

export function useVoters() {
  const { user } = useAuth();
  const cacheKey = user?.tenantId ? `voters_${user.tenantId}` : null;

  const fetchVotersFn = useCallback(async () => {
    if (!supabase || !user?.tenantId) return [];
    
    const { data, error: fetchError } = await supabase
      .from('voters')
      .select('*')
      .eq('client_id', user.tenantId)
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    return data || [];
  }, [user?.tenantId]);

  const { data: voters = [], isLoading: loading, error: queryError, refetch: refresh } = useQueryCache<Voter[]>(
    cacheKey || 'voters_empty',
    fetchVotersFn,
    { enabled: !!user?.tenantId }
  );

  const error = queryError ? queryError.message : null;

  const addVoter = async (voter: Omit<Voter, 'id' | 'client_id' | 'created_at'>) => {
    if (!supabase || !user?.tenantId) return null;

    try {
      const { data, error: addError } = await supabase
        .from('voters')
        .insert([{ ...voter, client_id: user.tenantId }])
        .select()
        .single();

      if (addError) throw addError;
      
      // Update cache
      if (cacheKey) {
        CacheManager.invalidate(cacheKey);
      }
      
      return data;
    } catch (err: any) {
      console.error('Error adding voter:', err);
      throw err;
    }
  };

  const updateVoter = async (id: string, updates: Partial<Voter>) => {
    if (!supabase || !user?.tenantId) return null;

    try {
      const { data, error: updateError } = await supabase
        .from('voters')
        .update(updates)
        .eq('id', id)
        .eq('client_id', user.tenantId) // SECURITY: Record must belong to the tenant
        .select()
        .single();

      if (updateError) throw updateError;

      // Update cache
      if (cacheKey) {
        CacheManager.invalidate(cacheKey);
      }

      return data;
    } catch (err: any) {
      console.error('Error updating voter:', err);
      throw err;
    }
  };

  const deleteVoter = async (id: string) => {
    if (!supabase || !user?.tenantId) return false;

    try {
      const { error: deleteError } = await supabase
        .from('voters')
        .delete()
        .eq('id', id)
        .eq('client_id', user.tenantId); // SECURITY: Record must belong to the tenant

      if (deleteError) throw deleteError;

      // Update cache
      if (cacheKey) {
        CacheManager.invalidate(cacheKey);
      }

      return true;
    } catch (err: any) {
      console.error('Error deleting voter:', err);
      throw err;
    }
  };



  return {
    voters,
    loading,
    error,
    refresh,
    addVoter,
    updateVoter,
    deleteVoter
  };
}
