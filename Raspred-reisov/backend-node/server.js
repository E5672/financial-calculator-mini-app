'use strict';

const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const Database = require('better-sqlite3');
const path = require('path');

// ── DB ────────────────────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'logistics.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    plate_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    capacity_tons REAL NOT NULL,
    gps_lat REAL NOT NULL DEFAULT 55.75,
    gps_lon REAL NOT NULL DEFAULT 37.62,
    accreditations TEXT NOT NULL DEFAULT '[]',
    restrictions TEXT NOT NULL DEFAULT '[]',
    maintenance_status TEXT NOT NULL DEFAULT 'available',
    release_permission TEXT NOT NULL DEFAULT 'allowed',
    forbidden_reason TEXT,
    forbidden_by TEXT,
    forbidden_at TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    origin_name TEXT NOT NULL,
    origin_lat REAL NOT NULL,
    origin_lon REAL NOT NULL,
    destination_name TEXT NOT NULL,
    destination_lat REAL NOT NULL,
    destination_lon REAL NOT NULL,
    distance_km REAL NOT NULL,
    profit REAL NOT NULL,
    weight_tons REAL NOT NULL,
    required_accreditations TEXT NOT NULL DEFAULT '[]',
    priority INTEGER NOT NULL DEFAULT 3,
    status TEXT NOT NULL DEFAULT 'pending',
    source TEXT NOT NULL DEFAULT 'manual',
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_id INTEGER NOT NULL REFERENCES machines(id),
    route_id INTEGER NOT NULL REFERENCES routes(id),
    status TEXT NOT NULL DEFAULT 'proposed',
    total_score REAL DEFAULT 0,
    distance_score REAL DEFAULT 0,
    profit_score REAL DEFAULT 0,
    restriction_score REAL DEFAULT 0,
    priority_score REAL DEFAULT 0,
    stability_score REAL DEFAULT 0,
    alternative_rank INTEGER DEFAULT 0,
    locked_by TEXT,
    locked_at TEXT,
    expires_at TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// ── HELPERS ──────────────────────────────────────────────────────────────────
const now = () => new Date().toISOString();
const parseJSON = (v) => { try { return JSON.parse(v); } catch { return []; } };

function hydrateMachine(row) {
  if (!row) return null;
  return { ...row, accreditations: parseJSON(row.accreditations), restrictions: parseJSON(row.restrictions) };
}
function hydrateRoute(row) {
  if (!row) return null;
  return { ...row, required_accreditations: parseJSON(row.required_accreditations) };
}
function hydrateAssignment(row, machines, routes) {
  if (!row) return null;
  const a = { ...row };
  if (machines) a.machine = hydrateMachine(machines.find(m => m.id === a.machine_id)) || null;
  if (routes)   a.route   = hydrateRoute(routes.find(r => r.id === a.route_id))     || null;
  return a;
}

