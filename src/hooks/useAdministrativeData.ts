import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { apiClient } from '@/src/lib/apiClient';
import { 
  CustomRole, 
  Leader, 
  Voter, 
  BudgetItem, 
  CampaignData, 
  Witness, 
  Juror, 
  Survey,
  User
} from '@/src/types';

export interface AdministrativeStats {
  activeUsers: number;
  leadersCount: number;
  votersCount: number;
  witnessesCount: number;
  jurorsCount: number;
  activeCampaignsCount: number;
  budgetExecuted: number;
  budgetTotal: number;
  activeSurveysCount: number;
  apiUsage?: {
    totalAssigned: number;
    totalConsumed: number;
    percentage: number;
    status: string;
  };
  loading: boolean;
}

export function useAdministrativeData() {
  const { user, client } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for each section
  const [stats, setStats] = useState<AdministrativeStats>({
    activeUsers: 0,
    leadersCount: 0,
    votersCount: 0,
    witnessesCount: 0,
    jurorsCount: 0,
    activeCampaignsCount: 0,
    budgetExecuted: 0,
    budgetTotal: 0,
    activeSurveysCount: 0,
    loading: true
  });

  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [subusers, setSubusers] = useState<User[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [jurors, setJurors] = useState<Juror[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);

  const fetchAll = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const clientId = user?.tenantId || client?.id;

      // 1. Fetch Users / Profiles
      let usersData: any[] = [];
      try { usersData = await apiClient.get<any[]>('/api/roles/profiles'); } catch (e) {}

      // 2. Fetch Custom Roles
      let rolesData: any[] = [];
      try { rolesData = await apiClient.get<any[]>('/api/roles'); } catch (e) {}

      // 3. Fetch Leaders
      let leadersData: any[] = [];
      try { leadersData = await apiClient.get<any[]>('/api/voters/leaders'); } catch (e) {}

      // 4. Fetch Voters
      let votersData: any[] = [];
      try { votersData = await apiClient.get<any[]>('/api/voters/voters'); } catch (e) {}

      // 5. Fetch Budget Items
      let budgetData: any[] = [];
      try { budgetData = await apiClient.get<any[]>('/api/budget'); } catch (e) {}

      // 6. Fetch Campaigns
      let campaignsData: any[] = [];
      try { campaignsData = await apiClient.get<any[]>('/api/campaigns'); } catch (e) {}

      // 7. Fetch Witnesses
      let witnessesData: any[] = [];
      try { witnessesData = await apiClient.get<any[]>('/api/witnesses'); } catch (e) {}

      // 8. Fetch Jurors
      let jurorsData: any[] = [];
      try { jurorsData = await apiClient.get<any[]>('/api/jurors'); } catch (e) {}

      // 9. Fetch Surveys
      let surveysData: any[] = [];
      try { surveysData = await apiClient.get<any[]>('/api/surveys'); } catch (e) {}

      // 10. Fetch API Usage (Keep Supabase temporarily or mock if missing API)
      let usageData = null;
      if (clientId) {
        try {
          const { data: usage, error: usageError } = await supabase
            .from('client_api_usage')
            .select('*')
            .eq('client_id', clientId)
            .single();
          
          if (!usageError) {
            usageData = usage;
          }
        } catch (e) {}
      }

      // Map Users
      const mappedUsers: User[] = (usersData || []).map(u => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName || u.email?.split('@')[0] || 'Unknown',
        role: u.role,
        status: u.status || 'ACTIVE',
        tenantId: u.clientId,
        allowedModules: u.allowedModules || []
      }));
      setSubusers(mappedUsers);

      // Map Roles
      const mappedRoles: CustomRole[] = (rolesData || []).map(r => ({
        id: r.id,
        clientId: r.clientId,
        name: r.name,
        code: r.code,
        description: r.description,
        isActive: r.isActive !== false,
        isSystem: r.isSystem || false,
        allowedModules: r.allowedModules || ['ADMINISTRATIVE'],
        createdAt: r.createdAt
      }));
      setRoles(mappedRoles);

      // Map Leaders
      const mappedLeaders: Leader[] = (leadersData || []).map(l => ({
        id: l.id,
        clientId: l.clientId,
        nombre: l.nombreCompleto,
        cedula: l.cedula,
        telefono: l.telefono,
        email: l.email,
        comuna: l.comuna,
        barrio: l.barrio,
        zoneId: l.zoneId,
        subdivisionId: l.subdivisionId,
        puesto: l.puesto,
        mesa: l.mesa,
        metaVotos: Number(l.metaVotos) || 50,
        votosComprometidos: Number(l.votosAsegurados) || 0,
        status: l.estado || 'ACTIVE',
        createdAt: l.createdAt
      }));
      setLeaders(mappedLeaders);

      // Map Voters
      const mappedVoters: Voter[] = (votersData || []).map(v => ({
        id: v.id,
        clientId: v.clientId,
        nombre: v.nombreCompleto,
        cedula: v.cedula,
        telefono: v.telefono,
        email: v.email,
        departamento: v.departamento,
        municipio: v.municipio,
        comuna: v.comuna,
        barrio: v.barrio,
        zoneId: v.zoneId,
        subdivisionId: v.subdivisionId,
        puesto: v.puestoVotacion,
        mesa: v.mesa,
        liderId: v.liderId,
        intencion: v.intencion || 'Voto Seguro',
        status: v.status || 'ACTIVE',
        createdAt: v.createdAt
      }));
      setVoters(mappedVoters);

      // Map Budget Items
      const mappedBudget: BudgetItem[] = (budgetData || []).map(b => ({
        id: b.id,
        clientId: b.clientId,
        campaignId: b.campaignId,
        tipo: b.tipo,
        categoriaCNE: b.categoriaCNE,
        concepto: b.concepto,
        monto: Number(b.monto) || 0,
        fecha: b.fecha,
        comprobanteNumero: b.comprobanteNumero,
        soporteUrl: b.soporteUrl,
        beneficiarioNombre: b.beneficiarioNombre,
        beneficiarioNit: b.beneficiarioNit,
        estado: b.estado || 'REGISTRADO',
        observaciones: b.observaciones,
        createdAt: b.createdAt
      }));
      setBudgetItems(mappedBudget);

      // Map Campaigns
      const mappedCampaigns: CampaignData[] = (campaignsData || []).map(c => ({
        id: c.id,
        clientId: c.clientId,
        nombre: c.nombre,
        candidatoNombre: c.candidatoNombre,
        cargoPostulacion: c.cargoPostulacion,
        departamento: c.departamento,
        municipio: c.municipio,
        circunscripcion: c.circunscripcion,
        fechaInicio: c.fechaInicio,
        fechaEleccion: c.fechaEleccion,
        metaVotos: Number(c.metaVotos) || 0,
        presupuestoTotal: Number(c.presupuestoTotal) || 0,
        estado: c.estado || 'ACTIVA',
        descripcion: c.descripcion,
        createdAt: c.createdAt
      }));
      setCampaigns(mappedCampaigns);

      // Map Witnesses
      const mappedWitnesses: Witness[] = (witnessesData || []).map(w => ({
        id: w.id,
        clientId: w.clientId,
        nombre: w.nombreCompleto,
        cedula: w.cedula,
        telefono: w.telefono,
        email: w.email,
        municipio: w.municipio,
        zona: w.zona,
        puesto: w.puestoVotacion,
        mesa: w.mesa,
        estado: w.estado || 'PENDIENTE',
        documentoSoporteUrl: w.documentoSoporteUrl,
        observaciones: w.observaciones,
        createdAt: w.createdAt
      }));
      setWitnesses(mappedWitnesses);

      // Map Jurors
      const mappedJurors: Juror[] = (jurorsData || []).map(j => ({
        id: j.id,
        clientId: j.clientId,
        nombre: j.nombreCompleto,
        cedula: j.cedula,
        telefono: j.telefono,
        municipio: j.municipio,
        puesto: j.puestoAsignado,
        mesa: j.mesaAsignada,
        cargo: j.cargo || 'VOCAL',
        afinidad: j.afinidad || 'NEUTRO',
        observaciones: j.observaciones,
        createdAt: j.createdAt
      }));
      setJurors(mappedJurors);

      // Map Surveys
      const mappedSurveys: Survey[] = (surveysData || []).map(s => ({
        id: s.id,
        clientId: s.clientId,
        titulo: s.titulo,
        descripcion: s.descripcion,
        fechaInicio: s.fechaInicio,
        fechaFin: s.fechaFin,
        muestraObjetivo: Number(s.muestraObjetivo) || 200,
        estado: s.estado || 'ACTIVA',
        preguntas: Array.isArray(s.preguntas) ? s.preguntas : [],
        createdAt: s.createdAt
      }));
      setSurveys(mappedSurveys);

      // Calculate Total Executed Expenses
      const executedExpenses = mappedBudget
        .filter(item => item.tipo === 'GASTO' && item.estado !== 'ANULADO')
        .reduce((sum, item) => sum + item.monto, 0);

      const totalBudgetCalculated = mappedCampaigns.reduce(
        (sum, c) => sum + c.presupuestoTotal, 0
      ) || mappedBudget
        .filter(item => item.tipo === 'INGRESO')
        .reduce((sum, item) => sum + item.monto, 0);

      setStats({
        activeUsers: mappedUsers.filter(u => u.status === 'ACTIVE').length || (user ? 1 : 0),
        leadersCount: mappedLeaders.length,
        votersCount: mappedVoters.length,
        witnessesCount: mappedWitnesses.length,
        jurorsCount: mappedJurors.length,
        activeCampaignsCount: mappedCampaigns.filter(c => c.estado === 'ACTIVA').length,
        budgetExecuted: executedExpenses,
        budgetTotal: totalBudgetCalculated,
        activeSurveysCount: mappedSurveys.filter(s => s.estado === 'ACTIVA').length,
        apiUsage: usageData ? {
          totalAssigned: usageData.total_assigned,
          totalConsumed: usageData.total_consumed,
          percentage: usageData.total_assigned > 0 
            ? Math.min(100, Math.round((usageData.total_consumed / usageData.total_assigned) * 100)) 
            : 0,
          status: usageData.status
        } : undefined,
        loading: false
      });

    } catch (err: any) {
      console.error('Error fetching administrative data:', err);
      setError(err.message || 'Error al sincronizar datos administrativos');
    } finally {
      setLoading(false);
    }
  }, [user, client]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    loading,
    error,
    stats,
    roles,
    subusers,
    leaders,
    voters,
    budgetItems,
    campaigns,
    witnesses,
    jurors,
    surveys,
    refresh: fetchAll
  };
}
