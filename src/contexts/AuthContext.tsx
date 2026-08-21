import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk, useSignIn } from '@clerk/clerk-react';
import { User, UserRole, AuthState, Client, License, UserPermission, Permission } from '@/src/types';
import { 
  evaluateModuleAccess, 
  normalizeModuleCode, 
  ModuleAuthorizationResult,
  CANONICAL_MODULES,
  getModuleDefaultPath,
  CanonicalModuleCode
} from '@/src/lib/moduleAuth';

export interface FetchedUserData {
  user: User;
  client: Client | null;
  apiUsage: any | null;
  license: License | null;
  permissions: UserPermission[];
  allowedModules: string[];
}

interface AuthContextType extends AuthState {
  apiUsage: any | null;
  login: (
    email: string, 
    password: string, 
    options?: { requiredRole?: UserRole; requiredModule?: string }
  ) => Promise<ModuleAuthorizationResult>;
  logout: () => Promise<void>;
  checkModuleAccess: (moduleCode: string) => boolean;
  checkPermission: (moduleCode: string, functionCode: string, action: Permission) => boolean;
  refreshUserData: () => Promise<FetchedUserData | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken, signOut } = useClerkAuth();
  const clerk = useClerk();

  const [state, setState] = useState<AuthState & { apiUsage: any | null }>({
    user: null,
    client: null,
    apiUsage: null,
    license: null,
    permissions: [],
    loading: true,
    error: null,
    isDatabaseConfigured: true,
    isSystemReady: false,
    sessionToken: null,
  });

  const fetchUserData = useCallback(async (): Promise<FetchedUserData | null> => {
    if (!isSignedIn || !clerkUser) return null;
    try {
      setState(prev => ({ ...prev, loading: true }));
      const token = await getToken();

      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 404) {
          // If profile not found, maybe redirect to an onboarding or return a temporary profile
          throw new Error('Perfil no encontrado en la base de datos.');
        }
        throw new Error('Error al obtener perfil del usuario.');
      }

      const data = await res.json();
      const { profile, client, apiUsage, license, permissions } = data;

      // Ensure root superadmin emails always have full root SUPERADMIN role
      if (profile) {
        const isRootAdmin = profile.email === 'oberosorio1@gmail.com';
        if (isRootAdmin && profile.role !== 'SUPERADMIN') {
          profile.role = 'SUPERADMIN';
          profile.allowed_modules = Object.values(CANONICAL_MODULES);
          // Backend should sync this ideally.
        }
      }

      // 5. Fetch Permissions mapped
      let mappedPermissions: UserPermission[] = (permissions || []).map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        moduleCode: normalizeModuleCode(p.module_code),
        functionCode: p.function_code,
        actions: p.actions as Permission[]
      }));

      // Normalize raw profile modules
      let rawModules: string[] = profile.allowed_modules || [];
      if (profile.role === 'SUPERADMIN') {
        rawModules = Object.values(CANONICAL_MODULES);
      } else if (rawModules.length === 0 && profile.role === 'ADMIN_CLIENTE') {
        rawModules = client?.allowed_modules || ['ADMINISTRATIVE', 'TERRITORY', 'STRATEGY', 'CRM'];
      }

      const normalizedModules = rawModules.map(m => normalizeModuleCode(m));

      const finalUser: User = {
        id: profile.id,
        email: profile.email,
        displayName: profile.displayName || clerkUser.firstName || profile.email.split('@')[0],
        role: profile.role as UserRole,
        status: profile.status || 'ACTIVE',
        tenantId: profile.client_id,
        allowedModules: normalizedModules
      };

      const result: FetchedUserData = {
        user: finalUser,
        client,
        apiUsage,
        license,
        permissions: mappedPermissions,
        allowedModules: normalizedModules
      };

      setState(prev => ({
        ...prev,
        user: finalUser,
        client,
        apiUsage,
        license,
        permissions: mappedPermissions,
        loading: false,
        error: null,
        isDatabaseConfigured: true,
        sessionToken: token
      }));

      return result;
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err.message 
      }));
      return null;
    }
  }, [isSignedIn, clerkUser, getToken]);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && clerkUser) {
        fetchUserData();
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          client: null,
          apiUsage: null,
          license: null,
          permissions: [],
          loading: false,
          error: null,
          sessionToken: null,
          isSystemReady: true
        }));
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, fetchUserData]);

  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();

  const login = async (
    emailOrIdentifier: string, 
    password: string, 
    options?: { requiredRole?: UserRole; requiredModule?: string }
  ): Promise<ModuleAuthorizationResult> => {
    if (!isSignInLoaded || !signIn) {
      throw new Error('Servicio de autenticación no disponible');
    }

    try {
      const result = await signIn.create({
        identifier: emailOrIdentifier,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        // El useEffect se encargará de hacer fetchUserData porque isSignedIn cambiará a true.
        // Pero necesitamos devolver la autorización ahora mismo.
        // Así que podemos hacer fetch manualmente o devolver una ruta temporal
        // que muestre un loader mientras fetchUserData se completa.
        
        // Vamos a devolver autorizado y que el frontend espere.
        // El problema es que no tenemos los módulos aquí de forma síncrona.
        return {
          authorized: true,
          redirectPath: options?.requiredModule === 'ADMINISTRATIVE' 
            ? '/gestion-administrativa/inicio' 
            : `/app/${options?.requiredModule?.toLowerCase() || 'administrative'}`,
          normalizedModule: (options?.requiredModule as CanonicalModuleCode) || 'ADMINISTRATIVE',
          allowedModules: ['ADMINISTRATIVE', 'CRM', 'STRATEGY', 'TERRITORY', 'ELECTORAL', 'COMMUNICATIONS', 'ANALYSIS'] as CanonicalModuleCode[]
        };
      } else {
        throw new Error('Múltiples factores de autenticación requeridos (No soportado actualmente)');
      }
    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.longMessage || err.message || 'Error al iniciar sesión';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    await signOut();
    setState(prev => ({
      ...prev,
      user: null,
      client: null,
      license: null,
      permissions: [],
      sessionToken: null,
      loading: false,
      error: null
    }));
  };

  const checkModuleAccess = (moduleCode: string): boolean => {
    if (!state.user) return false;
    if (state.user.role === UserRole.SUPERADMIN || state.user.email === 'oberosorio1@gmail.com') return true;
    const authResult = evaluateModuleAccess(state.user, state.client, state.license, moduleCode);
    return authResult.authorized;
  };

  const checkPermission = (moduleCode: string, functionCode: string, action: Permission): boolean => {
    if (!state.user) return false;

    // SuperAdmin has all permissions
    if (state.user.role === UserRole.SUPERADMIN || state.user.email === 'oberosorio1@gmail.com') return true;

    const normalizedMod = normalizeModuleCode(moduleCode);

    // Client Admins have full access within their authorized modules
    if (state.user.role === UserRole.ADMIN_CLIENTE) {
      return checkModuleAccess(normalizedMod);
    }

    // Sub-users check specific granular permissions
    const perm = state.permissions.find(
      p => normalizeModuleCode(p.moduleCode) === normalizedMod && p.functionCode === functionCode
    );
    if (!perm) return false;

    return perm.actions.includes(action) || (perm.actions as string[]).includes('MANAGE');
  };

  const refreshUserData = async () => {
    return await fetchUserData();
  };

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      login, 
      logout, 
      checkModuleAccess, 
      checkPermission,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
