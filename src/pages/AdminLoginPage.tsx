import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldAlert, Mail, Lock, ArrowRight, Loader2, UserPlus, KeyRound } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { AppLogo } from '@/src/components/common/AppLogo';
import { useAuth } from '@/src/contexts/AuthContext';
import { UserRole } from '@/src/types';
import { AdminRequestAccessModal } from '@/src/components/admin/AdminRequestAccessModal';
import { useSignUp, useAuth as useClerkAuth } from '@clerk/clerk-react';

export default function AdminLoginPage() {
  // Common state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Login specific state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const { login, refreshUserData } = useAuth();
  
  // Setup specific state
  const [statusLoading, setStatusLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(true); // default true until proven false
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useClerkAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if system is already initialized
    fetch('/api/system/setup-status')
      .then(res => res.json())
      .then(data => {
        setIsInitialized(data.isInitialized);
        setStatusLoading(false);
      })
      .catch(err => {
        console.error('Error checking setup status:', err);
        // Default to initialized on error to prevent accidental setups
        setIsInitialized(true); 
        setStatusLoading(false);
      });
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const success = await login(email, password, { requiredRole: UserRole.SUPERADMIN });
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError('No autorizado. Solo cuentas de SuperAdministrador pueden acceder.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.longMessage || err.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== 'complete') {
        throw new Error('No se pudo completar la verificación.');
      }

      await setActive({ session: completeSignUp.createdSessionId });
      const token = await getToken();
      
      const res = await fetch('/api/system/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al sincronizar el administrador en la base de datos.');
      }

      await refreshUserData();
      navigate('/admin/dashboard');

    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.longMessage || err.message || 'Código de verificación incorrecto');
    } finally {
      setIsLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  // --- RENDERING FOR SETUP (FIRST USER ONLY) ---
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px]" />
        </div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            <div className="text-center mb-8">
              <AppLogo size="lg" variant="admin" animated floating showGlowHalo className="mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Configuración Inicial</h1>
              <p className="text-slate-400">
                {pendingVerification 
                  ? 'Verifica tu correo electrónico' 
                  : 'Registra el administrador principal del sistema'}
              </p>
            </div>

            {!pendingVerification ? (
              <form onSubmit={handleSetupSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input 
                      type="email"
                      placeholder="admin@softwareelectoral.com"
                      className="pl-12"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Contraseña Segura</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input 
                      type="password"
                      placeholder="••••••••"
                      className="pl-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                    <span className="flex items-center justify-center gap-2">
                      Continuar <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifySetup} className="space-y-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center mb-6">
                  <p className="text-red-200 text-sm">
                    Hemos enviado un código de 6 dígitos a<br/>
                    <strong className="text-white">{email}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Código de Verificación</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input 
                      type="text"
                      placeholder="123456"
                      className="pl-12 h-14 text-lg tracking-[0.5em] font-mono text-center"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      maxLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verificar e Inicializar'}
                </Button>
                
                <button
                  type="button"
                  onClick={() => setPendingVerification(false)}
                  className="w-full text-center text-slate-400 text-sm hover:text-white transition-colors mt-4"
                >
                  Volver atrás
                </button>
              </form>
            )}
            
            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Este proceso solo ocurre una vez.<br />
                Después de esto, el registro se bloqueará.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- RENDERING FOR LOGIN (NORMAL FLOW) ---
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <AppLogo size="lg" variant="admin" animated floating showGlowHalo />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Acceso Privado</h1>
            <p className="text-slate-400">Panel Central de Administración</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Correo Electrónico o Cédula</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input 
                  type="text"
                  placeholder="admin@softwareelectoral.com o Cédula"
                  className="pl-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input 
                  type="password"
                  placeholder="••••••••"
                  className="pl-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Iniciar Sesión <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>

            {/* Secondary Option: Request Access */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all w-full group"
              >
                <UserPlus className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
                <span>¿Primera vez? <span className="text-red-400 font-bold group-hover:underline">Solicitar acceso</span></span>
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
              Esta es una zona restringida.<br />
              Cualquier intento de acceso no autorizado será registrado.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Modal for Admin Access Request */}
      <AdminRequestAccessModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
}
