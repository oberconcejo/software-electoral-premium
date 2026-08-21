import { pgTable, text, timestamp, uuid, integer, jsonb, numeric, boolean, date } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  nit: text('nit').unique(),
  email: text('email').unique().notNull(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  department: text('department'),
  country: text('country').default('Colombia'),
  logoUrl: text('logo_url'),
  plan: text('plan').default('BASIC'), // 'BASIC', 'PRO', 'ENTERPRISE'
  status: text('status').default('ACTIVE'), // 'ACTIVE', 'SUSPENDED', 'INACTIVE'
  maxUsers: integer('max_users').default(10),
  allowedModules: text('allowed_modules').array().default(sql`ARRAY['ADMINISTRATIVE','TERRITORY','STRATEGY','CRM']::text[]`),
  startDate: timestamp('start_date', { withTimezone: true }).defaultNow(),
  expiryDate: timestamp('expiry_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // We will use Clerk user ID here instead of Supabase UUID (Clerk uses strings, wait, we might need text for Clerk ID)
  // Actually, Clerk user IDs are strings like 'user_2xyz...'. If the original DB used UUIDs linked to Supabase auth.users, we should use text for id if moving to Clerk.
  clerkId: text('clerk_id').unique().notNull(), // Instead of overriding id, let's keep UUID for internal relations, and map clerkId.
  clientId: uuid('client_id').references(() => clients.id),
  email: text('email').notNull(),
  displayName: text('display_name'),
  phone: text('phone'),
  role: text('role').notNull().default('USUARIO'), // 'SUPERADMIN', 'ADMIN_CLIENTE', 'DIRECTOR', 'COORDINADOR', 'USUARIO', 'USUARIO_LIMITADO'
  status: text('status').default('ACTIVE'),
  allowedModules: text('allowed_modules').array().default(sql`ARRAY['ADMINISTRATIVE']::text[]`),
  customRoleId: uuid('custom_role_id'), // Will reference custom_roles.id
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }),
  nombre: text('nombre').notNull(),
  candidatoNombre: text('candidato_nombre'),
  cargoPostulacion: text('cargo_postulacion'),
  departamento: text('departamento'),
  municipio: text('municipio'),
  circunscripcion: text('circunscripcion'),
  fechaInicio: date('fecha_inicio').defaultNow(),
  fechaEleccion: date('fecha_eleccion'),
  metaVotos: integer('meta_votos').default(0),
  presupuestoTotal: numeric('presupuesto_total', { precision: 15, scale: 2 }).default('0'),
  estado: text('estado').default('ACTIVA'), // 'PLANIFICACION', 'ACTIVA', 'PAUSADA', 'FINALIZADA'
  descripcion: text('descripcion'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// We will add the rest of the tables progressively as needed.

export const voters = pgTable('voters', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id),
  cedula: text('cedula').unique().notNull(),
  nombreCompleto: text('nombre_completo').notNull(),
  telefono: text('telefono'),
  email: text('email'),
  direccion: text('direccion'),
  departamento: text('departamento'),
  municipio: text('municipio'),
  comuna: text('comuna'),
  barrio: text('barrio'),
  puestoVotacion: text('puesto_votacion'),
  mesa: text('mesa'),
  liderId: uuid('lider_id'),
  liderNombre: text('lider_nombre'),
  intencion: text('intencion').default('Indeciso'), // 'Voto Seguro' | 'Probable' | 'Indeciso' | 'En Contra'
  estadoValidacion: text('estado_validacion').default('PENDIENTE'),
  status: text('status').default('ACTIVE'), // 'ACTIVE' | 'INACTIVE'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const leaders = pgTable('leaders', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id),
  cedula: text('cedula').unique().notNull(),
  nombreCompleto: text('nombre_completo').notNull(),
  telefono: text('telefono'),
  email: text('email'),
  comuna: text('comuna'),
  barrio: text('barrio'),
  puesto: text('puesto'),
  mesa: text('mesa'),
  zonaInfluencia: text('zona_influencia'),
  metaVotos: integer('meta_votos').default(0),
  votosAsegurados: integer('votos_asegurados').default(0),
  estado: text('estado').default('ACTIVO'), // 'ACTIVO' | 'INACTIVO'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const jurors = pgTable('jurors', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id),
  cedula: text('cedula').unique().notNull(),
  nombreCompleto: text('nombre_completo').notNull(),
  telefono: text('telefono'),
  municipio: text('municipio'),
  puestoAsignado: text('puesto_asignado'),
  mesaAsignada: text('mesa_asignada'),
  estado: text('estado').default('PENDIENTE'),
  asistencia: boolean('asistencia').default(false),
  cargo: text('cargo').default('VOCAL'), // PRESIDENTE | VICEPRESIDENTE | VOCAL | REMANENTE
  afinidad: text('afinidad').default('DESCONOCIDO'),
  observaciones: text('observaciones'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const witnesses = pgTable('witnesses', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id),
  cedula: text('cedula').unique().notNull(),
  nombreCompleto: text('nombre_completo').notNull(),
  telefono: text('telefono'),
  email: text('email'),
  municipio: text('municipio'),
  zona: text('zona'),
  puestoVotacion: text('puesto_votacion'),
  mesa: text('mesa'),
  estado: text('estado').default('ACTIVO'),
  documentoSoporteUrl: text('documento_soporte_url'),
  observaciones: text('observaciones'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const budgetItems = pgTable('budget_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  tipo: text('tipo').notNull(), // 'INGRESO' | 'GASTO'
  categoriaCNE: text('categoria_cne').notNull(),
  concepto: text('concepto').notNull(),
  monto: numeric('monto', { precision: 15, scale: 2 }).notNull().default('0'),
  fecha: timestamp('fecha').defaultNow(),
  comprobanteNumero: text('comprobante_numero'),
  soporteUrl: text('soporte_url'),
  beneficiarioNombre: text('beneficiario_nombre'),
  beneficiarioNit: text('beneficiario_nit'),
  estado: text('estado').default('REGISTRADO'),
  observaciones: text('observaciones'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const surveys = pgTable('surveys', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id),
  titulo: text('titulo').notNull(),
  descripcion: text('descripcion'),
  fechaInicio: timestamp('fecha_inicio').defaultNow(),
  fechaFin: timestamp('fecha_fin'),
  muestraObjetivo: integer('muestra_objetivo').default(0),
  respuestasCount: integer('respuestas_count').default(0),
  estado: text('estado').default('BORRADOR'), // 'BORRADOR' | 'ACTIVA' | 'CERRADA'
  preguntas: jsonb('preguntas').default('[]'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const customRoles = pgTable('custom_roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  isSystem: boolean('is_system').default(false),
  allowedModules: text('allowed_modules').array().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const pollingStationQueries = pgTable('polling_station_queries', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id),
  cedula: text('cedula').notNull(),
  nombre: text('nombre'),
  departamento: text('departamento'),
  municipio: text('municipio'),
  puesto: text('puesto'),
  mesa: text('mesa'),
  exito: boolean('exito').default(false),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