// ── SEED ─────────────────────────────────────────────────────────────────────
function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM machines').get().c;
  if (count > 0) return;

  const t = now();
  const insertMachine = db.prepare(`
    INSERT INTO machines (name, plate_number, status, capacity_tons, gps_lat, gps_lon,
      accreditations, restrictions, maintenance_status, release_permission,
      forbidden_reason, forbidden_by, forbidden_at, version, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);

  const machines = [
    ['КАМАЗ-1','А001АА797','available',10.0,55.872,37.324,'["mkad","spb_zone"]','[]','available','allowed',null,null,null],
    ['КАМАЗ-2','В002ВВ797','available',15.0,55.611,37.738,'["mkad"]','[]','available','allowed',null,null,null],
    ['МАЗ-3','С003СС797','available',20.0,55.796,37.537,'["mkad","ttn_required"]','[]','available','allowed',null,null,null],
    ['Газель-4','Д004ДД797','available',3.5,55.680,37.360,'["mkad","city_center"]','[]','available','allowed',null,null,null],
    ['Скания-5','Е005ЕЕ797','available',25.0,55.920,37.810,'["mkad","spb_zone","heavy_cargo"]','[]','available','allowed',null,null,null],
    ['Вольво-6','Ж006ЖЖ797','in_route',20.0,55.750,37.620,'["mkad"]','[]','available','allowed',null,null,null],
    ['МАН-7','З007ЗЗ797','maintenance',18.0,55.580,37.490,'["mkad","ttn_required"]','[]','in_service','allowed',null,null,null],
    ['КАМАЗ-8','И008ИИ797','available',12.0,55.840,37.430,'["mkad"]','["no_night_rides"]','available','forbidden','Требуется замена тормозных колодок','Механик',t],
  ];
  machines.forEach(m => insertMachine.run(...m, t, t));

  const insertRoute = db.prepare(`
    INSERT INTO routes (name, origin_name, origin_lat, origin_lon, destination_name,
      destination_lat, destination_lon, distance_km, profit, weight_tons,
      required_accreditations, priority, status, source, version, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 1, ?, ?)
  `);

  const routes = [
    ['Химки → Подольск','Склад Химки',55.896,37.430,'База Подольск',55.431,37.544,68,45000,8.5,'["mkad"]',5,'import'],
    ['Мытищи → Домодедово','ТЦ Мытищи',55.920,37.739,'Склад Домодедово',55.444,37.900,89,62000,12,'["mkad"]',4,'import'],
    ['Балашиха → Одинцово','Завод Балашиха',55.794,37.959,'Склад Одинцово',55.678,37.279,72,38000,5,'["mkad"]',3,'manual'],
    ['Люберцы → Зеленоград','Склад Люберцы',55.677,37.893,'База Зеленоград',55.992,37.196,95,71000,18,'["mkad","ttn_required"]',5,'import'],
    ['Бутово → Сергиев Посад','Склад Бутово',55.553,37.569,'ТЦ Сергиев Посад',56.314,38.132,112,85000,22,'["mkad","heavy_cargo"]',4,'import'],
    ['Солнцево → Пушкино','База Солнцево',55.651,37.354,'Склад Пушкино',56.010,37.865,78,42000,3,'["mkad","city_center"]',2,'manual'],
    ['Тушино → Раменское','Склад Тушино',55.830,37.384,'База Раменское',55.571,38.227,94,55000,9,'["mkad"]',3,'import'],
    ['Котельники → Щёлково','ТЦ Котельники',55.659,37.880,'Завод Щёлково',55.921,38.011,61,33000,7,'["mkad"]',2,'manual'],
    ['Химки → Электросталь','Склад Химки',55.888,37.432,'Завод Электросталь',55.790,38.450,82,58000,14,'["mkad","ttn_required"]',4,'import'],
    ['Мытищи → Наро-Фоминск','ТЦ Мытищи',55.914,37.740,'Склад Наро-Фоминск',55.389,36.730,131,96000,20,'["mkad","heavy_cargo","spb_zone"]',5,'import'],
    ['Ботанический → Ногинск','Склад Ботанический',55.817,37.681,'База Ногинск',55.850,38.440,55,28000,4.5,'["mkad"]',1,'manual'],
    ['Одинцово → Балашиха','База Одинцово',55.680,37.281,'Склад Балашиха',55.796,37.938,66,48000,6,'["mkad"]',3,'import'],
  ];
  routes.forEach(r => insertRoute.run(...r, t, t));

  console.log('✓ Seed: 8 машин, 12 маршрутов');
}

seedIfEmpty();

// ── SCORING ENGINE ────────────────────────────────────────────────────────────
function calcDistance(machine, route) {
  const dlat = machine.gps_lat - route.origin_lat;
  const dlon = (machine.gps_lon - route.origin_lon) * Math.cos(route.origin_lat * Math.PI / 180);
  return Math.sqrt(dlat * dlat + dlon * dlon) * 111;
}

function passesHardFilters(machine, route) {
  if (machine.status !== 'available') return false;
  if (machine.release_permission === 'forbidden') return false;
  if (machine.capacity_tons < route.weight_tons) return false;
  const machineAcc = machine.accreditations || [];
  for (const req of (route.required_accreditations || [])) {
    if (!machineAcc.includes(req)) return false;
  }
  return true;
}

function calcRestrictionScore(machine) {
  const r = (machine.restrictions || []).length;
  return Math.max(0, 1 - r * 0.1);
}

function calcStabilityScore(machine) {
  if (machine.maintenance_status === 'available') return 1.0;
  if (machine.maintenance_status === 'in_service') return 0.3;
  return 0.0;
}

function computeScoring() {
  const allMachines = db.prepare('SELECT * FROM machines').all().map(hydrateMachine);
  const pendingRoutes = db.prepare("SELECT * FROM routes WHERE status = 'pending'").all().map(hydrateRoute);
  const results = [];

  const profits = pendingRoutes.map(r => r.profit);
  const maxProfit = Math.max(...profits) || 1;
  const minProfit = Math.min(...profits) || 0;
  const profitRange = maxProfit - minProfit || 1;

  for (const route of pendingRoutes) {
    const valid = allMachines.filter(m => passesHardFilters(m, route));
    if (valid.length === 0) continue;

    const distances = valid.map(m => calcDistance(m, route));
    const maxDist = Math.max(...distances) || 1;

    const profitScore = (route.profit - minProfit) / profitRange;

    const scored = valid.map((machine, i) => {
      const distanceScore    = 1 - distances[i] / maxDist;
      const restrictionScore = calcRestrictionScore(machine);
      const priorityScore    = (route.priority - 1) / 4;
      const stabilityScore   = calcStabilityScore(machine);
      const total = 0.40 * distanceScore + 0.25 * profitScore + 0.20 * restrictionScore
                  + 0.10 * priorityScore + 0.05 * stabilityScore;
      return { machine, route, total, distanceScore, profitScore, restrictionScore, priorityScore, stabilityScore };
    });

    scored.sort((a, b) => b.total - a.total);
    scored.slice(0, 3).forEach((s, rank) => results.push({ ...s, rank }));
  }
  return results;
}

// ── EXPRESS ──────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// ── MACHINES ─────────────────────────────────────────────────────────────────
app.get('/api/machines', (_, res) => {
  const rows = db.prepare('SELECT * FROM machines').all().map(hydrateMachine);
  res.json(rows);
});

app.get('/api/machines/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM machines WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ detail: 'Машина не найдена' });
  res.json(hydrateMachine(row));
});

app.put('/api/machines/:id', (req, res) => {
  const machine = db.prepare('SELECT * FROM machines WHERE id = ?').get(req.params.id);
  if (!machine) return res.status(404).json({ detail: 'Машина не найдена' });

  const allowed = ['name','status','capacity_tons','gps_lat','gps_lon','accreditations','restrictions','maintenance_status'];
  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(Array.isArray(req.body[key]) ? JSON.stringify(req.body[key]) : req.body[key]);
    }
  }
  if (updates.length === 0) return res.json(hydrateMachine(machine));

  updates.push('version = version + 1', 'updated_at = ?');
  values.push(now(), req.params.id);
  db.prepare(`UPDATE machines SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const updated = hydrateMachine(db.prepare('SELECT * FROM machines WHERE id = ?').get(req.params.id));
  broadcast({ event: 'machine_updated', machine_id: updated.id, data: updated });
  res.json(updated);
});

