import {
  Activity,
  ShieldCheck,
  Users,
  CreditCard,
  Building2,
  BookmarkCheck,
  CheckSquare,
  PieChart,
  MapPin,
  Settings
} from 'lucide-react';
import { UserRole } from '../types';

export interface AdminNavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  functionCode: string;
  description?: string;
  badge?: string;
  roles?: UserRole[];
}

export interface AdminNavSection {
  sectionTitle: string;
  items: AdminNavItem[];
}

export const administrativeNavSections: AdminNavSection[] = [
  {
    sectionTitle: 'GESTIÓN ADMINISTRATIVA',
    items: [
      {
        id: 'admin-inicio',
        label: '1. Inicio',
        icon: Activity,
        path: '/gestion-administrativa/inicio',
        functionCode: 'ADMIN_DASHBOARD',
        description: 'Métricas generales, resumen y estado de campaña'
      },
      {
        id: 'admin-roles',
        label: '2. Gestión de Roles',
        icon: ShieldCheck,
        path: '/gestion-administrativa/roles',
        functionCode: 'ROLES_MANAGEMENT',
        description: 'Administración de roles y matriz de permisos'
      },
      {
        id: 'admin-lideres',
        label: '3. Líderes',
        icon: Users,
        path: '/gestion-administrativa/lideres',
        functionCode: 'LEADERS_VOTERS',
        description: 'Censo de líderes barriales y coordinadores'
      },
      {
        id: 'admin-votantes',
        label: '4. Votantes',
        icon: Users,
        path: '/gestion-administrativa/votantes',
        functionCode: 'LEADERS_VOTERS',
        description: 'Censo de votantes y referidos'
      },
      {
        id: 'admin-presupuesto-cne',
        label: '5. Presupuesto / CNE',
        icon: CreditCard,
        path: '/gestion-administrativa/presupuesto-cne',
        functionCode: 'BUDGET_CNE',
        description: 'Ingresos, gastos oficiales y balance Cuentas Claras'
      },
      {
        id: 'admin-campana',
        label: '6. Gestión de Campaña',
        icon: Building2,
        path: '/gestion-administrativa/campana',
        functionCode: 'CAMPAIGN_MANAGEMENT',
        description: 'Objetivos, hitos, fechas y cronograma electoral'
      },
      {
        id: 'admin-testigos',
        label: '7. Gestión de Testigos',
        icon: BookmarkCheck,
        path: '/gestion-administrativa/testigos',
        functionCode: 'WITNESSES_MANAGEMENT',
        description: 'Acreditación y asignación de puestos de votación'
      },
      {
        id: 'admin-jurados',
        label: '8. Jurados Electorales',
        icon: CheckSquare,
        path: '/gestion-administrativa/jurados',
        functionCode: 'JURORS_MANAGEMENT',
        description: 'Monitoreo e identificación de jurados en mesas'
      },
      {
        id: 'admin-encuestas',
        label: '9. Encuestas y Sondeos',
        icon: PieChart,
        path: '/gestion-administrativa/encuestas',
        functionCode: 'POLLS_SURVEYS',
        description: 'Diseño de sondeos y tabulación estadística'
      },
      {
        id: 'admin-configuracion',
        label: '10. Configuración',
        icon: Settings,
        path: '/gestion-administrativa/configuracion',
        functionCode: 'SYSTEM_SETTINGS',
        description: 'Ajustes del sistema, subusuarios y seguridad'
      }
    ]
  }
];
