import { useState, useEffect, useCallback, useRef } from "react";
import { loginConGoogle, cerrarSesion, onLogin, guardarEnNube, cargarDesdeNube } from "./firebase";


// ── Paleta y tipografía ──────────────────────────────────────────────────────
// Estética: editorial de papelería — crema + tinta oscura + acento terracota
// Fuentes: Playfair Display (display) + DM Sans (body)

const FONT_LINK = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
${FONT_LINK}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream:   #F7F3EE;
  --cream2:  #EDE8E0;
  --ink:     #1C1917;
  --ink2:    #44403C;
  --ink3:    #78716C;
  --terra:   #C2714F;
  --terra2:  #E8956D;
  --sage:    #6B7C6E;
  --gold:    #B89A6A;
  --white:   #FDFCFA;
  --border:  #D6CFC5;
  --danger:  #C0392B;
  --success: #4A7C59;
  --shadow:  0 2px 12px rgba(28,25,23,.08);
  --shadow-lg: 0 8px 32px rgba(28,25,23,.12);
}

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--cream);
  color: var(--ink);
  min-height: 100vh;
}

/* ── Layout ── */
.app { display: flex; min-height: 100vh; }

.sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--ink);
  display: flex;
  flex-direction: column;
  padding: 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-logo {
  padding: 28px 24px 20px;
  border-bottom: 1px solid rgba(255,255,255,.1);
}
.sidebar-logo h1 {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: var(--cream);
  line-height: 1.2;
}
.sidebar-logo span {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: var(--terra2);
  letter-spacing: .12em;
  text-transform: uppercase;
  font-weight: 500;
}

.sidebar-nav { flex: 1; padding: 16px 0; }

.nav-section-label {
  font-size: 10px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgba(255,255,255,.3);
  font-weight: 600;
  padding: 12px 24px 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  cursor: pointer;
  font-size: 13.5px;
  color: rgba(255,255,255,.6);
  font-weight: 400;
  transition: all .15s;
  border-left: 3px solid transparent;
}
.nav-item:hover { color: var(--cream); background: rgba(255,255,255,.04); }
.nav-item.active {
  color: var(--cream);
  border-left-color: var(--terra);
  background: rgba(194,113,79,.12);
  font-weight: 500;
}
.nav-item .nav-icon { font-size: 15px; width: 20px; text-align: center; }
.nav-badge {
  margin-left: auto;
  background: var(--terra);
  color: white;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.main { flex: 1; overflow-y: auto; }

.topbar {
  background: var(--white);
  border-bottom: 1px solid var(--border);
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
}
.topbar-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
}
.topbar-sub { font-size: 12.5px; color: var(--ink3); margin-top: 1px; }

.page { padding: 32px; }

/* ── Cards ── */
.card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow);
  overflow: hidden;
}
.card-header {
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
}
.card-body { padding: 20px 24px; }

/* ── Botones ── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 7px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all .15s;
}
.btn-primary { background: var(--terra); color: white; }
.btn-primary:hover { background: #B0633F; }
.btn-secondary {
  background: transparent;
  color: var(--ink2);
  border: 1px solid var(--border);
}
.btn-secondary:hover { background: var(--cream2); }
.btn-danger { background: transparent; color: var(--danger); border: 1px solid #F5B7B1; }
.btn-danger:hover { background: #FDECEA; }
.btn-sm { padding: 5px 12px; font-size: 12px; }
.btn-icon { padding: 7px 10px; }

/* ── Formularios ── */
.form-grid { display: grid; gap: 16px; }
.form-grid-2 { grid-template-columns: 1fr 1fr; }
.form-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
.form-row { display: flex; gap: 12px; align-items: flex-end; }

.field { display: flex; flex-direction: column; gap: 5px; }
.label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink2);
  letter-spacing: .03em;
  text-transform: uppercase;
}
.input, .select, .textarea {
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  color: var(--ink);
  background: var(--white);
  transition: border .15s;
  outline: none;
}
.input:focus, .select:focus, .textarea:focus {
  border-color: var(--terra);
  box-shadow: 0 0 0 3px rgba(194,113,79,.1);
}
.input-prefix {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--white);
  transition: border .15s;
}
.input-prefix:focus-within {
  border-color: var(--terra);
  box-shadow: 0 0 0 3px rgba(194,113,79,.1);
}
.prefix-text {
  padding: 9px 10px;
  background: var(--cream2);
  font-size: 12px;
  color: var(--ink3);
  border-right: 1px solid var(--border);
  white-space: nowrap;
}
.input-prefix input {
  border: none;
  outline: none;
  padding: 9px 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  color: var(--ink);
  background: transparent;
  width: 100%;
}

/* ── Tabla ── */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead th {
  text-align: left;
  padding: 10px 14px;
  background: var(--cream);
  color: var(--ink3);
  font-size: 11px;
  letter-spacing: .1em;
  text-transform: uppercase;
  font-weight: 600;
  border-bottom: 1px solid var(--border);
}
tbody tr { border-bottom: 1px solid var(--cream2); transition: background .1s; }
tbody tr:hover { background: var(--cream); }
td { padding: 11px 14px; color: var(--ink2); vertical-align: middle; }
td.mono { font-variant-numeric: tabular-nums; font-size: 13px; }
td.bold { font-weight: 600; color: var(--ink); }

/* ── Badges ── */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.badge-ok { background: #D4EDDA; color: #1E6D38; }
.badge-warn { background: #FFF3CD; color: #856404; }
.badge-danger { background: #FDECEA; color: var(--danger); }
.badge-neutral { background: var(--cream2); color: var(--ink3); }
.badge-terra { background: #F9E5DC; color: var(--terra); }

/* ── Dashboard stats ── */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.stat-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}
.stat-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--terra);
  opacity: .6;
}
.stat-label { font-size: 11px; color: var(--ink3); text-transform: uppercase; letter-spacing: .1em; font-weight: 600; }
.stat-value { font-family: 'Playfair Display', serif; font-size: 28px; color: var(--ink); margin-top: 4px; }
.stat-sub { font-size: 12px; color: var(--ink3); margin-top: 2px; }

/* ── Misc ── */
.divider { height: 1px; background: var(--border); margin: 20px 0; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mb-4 { margin-bottom: 16px; }
.text-sm { font-size: 12.5px; }
.text-xs { font-size: 11.5px; }
.text-muted { color: var(--ink3); }
.text-terra { color: var(--terra); }
.text-success { color: var(--success); }
.text-danger { color: var(--danger); }
.font-bold { font-weight: 700; }
.w-full { width: 100%; }
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--ink3);
}
.empty-state .empty-icon { font-size: 36px; margin-bottom: 12px; }
.empty-state p { font-size: 14px; }

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 16px;
}
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.alert-warn { background: #FFF8E1; color: #795400; border: 1px solid #FFE082; }
.alert-danger { background: #FDECEA; color: var(--danger); border: 1px solid #F5B7B1; }
.alert-info { background: #EBF4F7; color: #1565A0; border: 1px solid #B3D4E8; }

.price-result {
  background: linear-gradient(135deg, var(--ink) 0%, #2D2926 100%);
  border-radius: 10px;
  padding: 24px;
  color: var(--cream);
}
.price-result .result-label { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; opacity: .6; }
.price-result .result-value { font-family: 'Playfair Display', serif; font-size: 32px; margin-top: 4px; }
.price-result .result-sub { font-size: 12px; opacity: .7; margin-top: 2px; }

.breakdown-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(255,255,255,.1);
  font-size: 13px;
}
.breakdown-row:last-child { border-bottom: none; }
.breakdown-row .key { opacity: .7; }
.breakdown-row .val { font-weight: 600; }

.tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
.tab {
  padding: 10px 20px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--ink3);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all .15s;
}
.tab:hover { color: var(--ink); }
.tab.active { color: var(--terra); border-bottom-color: var(--terra); font-weight: 600; }

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  background: var(--cream2);
  border-radius: 20px;
  font-size: 12px;
  color: var(--ink2);
}
.chip button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ink3);
  font-size: 14px;
  line-height: 1;
  padding: 0;
}
.chip button:hover { color: var(--danger); }
`;

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(n || 0);

const fmtN = (n, dec = 2) =>
  new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: dec }).format(n || 0);

const uid = () => Math.random().toString(36).slice(2, 9);

const UNITS = ["unidad", "resma", "metro", "cm", "hoja", "gramo", "kg", "ml", "litro", "rollo"];
const SEASONS = ["Todo el año", "Enero - Marzo", "Regreso a clases", "Invierno", "Primavera", "Fin de año / Navidad", "San Valentín", "Día del Maestro", "Día de la Madre", "Día del Padre"];
const CATEGORIES = ["Agendas", "Calendarios", "Papelería", "Kits", "Stickers", "Listas & planners", "Tarjetas", "Otro"];

// ── CSS Etapa 2 additions ────────────────────────────────────────────────────
const CSS_E2 = `
.compare-grid { display: grid; gap: 0; }
.compare-col {
  border-right: 1px solid var(--border);
  min-width: 200px;
}
.compare-col:last-child { border-right: none; }
.compare-header {
  padding: 16px 18px;
  background: var(--cream);
  border-bottom: 1px solid var(--border);
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 600;
}
.compare-row {
  display: flex;
  flex-direction: column;
}
.compare-cell {
  padding: 11px 18px;
  border-bottom: 1px solid var(--cream2);
  font-size: 13px;
  color: var(--ink2);
}
.compare-cell.label-col {
  background: var(--cream);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--ink3);
  font-weight: 600;
}
.compare-cell.best { color: var(--success); font-weight: 700; }
.compare-cell.worst { color: var(--danger); }

.kit-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--shadow);
}
.kit-card-header {
  padding: 14px 18px;
  background: linear-gradient(135deg, var(--ink) 0%, #2D2926 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.kit-name {
  font-family: 'Playfair Display', serif;
  font-size: 15px;
  color: var(--cream);
  font-weight: 600;
}
.kit-price {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: var(--terra2);
}
.kit-body { padding: 14px 18px; }
.kit-product-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed var(--cream2);
  font-size: 13px;
}
.kit-product-row:last-child { border-bottom: none; }

.vol-tier {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--cream);
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid var(--border);
}
.vol-tier-range {
  font-weight: 700;
  font-size: 14px;
  color: var(--ink);
  min-width: 130px;
}
.vol-tier-desc { font-size: 13px; color: var(--ink3); flex: 1; }
.vol-tier-badge {
  background: var(--terra);
  color: white;
  font-size: 13px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}