app.post('/api/machines/:id/release-permission', (req, res) => {
  const machine = db.prepare('SELECT * FROM machines WHERE id = ?').get(req.params.id);
  if (!machine) return res.status(404).json({ detail: 'Машина не найдена' });

  const { permission, reason, set_by } = req.body;
  const t = now();
  if (permission === 'forbidden') {
    db.prepare(`UPDATE machines SET release_permission='forbidden', forbidden_reason=?, forbidden_by=?, forbidden_at=?, version=version+1, updated_at=? WHERE id=?`)
      .run(reason || null, set_by, t, t, req.params.id);
  } else {
    db.prepare(`UPDATE machines SET release_permission='allowed', forbidden_reason=NULL, forbidden_by=NULL, forbidden_at=NULL, version=version+1, updated_at=? WHERE id=?`)
      .run(t, req.params.id);
  }
  const updated = hydrateMachine(db.prepare('SELECT * FROM machines WHERE id = ?').get(req.params.id));
  broadcast({ event: 'machine_updated', machine_id: updated.id, data: updated });
  res.json(updated);
});

app.get('/api/machines/:id/assignments', (req, res) => {
  const rows = db.prepare('SELECT * FROM assignments WHERE machine_id = ? ORDER BY created_at DESC').all(req.params.id);
  const machines = db.prepare('SELECT * FROM machines').all().map(hydrateMachine);
  const routes = db.prepare('SELECT * FROM routes').all().map(hydrateRoute);
  res.json(rows.map(r => hydrateAssignment(r, machines, routes)));
});

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.get('/api/routes', (req, res) => {
  const { status } = req.query;
  const sql = status
    ? 'SELECT * FROM routes WHERE status = ? ORDER BY priority DESC, profit DESC'
    : 'SELECT * FROM routes ORDER BY priority DESC, profit DESC';
  const rows = (status ? db.prepare(sql).all(status) : db.prepare(sql).all()).map(hydrateRoute);
  res.json(rows);
});

