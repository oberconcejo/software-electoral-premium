import React, { useState, useEffect } from 'react';
import { useSignUp, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Mail, Lock, KeyRound, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import { AppLogo } from '@/src/components/common/AppLogo';
import { useAuth } from '@/src/contexts/AuthContext';

export default function FirstUserSetupPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useClerkAuth();
  const { refreshUserData } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  
  const [statusLoading, setStatusLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if system is already initialized
    fetch('/api/system/setup-status')
      .then(res => res.json())
      .then(data => {
        if (data.isInitialized) {
          setIsLocked(true);
        }
        setStatusLoading(false);
      })
      .catch(err => {
        console.error('Error checking setup status:', err);
        setError('Error al conectar con el servidor.');
        setStatusLoading(false);
      });
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== 'complete') {
        throw new Error('No se pudo completar la verificación.');
      }

      // 1. Activate session
      await setActive({ session: completeSignUp.createdSessionId });
      
      // 2. We need to wait for the token to be available
      const token = await getToken();
      
      // 3. Register user in DB as SUPERADMIN
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

      // 4. Refresh global auth context
      await refreshUserData();

      // 5. Redirect to dashboard
      navigate('/admin/dashboard');

    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.longMessage || err.message || 'Código de verificación incorrecto');
    } finally {
      setLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Registro Bloqueado</h2>
          <p className="text-slate-400 mb-8">
            El sistema ya cuenta con un administrador registrado. Por motivos de seguridad, el registro público está desactivado.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full bg-slate-800 hover:bg-slate-700 text-white">
            Ir al inicio de sesión
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-10">
          <AppLogo size="xl" variant="indigo" animated floating className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-3">Configuración Inicial</h1>
          <p className="text-indigo-200/70">
            {pendingVerification 
              ? 'Verifica tu correo electrónico' 
              : 'Registra el administrador principal del sistema'}
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {!pendingVerification ? (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input 
                      type="email"
                      placeholder="admin@sistema.com"
                      className="pl-12 h-12 bg-slate-950/50 border-white/5 text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Contraseña Segura</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input 
                      type="password"
                      placeholder="••••••••"
                      className="pl-12 h-12 bg-slate-950/50 border-white/5 text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                  <span className="flex items-center gap-2">
                    Continuar <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-center mb-6">
                <p className="text-indigo-200 text-sm">
                  Hemos enviado un código de 6 dígitos a<br/>
                  <strong className="text-white">{email}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Código de Verificación</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input 
                    type="text"
                    placeholder="123456"
                    className="pl-12 h-14 bg-slate-950/50 border-white/5 text-white text-lg tracking-[0.5em] font-mono"
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
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verificar y Completar Registro'}
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
        </div>
      </motion.div>
    </div>
  );
}
