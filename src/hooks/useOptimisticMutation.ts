import { useState } from 'react';
import { globalCache } from '@/src/lib/cacheManager';

export function useOptimisticMutation<T, TVariables>(
  mutationFn: (vars: TVariables) => Promise<T>,
  options: {
    cacheKey: string;
    updater: (oldData: any, vars: TVariables) => any;
    onSuccess?: (data: T) => void;
    onError?: (error: Error, rollbackData: any) => void;
  }
) {
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (vars: TVariables) => {
    setIsMutating(true);
    setError(null);

    // Save previous state for rollback
    const previousData = globalCache.get(options.cacheKey);
    
    // Apply optimistic update
    globalCache.updateOptimistic(options.cacheKey, (old) => options.updater(old, vars));

    try {
      const result = await mutationFn(vars);
      if (options.onSuccess) options.onSuccess(result);
      
      // We don't necessarily invalidate because the optimistic update might be enough
      // But we can trigger a soft fetch or assume the optimistic update is correct
      return result;
    } catch (err: any) {
      // Rollback
      globalCache.set(options.cacheKey, previousData);
      setError(err);
      if (options.onError) options.onError(err, previousData);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  return { mutate, isMutating, error };
}