app.post('/api/routes', (req, res) => {
  const t = now();
  const b = req.body;
  const r = db.prepare(`
    INSERT INTO routes (name, origin_name, origin_lat, origin_lon, destination_name,
      destination_lat, destination_lon, distance_km, profit, weight_tons,
      required_accreditations, priority, status, source, version, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 1, ?, ?)
  `).run(b.name, b.origin_name, b.origin_lat, b.origin_lon, b.destination_name,
         b.destination_lat, b.destination_lon, b.distance_km, b.profit, b.weight_tons,
         JSON.stringify(b.required_accreditations || []), b.priority || 3, b.source || 'manual', t, t);

  const created = hydrateRoute(db.prepare('SELECT * FROM routes WHERE id = ?').get(r.lastInsertRowid));
  broadcast({ event: 'route_created', route_id: created.id });
  res.status(201).json(created);
});

app.post('/api/routes/import', (req, res) => {
  const t = now();
  const created = [];
  const insertRoute = db.prepare(`
    INSERT INTO routes (name, origin_name, origin_lat, origin_lon, destination_name,
      destination_lat, destination_lon, distance_km, profit, weight_tons,
      required_accreditations, priority, status, source, version, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 1, ?, ?)
  `);
  for (const b of (req.body.routes || [])) {
    const r = insertRoute.run(b.name, b.origin_name, b.origin_lat, b.origin_lon, b.destination_name,
      b.destination_lat, b.destination_lon, b.distance_km, b.profit, b.weight_tons,
      JSON.stringify(b.required_accreditations || []), b.priority || 3, b.source || 'import', t, t);
    created.push(hydrateRoute(db.prepare('SELECT * FROM routes WHERE id = ?').get(r.lastInsertRowid)));
  }
  broadcast({ event: 'routes_imported', count: created.length });
  res.status(201).json(created);
});

app.delete('/api/routes/:id', (req, res) => {
  const route = db.prepare('SELECT * FROM routes WHERE id = ?').get(req.params.id);
  if (!route) return res.status(404).json({ detail: 'Маршрут не найден' });
  if (!['pending','cancelled'].includes(route.status))
    return res.status(400).json({ detail: 'Нельзя удалить маршрут в статусе: ' + route.status });
  db.prepare('DELETE FROM routes WHERE id = ?').run(req.params.id);
  broadcast({ event: 'route_deleted', route_id: Number(req.params.id) });
  res.status(204).end();
});

// ── ASSIGNMENTS ───────────────────────────────────────────────────────────────
function getAssignmentsWithRelations(statusFilter) {
  const sql = statusFilter
    ? 'SELECT * FROM assignments WHERE status = ? ORDER BY alternative_rank ASC, total_score DESC'
    : 'SELECT * FROM assignments ORDER BY alternative_rank ASC, total_score DESC';
  const rows = statusFilter ? db.prepare(sql).all(statusFilter) : db.prepare(sql).all();
  const machines = db.prepare('SELECT * FROM machines').all().map(hydrateMachine);
  const routes = db.prepare('SELECT * FROM routes').all().map(hydrateRoute);
  return rows.map(r => hydrateAssignment(r, machines, routes));
}

app.get('/api/assignments', (req, res) => {
  res.json(getAssignmentsWithRelations(req.query.status));
});

