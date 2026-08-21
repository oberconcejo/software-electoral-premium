const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../server/routes');

const templates = {
  'witnesses.ts': `import express from 'express';
import { requireAuth } from '@clerk/express';
import { db } from '../../src/db';
import { witnesses } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(witnesses);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { clientId, nombre, cedula, telefono, email, municipio, zona, puesto, mesa, estado, documentoSoporteUrl, observaciones } = req.body;
    await db.insert(witnesses).values({
      clientId: clientId || null,
      nombreCompleto: nombre, cedula, telefono, email, municipio, zona, puestoVotacion: puesto, mesa, estado, documentoSoporteUrl, observaciones
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cedula, telefono, email, municipio, zona, puesto, mesa, estado, documentoSoporteUrl, observaciones } = req.body;
    await db.update(witnesses).set({
      nombreCompleto: nombre, cedula, telefono, email, municipio, zona, puestoVotacion: puesto, mesa, estado, documentoSoporteUrl, observaciones
    }).where(eq(witnesses.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(witnesses).where(eq(witnesses.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
`,

  'campaigns.ts': `import express from 'express';
import { requireAuth } from '@clerk/express';
import { db } from '../../src/db';
import { campaigns } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(campaigns);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { clientId, nombre, candidatoNombre, cargoPostulacion, departamento, municipio, circunscripcion, metaVotos, presupuestoTotal, estado, descripcion } = req.body;
    await db.insert(campaigns).values({
      clientId: clientId || null,
      nombre, candidatoNombre, cargoPostulacion, departamento, municipio, circunscripcion, metaVotos, presupuestoTotal: presupuestoTotal?.toString(), estado, descripcion
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, candidatoNombre, cargoPostulacion, departamento, municipio, circunscripcion, metaVotos, presupuestoTotal, estado, descripcion } = req.body;
    await db.update(campaigns).set({
      nombre, candidatoNombre, cargoPostulacion, departamento, municipio, circunscripcion, metaVotos, presupuestoTotal: presupuestoTotal?.toString(), estado, descripcion
    }).where(eq(campaigns.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(campaigns).where(eq(campaigns.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
`,

  'voters.ts': `import express from 'express';
import { requireAuth } from '@clerk/express';
import { db } from '../../src/db';
import { voters, leaders } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// LIDERES
router.get('/leaders', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(leaders);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/leaders', requireAuth(), async (req, res) => {
  try {
    const { clientId, nombre, cedula, telefono, email, comuna, barrio, puesto, mesa, zonaInfluencia, metaVotos, votosAsegurados, estado } = req.body;
    await db.insert(leaders).values({
      clientId: clientId || null, nombreCompleto: nombre, cedula, telefono, email, comuna, barrio, puesto, mesa, zonaInfluencia, metaVotos, votosAsegurados, estado
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/leaders/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cedula, telefono, email, comuna, barrio, puesto, mesa, zonaInfluencia, metaVotos, votosAsegurados, estado } = req.body;
    await db.update(leaders).set({
      nombreCompleto: nombre, cedula, telefono, email, comuna, barrio, puesto, mesa, zonaInfluencia, metaVotos, votosAsegurados, estado
    }).where(eq(leaders.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/leaders/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(leaders).where(eq(leaders.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// VOTANTES
router.get('/voters', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(voters);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/voters', requireAuth(), async (req, res) => {
  try {
    const { clientId, nombre, cedula, telefono, email, departamento, municipio, comuna, barrio, puesto, mesa, liderId, liderNombre, intencion, status } = req.body;
    await db.insert(voters).values({
      clientId: clientId || null, nombreCompleto: nombre, cedula, telefono, email, departamento, municipio, comuna, barrio, puestoVotacion: puesto, mesa, liderId, liderNombre, intencion, status
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/voters/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cedula, telefono, email, departamento, municipio, comuna, barrio, puesto, mesa, liderId, liderNombre, intencion, status } = req.body;
    await db.update(voters).set({
      nombreCompleto: nombre, cedula, telefono, email, departamento, municipio, comuna, barrio, puestoVotacion: puesto, mesa, liderId, liderNombre, intencion, status
    }).where(eq(voters.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/voters/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(voters).where(eq(voters.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
`,

  'surveys.ts': `import express from 'express';
import { requireAuth } from '@clerk/express';
import { db } from '../../src/db';
import { surveys } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(surveys);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { clientId, titulo, descripcion, muestraObjetivo, estado, preguntas } = req.body;
    await db.insert(surveys).values({
      clientId: clientId || null, titulo, descripcion, muestraObjetivo, estado, preguntas
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, muestraObjetivo, estado, preguntas } = req.body;
    await db.update(surveys).set({
      titulo, descripcion, muestraObjetivo, estado, preguntas
    }).where(eq(surveys.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(surveys).where(eq(surveys.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
`,

  'budget.ts': `import express from 'express';
import { requireAuth } from '@clerk/express';
import { db } from '../../src/db';
import { budgetItems } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(budgetItems);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { clientId, campaignId, tipo, categoriaCNE, concepto, monto, comprobanteNumero, soporteUrl, beneficiarioNombre, beneficiarioNit, estado, observaciones } = req.body;
    await db.insert(budgetItems).values({
      clientId: clientId || null, campaignId, tipo, categoriaCNE, concepto, monto: monto?.toString(), comprobanteNumero, soporteUrl, beneficiarioNombre, beneficiarioNit, estado, observaciones
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { campaignId, tipo, categoriaCNE, concepto, monto, comprobanteNumero, soporteUrl, beneficiarioNombre, beneficiarioNit, estado, observaciones } = req.body;
    await db.update(budgetItems).set({
      campaignId, tipo, categoriaCNE, concepto, monto: monto?.toString(), comprobanteNumero, soporteUrl, beneficiarioNombre, beneficiarioNit, estado, observaciones
    }).where(eq(budgetItems.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(budgetItems).where(eq(budgetItems.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
`,

  'roles.ts': `import express from 'express';
import { requireAuth } from '@clerk/express';
import { db } from '../../src/db';
import { customRoles, profiles } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(customRoles);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { clientId, name, code, description, isActive, isSystem, allowedModules } = req.body;
    await db.insert(customRoles).values({
      clientId: clientId || null, name, code, description, isActive, isSystem, allowedModules
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, isActive, isSystem, allowedModules } = req.body;
    await db.update(customRoles).set({
      name, code, description, isActive, isSystem, allowedModules
    }).where(eq(customRoles.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(customRoles).where(eq(customRoles.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Profiles (Users)
router.get('/profiles', requireAuth(), async (req, res) => {
  try {
    const data = await db.select().from(profiles);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/profiles', requireAuth(), async (req, res) => {
  try {
    const { id, clerkId, clientId, email, displayName, phone, role, status, allowedModules, customRoleId } = req.body;
    await db.insert(profiles).values({
      id, clerkId, clientId: clientId || null, email, displayName, phone, role, status, allowedModules, customRoleId
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/profiles/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, displayName, phone, role, status, allowedModules, customRoleId } = req.body;
    await db.update(profiles).set({
      email, displayName, phone, role, status, allowedModules, customRoleId
    }).where(eq(profiles.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/profiles/:id', requireAuth(), async (req, res) => {
  try {
    await db.delete(profiles).where(eq(profiles.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
`
};

for (const [filename, content] of Object.entries(templates)) {
  fs.writeFileSync(path.join(routesDir, filename), content);
}
console.log('Routes generated successfully.');
