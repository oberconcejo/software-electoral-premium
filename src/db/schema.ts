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