app.post('/api/assignments/compute', (req, res) => {
  // Clear old proposals
  db.prepare("DELETE FROM assignments WHERE status = 'proposed'").run();

  const scored = computeScoring();
  const t = now();
  const insert = db.prepare(`
    INSERT INTO assignments (machine_id, route_id, status, total_score, distance_score,
      profit_score, restriction_score, priority_score, stability_score,
      alternative_rank, version, created_at, updated_at)
    VALUES (?, ?, 'proposed', ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);

  for (const s of scored) {
    insert.run(s.machine.id, s.route.id,
      Math.round(s.total * 10000) / 10000,
      Math.round(s.distanceScore * 10000) / 10000,
      Math.round(s.profitScore * 10000) / 10000,
      Math.round(s.restrictionScore * 10000) / 10000,
      Math.round(s.priorityScore * 10000) / 10000,
      Math.round(s.stabilityScore * 10000) / 10000,
      s.rank, t, t);
  }

  const result = getAssignmentsWithRelations('proposed');
  broadcast({ event: 'assignments_computed', count: result.length });
  res.json(result);
});

app.post('/api/assignments/:id/lock', (req, res) => {
  const a = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ detail: 'Не найдено' });

  const { user_name } = req.body;
  const t = now();
  const expires = new Date(Date.now() + 3 * 60 * 1000).toISOString();

  if (a.locked_by && a.locked_by !== user_name && a.expires_at && a.expires_at > t) {
    const secs = Math.round((new Date(a.expires_at) - Date.now()) / 1000);
    return res.status(409).json({ detail: `Заблокировано пользователем ${a.locked_by}. Истекает через ${secs} сек.` });
  }

  db.prepare('UPDATE assignments SET locked_by=?, locked_at=?, expires_at=?, updated_at=? WHERE id=?')
    .run(user_name, t, expires, t, req.params.id);

  const updated = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  broadcast({ event: 'assignment_locked', assignment_id: updated.id, locked_by: user_name, expires_at: expires });
  res.json(hydrateAssignment(updated, db.prepare('SELECT * FROM machines').all().map(hydrateMachine), db.prepare('SELECT * FROM routes').all().map(hydrateRoute)));
});

app.post('/api/assignments/:id/unlock', (req, res) => {
  const a = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ detail: 'Не найдено' });
  const { user_name } = req.body;
  const t = now();

  if (a.locked_by && a.locked_by !== user_name) {
    return res.status(409).json({ detail: `Нельзя снять блокировку: заблокировано ${a.locked_by}` });
  }

  db.prepare('UPDATE assignments SET locked_by=NULL, locked_at=NULL, expires_at=NULL, updated_at=? WHERE id=?').run(t, req.params.id);
  broadcast({ event: 'assignment_unlocked', assignment_id: Number(req.params.id) });
  const updated = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  res.json(hydrateAssignment(updated, db.prepare('SELECT * FROM machines').all().map(hydrateMachine), db.prepare('SELECT * FROM routes').all().map(hydrateRoute)));
});

app.post('/api/assignments/:id/confirm', (req, res) => {
  const a = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ detail: 'Не найдено' });

  const { user_name, expected_version, notes } = req.body;
  const t = now();

  if (a.version !== expected_version) {
    return res.status(409).json({ detail: 'Назначение было изменено другим пользователем. Пожалуйста, обновите страницу.' });
  }
  if (a.locked_by && a.locked_by !== user_name && a.expires_at > t) {
    return res.status(409).json({ detail: `Назначение заблокировано пользователем ${a.locked_by}` });
  }

  db.prepare(`UPDATE assignments SET status='confirmed', version=version+1, locked_by=NULL,
    locked_at=NULL, expires_at=NULL, notes=?, updated_at=? WHERE id=?`).run(notes || null, t, req.params.id);
  db.prepare("UPDATE routes SET status='assigned', version=version+1, updated_at=? WHERE id=?").run(t, a.route_id);
  db.prepare("UPDATE machines SET status='in_route', version=version+1, updated_at=? WHERE id=?").run(t, a.machine_id);

  // Remove all other proposed assignments that use the same machine or the same route
  db.prepare(`DELETE FROM assignments WHERE status = 'proposed' AND id != ? AND (machine_id = ? OR route_id = ?)`)
    .run(req.params.id, a.machine_id, a.route_id);

  const updated = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  broadcast({ event: 'assignment_confirmed', assignment_id: updated.id, machine_id: a.machine_id, route_id: a.route_id });
  res.json(hydrateAssignment(updated, db.prepare('SELECT * FROM machines').all().map(hydrateMachine), db.prepare('SELECT * FROM routes').all().map(hydrateRoute)));
});

app.post('/api/assignments/:id/reject', (req, res) => {
  const a = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ detail: 'Не найдено' });

  const { user_name, reason } = req.body;
  const t = now();
  db.prepare(`UPDATE assignments SET status='rejected', version=version+1, locked_by=NULL,
    locked_at=NULL, expires_at=NULL, notes=?, updated_at=? WHERE id=?`).run(reason || null, t, req.params.id);

  const updated = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  broadcast({ event: 'assignment_rejected', assignment_id: updated.id });
  res.json(hydrateAssignment(updated, db.prepare('SELECT * FROM machines').all().map(hydrateMachine), db.prepare('SELECT * FROM routes').all().map(hydrateRoute)));
});

// ── HTTP + WS SERVER ─────────────────────────────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(msg) {
  const json = JSON.stringify(msg);
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(json);
  });
}

wss.on('connection', ws => {
  ws.on('message', msg => { if (msg.toString() === 'ping') ws.send('pong'); });
  ws.on('error', () => {});
});

const PORT = 8000;
server.listen(PORT, () => console.log(`✓ Бэкенд запущен: http://localhost:${PORT}`));