`;

// ── Datos iniciales demo ─────────────────────────────────────────────────────
const INIT_INSUMOS = [
  { id: uid(), nombre: "Resma papel obra A4 75gr", categoria: "Papel", unidad: "hoja", costoUnidad: 8.5, stock: 480, stockMin: 200, proveedor: "Papelería Norte", historial: [{ fecha: "2024-01", precio: 7.0 }, { fecha: "2024-06", precio: 7.8 }, { fecha: "2025-01", precio: 8.5 }] },
  { id: uid(), nombre: "Rollo laminado brillante A4", categoria: "Laminado", unidad: "cm", costoUnidad: 12, stock: 8500, stockMin: 3000, proveedor: "Suministros Creativos", historial: [{ fecha: "2024-06", precio: 10 }, { fecha: "2025-01", precio: 12 }] },
  { id: uid(), nombre: "Tapa cartón gris 3mm", categoria: "Encuadernación", unidad: "unidad", costoUnidad: 320, stock: 45, stockMin: 20, proveedor: "Cartonera Sur", historial: [{ fecha: "2024-01", precio: 250 }, { fecha: "2025-01", precio: 320 }] },
  { id: uid(), nombre: "Anillo plástico 19mm", categoria: "Encuadernación", unidad: "unidad", costoUnidad: 85, stock: 38, stockMin: 30, proveedor: "Suministros Creativos", historial: [{ fecha: "2024-06", precio: 70 }, { fecha: "2025-01", precio: 85 }] },
  { id: uid(), nombre: "Papel fotográfico autoadhesivo A4", categoria: "Papel especial", unidad: "hoja", costoUnidad: 180, stock: 55, stockMin: 40, proveedor: "Papelería Norte", historial: [{ fecha: "2024-06", precio: 150 }, { fecha: "2025-01", precio: 180 }] },
];

const INIT_MAQUINAS = [
  { id: uid(), nombre: "Impresora A4 tinta continua #1", valorCompra: 85000, vidaUtilAnios: 5, adquisicion: "2022-03" },
  { id: uid(), nombre: "Impresora A4 tinta continua #2", valorCompra: 85000, vidaUtilAnios: 5, adquisicion: "2022-08" },
  { id: uid(), nombre: "Plastificadora A3 Dasa", valorCompra: 120000, vidaUtilAnios: 8, adquisicion: "2021-05" },
  { id: uid(), nombre: "Plotter de corte", valorCompra: 180000, vidaUtilAnios: 7, adquisicion: "2023-01" },
  { id: uid(), nombre: "Anilladora", valorCompra: 45000, vidaUtilAnios: 10, adquisicion: "2020-11" },
  { id: uid(), nombre: "Guillotina A3 Dasa", valorCompra: 95000, vidaUtilAnios: 10, adquisicion: "2021-05" },
  { id: uid(), nombre: "Impresora láser A4", valorCompra: 75000, vidaUtilAnios: 6, adquisicion: "2023-06" },
];

const INIT_GASTOS = [
  { id: uid(), nombre: "Alquiler taller", monto: 80000 },
  { id: uid(), nombre: "Luz", monto: 25000 },
  { id: uid(), nombre: "Internet", monto: 8000 },
  { id: uid(), nombre: "Adobe Creative Suite", monto: 12000 },
  { id: uid(), nombre: "Google One", monto: 1500 },
];

const INIT_CONFIG = {
  sueldoMensual1: 300000,
  sueldoMensual2: 300000,
  horasMensuales1: 160,
  horasMensuales2: 160,
  margenGanancia: 50,
  ivaActivo: false,
  ivaPct: 21,
  canales: [
    { id: "redes",    nombre: "Redes sociales",   comision: 0,    activo: true },
    { id: "ml",       nombre: "Mercado Libre",     comision: 14,   activo: true },
    { id: "tiendanu", nombre: "Tienda Nube",       comision: 2,    activo: true },
    { id: "propio",   nombre: "Tienda propia",     comision: 0,    activo: true },
  ],
};

// ── Hook de estado global con Firebase ──────────────────────────────────────
function useAppState() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const [insumos, setInsumos] = useState(INIT_INSUMOS);
  const [productos, setProductos] = useState([]);
  const [kits, setKits] = useState([]);
  const [descuentos, setDescuentos] = useState([
    { id: "d1", desde: 5,   hasta: 10,  pct: 5  },
    { id: "d2", desde: 11,  hasta: 100, pct: 10 },
    { id: "d3", desde: 101, hasta: null, pct: 20 },
  ]);
  const [maquinas, setMaquinas] = useState(INIT_MAQUINAS);
  const [gastosFijos, setGastosFijos] = useState(INIT_GASTOS);
  const [config, setConfig] = useState(INIT_CONFIG);
  const datosRef = useRef(null);
  const saveTimer = useRef(null);

  // ── Login / logout ──────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onLogin((user) => {
      setUsuario(user);
      setCargando(false);
    });
    return unsub;
  }, []);

  // ── Cargar datos desde Firebase al hacer login ──────────────────────────
  useEffect(() => {
    if (!usuario) return;
    setSincronizando(true);
    cargarDesdeNube(usuario.uid).then((data) => {
      if (data) {
        if (data.insumos)     setInsumos(data.insumos);
        if (data.productos)   setProductos(data.productos);
        if (data.kits)        setKits(data.kits);
        if (data.descuentos)  setDescuentos(data.descuentos);
        if (data.maquinas)    setMaquinas(data.maquinas);
        if (data.gastosFijos) setGastosFijos(data.gastosFijos);
        if (data.config)      setConfig(c => ({ ...INIT_CONFIG, ...c, ...data.config }));
      }
      setSincronizando(false);
    });
  }, [usuario]);

  // ── Auto-guardar en Firebase (debounced 1.5s) ───────────────────────────
  useEffect(() => {
    if (!usuario) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const datos = { insumos, productos, kits, descuentos, maquinas, gastosFijos, config };
      await guardarEnNube(usuario.uid, datos);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [insumos, productos, kits, descuentos, maquinas, gastosFijos, config, usuario]);

  // ── Costos calculados ───────────────────────────────────────────────────
  const costoMaquinasMensual = maquinas.reduce((s, m) => s + m.valorCompra / (m.vidaUtilAnios * 12), 0);
  const totalGastosFijos = gastosFijos.reduce((s, g) => s + g.monto, 0) + costoMaquinasMensual;
  const costoHora1 = config.horasMensuales1 > 0 ? config.sueldoMensual1 / config.horasMensuales1 : 0;
  const costoHora2 = config.horasMensuales2 > 0 ? config.sueldoMensual2 / config.horasMensuales2 : 0;

  const calcularCostoProducto = useCallback((producto) => {
    if (!producto) return {};
    const costoInsumos = (producto.insumos || []).reduce((s, pi) => {
      const ins = insumos.find(i => i.id === pi.insumoId);
      if (!ins) return s;
      return s + ins.costoUnidad * (pi.cantidad || 0);
    }, 0);
    const loteTam = producto.loteTamanio || 1;
    const loteHoras = producto.loteHoras || 0;
    const costoMOLote = (loteHoras * costoHora1) + (loteHoras * costoHora2);
    const costoMOUnidad = loteTam > 0 ? costoMOLote / loteTam : 0;
    const costoTotal = costoInsumos + costoMOUnidad;
    const margen = (producto.margen ?? config.margenGanancia) / 100;
    const precioSugerido = margen < 1 ? costoTotal / (1 - margen) : costoTotal * 2;
    return { costoInsumos, costoMOUnidad, costoTotal, precioSugerido };
  }, [insumos, costoHora1, costoHora2, config.margenGanancia]);

  const preciosPorCanal = useCallback((precioBase) => {
    const canales = config.canales || [];
    return canales.filter(c => c.activo).map(canal => {
      const precioConComision = canal.comision > 0
        ? precioBase / (1 - canal.comision / 100)
        : precioBase;
      const precioFinal = config.ivaActivo
        ? precioConComision * (1 + (config.ivaPct || 21) / 100)
        : precioConComision;
      return {
        ...canal,
        precioConComision,
        precioFinal,
        comisionMonto: precioConComision - precioBase,
        ivaMonto: config.ivaActivo ? precioConComision * (config.ivaPct || 21) / 100 : 0,
      };
    });
  }, [config]);

  const stocksLow = insumos.filter(i => i.stock <= i.stockMin).length;

  const calcularKit = useCallback((kit) => {
    const items = (kit.items || []).map(item => {
      const p = productos.find(x => x.id === item.productoId);
      if (!p) return null;
      const c = calcularCostoProducto(p);
      return { producto: p, costos: c, cantidad: item.cantidad || 1 };
    }).filter(Boolean);
    const subtotal = items.reduce((s, it) => s + it.costos.precioSugerido * it.cantidad, 0);
    const descuento = (kit.descuento || 0) / 100;
    const precioKit = subtotal * (1 - descuento);
    const costoKit = items.reduce((s, it) => s + it.costos.costoTotal * it.cantidad, 0);
    return { items, subtotal, precioKit, costoKit, ahorro: subtotal - precioKit };
  }, [productos, calcularCostoProducto]);

  const descuentoVolumen = useCallback((precio, cantidad) => {
    const tier = descuentos
      .filter(d => cantidad >= d.desde && (d.hasta === null || cantidad <= d.hasta))
      .sort((a, b) => b.pct - a.pct)[0];
    if (!tier) return { precioFinal: precio, pct: 0 };
    return { precioFinal: precio * (1 - tier.pct / 100), pct: tier.pct };
  }, [descuentos]);

  return {
    usuario, cargando, sincronizando, guardado,
    insumos, setInsumos,
    productos, setProductos,
    kits, setKits,
    descuentos, setDescuentos,
    maquinas, setMaquinas,
    gastosFijos, setGastosFijos,
    config, setConfig,
    costoMaquinasMensual, totalGastosFijos,
    costoHora1, costoHora2,
    calcularCostoProducto, calcularKit,
    descuentoVolumen, preciosPorCanal,
    stocksLow,
  };
}


// ════════════════════════════════════════════════════════════════════════════
// MÓDULO: Dashboard
// ════════════════════════════════════════════════════════════════════════════
function Dashboard({ state }) {
  const { insumos, productos, maquinas, gastosFijos, costoMaquinasMensual, totalGastosFijos, costoHora1, costoHora2, stocksLow } = state;
  const alertasStock = insumos.filter(i => i.stock <= i.stockMin);

  return (
    <div className="page">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Insumos registrados</div>
          <div className="stat-value">{insumos.length}</div>
          <div className="stat-sub">{stocksLow > 0 ? <span className="text-danger">⚠ {stocksLow} con stock bajo</span> : "Stock OK"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Productos</div>
          <div className="stat-value">{productos.length}</div>
          <div className="stat-sub">registrados</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Gastos fijos + máquinas</div>
          <div className="stat-value" style={{fontSize:22}}>{fmt(totalGastosFijos)}</div>
          <div className="stat-sub">por mes</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Costo / hora mano de obra</div>
          <div className="stat-value" style={{fontSize:22}}>{fmt(costoHora1)}</div>
          <div className="stat-sub">por persona</div>
        </div>
      </div>

      {alertasStock.length > 0 && (
        <div className="card mb-4" style={{marginBottom:20}}>
          <div className="card-header">
            <span className="card-title">⚠️ Alertas de stock</span>
          </div>
          <div className="card-body">
            {alertasStock.map(i => (
              <div key={i.id} className="alert alert-danger" style={{marginBottom:8}}>
                <strong>{i.nombre}</strong>: stock actual {fmtN(i.stock)} {i.unidad} — mínimo {fmtN(i.stockMin)} {i.unidad}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:20}}>
        <div className="card">
          <div className="card-header"><span className="card-title">Resumen de gastos fijos</span></div>
          <div className="card-body">
            {gastosFijos.map(g => (
              <div key={g.id} className="breakdown-row" style={{color:"var(--ink2)", borderColor:"var(--cream2)"}}>
                <span className="key">{g.nombre}</span>
                <span className="val">{fmt(g.monto)}</span>
              </div>
            ))}
            <div className="breakdown-row" style={{color:"var(--ink2)", borderColor:"var(--cream2)"}}>
              <span className="key">Amortización máquinas</span>
              <span className="val">{fmt(costoMaquinasMensual)}</span>
            </div>
            <div className="divider" />
            <div style={{display:"flex",justifyContent:"space-between", fontWeight:700, fontSize:14}}>
              <span>Total mensual</span><span style={{color:"var(--terra)"}}>{fmt(totalGastosFijos)}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Mano de obra</span></div>
          <div className="card-body">
            <div className="breakdown-row" style={{color:"var(--ink2)", borderColor:"var(--cream2)"}}>
              <span className="key">Sueldo Socia 1</span>
              <span className="val">{fmt(state.config.sueldoMensual1)}/mes</span>
            </div>
            <div className="breakdown-row" style={{color:"var(--ink2)", borderColor:"var(--cream2)"}}>
              <span className="key">Horas Socia 1</span>
              <span className="val">{state.config.horasMensuales1}h → {fmt(costoHora1)}/h</span>
            </div>
            <div className="breakdown-row" style={{color:"var(--ink2)", borderColor:"var(--cream2)"}}>
              <span className="key">Sueldo Socia 2</span>
              <span className="val">{fmt(state.config.sueldoMensual2)}/mes</span>
            </div>
            <div className="breakdown-row" style={{color:"var(--ink2)", borderColor:"var(--cream2)"}}>
              <span className="key">Horas Socia 2</span>
              <span className="val">{state.config.horasMensuales2}h → {fmt(costoHora2)}/h</span>
            </div>
            <div className="divider" />
            <div style={{display:"flex",justifyContent:"space-between", fontWeight:700, fontSize:14}}>
              <span>Costo total mano de obra</span>
              <span style={{color:"var(--terra)"}}>{fmt(state.config.sueldoMensual1 + state.config.sueldoMensual2)}/mes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MÓDULO: Insumos
// ════════════════════════════════════════════════════════════════════════════
function ModalInsumo({ insumo, onSave, onClose }) {
  const blank = { id: uid(), nombre: "", categoria: "", unidad: "hoja", costoUnidad: "", stock: "", stockMin: "", proveedor: "", historial: [] };
  const [form, setForm] = useState(insumo || blank);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.nombre.trim()) return alert("Ingresá el nombre del insumo");
    if (!form.costoUnidad || isNaN(form.costoUnidad)) return alert("Ingresá el costo por unidad");
    const saved = {
      ...form,
      costoUnidad: parseFloat(form.costoUnidad),
      stock: parseFloat(form.stock) || 0,
      stockMin: parseFloat(form.stockMin) || 0,
    };
    // Si es nuevo y tiene costo, agregar al historial
    if (!insumo && saved.costoUnidad) {
      const hoy = new Date();
      saved.historial = [{ fecha: `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}`, precio: saved.costoUnidad }];
    }
    onSave(saved);
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"var(--white)",borderRadius:12,width:"100%",maxWidth:560,boxShadow:"var(--shadow-lg)",overflow:"hidden"}}>
        <div className="card-header">
          <span className="card-title">{insumo ? "Editar insumo" : "Nuevo insumo"}</span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field">
              <label className="label">Nombre del insumo</label>
              <input className="input" value={form.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="Ej: Resma papel obra A4 75gr" />
            </div>
            <div className="form-grid form-grid-2">
              <div className="field">
                <label className="label">Categoría</label>
                <input className="input" value={form.categoria} onChange={e=>set("categoria",e.target.value)} placeholder="Papel, Laminado, etc." />
              </div>
              <div className="field">
                <label className="label">Unidad de uso</label>
                <select className="select" value={form.unidad} onChange={e=>set("unidad",e.target.value)}>
                  {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="form-grid form-grid-3">
              <div className="field">
                <label className="label">Costo por {form.unidad} ($)</label>
                <div className="input-prefix">
                  <span className="prefix-text">$</span>
                  <input type="number" value={form.costoUnidad} onChange={e=>set("costoUnidad",e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="field">
                <label className="label">Stock actual</label>
                <input className="input" type="number" value={form.stock} onChange={e=>set("stock",e.target.value)} placeholder="0" />
              </div>
              <div className="field">
                <label className="label">Stock mínimo</label>
                <input className="input" type="number" value={form.stockMin} onChange={e=>set("stockMin",e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="field">
              <label className="label">Proveedor principal</label>
              <input className="input" value={form.proveedor} onChange={e=>set("proveedor",e.target.value)} placeholder="Nombre del proveedor" />
            </div>
          </div>
        </div>
        <div style={{padding:"16px 24px",background:"var(--cream)",borderTop:"1px solid var(--border)",display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>Guardar insumo</button>
        </div>
      </div>
    </div>
  );
}

function ModalHistorial({ insumo, onSave, onClose }) {
  const [nuevoPrecio, setNuevoPrecio] = useState("");

  const agregar = () => {
    if (!nuevoPrecio || isNaN(nuevoPrecio)) return;
    const hoy = new Date();
    const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}`;
    const hist = [...(insumo.historial||[]), { fecha, precio: parseFloat(nuevoPrecio) }];
    onSave({ ...insumo, historial: hist, costoUnidad: parseFloat(nuevoPrecio) });
    setNuevoPrecio("");
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"var(--white)",borderRadius:12,width:"100%",maxWidth:500,boxShadow:"var(--shadow-lg)",overflow:"hidden"}}>
        <div className="card-header">
          <span className="card-title">📈 Historial: {insumo.nombre}</span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card-body">
          <table style={{width:"100%",marginBottom:16}}>
            <thead><tr><th>Fecha</th><th>Precio por {insumo.unidad}</th></tr></thead>
            <tbody>
              {(insumo.historial||[]).map((h,i)=>(
                <tr key={i}>
                  <td>{h.fecha}</td>
                  <td className="mono">{fmt(h.precio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="divider" />
          <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
            <div className="field" style={{flex:1}}>
              <label className="label">Registrar nuevo precio (hoy)</label>
              <div className="input-prefix">
                <span className="prefix-text">$</span>
                <input type="number" value={nuevoPrecio} onChange={e=>setNuevoPrecio(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <button className="btn btn-primary" onClick={agregar}>Agregar</button>
          </div>
        </div>
        <div style={{padding:"16px 24px",background:"var(--cream)",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end"}}>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function Insumos({ state }) {
  const { insumos, setInsumos } = state;
  const [modal, setModal] = useState(null); // null | {type:'edit'|'new'|'hist', insumo}
  const [filtro, setFiltro] = useState("");

  const filtered = insumos.filter(i =>
    i.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    i.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleSave = (ins) => {
    setInsumos(prev => {
      const idx = prev.findIndex(i=>i.id===ins.id);
      if (idx >= 0) { const n=[...prev]; n[idx]=ins; return n; }
      return [...prev, ins];
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar este insumo?")) setInsumos(prev=>prev.filter(i=>i.id!==id));
  };

  return (
    <div className="page">
      {modal?.type==="edit" && <ModalInsumo insumo={modal.insumo} onSave={handleSave} onClose={()=>setModal(null)} />}
      {modal?.type==="new" && <ModalInsumo insumo={null} onSave={handleSave} onClose={()=>setModal(null)} />}
      {modal?.type==="hist" && <ModalHistorial insumo={modal.insumo} onSave={handleSave} onClose={()=>setModal(null)} />}

      <div className="flex items-center justify-between mb-4">
        <input className="input" style={{maxWidth:280}} placeholder="🔍 Buscar insumo..." value={filtro} onChange={e=>setFiltro(e.target.value)} />
        <button className="btn btn-primary" onClick={()=>setModal({type:"new"})}>+ Nuevo insumo</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Categoría</th>
                <th>Unidad</th>
                <th>Costo / unidad</th>
                <th>Stock</th>
                <th>Mín.</th>
                <th>Estado</th>
                <th>Proveedor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 && (
                <tr><td colSpan={9}><div className="empty-state"><div className="empty-icon">📦</div><p>No hay insumos cargados</p></div></td></tr>
              )}
              {filtered.map(ins=>{
                const low = ins.stock <= ins.stockMin;
                const med = ins.stock <= ins.stockMin * 1.5;
                return (
                  <tr key={ins.id}>
                    <td className="bold">{ins.nombre}</td>
                    <td>{ins.categoria}</td>
                    <td><span className="badge badge-neutral">{ins.unidad}</span></td>
                    <td className="mono">{fmt(ins.costoUnidad)}</td>
                    <td className="mono">{fmtN(ins.stock)}</td>
                    <td className="mono">{fmtN(ins.stockMin)}</td>
                    <td>
                      {low ? <span className="badge badge-danger">⚠ Bajo mínimo</span>
                           : med ? <span className="badge badge-warn">Cerca del mín.</span>
                           : <span className="badge badge-ok">OK</span>}
                    </td>
                    <td className="text-muted text-sm">{ins.proveedor}</td>
                    <td>
                      <div style={{display:"flex",gap:6}}>
                        <button className="btn btn-secondary btn-sm btn-icon" title="Historial precios" onClick={()=>setModal({type:"hist",insumo:ins})}>📈</button>
                        <button className="btn btn-secondary btn-sm btn-icon" title="Editar" onClick={()=>setModal({type:"edit",insumo:ins})}>✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" title="Eliminar" onClick={()=>handleDelete(ins.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MÓDULO: Productos
// ════════════════════════════════════════════════════════════════════════════
function ModalProducto({ producto, insumos, config, calcularCostoProducto, onSave, onClose }) {
  const blank = {
    id: uid(), nombre: "", variante: "", categoria: "Agendas", temporada: "Todo el año",
    insumos: [], loteTamanio: 10, loteHoras: 2, margen: config.margenGanancia, notas: ""
  };
  const [form, setForm] = useState(producto || blank);
  const [insAdd, setInsAdd] = useState({ insumoId: "", cantidad: "" });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const costos = calcularCostoProducto(form);

  const addInsumo = () => {
    if (!insAdd.insumoId || !insAdd.cantidad) return;
    const exists = form.insumos.find(i=>i.insumoId===insAdd.insumoId);
    if (exists) return alert("Este insumo ya está agregado");
    set("insumos", [...form.insumos, { insumoId: insAdd.insumoId, cantidad: parseFloat(insAdd.cantidad) }]);
    setInsAdd({ insumoId: "", cantidad: "" });
  };

  const removeInsumo = (id) => set("insumos", form.insumos.filter(i=>i.insumoId!==id));

  const handleSave = () => {
    if (!form.nombre.trim()) return alert("Ingresá el nombre del producto");
    onSave({ ...form, loteTamanio: parseInt(form.loteTamanio)||1, loteHoras: parseFloat(form.loteHoras)||0, margen: parseFloat(form.margen)||0 });
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"}}>
      <div style={{background:"var(--white)",borderRadius:12,width:"100%",maxWidth:700,boxShadow:"var(--shadow-lg)",overflow:"hidden",margin:"auto"}}>
        <div className="card-header">
          <span className="card-title">{producto ? "Editar producto" : "Nuevo producto"}</span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:0}}>
          {/* Col izquierda */}
          <div style={{padding:"20px 24px",borderRight:"1px solid var(--border)"}}>
            <div className="form-grid">
              <div className="form-grid form-grid-2">
                <div className="field">
                  <label className="label">Nombre</label>
                  <input className="input" value={form.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="Agenda A5 semanal" />
                </div>
                <div className="field">
                  <label className="label">Variante (tamaño/diseño)</label>
                  <input className="input" value={form.variante} onChange={e=>set("variante",e.target.value)} placeholder="A5, floral, etc." />
                </div>
              </div>
              <div className="form-grid form-grid-2">
                <div className="field">
                  <label className="label">Categoría</label>
                  <select className="select" value={form.categoria} onChange={e=>set("categoria",e.target.value)}>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Temporada</label>
                  <select className="select" value={form.temporada} onChange={e=>set("temporada",e.target.value)}>
                    {SEASONS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="divider" />
              <div style={{fontWeight:600,fontSize:13,color:"var(--ink2)",marginBottom:4}}>📦 Insumos utilizados</div>

              {form.insumos.map(pi=>{
                const ins = insumos.find(i=>i.id===pi.insumoId);
                return ins ? (
                  <div key={pi.insumoId} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"var(--cream)",borderRadius:6,fontSize:13}}>
                    <span>{ins.nombre}</span>
                    <span style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span className="badge badge-neutral">{fmtN(pi.cantidad)} {ins.unidad}</span>
                      <span style={{color:"var(--ink3)",fontSize:12}}>{fmt(ins.costoUnidad * pi.cantidad)}</span>
                      <button onClick={()=>removeInsumo(pi.insumoId)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--danger)",fontSize:14}}>✕</button>
                    </span>
                  </div>
                ) : null;
              })}

              <div style={{display:"flex",gap:8}}>
                <select className="select" style={{flex:2}} value={insAdd.insumoId} onChange={e=>setInsAdd(a=>({...a,insumoId:e.target.value}))}>
                  <option value="">Seleccionar insumo...</option>
                  {insumos.map(i=><option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>)}
                </select>
                <input className="input" style={{width:90}} type="number" placeholder={`Cant. ${insumos.find(i=>i.id===insAdd.insumoId)?.unidad||"unid."}`} value={insAdd.cantidad} onChange={e=>setInsAdd(a=>({...a,cantidad:e.target.value}))} />
                <button className="btn btn-primary" onClick={addInsumo}>+</button>
              </div>

              <div className="divider" />
              <div style={{fontWeight:600,fontSize:13,color:"var(--ink2)",marginBottom:4}}>⏱ Tiempo de producción (por lote)</div>
              <div className="form-grid form-grid-2">
                <div className="field">
                  <label className="label">Unidades por lote</label>
                  <input className="input" type="number" value={form.loteTamanio} onChange={e=>set("loteTamanio",e.target.value)} />
                </div>
                <div className="field">
                  <label className="label">Horas para ese lote</label>
                  <input className="input" type="number" step="0.5" value={form.loteHoras} onChange={e=>set("loteHoras",e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label className="label">Margen de ganancia (%)</label>
                <input className="input" type="number" value={form.margen} onChange={e=>set("margen",e.target.value)} />
              </div>
            </div>
          </div>

          {/* Col derecha — precio en vivo */}
          <div style={{padding:"20px",background:"var(--ink)",display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontFamily:"Playfair Display, serif",color:"var(--cream)",fontSize:15,marginBottom:4}}>Cálculo en vivo</div>
            <div className="breakdown-row">
              <span className="key" style={{color:"rgba(255,255,255,.6)"}}>Insumos</span>
              <span className="val" style={{color:"var(--cream)"}}>{fmt(costos.costoInsumos)}</span>
            </div>
            <div className="breakdown-row">
              <span className="key" style={{color:"rgba(255,255,255,.6)"}}>Mano de obra</span>
              <span className="val" style={{color:"var(--cream)"}}>{fmt(costos.costoMOUnidad)}</span>
            </div>
            <div className="breakdown-row">
              <span className="key" style={{color:"rgba(255,255,255,.6)"}}>Costo total/u.</span>
              <span className="val" style={{color:"var(--terra2)"}}>{fmt(costos.costoTotal)}</span>
            </div>
            <div style={{height:1,background:"rgba(255,255,255,.1)",margin:"4px 0"}} />
            <div style={{color:"rgba(255,255,255,.6)",fontSize:11,textTransform:"uppercase",letterSpacing:".1em"}}>Precio sugerido</div>
            <div style={{fontFamily:"Playfair Display, serif",fontSize:30,color:"var(--cream)"}}>{fmt(costos.precioSugerido)}</div>
            <div style={{color:"rgba(255,255,255,.5)",fontSize:11}}>Con {form.margen}% de margen</div>
            <div style={{height:1,background:"rgba(255,255,255,.1)",margin:"4px 0"}} />
            <div style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>
              Lote: {form.loteTamanio} u. en {form.loteHoras}h<br/>
              MO por unidad: {fmt(costos.costoMOUnidad)}
            </div>
          </div>
        </div>
        <div style={{padding:"16px 24px",background:"var(--cream)",borderTop:"1px solid var(--border)",display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>Guardar producto</button>
        </div>
      </div>
    </div>
  );
}

function Productos({ state }) {
  const { productos, setProductos, insumos, config, calcularCostoProducto } = state;
  const [modal, setModal] = useState(null);
  const [filtro, setFiltro] = useState("");

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleSave = (p) => {
    setProductos(prev => {
      const idx = prev.findIndex(x=>x.id===p.id);
      if (idx>=0){const n=[...prev];n[idx]=p;return n;}
      return [...prev,p];
    });
  };

  const handleDelete = (id) => {
    if(window.confirm("¿Eliminar este producto?")) setProductos(prev=>prev.filter(p=>p.id!==id));
  };

  return (
    <div className="page">
      {modal?.type==="new" && <ModalProducto producto={null} insumos={insumos} config={config} calcularCostoProducto={calcularCostoProducto} onSave={handleSave} onClose={()=>setModal(null)} />}
      {modal?.type==="edit" && <ModalProducto producto={modal.producto} insumos={insumos} config={config} calcularCostoProducto={calcularCostoProducto} onSave={handleSave} onClose={()=>setModal(null)} />}

      <div className="flex items-center justify-between mb-4">
        <input className="input" style={{maxWidth:280}} placeholder="🔍 Buscar producto..." value={filtro} onChange={e=>setFiltro(e.target.value)} />
        <button className="btn btn-primary" onClick={()=>setModal({type:"new"})}>+ Nuevo producto</button>
      </div>

      {filtered.length===0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">📒</div><p>No hay productos. ¡Agregá el primero!</p></div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Variante</th>
                  <th>Categoría</th>
                  <th>Temporada</th>
                  <th>Costo insumos</th>
                  <th>Costo MO</th>
                  <th>Costo total</th>
                  <th>Precio sugerido</th>
                  <th>Margen</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p=>{
                  const c = calcularCostoProducto(p);
                  const ganancia = c.precioSugerido - c.costoTotal;
                  return (
                    <tr key={p.id}>
                      <td className="bold">{p.nombre}</td>
                      <td><span className="badge badge-neutral">{p.variante||"—"}</span></td>
                      <td>{p.categoria}</td>
                      <td className="text-sm text-muted">{p.temporada}</td>
                      <td className="mono">{fmt(c.costoInsumos)}</td>
                      <td className="mono">{fmt(c.costoMOUnidad)}</td>
                      <td className="mono bold">{fmt(c.costoTotal)}</td>
                      <td className="mono" style={{color:"var(--terra)",fontWeight:700}}>{fmt(c.precioSugerido)}</td>
                      <td><span className="badge badge-ok">{p.margen}%</span></td>
                      <td>
                        <div style={{display:"flex",gap:6}}>
                          <button className="btn btn-secondary btn-sm btn-icon" onClick={()=>setModal({type:"edit",producto:p})}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={()=>handleDelete(p.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MÓDULO: Configuración
// ════════════════════════════════════════════════════════════════════════════
function Configuracion({ state }) {
  const { config, setConfig, gastosFijos, setGastosFijos, maquinas, setMaquinas, costoMaquinasMensual } = state;
  const [tab, setTab] = useState("sueldos");
  const [gastoForm, setGastoForm] = useState({ nombre:"", monto:"" });
  const [maqForm, setMaqForm] = useState({ nombre:"", valorCompra:"", vidaUtilAnios:"", adquisicion:"" });

  const addGasto = () => {
    if(!gastoForm.nombre||!gastoForm.monto) return;
    setGastosFijos(prev=>[...prev,{id:uid(),nombre:gastoForm.nombre,monto:parseFloat(gastoForm.monto)}]);
    setGastoForm({nombre:"",monto:""});
  };
  const delGasto = (id) => setGastosFijos(prev=>prev.filter(g=>g.id!==id));
  const addMaq = () => {
    if(!maqForm.nombre||!maqForm.valorCompra) return;
    setMaquinas(prev=>[...prev,{id:uid(),...maqForm,valorCompra:parseFloat(maqForm.valorCompra),vidaUtilAnios:parseFloat(maqForm.vidaUtilAnios)||5}]);
    setMaqForm({nombre:"",valorCompra:"",vidaUtilAnios:"",adquisicion:""});
  };
  const delMaq = (id) => setMaquinas(prev=>prev.filter(m=>m.id!==id));

  return (
    <div className="page">
      <div className="tabs">
        {[["sueldos","👩‍💼 Sueldos & horas"],["gastos","🏠 Gastos fijos"],["maquinas","⚙️ Máquinas"]].map(([k,l])=>(
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{l}</div>
        ))}
      </div>

      {tab==="sueldos" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {[1,2].map(n=>(
            <div key={n} className="card">
              <div className="card-header"><span className="card-title">Socia {n}</span></div>
              <div className="card-body">
                <div className="form-grid">
                  <div className="field">
                    <label className="label">Sueldo mensual deseado ($)</label>
                    <div className="input-prefix">
                      <span className="prefix-text">$</span>
                      <input type="number" value={config[`sueldoMensual${n}`]} onChange={e=>setConfig(c=>({...c,[`sueldoMensual${n}`]:parseFloat(e.target.value)||0}))} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Horas trabajadas por mes</label>
                    <input className="input" type="number" value={config[`horasMensuales${n}`]} onChange={e=>setConfig(c=>({...c,[`horasMensuales${n}`]:parseFloat(e.target.value)||1}))} />
                  </div>
                </div>
                <div className="divider" />
                <div className="alert alert-info">
                  Costo/hora: <strong>{fmt(config[`sueldoMensual${n}`]/(config[`horasMensuales${n}`]||1))}</strong>
                </div>
              </div>
            </div>
          ))}
          <div className="card" style={{gridColumn:"1/-1"}}>
            <div className="card-header"><span className="card-title">Margen de ganancia por defecto</span></div>
            <div className="card-body">
              <div className="field" style={{maxWidth:200}}>
                <label className="label">Margen (%)</label>
                <input className="input" type="number" value={config.margenGanancia} onChange={e=>setConfig(c=>({...c,margenGanancia:parseFloat(e.target.value)||0}))} />
              </div>
              <div className="mt-2 text-sm text-muted">Podés sobreescribir el margen en cada producto individualmente.</div>
            </div>
          </div>
        </div>
      )}

      {tab==="gastos" && (
        <div className="card">
          <div className="card-header"><span className="card-title">Gastos fijos mensuales</span></div>
          <div className="card-body">
            <table style={{width:"100%",marginBottom:20}}>
              <thead><tr><th>Concepto</th><th>Monto mensual</th><th></th></tr></thead>
              <tbody>
                {gastosFijos.map(g=>(
                  <tr key={g.id}>
                    <td>{g.nombre}</td>
                    <td className="mono">{fmt(g.monto)}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={()=>delGasto(g.id)}>Eliminar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="divider" />
            <div className="form-row">
              <div className="field" style={{flex:2}}>
                <label className="label">Concepto</label>
                <input className="input" value={gastoForm.nombre} onChange={e=>setGastoForm(f=>({...f,nombre:e.target.value}))} placeholder="Ej: Alquiler taller" />
              </div>
              <div className="field" style={{flex:1}}>
                <label className="label">Monto ($)</label>
                <div className="input-prefix"><span className="prefix-text">$</span><input type="number" value={gastoForm.monto} onChange={e=>setGastoForm(f=>({...f,monto:e.target.value}))} /></div>
              </div>
              <button className="btn btn-primary" onClick={addGasto}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {tab==="maquinas" && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Máquinas — Amortización</span>
            <span className="badge badge-terra">Total mensual: {fmt(costoMaquinasMensual)}</span>
          </div>
          <div className="card-body">
            <table style={{width:"100%",marginBottom:20}}>
              <thead><tr><th>Máquina</th><th>Valor compra</th><th>Vida útil</th><th>Amort./mes</th><th></th></tr></thead>
              <tbody>
                {maquinas.map(m=>(
                  <tr key={m.id}>
                    <td>{m.nombre}</td>
                    <td className="mono">{fmt(m.valorCompra)}</td>
                    <td>{m.vidaUtilAnios} años</td>
                    <td className="mono">{fmt(m.valorCompra/(m.vidaUtilAnios*12))}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={()=>delMaq(m.id)}>Eliminar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="divider" />
            <div className="form-grid form-grid-2">
              <div className="field">
                <label className="label">Nombre de la máquina</label>
                <input className="input" value={maqForm.nombre} onChange={e=>setMaqForm(f=>({...f,nombre:e.target.value}))} placeholder="Ej: Plastificadora A3" />
              </div>
              <div className="field">
                <label className="label">Valor de compra ($)</label>
                <div className="input-prefix"><span className="prefix-text">$</span><input type="number" value={maqForm.valorCompra} onChange={e=>setMaqForm(f=>({...f,valorCompra:e.target.value}))} /></div>
              </div>
              <div className="field">
                <label className="label">Vida útil estimada (años)</label>
                <input className="input" type="number" value={maqForm.vidaUtilAnios} onChange={e=>setMaqForm(f=>({...f,vidaUtilAnios:e.target.value}))} placeholder="5" />
              </div>
              <div className="field">
                <label className="label">Año adquisición</label>
                <input className="input" value={maqForm.adquisicion} onChange={e=>setMaqForm(f=>({...f,adquisicion:e.target.value}))} placeholder="2024-01" />
              </div>
            </div>
            <button className="btn btn-primary mt-3" onClick={addMaq}>Agregar máquina</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MÓDULO: Calculadora rápida
// ════════════════════════════════════════════════════════════════════════════
function CalcRapida({ state }) {
  const { insumos, calcularCostoProducto } = state;
  const [lineas, setLineas] = useState([{ insumoId:"", cantidad:"" }]);
  const [loteT, setLoteT] = useState(10);
  const [loteH, setLoteH] = useState(2);
  const [margen, setMargen] = useState(50);

  const addLinea = () => setLineas(l=>[...l,{insumoId:"",cantidad:""}]);
  const setLinea = (i, k, v) => setLineas(l=>{ const n=[...l]; n[i]={...n[i],[k]:v}; return n; });
  const removeLinea = (i) => setLineas(l=>l.filter((_,j)=>j!==i));

  const pseudo = { insumos: lineas.filter(l=>l.insumoId&&l.cantidad).map(l=>({insumoId:l.insumoId,cantidad:parseFloat(l.cantidad)})), loteTamanio:parseInt(loteT)||1, loteHoras:parseFloat(loteH)||0, margen:parseFloat(margen)||0 };
  const costos = calcularCostoProducto(pseudo);

  return (
    <div className="page">
      <div className="alert alert-info mb-4" style={{marginBottom:20}}>
        💡 Calculá el precio de cualquier combinación de insumos sin necesidad de crear un producto.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:24}}>
        <div className="card">
          <div className="card-header"><span className="card-title">Insumos del producto</span></div>
          <div className="card-body">
            {lineas.map((l,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:10,alignItems:"flex-end"}}>
                <div className="field" style={{flex:3}}>
                  {i===0 && <label className="label">Insumo</label>}
                  <select className="select" value={l.insumoId} onChange={e=>setLinea(i,"insumoId",e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {insumos.map(ins=><option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidad})</option>)}
                  </select>
                </div>
                <div className="field" style={{flex:1}}>
                  {i===0 && <label className="label">Cantidad</label>}
                  <input className="input" type="number" placeholder="0" value={l.cantidad} onChange={e=>setLinea(i,"cantidad",e.target.value)} />
                </div>
                <button className="btn btn-danger btn-sm btn-icon" style={{marginBottom:2}} onClick={()=>removeLinea(i)}>✕</button>
              </div>
            ))}
            <button className="btn btn-secondary mt-2" onClick={addLinea}>+ Agregar insumo</button>
            <div className="divider" />
            <div className="form-grid form-grid-3">
              <div className="field">
                <label className="label">Lote (unidades)</label>
                <input className="input" type="number" value={loteT} onChange={e=>setLoteT(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Horas para lote</label>
                <input className="input" type="number" step="0.5" value={loteH} onChange={e=>setLoteH(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Margen (%)</label>
                <input className="input" type="number" value={margen} onChange={e=>setMargen(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div className="price-result">
          <div className="result-label">Precio sugerido por unidad</div>
          <div className="result-value">{fmt(costos.precioSugerido)}</div>
          <div className="result-sub">Con {margen}% de margen</div>
          <div style={{height:1,background:"rgba(255,255,255,.15)",margin:"16px 0"}} />
          <div className="breakdown-row">
            <span className="key">Insumos</span>
            <span className="val">{fmt(costos.costoInsumos)}</span>
          </div>
          <div className="breakdown-row">
            <span className="key">Mano de obra</span>
            <span className="val">{fmt(costos.costoMOUnidad)}</span>
          </div>
          <div className="breakdown-row">
            <span className="key">Costo total</span>
            <span className="val" style={{color:"var(--terra2)"}}>{fmt(costos.costoTotal)}</span>
          </div>
          <div className="breakdown-row">
            <span className="key">Ganancia/u.</span>
            <span className="val" style={{color:"#7FD48F"}}>{fmt(costos.precioSugerido - costos.costoTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MÓDULO: Kits
// ════════════════════════════════════════════════════════════════════════════
function ModalKit({ kit, productos, calcularCostoProducto, onSave, onClose }) {
  const blank = { id: uid(), nombre: "", descripcion: "", descuento: 15, items: [] };
  const [form, setForm] = useState(kit || blank);
  const [addProd, setAddProd] = useState({ productoId: "", cantidad: 1 });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addItem = () => {
    if (!addProd.productoId) return;
    if (form.items.find(i => i.productoId === addProd.productoId)) return alert("Ya está en el kit");
    set("items", [...form.items, { productoId: addProd.productoId, cantidad: parseInt(addProd.cantidad) || 1 }]);
    setAddProd({ productoId: "", cantidad: 1 });
  };
  const removeItem = (id) => set("items", form.items.filter(i => i.productoId !== id));
  const setItemCantidad = (id, v) => set("items", form.items.map(i => i.productoId === id ? { ...i, cantidad: parseInt(v) || 1 } : i));

  // Preview en vivo
  const items = form.items.map(item => {
    const p = productos.find(x => x.id === item.productoId);
    if (!p) return null;
    const c = calcularCostoProducto(p);
    return { p, c, cantidad: item.cantidad };
  }).filter(Boolean);
  const subtotal = items.reduce((s, it) => s + it.c.precioSugerido * it.cantidad, 0);
  const precioKit = subtotal * (1 - (form.descuento || 0) / 100);
  const costoKit = items.reduce((s, it) => s + it.c.costoTotal * it.cantidad, 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
      <div style={{ background: "var(--white)", borderRadius: 12, width: "100%", maxWidth: 680, boxShadow: "var(--shadow-lg)", overflow: "hidden", margin: "auto" }}>
        <div className="card-header">
          <span className="card-title">{kit ? "Editar kit" : "Nuevo kit"}</span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px" }}>
          <div style={{ padding: "20px 24px", borderRight: "1px solid var(--border)" }}>
            <div className="form-grid">
              <div className="field">
                <label className="label">Nombre del kit</label>
                <input className="input" value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Ej: Kit inicio de año escolar" />
              </div>
              <div className="field">
                <label className="label">Descuento del kit (%)</label>
                <input className="input" type="number" min="0" max="50" value={form.descuento} onChange={e => set("descuento", e.target.value)} />
              </div>

              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink2)" }}>🛍 Productos del kit</div>

              {items.map(({ p, c, cantidad }) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--cream)", borderRadius: 6, fontSize: 13 }}>
                  <span style={{ flex: 1 }}>{p.nombre} {p.variante && <span className="badge badge-neutral" style={{ fontSize: 10 }}>{p.variante}</span>}</span>
                  <input type="number" min="1" value={cantidad} onChange={e => setItemCantidad(p.id, e.target.value)} style={{ width: 52, padding: "4px 6px", border: "1px solid var(--border)", borderRadius: 5, fontSize: 13 }} />
                  <span style={{ color: "var(--ink3)", fontSize: 12, minWidth: 70, textAlign: "right" }}>{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(c.precioSugerido * cantidad)}</span>
                  <button onClick={() => removeItem(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: 15 }}>✕</button>
                </div>
              ))}
              {form.items.length === 0 && <div className="text-sm text-muted">Agregá productos al kit desde abajo.</div>}

              <div style={{ display: "flex", gap: 8 }}>
                <select className="select" style={{ flex: 3 }} value={addProd.productoId} onChange={e => setAddProd(a => ({ ...a, productoId: e.target.value }))}>
                  <option value="">Seleccionar producto...</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}{p.variante ? ` — ${p.variante}` : ""}</option>)}
                </select>
                <input className="input" style={{ width: 64 }} type="number" min="1" value={addProd.cantidad} onChange={e => setAddProd(a => ({ ...a, cantidad: e.target.value }))} />
                <button className="btn btn-primary" onClick={addItem}>+</button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ padding: 20, background: "var(--ink)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontFamily: "Playfair Display, serif", color: "var(--cream)", fontSize: 15 }}>Resumen del kit</div>
            <div className="breakdown-row">
              <span className="key" style={{ color: "rgba(255,255,255,.6)" }}>Subtotal</span>
              <span className="val" style={{ color: "var(--cream)" }}>{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(subtotal)}</span>
            </div>
            <div className="breakdown-row">
              <span className="key" style={{ color: "rgba(255,255,255,.6)" }}>Descuento {form.descuento}%</span>
              <span className="val" style={{ color: "#7FD48F" }}>-{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(subtotal - precioKit)}</span>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,.1)" }} />
            <div style={{ color: "rgba(255,255,255,.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em" }}>Precio final del kit</div>
            <div style={{ fontFamily: "Playfair Display, serif", fontSize: 26, color: "var(--terra2)" }}>{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(precioKit)}</div>
            <div style={{ height: 1, background: "rgba(255,255,255,.1)", marginTop: 4 }} />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>
              Costo total kit: {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(costoKit)}<br />
              Ganancia: {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(precioKit - costoKit)}
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 24px", background: "var(--cream)", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { if (!form.nombre.trim()) return alert("Ingresá el nombre del kit"); onSave({ ...form, descuento: parseFloat(form.descuento) || 0 }); onClose(); }}>Guardar kit</button>
        </div>
      </div>
    </div>
  );
}

function Kits({ state }) {
  const { kits, setKits, productos, calcularCostoProducto, calcularKit } = state;
  const [modal, setModal] = useState(null);
  const fmt0 = n => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n || 0);

  const handleSave = (k) => {
    setKits(prev => {
      const idx = prev.findIndex(x => x.id === k.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = k; return n; }
      return [...prev, k];
    });
  };
  const handleDelete = (id) => { if (window.confirm("¿Eliminar este kit?")) setKits(prev => prev.filter(k => k.id !== id)); };

  return (
    <div className="page">
      {modal?.type === "new" && <ModalKit kit={null} productos={productos} calcularCostoProducto={calcularCostoProducto} onSave={handleSave} onClose={() => setModal(null)} />}
      {modal?.type === "edit" && <ModalKit kit={modal.kit} productos={productos} calcularCostoProducto={calcularCostoProducto} onSave={handleSave} onClose={() => setModal(null)} />}

      {productos.length === 0 && (
        <div className="alert alert-warn" style={{ marginBottom: 20 }}>⚠ Primero necesitás tener productos cargados para armar kits.</div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div style={{ fontSize: 13, color: "var(--ink3)" }}>{kits.length} kit{kits.length !== 1 ? "s" : ""} registrado{kits.length !== 1 ? "s" : ""}</div>
        <button className="btn btn-primary" onClick={() => setModal({ type: "new" })}>+ Nuevo kit</button>
      </div>

      {kits.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">🎁</div><p>No hay kits todavía. ¡Creá tu primer bundle!</p></div></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
          {kits.map(kit => {
            const calc = calcularKit(kit);
            return (
              <div key={kit.id} className="kit-card">
                <div className="kit-card-header">
                  <div>
                    <div className="kit-name">{kit.nombre}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{calc.items.length} producto{calc.items.length !== 1 ? "s" : ""} · {kit.descuento}% off</div>
                  </div>
                  <div className="kit-price">{fmt0(calc.precioKit)}</div>
                </div>
                <div className="kit-body">
                  {calc.items.map(({ producto, costos, cantidad }) => (
                    <div key={producto.id} className="kit-product-row">
                      <span>{producto.nombre}{producto.variante ? ` (${producto.variante})` : ""}{cantidad > 1 ? ` ×${cantidad}` : ""}</span>
                      <span style={{ color: "var(--ink3)", fontSize: 12 }}>{fmt0(costos.precioSugerido * cantidad)}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink3)" }}>
                    <span>Subtotal sin descuento: {fmt0(calc.subtotal)}</span>
                    <span style={{ color: "var(--success)", fontWeight: 600 }}>Ahorro: {fmt0(calc.ahorro)}</span>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type: "edit", kit })}>✏️ Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(kit.id)}>🗑 Eliminar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MÓDULO: Comparador de productos
// ════════════════════════════════════════════════════════════════════════════
function Comparador({ state }) {
  const { productos, calcularCostoProducto } = state;
  const [seleccionados, setSeleccionados] = useState([]);
  const fmt0 = n => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n || 0);

  const toggle = (id) => {
    if (seleccionados.includes(id)) setSeleccionados(s => s.filter(x => x !== id));
    else if (seleccionados.length < 4) setSeleccionados(s => [...s, id]);
  };

  const comparados = seleccionados.map(id => {
    const p = productos.find(x => x.id === id);
    if (!p) return null;
    const c = calcularCostoProducto(p);
    return { p, c };
  }).filter(Boolean);

  const minCosto = comparados.length ? Math.min(...comparados.map(x => x.c.costoTotal)) : 0;
  const maxCosto = comparados.length ? Math.max(...comparados.map(x => x.c.costoTotal)) : 0;
  const maxGanancia = comparados.length ? Math.max(...comparados.map(x => x.c.precioSugerido - x.c.costoTotal)) : 0;

  const ROWS = [
    { label: "Categoría", val: x => x.p.categoria },
    { label: "Temporada", val: x => x.p.temporada },
    { label: "Variante", val: x => x.p.variante || "—" },
    { label: "Costo insumos", val: x => fmt0(x.c.costoInsumos), num: x => x.c.costoInsumos, better: "low" },
    { label: "Costo mano de obra", val: x => fmt0(x.c.costoMOUnidad), num: x => x.c.costoMOUnidad, better: "low" },
    { label: "Costo total", val: x => fmt0(x.c.costoTotal), num: x => x.c.costoTotal, better: "low" },
    { label: "Precio sugerido", val: x => fmt0(x.c.precioSugerido), num: x => x.c.precioSugerido, better: "high" },
    { label: "Ganancia por unidad", val: x => fmt0(x.c.precioSugerido - x.c.costoTotal), num: x => x.c.precioSugerido - x.c.costoTotal, better: "high" },
    { label: "Margen aplicado", val: x => `${x.p.margen}%` },
    { label: "Lote de producción", val: x => `${x.p.loteTamanio} u. en ${x.p.loteHoras}h` },
  ];

  return (
    <div className="page">
      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        📊 Seleccioná hasta 4 productos de la lista para comparar sus costos y rentabilidad lado a lado.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        {/* Panel de selección */}
        <div className="card" style={{ alignSelf: "start" }}>
          <div className="card-header"><span className="card-title">Seleccionar productos</span></div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {productos.length === 0 && <div className="empty-state" style={{ padding: 24 }}><p>No hay productos cargados</p></div>}
            {productos.map(p => {
              const sel = seleccionados.includes(p.id);
              return (
                <div key={p.id} onClick={() => toggle(p.id)} style={{ padding: "10px 16px", cursor: "pointer", background: sel ? "rgba(194,113,79,.08)" : "transparent", borderLeft: `3px solid ${sel ? "var(--terra)" : "transparent"}`, borderBottom: "1px solid var(--cream2)", transition: "all .1s" }}>
                  <div style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? "var(--terra)" : "var(--ink)" }}>{p.nombre}</div>
                  <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 2 }}>{p.categoria}{p.variante ? ` · ${p.variante}` : ""}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabla comparativa */}
        <div>
          {comparados.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-icon">📊</div><p>Seleccioná productos para ver la comparación</p></div></div>
          ) : (
            <div className="card" style={{ overflow: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: `200px repeat(${comparados.length}, 1fr)`, minWidth: 500 }}>
                {/* Header */}
                <div style={{ padding: "14px 18px", background: "var(--cream)", borderBottom: "1px solid var(--border)", borderRight: "1px solid var(--border)" }} />
                {comparados.map(({ p }) => (
                  <div key={p.id} style={{ padding: "14px 18px", background: "var(--cream)", borderBottom: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{p.nombre}</div>
                    {p.variante && <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 2 }}>{p.variante}</div>}
                  </div>
                ))}

                {/* Filas */}
                {ROWS.map((row, ri) => (
                  <>
                    <div key={`lbl-${ri}`} style={{ padding: "11px 18px", background: "var(--cream)", borderBottom: "1px solid var(--cream2)", borderRight: "1px solid var(--border)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--ink3)", fontWeight: 600, display: "flex", alignItems: "center" }}>
                      {row.label}
                    </div>
                    {comparados.map(x => {
                      let cls = "";
                      if (row.num && comparados.length > 1) {
                        const v = row.num(x);
                        if (row.better === "low" && v === Math.min(...comparados.map(row.num))) cls = "best";
                        if (row.better === "low" && v === Math.max(...comparados.map(row.num)) && comparados.length > 1) cls = "worst";
                        if (row.better === "high" && v === Math.max(...comparados.map(row.num))) cls = "best";
                        if (row.better === "high" && v === Math.min(...comparados.map(row.num)) && comparados.length > 1) cls = "worst";
                      }
                      return (
                        <div key={`val-${x.p.id}-${ri}`} style={{ padding: "11px 18px", borderBottom: "1px solid var(--cream2)", borderRight: "1px solid var(--border)", fontSize: 13, fontWeight: cls === "best" ? 700 : 400, color: cls === "best" ? "var(--success)" : cls === "worst" ? "var(--danger)" : "var(--ink2)" }}>
                          {row.val(x)}
                          {cls === "best" && comparados.length > 1 && <span style={{ fontSize: 10, marginLeft: 4 }}>✓ mejor</span>}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MÓDULO: Descuentos por volumen
// ════════════════════════════════════════════════════════════════════════════
function Descuentos({ state }) {
  const { descuentos, setDescuentos, productos, calcularCostoProducto } = state;
  const [simProd, setSimProd] = useState("");
  const [simCant, setSimCant] = useState(10);
  const fmt0 = n => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n || 0);

  const addTier = () => {
    setDescuentos(prev => [...prev, { id: uid(), desde: 1, hasta: 10, pct: 5 }]);
  };
  const updateTier = (id, k, v) => {
    setDescuentos(prev => prev.map(d => d.id === id ? { ...d, [k]: v === "" ? null : parseFloat(v) } : d));
  };
  const deleteTier = (id) => setDescuentos(prev => prev.filter(d => d.id !== id));

  // Simulador
  const prodSim = productos.find(p => p.id === simProd);
  const costosSim = prodSim ? calcularCostoProducto(prodSim) : null;
  const precioBase = costosSim?.precioSugerido || 0;
  const tierAplicado = descuentos.filter(d => simCant >= d.desde && (d.hasta === null || simCant <= d.hasta)).sort((a, b) => b.pct - a.pct)[0];
  const precioConDesc = tierAplicado ? precioBase * (1 - tierAplicado.pct / 100) : precioBase;
  const totalVenta = precioConDesc * simCant;

  return (
    <div className="page">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Tabla de tiers */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Escalonado de descuentos</span>
            <button className="btn btn-primary btn-sm" onClick={addTier}>+ Agregar escalón</button>
          </div>
          <div className="card-body">
            <div className="alert alert-info" style={{ marginBottom: 16, fontSize: 12 }}>
              Estos descuentos se aplican automáticamente al usar el simulador. Se muestran a tus clientes como incentivo por volumen.
            </div>
            {descuentos.length === 0 && <div className="text-sm text-muted">No hay descuentos por volumen configurados.</div>}
            {descuentos.map((d, i) => (
              <div key={d.id} className="vol-tier">
                <div className="vol-tier-range">
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="number" value={d.desde} min="1" onChange={e => updateTier(d.id, "desde", e.target.value)} style={{ width: 55, padding: "4px 7px", border: "1px solid var(--border)", borderRadius: 5, fontSize: 13, fontWeight: 700 }} />
                    <span style={{ fontSize: 12, color: "var(--ink3)" }}>a</span>
                    <input type="number" value={d.hasta ?? ""} placeholder="∞" onChange={e => updateTier(d.id, "hasta", e.target.value)} style={{ width: 55, padding: "4px 7px", border: "1px solid var(--border)", borderRadius: 5, fontSize: 13, fontWeight: 700 }} />
                    <span style={{ fontSize: 12, color: "var(--ink3)" }}>u.</span>
                  </div>
                </div>
                <div className="vol-tier-desc">
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="number" value={d.pct} min="0" max="100" onChange={e => updateTier(d.id, "pct", e.target.value)} style={{ width: 55, padding: "4px 7px", border: "1px solid var(--border)", borderRadius: 5, fontSize: 13, fontWeight: 700, color: "var(--terra)" }} />
                    <span style={{ fontSize: 13 }}>% de descuento</span>
                  </div>
                </div>
                <button onClick={() => deleteTier(d.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: 16 }}>✕</button>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--cream)", borderRadius: 8, fontSize: 12, color: "var(--ink3)" }}>
              💡 Los rangos se aplican de mayor a menor descuento si se superponen. Dejá "hasta" vacío para "sin límite máximo".
            </div>
          </div>
        </div>

        {/* Simulador */}
        <div className="card">
          <div className="card-header"><span className="card-title">🧮 Simulador de precio por cantidad</span></div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field">
                <label className="label">Producto a simular</label>
                <select className="select" value={simProd} onChange={e => setSimProd(e.target.value)}>
                  <option value="">Seleccionar producto...</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}{p.variante ? ` (${p.variante})` : ""}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Cantidad de unidades</label>
                <input className="input" type="number" min="1" value={simCant} onChange={e => setSimCant(parseInt(e.target.value) || 1)} />
              </div>
            </div>

            {prodSim && costosSim && (
              <>
                <div className="divider" />
                <div className="price-result" style={{ marginTop: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div className="result-label">Precio por unidad</div>
                      <div className="result-value">{fmt0(precioConDesc)}</div>
                      {tierAplicado && <div style={{ fontSize: 12, color: "var(--terra2)", marginTop: 2 }}>Con {tierAplicado.pct}% de descuento por volumen</div>}
                      {!tierAplicado && <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 2 }}>Sin descuento por volumen</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(255,255,255,.5)" }}>Total {simCant} u.</div>
                      <div style={{ fontFamily: "Playfair Display, serif", fontSize: 24, color: "var(--terra2)" }}>{fmt0(totalVenta)}</div>
                    </div>
                  </div>
                  <div style={{ height: 1, background: "rgba(255,255,255,.1)", margin: "14px 0" }} />
                  <div className="breakdown-row">
                    <span className="key">Precio base (sin descuento)</span>
                    <span className="val">{fmt0(precioBase)} c/u</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="key">Ahorro por unidad</span>
                    <span className="val" style={{ color: "#7FD48F" }}>{fmt0(precioBase - precioConDesc)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="key">Ahorro total</span>
                    <span className="val" style={{ color: "#7FD48F" }}>{fmt0((precioBase - precioConDesc) * simCant)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="key">Tu ganancia total</span>
                    <span className="val" style={{ color: "var(--terra2)" }}>{fmt0((precioConDesc - costosSim.costoTotal) * simCant)}</span>
                  </div>
                </div>

                {/* Tabla de todos los escalones para este producto */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".08em" }}>Tabla de precios por escala</div>
                  <table style={{ width: "100%" }}>
                    <thead><tr><th>Cantidad</th><th>Descuento</th><th>Precio c/u</th><th>Total</th></tr></thead>
                    <tbody>
                      <tr style={{ background: !tierAplicado && simCant < (descuentos[0]?.desde || 999) ? "rgba(194,113,79,.06)" : "" }}>
                        <td>1 – {descuentos.length ? descuentos.sort((a,b)=>a.desde-b.desde)[0].desde - 1 : "∞"} u.</td>
                        <td>Sin descuento</td>
                        <td className="mono">{fmt0(precioBase)}</td>
                        <td className="mono text-muted">—</td>
                      </tr>
                      {[...descuentos].sort((a, b) => a.desde - b.desde).map(d => {
                        const p = precioBase * (1 - d.pct / 100);
                        const active = tierAplicado?.id === d.id;
                        return (
                          <tr key={d.id} style={{ background: active ? "rgba(194,113,79,.06)" : "" }}>
                            <td style={{ fontWeight: active ? 700 : 400 }}>{d.desde} – {d.hasta ?? "∞"} u. {active && "← vos"}</td>
                            <td><span className="badge badge-terra">{d.pct}% off</span></td>
                            <td className="mono" style={{ fontWeight: active ? 700 : 400, color: active ? "var(--terra)" : "" }}>{fmt0(p)}</td>
                            <td className="mono text-muted">{fmt0(p * simCant)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {!prodSim && <div className="empty-state" style={{ padding: 32 }}><div className="empty-icon">🧮</div><p>Seleccioná un producto para simular</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MÓDULO: Canales de venta
// ════════════════════════════════════════════════════════════════════════════
function Canales({ state }) {
  const { productos, kits, calcularCostoProducto, calcularKit, preciosPorCanal, config, setConfig } = state;
  const [tab, setTab] = useState("productos");
  const [simProd, setSimProd] = useState("");
  const fmt0 = n => new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(n||0);

  const canales = config.canales || [];
  const toggleCanal = (id) => setConfig(c=>({...c, canales: c.canales.map(x=>x.id===id?{...x,activo:!x.activo}:x)}));
  const updateCanal = (id, k, v) => setConfig(c=>({...c, canales: c.canales.map(x=>x.id===id?{...x,[k]:v}:x)}));
  const addCanal = () => setConfig(c=>({...c, canales:[...c.canales,{id:uid(),nombre:"Nuevo canal",comision:0,activo:true}]}));
  const deleteCanal = (id) => setConfig(c=>({...c, canales:c.canales.filter(x=>x.id!==id)}));

  const prodSim = productos.find(p=>p.id===simProd);
  const costosSim = prodSim ? calcularCostoProducto(prodSim) : null;
  const canalesSim = costosSim ? preciosPorCanal(costosSim.precioSugerido) : [];

  return (
    <div className="page">
      <div className="tabs">
        {[["config","⚙️ Configurar canales"],["sim","🧮 Simulador por producto"],["kits","🎁 Kits por canal"]].map(([k,l])=>(
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{l}</div>
        ))}
      </div>

      {tab==="config" && (
        <div style={{display:"grid",gap:20}}>
          {/* IVA */}
          <div className="card">
            <div className="card-header"><span className="card-title">IVA (Monotributo)</span></div>
            <div className="card-body">
              <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:14}}>
                  <input type="checkbox" checked={config.ivaActivo||false} onChange={e=>setConfig(c=>({...c,ivaActivo:e.target.checked}))} style={{width:16,height:16,accentColor:"var(--terra)"}} />
                  Activar IVA en precios de venta
                </label>
                {config.ivaActivo && (
                  <div className="field" style={{maxWidth:160}}>
                    <label className="label">% IVA</label>
                    <input className="input" type="number" value={config.ivaPct||21} onChange={e=>setConfig(c=>({...c,ivaPct:parseFloat(e.target.value)||21}))} />
                  </div>
                )}
              </div>
              {config.ivaActivo && (
                <div className="alert alert-info mt-3">
                  El IVA se suma <strong>al precio con comisión</strong> de cada canal. Se muestra como línea separada en el simulador.
                </div>
              )}
              {!config.ivaActivo && (
                <div className="alert alert-warn mt-3">
                  IVA desactivado. Activalo cuando te inscribas como monotributista para ver precios con impuesto incluido.
                </div>
              )}
            </div>
          </div>

          {/* Canales */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Canales de venta</span>
              <button className="btn btn-primary btn-sm" onClick={addCanal}>+ Agregar canal</button>
            </div>
            <div className="card-body">
              <div style={{display:"grid",gap:10}}>
                {canales.map(canal=>(
                  <div key={canal.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:canal.activo?"var(--cream)":"rgba(0,0,0,.03)",borderRadius:8,border:"1px solid var(--border)",opacity:canal.activo?1:.6}}>
                    <input type="checkbox" checked={canal.activo} onChange={()=>toggleCanal(canal.id)} style={{width:16,height:16,accentColor:"var(--terra)",cursor:"pointer"}} />
                    <input className="input" style={{flex:2,fontWeight:600}} value={canal.nombre} onChange={e=>updateCanal(canal.id,"nombre",e.target.value)} />
                    <div style={{display:"flex",alignItems:"center",gap:6,flex:1}}>
                      <div className="input-prefix" style={{flex:1}}>
                        <input type="number" min="0" max="100" step="0.5" value={canal.comision} onChange={e=>updateCanal(canal.id,"comision",parseFloat(e.target.value)||0)} />
                        <span className="prefix-text">% comisión</span>
                      </div>
                    </div>
                    {canal.comision>0
                      ? <span className="badge badge-warn">Comisión activa</span>
                      : <span className="badge badge-ok">Sin comisión</span>
                    }
                    <button onClick={()=>deleteCanal(canal.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--danger)",fontSize:16}}>✕</button>
                  </div>
                ))}
              </div>
              <div className="alert alert-info mt-3" style={{fontSize:12}}>
                💡 La comisión se suma al precio base para que vos siempre te llevés lo mismo, sea cual sea el canal donde vendés.
              </div>
            </div>
          </div>
        </div>
      )}

      {tab==="sim" && (
        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:24}}>
          <div className="card" style={{alignSelf:"start"}}>
            <div className="card-header"><span className="card-title">Seleccionar producto</span></div>
            <div style={{maxHeight:400,overflowY:"auto"}}>
              {productos.length===0 && <div className="empty-state" style={{padding:24}}><p>No hay productos cargados</p></div>}
              {productos.map(p=>(
                <div key={p.id} onClick={()=>setSimProd(p.id)} style={{padding:"10px 16px",cursor:"pointer",background:simProd===p.id?"rgba(194,113,79,.08)":"transparent",borderLeft:`3px solid ${simProd===p.id?"var(--terra)":"transparent"}`,borderBottom:"1px solid var(--cream2)"}}>
                  <div style={{fontSize:13,fontWeight:simProd===p.id?600:400,color:simProd===p.id?"var(--terra)":"var(--ink)"}}>{p.nombre}</div>
                  <div style={{fontSize:11,color:"var(--ink3)",marginTop:2}}>{p.categoria}{p.variante?` · ${p.variante}`:""}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {!prodSim && <div className="card"><div className="empty-state"><div className="empty-icon">🏪</div><p>Seleccioná un producto para ver sus precios por canal</p></div></div>}
            {prodSim && costosSim && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Precios por canal — {prodSim.nombre}</span>
                  <span className="badge badge-neutral">Costo: {fmt0(costosSim.costoTotal)}</span>
                </div>
                <div className="card-body">
                  <div style={{display:"grid",gap:12}}>
                    {canalesSim.map(c=>{
                      const ganancia = c.precioFinal - costosSim.costoTotal;
                      const margenReal = costosSim.costoTotal>0 ? (ganancia/c.precioFinal*100) : 0;
                      return (
                        <div key={c.id} style={{padding:"16px 20px",background:"var(--cream)",borderRadius:10,border:"1px solid var(--border)"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                            <div>
                              <div style={{fontWeight:700,fontSize:15,color:"var(--ink)"}}>{c.nombre}</div>
                              <div style={{fontSize:12,color:"var(--ink3)",marginTop:2}}>
                                {c.comision>0 ? `Comisión: ${c.comision}% → +${fmt0(c.comisionMonto)}` : "Sin comisión"}
                                {config.ivaActivo && ` · IVA ${config.ivaPct}%: +${fmt0(c.ivaMonto)}`}
                              </div>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontFamily:"Playfair Display, serif",fontSize:26,color:"var(--terra)"}}>
                                {fmt0(c.precioFinal)}
                              </div>
                              <div style={{fontSize:11,color:"var(--ink3)"}}>precio de publicación</div>
                            </div>
                          </div>
                          <div style={{marginTop:10,display:"flex",gap:16,fontSize:12,color:"var(--ink3)",borderTop:"1px dashed var(--border)",paddingTop:8}}>
                            <span>Precio base: <strong>{fmt0(costosSim.precioSugerido)}</strong></span>
                            <span>Ganancia neta: <strong style={{color:ganancia>0?"var(--success)":"var(--danger)"}}>{fmt0(ganancia)}</strong></span>
                            <span>Margen real: <strong style={{color:margenReal>30?"var(--success)":margenReal>15?"var(--gold)":"var(--danger)"}}>{margenReal.toFixed(1)}%</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab==="kits" && (
        <div>
          {kits.length===0 && <div className="card"><div className="empty-state"><div className="empty-icon">🎁</div><p>No hay kits. Creá uno en la sección Kits primero.</p></div></div>}
          {kits.length>0 && (
            <div style={{display:"grid",gap:16}}>
              {kits.map(kit=>{
                const calc = calcularKit(kit);
                const canalesKit = preciosPorCanal(calc.precioKit);
                return (
                  <div key={kit.id} className="card">
                    <div className="card-header">
                      <span className="card-title">🎁 {kit.nombre}</span>
                      <span className="badge badge-terra">{kit.descuento}% off · Precio base: {fmt0(calc.precioKit)}</span>
                    </div>
                    <div className="card-body">
                      <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(canalesKit.length,4)},1fr)`,gap:10}}>
                        {canalesKit.map(c=>(
                          <div key={c.id} style={{padding:"12px 14px",background:"var(--cream)",borderRadius:8,border:"1px solid var(--border)"}}>
                            <div style={{fontSize:12,fontWeight:600,color:"var(--ink2)"}}>{c.nombre}</div>
                            <div style={{fontFamily:"Playfair Display, serif",fontSize:22,color:"var(--terra)",marginTop:4}}>{fmt0(c.precioFinal)}</div>
                            <div style={{fontSize:11,color:"var(--ink3)",marginTop:2}}>
                              {c.comision>0?`+${c.comision}% com.`:"sin comisión"}
                              {config.ivaActivo&&` +IVA`}
                            </div>
                            <div style={{fontSize:11,color:"var(--success)",marginTop:4,fontWeight:600}}>
                              Gan: {fmt0(c.precioFinal - calc.costoKit)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MÓDULO: Exportar / Reportes
// ════════════════════════════════════════════════════════════════════════════
function Exportar({ state }) {
  const { insumos, productos, kits, gastosFijos, maquinas, config, calcularCostoProducto, calcularKit, preciosPorCanal, costoMaquinasMensual, totalGastosFijos } = state;
  const [exportando, setExportando] = useState(false);
  const fmt0 = n => new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(n||0);

  // ── Exportar CSV (compatible con Excel) ───────────────────────────────────
  const exportarCSV = (nombre, headers, rows) => {
    const BOM = "\uFEFF";
    const sep = ";";
    const lines = [headers.join(sep), ...rows.map(r => r.map(c=>`"${String(c||"").replace(/"/g,'""')}"`).join(sep))];
    const blob = new Blob([BOM + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = nombre; a.click();
    URL.revokeObjectURL(url);
  };

  const exportarInsumos = () => {
    exportarCSV("insumos.csv",
      ["Nombre","Categoría","Unidad","Costo por unidad","Stock actual","Stock mínimo","Estado","Proveedor"],
      insumos.map(i=>[i.nombre, i.categoria, i.unidad, i.costoUnidad, i.stock, i.stockMin, i.stock<=i.stockMin?"⚠ Bajo mínimo":"OK", i.proveedor])
    );
  };

  const exportarProductos = () => {
    exportarCSV("productos.csv",
      ["Nombre","Variante","Categoría","Temporada","Costo insumos","Costo MO","Costo total","Precio sugerido","Margen %","Ganancia"],
      productos.map(p=>{
        const c = calcularCostoProducto(p);
        return [p.nombre, p.variante||"", p.categoria, p.temporada, c.costoInsumos, c.costoMOUnidad, c.costoTotal, c.precioSugerido, p.margen, c.precioSugerido-c.costoTotal];
      })
    );
  };

  const exportarCanales = () => {
    const rows = [];
    productos.forEach(p => {
      const c = calcularCostoProducto(p);
      const canales = preciosPorCanal(c.precioSugerido);
      canales.forEach(canal => {
        rows.push([p.nombre, p.variante||"", canal.nombre, `${canal.comision}%`, c.costoTotal, c.precioSugerido, canal.precioFinal, canal.precioFinal-c.costoTotal]);
      });
    });
    exportarCSV("precios_canales.csv",
      ["Producto","Variante","Canal","Comisión","Costo total","Precio base","Precio publicación","Ganancia neta"],
      rows
    );
  };

  const exportarKits = () => {
    const rows = [];
    kits.forEach(kit => {
      const calc = calcularKit(kit);
      rows.push([kit.nombre, calc.items.length, `${kit.descuento}%`, calc.subtotal, calc.precioKit, calc.costoKit, calc.precioKit-calc.costoKit, calc.ahorro]);
      calc.items.forEach(it => {
        rows.push([`  └ ${it.producto.nombre}`, `×${it.cantidad}`, "", "", it.costos.precioSugerido*it.cantidad, it.costos.costoTotal*it.cantidad,"",""]);
      });
    });
    exportarCSV("kits.csv",
      ["Kit / Producto","Cant. / Items","Descuento","Subtotal","Precio kit","Costo kit","Ganancia","Ahorro cliente"],
      rows
    );
  };

  // ── Generar reporte HTML para imprimir/PDF ─────────────────────────────────
  const generarReportePDF = () => {
    setExportando(true);
    const fecha = new Date().toLocaleDateString("es-AR");
    const prodRows = productos.map(p => {
      const c = calcularCostoProducto(p);
      return `<tr>
        <td>${p.nombre}${p.variante?` <span class="tag">${p.variante}</span>`:""}</td>
        <td>${p.categoria}</td>
        <td>${p.temporada}</td>
        <td class="num">${fmt0(c.costoInsumos)}</td>
        <td class="num">${fmt0(c.costoMOUnidad)}</td>
        <td class="num bold">${fmt0(c.costoTotal)}</td>
        <td class="num accent">${fmt0(c.precioSugerido)}</td>
        <td class="num">${p.margen}%</td>
      </tr>`;
    }).join("");

    const insRows = insumos.map(i => {
      const bajo = i.stock <= i.stockMin;
      return `<tr ${bajo?'class="warn-row"':""}>
        <td>${i.nombre}</td><td>${i.categoria}</td><td>${i.unidad}</td>
        <td class="num">${fmt0(i.costoUnidad)}</td>
        <td class="num">${i.stock}</td>
        <td class="num">${i.stockMin}</td>
        <td>${bajo?"⚠ Bajo mínimo":"OK"}</td>
      </tr>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte — Calculadora de Costos</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;600&display=swap');
  body { font-family:'DM Sans',sans-serif; color:#1C1917; background:#fff; margin:0; padding:0; }
  .cover { background:#1C1917; color:#F7F3EE; padding:48px 56px; }
  .cover h1 { font-family:'Playfair Display',serif; font-size:32px; margin:0 0 6px; }
  .cover p { font-size:14px; opacity:.6; margin:0; }
  .cover .date { font-size:12px; opacity:.4; margin-top:12px; }
  .section { padding:32px 56px 0; }
  h2 { font-family:'Playfair Display',serif; font-size:20px; color:#1C1917; border-bottom:2px solid #C2714F; padding-bottom:6px; margin-bottom:16px; }
  table { width:100%; border-collapse:collapse; font-size:12px; margin-bottom:24px; }
  th { text-align:left; padding:8px 10px; background:#F7F3EE; color:#78716C; font-size:10px; text-transform:uppercase; letter-spacing:.08em; border-bottom:1px solid #D6CFC5; }
  td { padding:8px 10px; border-bottom:1px solid #EDE8E0; }
  td.num { text-align:right; font-variant-numeric:tabular-nums; }
  td.bold { font-weight:700; }
  td.accent { color:#C2714F; font-weight:700; }
  .tag { background:#EDE8E0; padding:2px 7px; border-radius:10px; font-size:10px; }
  .warn-row td { background:#FFF8E1; }
  .summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
  .stat { background:#F7F3EE; border-radius:8px; padding:14px 16px; }
  .stat-l { font-size:10px; text-transform:uppercase; letter-spacing:.1em; color:#78716C; }
  .stat-v { font-family:'Playfair Display',serif; font-size:22px; color:#1C1917; margin-top:3px; }
  @media print { .no-print{display:none} }
</style>
</head>
<body>
<div class="cover">
  <h1>Calculadora de Costos</h1>
  <p>Reporte completo de tu negocio de papelería</p>
  <div class="date">Generado el ${fecha}</div>
</div>

<div class="section">
  <h2>Resumen general</h2>
  <div class="summary-grid">
    <div class="stat"><div class="stat-l">Productos</div><div class="stat-v">${productos.length}</div></div>
    <div class="stat"><div class="stat-l">Insumos</div><div class="stat-v">${insumos.length}</div></div>
    <div class="stat"><div class="stat-l">Kits</div><div class="stat-v">${kits.length}</div></div>
    <div class="stat"><div class="stat-l">Gastos fijos + máq.</div><div class="stat-v" style="font-size:16px">${fmt0(totalGastosFijos)}/mes</div></div>
  </div>
</div>

<div class="section">
  <h2>Productos y precios</h2>
  <table>
    <thead><tr><th>Producto</th><th>Categoría</th><th>Temporada</th><th>Costo insumos</th><th>Costo MO</th><th>Costo total</th><th>Precio sugerido</th><th>Margen</th></tr></thead>
    <tbody>${prodRows||'<tr><td colspan="8" style="text-align:center;color:#78716C">Sin productos cargados</td></tr>'}</tbody>
  </table>
</div>

<div class="section">
  <h2>Insumos y stock</h2>
  <table>
    <thead><tr><th>Insumo</th><th>Categoría</th><th>Unidad</th><th>Costo/u.</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr></thead>
    <tbody>${insRows}</tbody>
  </table>
</div>

<div class="section">
  <h2>Gastos fijos mensuales</h2>
  <table>
    <thead><tr><th>Concepto</th><th>Monto mensual</th></tr></thead>
    <tbody>
      ${gastosFijos.map(g=>`<tr><td>${g.nombre}</td><td class="num">${fmt0(g.monto)}</td></tr>`).join("")}
      <tr><td><strong>Amortización máquinas</strong></td><td class="num"><strong>${fmt0(costoMaquinasMensual)}</strong></td></tr>
      <tr style="background:#F7F3EE"><td><strong>TOTAL</strong></td><td class="num bold accent">${fmt0(totalGastosFijos)}</td></tr>
    </tbody>
  </table>
</div>

<div class="section" style="padding-bottom:48px">
  <h2>Máquinas</h2>
  <table>
    <thead><tr><th>Máquina</th><th>Valor de compra</th><th>Vida útil</th><th>Amort. mensual</th></tr></thead>
    <tbody>
      ${maquinas.map(m=>`<tr><td>${m.nombre}</td><td class="num">${fmt0(m.valorCompra)}</td><td>${m.vidaUtilAnios} años</td><td class="num">${fmt0(m.valorCompra/(m.vidaUtilAnios*12))}</td></tr>`).join("")}
    </tbody>
  </table>
</div>

<script>window.onload=()=>window.print();</script>
</body></html>`;

    const win = window.open("","_blank");
    if (win) { win.document.write(html); win.document.close(); }
    setExportando(false);
  };

  const EXPORTS = [
    {
      icon:"📦", titulo:"Insumos", desc:"Lista completa de materiales, costos, stock y alertas.", accion: exportarInsumos, formato:"CSV / Excel",
    },
    {
      icon:"📒", titulo:"Productos y precios", desc:"Todos los productos con costos desglosados y precio sugerido.", accion: exportarProductos, formato:"CSV / Excel",
    },
    {
      icon:"🏪", titulo:"Precios por canal", desc:"Precio de publicación de cada producto en cada canal de venta.", accion: exportarCanales, formato:"CSV / Excel",
    },
    {
      icon:"🎁", titulo:"Kits", desc:"Todos los kits con sus productos, precios y ganancia.", accion: exportarKits, formato:"CSV / Excel",
    },
    {
      icon:"📄", titulo:"Reporte completo PDF", desc:"Reporte profesional listo para imprimir o guardar como PDF.", accion: generarReportePDF, formato:"PDF (imprimir)",
    },
  ];

  return (
    <div className="page">
      <div className="alert alert-info" style={{marginBottom:24}}>
        💾 <strong>Tus datos se guardan automáticamente</strong> en este navegador. Para exportar y compartir, usá las opciones de abajo.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {EXPORTS.map((exp,i)=>(
          <div key={i} className="card" style={{overflow:"visible"}}>
            <div className="card-body" style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{fontSize:32}}>{exp.icon}</div>
              <div>
                <div style={{fontFamily:"Playfair Display, serif",fontSize:16,fontWeight:600,color:"var(--ink)"}}>{exp.titulo}</div>
                <div style={{fontSize:13,color:"var(--ink3)",marginTop:4}}>{exp.desc}</div>
              </div>
              <div style={{marginTop:"auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span className="badge badge-neutral">{exp.formato}</span>
                <button className="btn btn-primary btn-sm" onClick={exp.accion} disabled={exportando}>
                  ↓ Exportar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{marginTop:24}}>
        <div className="card-header"><span className="card-title">💾 Respaldo manual de datos</span></div>
        <div className="card-body">
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <button className="btn btn-secondary" onClick={()=>{
              const data = JSON.stringify(loadState(), null, 2);
              const blob = new Blob([data],{type:"application/json"});
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href=url; a.download=`papeleria_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
              URL.revokeObjectURL(url);
            }}>
              📥 Descargar backup (.json)
            </button>
            <label className="btn btn-secondary" style={{cursor:"pointer"}}>
              📤 Restaurar backup (.json)
              <input type="file" accept=".json" style={{display:"none"}} onChange={e=>{
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  try {
                    const data = JSON.parse(ev.target.result);
                    if (window.confirm("¿Restaurar los datos del backup? Se reemplazará todo lo actual.")) {
                      saveState(data);
                      window.location.reload();
                    }
                  } catch { alert("Archivo inválido"); }
                };
                reader.readAsText(file);
              }} />
            </label>
          </div>
          <div className="mt-2 text-sm text-muted">
            El backup guarda todos tus datos (insumos, productos, kits, configuración) en un archivo que podés restaurar en cualquier dispositivo o navegador.
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PANTALLA DE LOGIN
// ════════════════════════════════════════════════════════════════════════════
function PantallaLogin({ onLogin }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setCargando(true);
    setError("");
    try {
      await onLogin();
    } catch (e) {
      setError("No se pudo iniciar sesión. Intentá de nuevo.");
      setCargando(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", background:"var(--ink)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24
    }}>
      <style>{CSS}</style>
      <div style={{
        background:"var(--white)", borderRadius:16, padding:"48px 40px",
        maxWidth:420, width:"100%", textAlign:"center",
        boxShadow:"var(--shadow-lg)"
      }}>
        <div style={{fontSize:48, marginBottom:16}}>📒</div>
        <div style={{fontFamily:"Playfair Display, serif", fontSize:28, fontWeight:700, color:"var(--ink)", lineHeight:1.2, marginBottom:8}}>
          Calculadora<br/>de Costos
        </div>
        <div style={{fontSize:13, color:"var(--ink3)", marginBottom:8}}>
          Para tu negocio de papelería
        </div>
        <div style={{height:1, background:"var(--border)", margin:"24px 0"}} />
        <div style={{fontSize:14, color:"var(--ink2)", marginBottom:24, lineHeight:1.6}}>
          Iniciá sesión con tu cuenta de Google para acceder a tu calculadora. Tus datos se sincronizan automáticamente en la nube.
        </div>
        {error && (
          <div style={{background:"#FDECEA", color:"var(--danger)", padding:"10px 14px", borderRadius:8, fontSize:13, marginBottom:16}}>
            {error}
          </div>
        )}
        <button
          onClick={handleLogin}
          disabled={cargando}
          style={{
            width:"100%", padding:"13px 20px",
            background: cargando ? "var(--cream2)" : "var(--terra)",
            color: cargando ? "var(--ink3)" : "white",
            border:"none", borderRadius:8, fontSize:15, fontWeight:600,
            cursor: cargando ? "not-allowed" : "pointer",
            fontFamily:"DM Sans, sans-serif",
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
            transition:"all .2s"
          }}
        >
          {cargando ? (
            <>⏳ Conectando...</>
          ) : (
            <><span style={{fontSize:18}}>G</span> Ingresar con Google</>
          )}
        </button>
        <div style={{fontSize:11, color:"var(--ink3)", marginTop:16}}>
          Solo vos podés ver tus datos. Nunca compartimos tu información.
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ════════════════════════════════════════════════════════════════════════════
const PAGES = [
  { id:"dashboard",  icon:"📊", label:"Resumen",           section:"principal" },
  { id:"insumos",    icon:"📦", label:"Insumos",            section:"principal" },
  { id:"productos",  icon:"📒", label:"Productos",          section:"principal" },
  { id:"kits",       icon:"🎁", label:"Kits",               section:"ventas" },
  { id:"comparador", icon:"⚖️", label:"Comparador",         section:"ventas" },
  { id:"descuentos", icon:"🏷️", label:"Descuentos",         section:"ventas" },
  { id:"canales",    icon:"🏪", label:"Canales de venta",   section:"ventas" },
  { id:"calc",       icon:"🧮", label:"Calc. rápida",       section:"herramientas" },
  { id:"exportar",   icon:"📤", label:"Exportar",           section:"herramientas" },
  { id:"config",     icon:"⚙️", label:"Configuración",      section:"herramientas" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const state = useAppState();

  // ── Pantalla de carga inicial ─────────────────────────────────────────
  if (state.cargando) {
    return (
      <div style={{minHeight:"100vh",background:"var(--ink)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <style>{CSS}</style>
        <div style={{textAlign:"center",color:"var(--cream)"}}>
          <div style={{fontSize:48,marginBottom:16}}>📒</div>
          <div style={{fontFamily:"Playfair Display, serif",fontSize:20}}>Cargando...</div>
        </div>
      </div>
    );
  }

  // ── Login screen ──────────────────────────────────────────────────────
  if (!state.usuario) {
    return <PantallaLogin onLogin={loginConGoogle} />;
  }

  const titles = {
    dashboard:"Resumen general", insumos:"Insumos", productos:"Productos",
    kits:"Kits & Bundles", comparador:"Comparador de productos",
    descuentos:"Descuentos por volumen", canales:"Canales de venta",
    calc:"Calculadora rápida", exportar:"Exportar & Reportes", config:"Configuración",
  };
  const subs = {
    dashboard:"Vista de un vistazo de tu negocio",
    insumos:"Materiales, costos y stock",
    productos:"Fichas y precios de cada producto",
    kits:"Armá paquetes de productos con descuento",
    comparador:"Comparación lado a lado de costos y rentabilidad",
    descuentos:"Escalones de precio por cantidad",
    canales:"Precios ajustados por comisión e IVA por canal",
    calc:"Calculá el precio de cualquier combinación",
    exportar:"Exportá reportes a Excel y PDF · Backup de datos",
    config:"Sueldos, gastos fijos y máquinas",
  };

  const sections = ["principal","ventas","herramientas"];
  const sectionLabels = { principal:"Principal", ventas:"Ventas", herramientas:"Herramientas" };

  return (
    <>
      <style>{CSS + CSS_E2}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span>Papelería</span>
            <h1>Calculadora<br/>de Costos</h1>
          </div>
          <nav className="sidebar-nav" style={{overflowY:"auto"}}>
            {sections.map(sec=>(
              <div key={sec}>
                <div className="nav-section-label">{sectionLabels[sec]}</div>
                {PAGES.filter(p=>p.section===sec).map(p=>(
                  <div key={p.id} className={`nav-item ${page===p.id?"active":""}`} onClick={()=>setPage(p.id)}>
                    <span className="nav-icon">{p.icon}</span>
                    {p.label}
                    {p.id==="insumos" && state.stocksLow>0 && <span className="nav-badge">{state.stocksLow}</span>}
                    {p.id==="kits" && state.kits.length>0 && <span className="nav-badge">{state.kits.length}</span>}
                  </div>
                ))}
              </div>
            ))}
          </nav>
          <div style={{padding:"12px 24px",borderTop:"1px solid rgba(255,255,255,.1)"}}>
            {state.sincronizando && (
              <div style={{fontSize:11,color:"rgba(255,255,255,.4)",display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"var(--gold)",display:"inline-block"}}/>
                Sincronizando...
              </div>
            )}
            {state.guardado && !state.sincronizando && (
              <div style={{fontSize:11,color:"rgba(255,255,255,.4)",display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#7FD48F",display:"inline-block"}}/>
                Guardado en la nube ✓
              </div>
            )}
            <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14}}>👤</span>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:140}}>
                {state.usuario.displayName || state.usuario.email}
              </span>
            </div>
            <button onClick={cerrarSesion} style={{
              background:"none",border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.5)",
              borderRadius:5,padding:"5px 10px",fontSize:11,cursor:"pointer",width:"100%",
              fontFamily:"DM Sans, sans-serif"
            }}>
              Cerrar sesión
            </button>
          </div>
        </aside>
        <div className="main">
          <div className="topbar">
            <div>
              <div className="topbar-title">{titles[page]}</div>
              <div className="topbar-sub">{subs[page]}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {state.sincronizando && (
                <div style={{fontSize:12,color:"var(--gold)",display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:"var(--gold)",display:"inline-block"}}/>
                  Sincronizando
                </div>
              )}
              {state.guardado && !state.sincronizando && (
                <div style={{fontSize:12,color:"var(--success)",display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:"var(--success)",display:"inline-block"}}/>
                  Guardado en la nube
                </div>
              )}
            </div>
          </div>
          {page==="dashboard"  && <Dashboard  state={state} />}
          {page==="insumos"    && <Insumos    state={state} />}
          {page==="productos"  && <Productos  state={state} />}
          {page==="kits"       && <Kits       state={state} />}
          {page==="comparador" && <Comparador state={state} />}
          {page==="descuentos" && <Descuentos state={state} />}
          {page==="canales"    && <Canales    state={state} />}
          {page==="calc"       && <CalcRapida state={state} />}
          {page==="exportar"   && <Exportar   state={state} />}
          {page==="config"     && <Configuracion state={state} />}
        </div>
      </div>
    </>
  );
}

  { id:"dashboard",  icon:"📊", label:"Resumen",           section:"principal" },
  { id:"insumos",    icon:"📦", label:"Insumos",            section:"principal" },
  { id:"productos",  icon:"📒", label:"Productos",          section:"principal" },
  { id:"kits",       icon:"🎁", label:"Kits",               section:"ventas" },
  { id:"comparador", icon:"⚖️", label:"Comparador",         section:"ventas" },
  { id:"descuentos", icon:"🏷️", label:"Descuentos",         section:"ventas" },
  { id:"canales",    icon:"🏪", label:"Canales de venta",   section:"ventas" },
  { id:"calc",       icon:"🧮", label:"Calc. rápida",       section:"herramientas" },
  { id:"exportar",   icon:"📤", label:"Exportar",           section:"herramientas" },
  { id:"config",     icon:"⚙️", label:"Configuración",      section:"herramientas" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const state = useAppState();

  const titles = {
    dashboard:"Resumen general", insumos:"Insumos", productos:"Productos",
    kits:"Kits & Bundles", comparador:"Comparador de productos",
    descuentos:"Descuentos por volumen", canales:"Canales de venta",
    calc:"Calculadora rápida", exportar:"Exportar & Reportes", config:"Configuración",
  };
  const subs = {
    dashboard:"Vista de un vistazo de tu negocio",
    insumos:"Materiales, costos y stock",
    productos:"Fichas y precios de cada producto",
    kits:"Armá paquetes de productos con descuento",
    comparador:"Comparación lado a lado de costos y rentabilidad",
    descuentos:"Escalones de precio por cantidad",
    canales:"Precios ajustados por comisión e IVA por canal",
    calc:"Calculá el precio de cualquier combinación",
    exportar:"Exportá reportes a Excel y PDF · Backup de datos",
    config:"Sueldos, gastos fijos y máquinas",
  };

  const sections = ["principal","ventas","herramientas"];
  const sectionLabels = { principal:"Principal", ventas:"Ventas", herramientas:"Herramientas" };

  return (
    <>
      <style>{CSS + CSS_E2}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span>Papelería</span>
            <h1>Calculadora<br/>de Costos</h1>
          </div>
          <nav className="sidebar-nav" style={{overflowY:"auto"}}>
            {sections.map(sec=>(
              <div key={sec}>
                <div className="nav-section-label">{sectionLabels[sec]}</div>
                {PAGES.filter(p=>p.section===sec).map(p=>(
                  <div key={p.id} className={`nav-item ${page===p.id?"active":""}`} onClick={()=>setPage(p.id)}>
                    <span className="nav-icon">{p.icon}</span>
                    {p.label}
                    {p.id==="insumos" && state.stocksLow>0 && <span className="nav-badge">{state.stocksLow}</span>}
                    {p.id==="kits" && state.kits.length>0 && <span className="nav-badge">{state.kits.length}</span>}
                  </div>
                ))}
              </div>
            ))}
          </nav>
          <div style={{padding:"12px 24px",borderTop:"1px solid rgba(255,255,255,.1)"}}>
            {state.guardado && (
              <div style={{fontSize:11,color:"rgba(255,255,255,.4)",display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#7FD48F",display:"inline-block"}}/>
                Guardado automáticamente
              </div>
            )}
            <div style={{fontSize:11,color:"rgba(255,255,255,.3)",letterSpacing:".08em"}}>VERSIÓN COMPLETA — v4.0</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.2)",marginTop:2}}>Todas las etapas activas</div>
          </div>
        </aside>
        <div className="main">
          <div className="topbar">
            <div>
              <div className="topbar-title">{titles[page]}</div>
              <div className="topbar-sub">{subs[page]}</div>
            </div>
            {state.guardado && (
              <div style={{fontSize:12,color:"var(--success)",display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:"var(--success)",display:"inline-block"}}/>
                Guardado
              </div>
            )}
          </div>
          {page==="dashboard"  && <Dashboard  state={state} />}
          {page==="insumos"    && <Insumos    state={state} />}
          {page==="productos"  && <Productos  state={state} />}
          {page==="kits"       && <Kits       state={state} />}
          {page==="comparador" && <Comparador state={state} />}
          {page==="descuentos" && <Descuentos state={state} />}
          {page==="canales"    && <Canales    state={state} />}
          {page==="calc"       && <CalcRapida state={state} />}
          {page==="exportar"   && <Exportar   state={state} />}
          {page==="config"     && <Configuracion state={state} />}
        </div>
      </div>
    </>
  );
}
