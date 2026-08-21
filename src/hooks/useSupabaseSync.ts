import { useEffect, useRef } from 'react';
import { supabase } from '@/src/lib/supabase';
import { globalCache } from '@/src/lib/cacheManager';
import { useAuth } from '@/src/contexts/AuthContext';

// Las tablas que consideramos prioritarias para sincronizar en vivo.
const MONITORED_TABLES = [
  'territorial_zones',
  'territorial_subdivisions',
  'leaders',
  'voters',
  'witnesses',
  'jurors',
  'campaigns',
];

export function useSupabaseSync() {
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Si no hay Supabase o no hay usuario autenticado (con tenantId), no nos suscribimos.
    if (!supabase || !user?.tenantId) {
      if (channelRef.current) {
        supabase?.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    const clientId = user.tenantId;

    // Crear un único canal de comunicación para el cliente activo
    const channelName = `public:client_${clientId}`;
    
    console.log(`[Realtime] Conectando a Supabase Realtime para client_id: ${clientId}`);

    const channel = supabase.channel(channelName);

    // Iterar sobre las tablas prioritarias y crear un listener con filtro RLS por client_id
    MONITORED_TABLES.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          console.log(`[Realtime] Payload recibido en ${table}:`, payload);
          
          const cachePrefix = table; // Asumimos que la llave de caché empieza con el nombre de la tabla (ej. "voters_..." o "voters")

          switch (payload.eventType) {
            case 'INSERT':
            case 'UPDATE':
              // upsertListItem actualiza si existe, o lo inserta si es nuevo en TODAS las llaves de caché que coincidan con la tabla
              globalCache.upsertListItem(cachePrefix, payload.new, 'id');
              break;
            
            case 'DELETE':
              // Elimina el elemento de todos los arreglos en caché asociados a esta tabla
              globalCache.deleteListItem(cachePrefix, payload.old.id, 'id');
              break;
          }
        }
      );
    });

    // Suscribirse y manejar el estado de la conexión
    channel.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] ✅ Sincronización en vivo activa para ${clientId}`);
        // Opcional: Si veníamos de un estado de error/desconexión, podríamos invalidar cachés para asegurar integridad.
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn(`[Realtime] ⚠️ Error en sincronización (${status}). Supabase intentará reconectar.`);
      }
    });

    channelRef.current = channel;

    return () => {
      console.log(`[Realtime] 🔌 Desconectando canal ${channelName}`);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user?.tenantId]);
}
