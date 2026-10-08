import React, { useState, useEffect, useCallback } from "react";
import {
  Check,
  Circle,
  Flame,
  Snowflake,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Activity,
  Sunrise,
  Moon,
  Heart,
  Wind,
  Feather,
} from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@500;700;900&family=Inter:wght@400;500;600&display=swap');`;

/* ============================== PIED / MOLLET (routine A / B, 24 semaines : 4 mise en place + 20 en 4 cycles de 5 semaines) ============================== */

const PIED_INTRO_WEEKS = 4;

// niveau (0-7) et statut décharge par semaine de programme (1 à 20) — chaque cycle = 4 semaines actives (2 base + 2 surcharge) + 1 décharge en clôture
const PIED_CYCLE_WEEKS = [
  { week: 1, cycle: 1, level: 0, deload: false },
  { week: 2, cycle: 1, level: 0, deload: false },
  { week: 3, cycle: 1, level: 1, deload: false },
  { week: 4, cycle: 1, level: 1, deload: false },
  { week: 5, cycle: 1, level: 1, deload: true },
  { week: 6, cycle: 2, level: 2, deload: false },
  { week: 7, cycle: 2, level: 2, deload: false },
  { week: 8, cycle: 2, level: 3, deload: false },
  { week: 9, cycle: 2, level: 3, deload: false },
  { week: 10, cycle: 2, level: 3, deload: true },
  { week: 11, cycle: 3, level: 4, deload: false },
  { week: 12, cycle: 3, level: 4, deload: false },
  { week: 13, cycle: 3, level: 5, deload: false },
  { week: 14, cycle: 3, level: 5, deload: false },
  { week: 15, cycle: 3, level: 5, deload: true },
  { week: 16, cycle: 4, level: 6, deload: false },
  { week: 17, cycle: 4, level: 6, deload: false },
  { week: 18, cycle: 4, level: 7, deload: false },
  { week: 19, cycle: 4, level: 7, deload: false },
  { week: 20, cycle: 4, level: 7, deload: true },
];

const PIED_POST_INTRO_DELOAD = 1;
const PIED_TOTAL_WEEKS = PIED_INTRO_WEEKS + PIED_POST_INTRO_DELOAD + PIED_CYCLE_WEEKS.length; // 25

function isPiedIntroWeek(week) {
  return week <= PIED_INTRO_WEEKS;
}
function isPiedPostIntroDeload(week) {
  return week === PIED_INTRO_WEEKS + PIED_POST_INTRO_DELOAD;
}
function piedProgramWeek(week) {
  return week - PIED_INTRO_WEEKS - PIED_POST_INTRO_DELOAD;
}
function piedCycleInfo(week) {
  return PIED_CYCLE_WEEKS.find((w) => w.week === piedProgramWeek(week));
}

// Badge affiché en haut de l'onglet (mise en place / décharge post-mise en place / cycle+niveau / décharge)
function piedWeekBadge(week) {
  if (isPiedIntroWeek(week)) {
    return { label: "Mise en place", sub: "2 sets par exercice", deload: false };
  }
  if (isPiedPostIntroDeload(week)) {
    return { label: "Décharge", sub: "Avant le cycle 1", deload: true };
  }
  const info = piedCycleInfo(week);
  return {
    label: info.deload ? "Décharge" : `Cycle ${info.cycle}`,
    sub: info.deload ? "Volume réduit" : `Niveau ${info.level + 1}`,
    deload: info.deload,
  };
}

// Chaque exercice définit : levels[0..7] (progression principale), deload (décharge), intro (mise en place, 2 sets)
function targetFor(exercise, week) {
  if (isPiedIntroWeek(week)) {
    return exercise.intro;
  }
  if (isPiedPostIntroDeload(week)) {
    return exercise.deload;
  }
  const info = piedCycleInfo(week);
  if (info.deload) {
    return exercise.deload;
  }
  return exercise.levels[info.level];
}

const ROUTINES = {
  A: {
    label: "Routine A",
    days: ["Séance 1", "Séance 2", "Séance 3"],
    exercises: [
      {
        id: "shortfoot",
        name: "Short foot",
        type: "duration",
        unit: "sec",
        intro: { sets: 2, target: 5, holdSec: 4, displayTarget: "5 reps (tenues 4s)" },
        deload: { sets: 2, target: 4, holdSec: 4, displayTarget: "4 reps (tenues 4s)" },
        levels: [
          { sets: 3, target: 5, holdSec: 4, displayTarget: "5 reps (tenues 4s)" },
          { sets: 3, target: 7, holdSec: 4, displayTarget: "7 reps (tenues 4s)" },
          { sets: 3, target: 7, holdSec: 6, displayTarget: "7 reps (tenues 6s)" },
          { sets: 3, target: 7, holdSec: 8, displayTarget: "7 reps (tenues 8s)" },
          { sets: 3, target: 9, holdSec: 8, displayTarget: "9 reps (tenues 8s)" },
          { sets: 3, target: 11, holdSec: 8, displayTarget: "11 reps (tenues 8s)" },
          { sets: 3, target: 11, holdSec: 10, displayTarget: "11 reps (tenues 10s)" },
          { sets: 3, target: 11, holdSec: 12, displayTarget: "11 reps (tenues 12s)" },
        ],
      },
      {
        id: "extmollet",
        name: "Extension de mollet",
        type: "reps",
        unit: "reps",
        intro: { sets: 2, target: 8 },
        deload: { sets: 2, target: 6 },
        levels: [
          { sets: 3, target: 8 },
          { sets: 3, target: 10 },
          { sets: 3, target: 12 },
          { sets: 3, target: 15 },
          { sets: 3, target: 17 },
          { sets: 3, target: 19 },
          { sets: 3, target: 21 },
          { sets: 3, target: 23 },
        ],
      },
      {
        id: "slb",
        name: "Single leg balance",
        type: "duration",
        unit: "sec",
        intro: { sets: 1, target: 30 },
        deload: { sets: 1, target: 20 },
        levels: [
          { sets: 1, target: 30 },
          { sets: 1, target: 40 },
          { sets: 1, target: 45 },
          { sets: 1, target: 55 },
          { sets: 1, target: 60 },
          { sets: 1, target: 65 },
          { sets: 1, target: 70 },
          { sets: 1, target: 75 },
        ],
      },
    ],
  },
  B: {
    label: "Routine B",
    days: ["Séance 1", "Séance 2", "Séance 3"],
    exercises: [
      {
        id: "tibpost",
        name: "Tibialis posterior",
        type: "reps",
        unit: "reps",
        intro: { sets: 2, target: 10 },
        deload: { sets: 2, target: 8 },
        levels: [
          { sets: 3, target: 10 },
          { sets: 3, target: 12 },
          { sets: 3, target: 14 },
          { sets: 3, target: 16 },
          { sets: 3, target: 18 },
          { sets: 3, target: 20 },
          { sets: 3, target: 22 },
          { sets: 3, target: 24 },
        ],
      },
      {
        id: "gaspedal",
        name: "Tibialis raise",
        type: "reps",
        unit: "reps",
        intro: { sets: 2, target: 20, displayTarget: "20 reps (poids du corps)" },
        deload: { sets: 2, target: 16, displayTarget: "16 reps (poids du corps)" },
        // Niveaux 0-1 : palier poids du corps (20 puis 25 reps). Niveaux 2-7 : passage au tib bar lesté,
        // UNILATÉRAL (un pied à la fois, charge pleine par pied) — cohérent avec le suivi par jambe déjà
        // en place dans l'appli et avec le test réel (5kg à un pied via poids de poignet, jugé insuffisant).
        // Incréments de 2,5kg — le disque le plus universellement vendu et disponible pour un rail Olympique
        // 50mm (celui que prennent la plupart des tib bars) : avec un set standard 1,25/2,5/5/10/15/20kg,
        // chaque palier ci-dessous se charge avec une seule combinaison simple de disques courants, sans
        // avoir besoin de micro-plaques de fractionnement spécialisées (celles-ci existent en 0,25-1,5kg
        // mais sont une niche à commander en ligne, pas vendues couramment en magasin de sport en France).
        // Aucune des sources consultées ne publie de protocole de charge avancée en unilatéral pour le
        // tibialis anterior — ce barème reste une extrapolation prudente à partir de ton propre repère
        // (5kg/pied insuffisant), pas un protocole vérifié en littérature. À recalibrer selon ta progression réelle.
        levels: [
          { sets: 3, target: 20, displayTarget: "20 reps (poids du corps)" },
          { sets: 3, target: 25, displayTarget: "25 reps (poids du corps)" },
          { sets: 3, target: 15, displayTarget: "Tib bar lesté 5kg (2×2,5) — 15 reps" },
          { sets: 3, target: 15, displayTarget: "Tib bar lesté 7,5kg (5+2,5) — 15 reps" },
          { sets: 3, target: 12, displayTarget: "Tib bar lesté 10kg (2×5) — 12 reps" },
          { sets: 3, target: 12, displayTarget: "Tib bar lesté 12,5kg (10+2,5) — 12 reps" },
          { sets: 3, target: 10, displayTarget: "Tib bar lesté 15kg (10+5) — 10 reps" },
          { sets: 3, target: 10, displayTarget: "Tib bar lesté 17,5kg (15+2,5) — 10 reps" },
        ],
      },
      {
        id: "slb",
        name: "Single leg balance",
        type: "duration",
        unit: "sec",
        intro: { sets: 1, target: 30 },
        deload: { sets: 1, target: 20 },
        levels: [
          { sets: 1, target: 30 },
          { sets: 1, target: 40 },
          { sets: 1, target: 45 },
          { sets: 1, target: 55 },
          { sets: 1, target: 60 },
          { sets: 1, target: 65 },
          { sets: 1, target: 70 },
          { sets: 1, target: 75 },
        ],
      },
    ],
  },
};

/* ============================== ÉTIREMENTS PIED (5 étirements, 2x30s, objectif 6 séances/semaine) ============================== */

const PIED_STRETCHES = [
  { id: "etirmollet", name: "Étirement mollet", bilateral: true, sets: 2, target: 30 },
  { id: "seiza", name: "Seiza", bilateral: true, sets: 2, target: 30 },
  { id: "atgsplitsquat", name: "ATG split squat", bilateral: false, sets: 2, target: 30 },
  { id: "kiza", name: "Kiza", bilateral: true, sets: 2, target: 30 },
  { id: "ecartementgrosorteils", name: "Écartement des gros orteils", bilateral: true, sets: 2, target: 30 },
];

// window.storage peut échouer ponctuellement (cf. doc officielle : "Storage operations can fail").
// On retente automatiquement avant d'informer l'utilisateur d'un échec réel.
async function storageSetWithRetry(key, value, retries = 3, delayMs = 350) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await window.storage.set(key, value, false);
      if (result) return result;
    } catch (e) {
      // on retente
    }
    if (attempt < retries - 1) {
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  return null;
}

async function storageGetWithRetry(key, retries = 3, delayMs = 350) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await window.storage.get(key, false);
    } catch (e) {
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
      }
    }
  }
  return null;
}

/* ============================== CALENDRIER RÉCAPITULATIF (affichage seulement, la saisie reste inchangée) ============================== */

function isoDateStr(d) {
  // Date locale (pas UTC) : toISOString() décalerait d'un jour selon le fuseau horaire
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function todayISOShared() {
  return isoDateStr(new Date());
}

// Journal des dates : à chaque séance complétée, on note la date du jour et quelle routine.
// Clé de stockage : session:datelog-<tabId>, contenu : { "2026-09-10": "A", "2026-09-11": "B" }
async function loadDateLog(tabId) {
  try {
    const res = await storageGetWithRetry(`session:datelog-${tabId}`);
    return res ? JSON.parse(res.value) : {};
  } catch (e) {
    return {};
  }
}
async function markDateLog(tabId, routineTag, currentLog) {
  const iso = todayISOShared();
  const next = { ...currentLog, [iso]: routineTag };
  try {
    await storageSetWithRetry(`session:datelog-${tabId}`, JSON.stringify(next));
  } catch (e) {
    // best effort
  }
  return next;
}

// Historique détaillé : une entrée par jour et par onglet, contenant le contenu réel de la séance
// (exercices, cibles du jour, sets/reps/poids saisis). Sert de base à une future sauvegarde/export.
// Clé : session:history-<tabId>-<date>
async function saveHistoryEntry(tabId, payload) {
  const iso = todayISOShared();
  try {
    await storageSetWithRetry(
      `session:history-${tabId}-${iso}`,
      JSON.stringify({ date: iso, tab: tabId, savedAt: new Date().toISOString(), ...payload })
    );
  } catch (e) {
    // best effort
  }
}

// Détecte si une séance contient au moins une saisie (set rempli ou case cochée),
// sans exiger que tout soit complet — les notes ne sont pas prises en compte.
function hasAnyInput(sessionData) {
  if (!sessionData || !sessionData.sets) return false;
  return Object.values(sessionData.sets).some((v) => {
    if (Array.isArray(v)) return v.some((x) => x === true || (x !== "" && x !== undefined && x !== false));
    if (v && typeof v === "object") {
      return Object.values(v).some((arr) => {
        if (Array.isArray(arr)) return arr.some((x) => x === true || (x !== "" && x !== undefined && x !== false));
        return arr === true || (arr !== "" && arr !== undefined && arr !== false);
      });
    }
    return v === true || (v !== "" && v !== undefined && v !== false);
  });
}

function monthGridDates(year, month) {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

// Calendrier récapitulatif en lecture seule. dateLog : { iso: tag }, colors : { tag: couleur }
function RecapCalendar({ title, dateLog, colors, legend }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const cells = monthGridDates(cursor.year, cursor.month);
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const changeMonth = (delta) => {
    let m = cursor.month + delta;
    let y = cursor.year;
    if (m < 0) { m = 11; y -= 1; } else if (m > 11) { m = 0; y += 1; }
    setCursor({ year: y, month: m });
  };

  return (
    <div style={{ marginTop: 28 }}>
      <div className="zen" style={{ fontSize: 13, fontWeight: 700, color: "#8B9490", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ background: "#1F2623", borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <button onClick={() => changeMonth(-1)} style={{ background: "transparent", border: "none", color: "#EDE9DF", padding: 4, cursor: "pointer" }} aria-label="Mois précédent">
            <ChevronLeft size={18} />
          </button>
          <div className="zen" style={{ fontWeight: 700, fontSize: 13.5, textTransform: "capitalize" }}>{monthLabel}</div>
          <button onClick={() => changeMonth(1)} style={{ background: "transparent", border: "none", color: "#EDE9DF", padding: 4, cursor: "pointer" }} aria-label="Mois suivant">
            <ChevronRight size={18} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 10, color: "#8B9490" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const iso = isoDateStr(d);
            const tag = dateLog[iso];
            const isToday = iso === todayISOShared();
            return (
              <div
                key={i}
                title={tag ? `${iso} — ${tag}` : iso}
                style={{
                  aspectRatio: "1",
                  borderRadius: 7,
                  border: isToday ? "1px solid #8FA3E8" : "1px solid #2A322D",
                  background: tag && colors[tag] ? colors[tag] : "#161B19",
                  color: tag ? "#0F1311" : "#6E7772",
                  fontSize: 11,
                  fontWeight: tag ? 700 : 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>
        {legend && legend.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: "#8B9490", flexWrap: "wrap" }}>
            {legend.map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: "inline-block" }} />
                {l.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function sessionKey(routineId, week, day) {
  return `session:${routineId}-w${week}-${day}`;
}

const SIDES = [
  { id: "droite", label: "Droite" },
  { id: "gauche", label: "Gauche" },
];
const BOTH = [{ id: "both", label: null }];

function sidesFor(ex) {
  return ex.bilateral ? BOTH : SIDES;
}

function emptyPiedSession(routine, week) {
  const state = {};
  const exerciseNotes = {};
  routine.exercises.forEach((ex) => {
    const t = targetFor(ex, week);
    const makeArr = () =>
      ex.type === "duration" ? Array(t.sets).fill(false) : Array(t.sets).fill("");
    const sideState = {};
    const noteState = {};
    sidesFor(ex).forEach(({ id: side }) => {
      sideState[side] = makeArr();
      noteState[side] = "";
    });
    state[ex.id] = sideState;
    exerciseNotes[ex.id] = noteState;
  });
  return { sets: state, exerciseNotes, notes: "" };
}

function isPiedSessionComplete(sessionData, routine, week) {
  if (!sessionData) return false;
  return routine.exercises.every((ex) => {
    const t = targetFor(ex, week);
    return sidesFor(ex).every(({ id: side }) => {
      const vals = sessionData.sets?.[ex.id]?.[side] || [];
      if (ex.type === "duration") {
        return vals.length >= t.sets && vals.slice(0, t.sets).every(Boolean);
      }
      return (
        vals.length >= t.sets &&
        vals.slice(0, t.sets).every((v) => v !== "" && v !== undefined)
      );
    });
  });
}

/* ============================== ÉTIREMENTS PIED — suivi par date, 5 étirements fixes 2×30s, objectif 6 séances/semaine ============================== */

function piedStretchSidesFor(ex) {
  return ex.bilateral ? BOTH : SIDES;
}

function piedEtirementsKey(date) {
  return `session:piedetirements-${date}`;
}

function emptyPiedEtirementsSession() {
  const sets = {};
  PIED_STRETCHES.forEach((ex) => {
    const sideState = {};
    piedStretchSidesFor(ex).forEach(({ id: side }) => {
      sideState[side] = Array(ex.sets).fill(false);
    });
    sets[ex.id] = sideState;
  });
  return { sets, notes: "" };
}

function isPiedEtirementsSessionComplete(sessionData) {
  if (!sessionData) return false;
  return PIED_STRETCHES.every((ex) =>
    piedStretchSidesFor(ex).every(({ id: side }) => {
      const vals = sessionData.sets?.[ex.id]?.[side] || [];
      return vals.length >= ex.sets && vals.slice(0, ex.sets).every(Boolean);
    })
  );
}

function PiedEtirementsTab() {
  const [date, setDate] = useState(todayISODate());
  const [session, setSession] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [dateLog, setDateLog] = useState({});

  const key = piedEtirementsKey(date);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const log = await loadDateLog("piedetirements");
      if (!cancelled) setDateLog(log);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      try {
        const res = await storageGetWithRetry(key);
        if (!cancelled) {
          setSession(res ? JSON.parse(res.value) : emptyPiedEtirementsSession());
          setLoaded(true);
        }
      } catch (e) {
        if (!cancelled) {
          setSession(emptyPiedEtirementsSession());
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const persist = useCallback(
    async (next) => {
      setSession(next);
      try {
        const result = await storageSetWithRetry(key, JSON.stringify(next));
        setSaveError(!result);
        if (result && hasAnyInput(next)) {
          const complete = isPiedEtirementsSessionComplete(next);
          const nextLog = { ...dateLog, [date]: complete ? "complet" : "partiel" };
          setDateLog(nextLog);
          try {
            await storageSetWithRetry("session:datelog-piedetirements", JSON.stringify(nextLog));
          } catch (e) {
            // best effort
          }
          saveHistoryEntry("piedetirements", {
            date,
            exercises: PIED_STRETCHES.map((ex) => ({
              id: ex.id,
              name: ex.name,
              target: `${ex.sets} × ${ex.target}s`,
              saisi: next.sets?.[ex.id] ?? null,
            })),
            notes: next.notes || "",
          });
        }
      } catch (e) {
        setSaveError(true);
      }
    },
    [key, date, dateLog]
  );

  const toggleSet = (exId, side, i) => {
    if (!session) return;
    const arr = [...(session.sets[exId]?.[side] || [])];
    arr[i] = !arr[i];
    persist({ ...session, sets: { ...session.sets, [exId]: { ...session.sets[exId], [side]: arr } } });
  };

  const setNotes = (value) => {
    if (!session) return;
    persist({ ...session, notes: value });
  };

  return (
    <div>
      {saveError && (
        <div
          style={{
            background: "rgba(198,85,59,0.14)",
            border: "1px solid #C6553B",
            color: "#E8A08F",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12.5,
            marginBottom: 12,
          }}
        >
          ⚠ Échec de la sauvegarde — vos dernières coches n'ont pas été enregistrées.
        </div>
      )}

      <div style={{ fontSize: 12, color: "#8B9490", marginBottom: 14 }}>
        5 étirements, 2 × 30 sec chacun — objectif 6 séances par semaine (pas nécessairement quotidien)
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1F2623",
          borderRadius: 10,
          padding: "10px 12px",
          marginBottom: 20,
          gap: 10,
        }}
      >
        <label style={{ fontSize: 13, color: "#B8BFB9" }}>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            background: "#161B19",
            border: "1px solid #2A322D",
            borderRadius: 8,
            color: "#EDE9DF",
            padding: "7px 10px",
            fontSize: 13,
          }}
        />
      </div>

      {loaded && session && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PIED_STRETCHES.map((ex) => (
            <div key={ex.id} style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #C9A66B" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                <div style={{ fontSize: 12, color: "#8B9490" }}>{ex.sets} × {ex.target} sec</div>
              </div>

              {piedStretchSidesFor(ex).map(({ id: side, label: sideLabel }) => {
                const vals = session.sets[ex.id]?.[side] || [];
                return (
                  <div key={side} style={{ marginBottom: 10 }}>
                    {sideLabel && (
                      <div style={{ fontSize: 11, color: "#8B9490", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                        {sideLabel}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Array.from({ length: ex.sets }).map((_, i) => {
                        const done = !!vals[i];
                        return (
                          <button
                            key={i}
                            className="set-check"
                            onClick={() => toggleSet(ex.id, side, i)}
                            style={{
                              flex: "1 1 0",
                              minWidth: 64,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              padding: "10px 8px",
                              borderRadius: 8,
                              border: "1px solid",
                              borderColor: done ? "#4C8C4A" : "#2A322D",
                              background: done ? "rgba(76,140,74,0.14)" : "#161B19",
                              color: done ? "#7FBF83" : "#B8BFB9",
                              cursor: "pointer",
                              fontSize: 13,
                            }}
                          >
                            {done ? <Check size={14} /> : <Circle size={14} />}
                            Set {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <div style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px" }}>
            <label style={{ fontSize: 13, color: "#B8BFB9", display: "block", marginBottom: 6 }}>Notes</label>
            <textarea
              value={session.notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ressenti, souplesse, ajustements..."
              rows={2}
              style={{ width: "100%", background: "#161B19", border: "1px solid #2A322D", borderRadius: 8, color: "#EDE9DF", padding: "10px", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}

      <RecapCalendar
        title="Récapitulatif — Étirements pied"
        dateLog={dateLog}
        colors={{ complet: "#4C8C4A", partiel: "#C9A66B" }}
        legend={[
          { color: "#4C8C4A", label: "Complet" },
          { color: "#C9A66B", label: "Partiel" },
        ]}
      />
    </div>
  );
}

function PiedTab() {
  const [section, setSection] = useState("renforcement");
  const [routineId, setRoutineId] = useState("A");
  const [week, setWeek] = useState(1);
  const [dayIdx, setDayIdx] = useState(0);
  const [session, setSession] = useState(null);
  const [overview, setOverview] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [dateLog, setDateLog] = useState({});

  const routine = ROUTINES[routineId];
  const phase = piedWeekBadge(week);
  const day = routine.days[dayIdx];
  const key = sessionKey(routineId, week, day);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const log = await loadDateLog("pied");
      if (!cancelled) setDateLog(log);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      try {
        const res = await storageGetWithRetry(key);
        if (!cancelled) {
          setSession(res ? JSON.parse(res.value) : emptyPiedSession(routine, week));
          setLoaded(true);
        }
      } catch (e) {
        if (!cancelled) {
          setSession(emptyPiedSession(routine, week));
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await storageGetWithRetry(`session:pied-${routineId}-overview`);
        if (!cancelled) setOverview(res ? JSON.parse(res.value) : {});
      } catch (e) {
        if (!cancelled) setOverview({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [routineId]);

  const persist = useCallback(
    async (next) => {
      setSession(next);
      try {
        const result = await storageSetWithRetry(key, JSON.stringify(next));
        if (result) {
          setSaveError(false);
          const complete = isPiedSessionComplete(next, routine, week);
          const nextOverview = { ...overview, [key]: complete };
          setOverview(nextOverview);
          try {
            await storageSetWithRetry(`session:pied-${routineId}-overview`, JSON.stringify(nextOverview));
          } catch (e) {
            // la vue d'ensemble peut échouer sans bloquer la sauvegarde de la séance elle-même
          }
          if (hasAnyInput(next)) {
            const nextLog = await markDateLog("pied", routineId, dateLog);
            setDateLog(nextLog);
            saveHistoryEntry("pied", {
              routine: routineId,
              routineLabel: routine.label,
              week,
              day,
              exercises: routine.exercises.map((ex) => {
                const t = targetFor(ex, week);
                return {
                  id: ex.id,
                  name: ex.name,
                  type: ex.type,
                  target: t,
                  saisi: next.sets?.[ex.id] ?? null,
                  note: next.exerciseNotes?.[ex.id] ?? null,
                };
              }),
              notes: next.notes || "",
            });
          }
        } else {
          setSaveError(true);
        }
      } catch (e) {
        setSaveError(true);
      }
    },
    [key, routine, week, routineId, overview, dateLog]
  );

  const toggleDuration = (exId, side, setIdx) => {
    if (!session) return;
    const arr = [...(session.sets[exId]?.[side] || [])];
    arr[setIdx] = !arr[setIdx];
    persist({ ...session, sets: { ...session.sets, [exId]: { ...session.sets[exId], [side]: arr } } });
  };

  const setReps = (exId, side, setIdx, value) => {
    if (!session) return;
    const arr = [...(session.sets[exId]?.[side] || [])];
    arr[setIdx] = value;
    persist({ ...session, sets: { ...session.sets, [exId]: { ...session.sets[exId], [side]: arr } } });
  };

  const setNotes = (value) => {
    if (!session) return;
    persist({ ...session, notes: value });
  };

  const setExerciseNote = (exId, side, value) => {
    if (!session) return;
    persist({
      ...session,
      exerciseNotes: { ...session.exerciseNotes, [exId]: { ...(session.exerciseNotes?.[exId] || {}), [side]: value } },
    });
  };

  const switchRoutine = (id) => {
    setRoutineId(id);
    setDayIdx(0);
  };

  const changeWeek = (delta) => {
    const w = Math.min(PIED_TOTAL_WEEKS, Math.max(1, week + delta));
    setWeek(w);
  };

  const isDecharge = phase.deload;

  return (
    <div>
      {saveError && (
        <div
          style={{
            background: "rgba(198,85,59,0.14)",
            border: "1px solid #C6553B",
            color: "#E8A08F",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12.5,
            marginBottom: 12,
          }}
        >
          ⚠ Échec de la sauvegarde — vos dernières coches n'ont pas été enregistrées.
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[
          { id: "renforcement", label: "Renforcement" },
          { id: "etirements", label: "Étirements" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              flex: 1,
              background: section === s.id ? "#C9A66B" : "#1F2623",
              color: section === s.id ? "#161B19" : "#B8BFB9",
              border: "none",
              borderRadius: 10,
              padding: "10px 14px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "etirements" ? (
        <PiedEtirementsTab />
      ) : (
        <>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {Object.entries(ROUTINES).map(([id, r]) => (
          <button
            key={id}
            className="routine-tab"
            onClick={() => switchRoutine(id)}
            style={{
              flex: 1,
              background: routineId === id ? "#3B5BDB" : "#1F2623",
              color: routineId === id ? "#F5F6FA" : "#B8BFB9",
              border: "none",
              borderRadius: 10,
              padding: "12px 14px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>{r.label}</div>
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1F2623",
          borderRadius: 10,
          padding: "10px 12px",
          marginBottom: 14,
        }}
      >
        <button
          onClick={() => changeWeek(-1)}
          disabled={week === 1}
          style={{ background: "transparent", border: "none", color: week === 1 ? "#4A524D" : "#EDE9DF", cursor: week === 1 ? "default" : "pointer", padding: 6 }}
          aria-label="Semaine précédente"
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div className="zen" style={{ fontWeight: 700, fontSize: 16 }}>
            Semaine {week}<span style={{ opacity: 0.5 }}> / {PIED_TOTAL_WEEKS}</span>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              marginTop: 2,
              padding: "2px 8px",
              borderRadius: 999,
              background: isDecharge ? "#2A3B2E" : "#26304A",
              color: isDecharge ? "#7FBF83" : "#8FA3E8",
            }}
          >
            {isDecharge ? <Snowflake size={12} /> : <Flame size={12} />}
            {phase.label} — {phase.sub}
          </div>
        </div>
        <button
          onClick={() => changeWeek(1)}
          disabled={week === PIED_TOTAL_WEEKS}
          style={{ background: "transparent", border: "none", color: week === PIED_TOTAL_WEEKS ? "#4A524D" : "#EDE9DF", cursor: week === PIED_TOTAL_WEEKS ? "default" : "pointer", padding: 6 }}
          aria-label="Semaine suivante"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div style={{ fontSize: 12, color: "#8B9490", marginBottom: 10 }}>
        3 séances par routine et par semaine — à répartir comme vous voulez
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {routine.days.map((d, i) => {
          const k = sessionKey(routineId, week, d);
          const done = overview[k];
          return (
            <button
              key={d}
              className="day-tab"
              onClick={() => setDayIdx(i)}
              style={{
                flex: 1,
                padding: "9px 6px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: dayIdx === i ? "#3B5BDB" : "#2A322D",
                background: dayIdx === i ? "rgba(59,91,219,0.12)" : "transparent",
                color: dayIdx === i ? "#EDE9DF" : "#8B9490",
                cursor: "pointer",
                fontSize: 13,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              {d}
              {done ? <Check size={12} color="#4C8C4A" /> : <Circle size={8} color="#4A524D" fill="#4A524D" />}
            </button>
          );
        })}
      </div>

      {loaded && session && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {routine.exercises.map((ex) => {
            const t = targetFor(ex, week);
            return (
              <div
                key={ex.id}
                style={{
                  background: "#1F2623",
                  borderRadius: 10,
                  padding: "14px 16px",
                  borderLeft: ex.isStretch ? "3px solid #C9A66B" : "3px solid #3B5BDB",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                  <div style={{ fontSize: 12, color: "#8B9490" }}>
                    {t.sets} × {t.displayTarget || `${t.target} ${ex.unit}`}
                  </div>
                </div>

                {sidesFor(ex).map(({ id: side, label: sideLabel }) => {
                  const vals = session.sets[ex.id]?.[side] || [];
                  return (
                    <div key={side} style={{ marginBottom: 10 }}>
                      {sideLabel && (
                        <div style={{ fontSize: 11, color: "#8B9490", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                          {sideLabel}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {Array.from({ length: t.sets }).map((_, i) => {
                          if (ex.type === "duration") {
                            const done = !!vals[i];
                            return (
                              <button
                                key={i}
                                className="set-check"
                                onClick={() => toggleDuration(ex.id, side, i)}
                                style={{
                                  flex: "1 1 0",
                                  minWidth: 64,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 6,
                                  padding: "10px 8px",
                                  borderRadius: 8,
                                  border: "1px solid",
                                  borderColor: done ? "#4C8C4A" : "#2A322D",
                                  background: done ? "rgba(76,140,74,0.14)" : "#161B19",
                                  color: done ? "#7FBF83" : "#B8BFB9",
                                  cursor: "pointer",
                                  fontSize: 13,
                                }}
                              >
                                {done ? <Check size={14} /> : <Circle size={14} />}
                                Set {i + 1}
                              </button>
                            );
                          }
                          return (
                            <div key={i} style={{ flex: "1 1 0", minWidth: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                              <label style={{ fontSize: 11, color: "#8B9490" }}>Set {i + 1}</label>
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                placeholder={String(t.target)}
                                value={vals[i] ?? ""}
                                onChange={(e) => setReps(ex.id, side, i, e.target.value)}
                                style={{
                                  width: "100%",
                                  textAlign: "center",
                                  background: "#161B19",
                                  border: "1px solid #2A322D",
                                  borderRadius: 8,
                                  color: "#EDE9DF",
                                  padding: "9px 4px",
                                  fontSize: 14,
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        value={session.exerciseNotes?.[ex.id]?.[side] ?? ""}
                        onChange={(e) => setExerciseNote(ex.id, side, e.target.value)}
                        placeholder={sideLabel ? `Note ${sideLabel.toLowerCase()} (optionnel)` : "Note (optionnel)"}
                        style={{
                          width: "100%",
                          marginTop: 7,
                          background: "#161B19",
                          border: "1px solid #2A322D",
                          borderRadius: 8,
                          color: "#EDE9DF",
                          padding: "7px 10px",
                          fontSize: 12,
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}

          <div style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px" }}>
            <label style={{ fontSize: 13, color: "#B8BFB9", display: "block", marginBottom: 6 }}>Notes</label>
            <textarea
              value={session.notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ressenti, technique, ajustements..."
              rows={2}
              style={{ width: "100%", background: "#161B19", border: "1px solid #2A322D", borderRadius: 8, color: "#EDE9DF", padding: "10px", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}

      <RecapCalendar
        title="Récapitulatif — Pied"
        dateLog={dateLog}
        colors={{ A: "#4C8C4A", B: "#C9A66B" }}
        legend={[
          { color: "#4C8C4A", label: "Routine A" },
          { color: "#C9A66B", label: "Routine B" },
        ]}
      />
        </>
      )}
    </div>
  );
}

/* ============================== MUSCULATION (Jour A / Jour B, même calendrier 25 semaines que Pied) ============================== */

const KETTLEBELLS = [16, 20, 24, 32];

// niveau (0-7) et statut décharge par semaine — chaque cycle = 4 semaines actives (2 base + 2 surcharge) + 1 semaine de décharge en clôture
const MUSCU_WEEKS = [
  { week: 1, cycle: 1, level: 0, deload: false },
  { week: 2, cycle: 1, level: 0, deload: false },
  { week: 3, cycle: 1, level: 1, deload: false },
  { week: 4, cycle: 1, level: 1, deload: false },
  { week: 5, cycle: 1, level: 1, deload: true },
  { week: 6, cycle: 2, level: 2, deload: false },
  { week: 7, cycle: 2, level: 2, deload: false },
  { week: 8, cycle: 2, level: 3, deload: false },
  { week: 9, cycle: 2, level: 3, deload: false },
  { week: 10, cycle: 2, level: 3, deload: true },
  { week: 11, cycle: 3, level: 4, deload: false },
  { week: 12, cycle: 3, level: 4, deload: false },
  { week: 13, cycle: 3, level: 5, deload: false },
  { week: 14, cycle: 3, level: 5, deload: false },
  { week: 15, cycle: 3, level: 5, deload: true },
  { week: 16, cycle: 4, level: 6, deload: false },
  { week: 17, cycle: 4, level: 6, deload: false },
  { week: 18, cycle: 4, level: 7, deload: false },
  { week: 19, cycle: 4, level: 7, deload: false },
  { week: 20, cycle: 4, level: 7, deload: true },
];

function muscuWeekInfo(week) {
  return MUSCU_WEEKS.find((w) => w.week === week);
}

// Période de mise en place : 4 semaines avant le programme, volume divisé par deux (nombre de sets),
// avec une légère progression après 2 semaines (semaines 3-4 un peu au-dessus des semaines 1-2)
// + 1 semaine de décharge juste après la mise en place, avant le cycle 1
const INTRO_WEEKS = 4;
const POST_INTRO_DELOAD = 1;
const MUSCU_TOTAL_WEEKS = INTRO_WEEKS + POST_INTRO_DELOAD + 20; // 25
function isIntroWeek(week) {
  return week <= INTRO_WEEKS;
}
function isIntroWeekPhase2(week) {
  return week > 2 && week <= INTRO_WEEKS;
}
function isPostIntroDeload(week) {
  return week === INTRO_WEEKS + POST_INTRO_DELOAD;
}
function programWeek(week) {
  return week - INTRO_WEEKS - POST_INTRO_DELOAD;
}

// La semaine de décharge devient une semaine de "test" : pas de cible fixe, l'utilisateur note
// ses résultats du jour pour ajuster lui-même la progression du cycle suivant.
function isMuscuTestWeek(week) {
  if (isIntroWeek(week) || isPostIntroDeload(week)) return false;
  return muscuWeekInfo(programWeek(week)).deload;
}

// Push-up : identique à la progression déjà en place (variantes Decline / Weighted decline à partir du cycle 3)
const PUSH_UP_LEVELS = [
  { name: "Push up", reps: 10 },
  { name: "Push up", reps: 12 },
  { name: "Push up", reps: 14 },
  { name: "Push up", reps: 16 },
  { name: "Decline push up", reps: 10 },
  { name: "Decline push up", reps: 12 },
  { name: "Weighted decline push up", reps: 10 },
  { name: "Weighted decline push up", reps: 12 },
];
function pushUpTarget(week) {
  if (isIntroWeek(week)) return { sets: 1, reps: isIntroWeekPhase2(week) ? 12 : 10, name: "Push up" };
  if (isPostIntroDeload(week)) return { sets: 1, reps: 10, name: "Push up" };
  const info = muscuWeekInfo(programWeek(week));
  const entry = PUSH_UP_LEVELS[info.level];
  const ov = overrideFor("pushup", info.level);
  return { sets: 2, reps: ov ? ov.reps : entry.reps, name: entry.name };
}

// Rings row : identique à la progression déjà en place (variante 8, PM à partir du cycle 3)
const RINGS_ROW_LEVELS = [
  { name: "Rings row (8)", reps: 10 },
  { name: "Rings row (8)", reps: 12 },
  { name: "Rings row (8)", reps: 14 },
  { name: "Rings row (8)", reps: 16 },
  { name: "Rings row (8, PM)", reps: 10 },
  { name: "Rings row (8, PM)", reps: 12 },
  { name: "Rings row (8, PM)", reps: 14 },
  { name: "Rings row (8, PM)", reps: 16 },
];
function ringsRowTarget(week) {
  if (isIntroWeek(week)) return { sets: 1, reps: isIntroWeekPhase2(week) ? 12 : 10, name: "Rings row (8)" };
  if (isPostIntroDeload(week)) return { sets: 1, reps: 10, name: "Rings row (8)" };
  const info = muscuWeekInfo(programWeek(week));
  const entry = RINGS_ROW_LEVELS[info.level];
  const ov = overrideFor("ringsrow", info.level);
  return { sets: 2, reps: ov ? ov.reps : entry.reps, name: entry.name };
}

// Goblet squat : barème par défaut = alternance set1/set2 (plafond 32kg). Un override de test
// donne UN nouveau poids d'ancrage, et l'alternance set1/set2 repart de ce poids (même logique
// qu'au départ : les deux sets au nouveau poids, puis un set avance au palier supérieur, etc.)
const KETTLEBELLS_AVAILABLE = [16, 20, 24, 32];
const SQUAT_WEIGHTS_BY_LEVEL = [
  [16, 16], [16, 20], [20, 20], [20, 24], [24, 24], [24, 32], [32, 32], [32, 32],
];

function nearestKettlebellIndex(weight) {
  let idx = KETTLEBELLS_AVAILABLE.indexOf(weight);
  if (idx !== -1) return idx;
  idx = KETTLEBELLS_AVAILABLE.findIndex((w) => w >= weight);
  return idx === -1 ? KETTLEBELLS_AVAILABLE.length - 1 : idx;
}

// Construit l'alternance set1/set2 pour tous les niveaux à partir de fromLevel, en repartant du poids donné
function buildSquatRestartSchedule(startWeight, fromLevel) {
  const schedule = {};
  let idx = nearestKettlebellIndex(startWeight);
  let base = KETTLEBELLS_AVAILABLE[idx];
  let level = fromLevel;
  while (level <= 7) {
    schedule[level] = [base, base];
    level++;
    if (level > 7) break;
    const nextIdx = Math.min(idx + 1, KETTLEBELLS_AVAILABLE.length - 1);
    const nextTier = KETTLEBELLS_AVAILABLE[nextIdx];
    schedule[level] = [base, nextTier];
    level++;
    idx = nextIdx;
    base = nextTier;
  }
  return schedule;
}

function squatTarget(week) {
  if (isIntroWeek(week)) return isIntroWeekPhase2(week) ? { sets: 1, reps: 22, weights: [16] } : { sets: 1, reps: 20, weights: [16] };
  if (isPostIntroDeload(week)) return { sets: 1, reps: 20, weights: [16] };
  const info = muscuWeekInfo(programWeek(week));
  return { sets: 2, reps: 20, weights: SQUAT_WEIGHTS_BY_LEVEL[info.level] };
}

// --- Mécanisme des semaines de test ---
// Pendant une semaine de test, la cible affichée est identique au niveau précédent (rien de spécial).
// L'utilisateur note en plus : sa répétition max du jour (simple mémo), les reps/poids qu'il choisit
// pour le niveau suivant, et optionnellement un nouveau nom d'exercice (changement de mouvement).
// Le niveau "surcharge" qui suit reprend automatiquement +2 reps par rapport au niveau "base" choisi.
let MUSCU_OVERRIDES = {};
let MUSCU_NAME_OVERRIDES = {};

function overrideFor(exId, level) {
  const o = MUSCU_OVERRIDES[`${exId}-${level}`];
  return o && ((o.reps !== undefined && o.reps !== "") || o.weights || o.seconds !== undefined) ? o : null;
}

// Cherche le nom personnalisé le plus récent au niveau donné ou avant (persiste jusqu'au prochain changement)
function nameOverrideFor(exId, level) {
  for (let l = level; l >= 0; l--) {
    const n = MUSCU_NAME_OVERRIDES[`${exId}-${l}`];
    if (n) return n;
  }
  return null;
}

function muscuLevelForWeek(week) {
  if (isIntroWeek(week) || isPostIntroDeload(week)) return null;
  return muscuWeekInfo(programWeek(week)).level;
}

// KT single leg deadlift (nouveau) : barème par défaut 5kg puis 10kg, reps 6->14 (+2/niveau).
// Un choix fait en semaine de test remplace ce barème à partir du niveau suivant.
const SLDL_DEFAULT = [
  { weight: 5, reps: 6 }, { weight: 5, reps: 8 }, { weight: 5, reps: 10 }, { weight: 5, reps: 12 },
  { weight: 5, reps: 14 }, { weight: 10, reps: 6 }, { weight: 10, reps: 8 }, { weight: 10, reps: 10 },
];
function singleLegDeadliftTarget(week) {
  if (isIntroWeek(week)) return { sets: 1, weight: 5, reps: 6 };
  if (isPostIntroDeload(week)) return { sets: 1, weight: 5, reps: 6 };
  const info = muscuWeekInfo(programWeek(week));
  const ov = overrideFor("sldl", info.level);
  const d = SLDL_DEFAULT[info.level];
  return { sets: 2, weight: ov ? ov.weight : d.weight, reps: ov ? ov.reps : d.reps };
}

// KT press (nouveau) : barème par défaut 20kg puis 24kg, reps 6->14 (+2/niveau).
const KTPRESS_DEFAULT = [
  { weight: 16, reps: 6 }, { weight: 16, reps: 8 }, { weight: 16, reps: 10 }, { weight: 16, reps: 12 },
  { weight: 16, reps: 14 }, { weight: 20, reps: 6 }, { weight: 20, reps: 8 }, { weight: 20, reps: 10 },
];
function ktPressTarget(week) {
  if (isIntroWeek(week)) return { sets: 1, weight: 16, reps: 6 };
  if (isPostIntroDeload(week)) return { sets: 1, weight: 16, reps: 6 };
  const info = muscuWeekInfo(programWeek(week));
  const ov = overrideFor("ktpress", info.level);
  const d = KTPRESS_DEFAULT[info.level];
  return { sets: 2, weight: ov ? ov.weight : d.weight, reps: ov ? ov.reps : d.reps };
}

// Pull up assisté (nouveau) : barème par défaut bande 1 -> 2 -> 3, reps 6->10 puis reset à 4.
const PULLUP_DEFAULT = [
  { band: 1, reps: 6 }, { band: 1, reps: 8 }, { band: 1, reps: 10 },
  { band: 2, reps: 4 }, { band: 2, reps: 6 }, { band: 2, reps: 8 }, { band: 2, reps: 10 },
  { band: 3, reps: 4 },
];
function pullUpTarget(week) {
  if (isIntroWeek(week)) return { sets: 1, band: 1, reps: 6 };
  if (isPostIntroDeload(week)) return { sets: 1, band: 1, reps: 6 };
  const info = muscuWeekInfo(programWeek(week));
  const ov = overrideFor("pullup", info.level);
  const d = PULLUP_DEFAULT[info.level];
  return { sets: 2, band: ov ? ov.weight : d.band, reps: ov ? ov.reps : d.reps };
}

// Pistol squat (remplace walking lunges) : progression box-assistée — hauteur d'assise décroissante
// (chaise -> support bas -> support très bas -> amplitude complète) plutôt qu'une charge ajoutée, pour
// construire équilibre, contrôle excentrique et mobilité de cheville en même temps que la force.
// Hauteurs indicatives (repères pratiques à la maison), à ajuster librement selon le mobilier disponible.
const PISTOLSQUAT_LEVELS = [
  { name: "Pistol squat — assis chaise (~45cm)", reps: 5 },
  { name: "Pistol squat — assis chaise (~45cm)", reps: 8 },
  { name: "Pistol squat — support bas (~35cm)", reps: 5 },
  { name: "Pistol squat — support bas (~35cm)", reps: 8 },
  { name: "Pistol squat — support très bas (~25cm)", reps: 5 },
  { name: "Pistol squat — support très bas (~25cm)", reps: 8 },
  { name: "Pistol squat — amplitude quasi complète (~15cm)", reps: 6 },
  { name: "Pistol squat complet", reps: 5 },
];
function pistolSquatTarget(week) {
  if (isIntroWeek(week)) return { sets: 1, reps: isIntroWeekPhase2(week) ? 8 : 5, name: "Pistol squat — assis chaise (~45cm)" };
  if (isPostIntroDeload(week)) return { sets: 1, reps: 5, name: "Pistol squat — assis chaise (~45cm)" };
  const info = muscuWeekInfo(programWeek(week));
  const entry = PISTOLSQUAT_LEVELS[info.level];
  const ov = overrideFor("pistolsquat", info.level);
  return { sets: 2, reps: ov ? ov.reps : entry.reps, name: entry.name };
}

// Swing : identique à la progression déjà en place
const DELOAD_WEEKS = [5, 10, 15, 20];
function swingStepForWeek(programW) {
  const deloadWeeksBefore = DELOAD_WEEKS.filter((d) => d < programW).length;
  return programW - 1 - deloadWeeksBefore;
}
function swingWeightsForStep(step) {
  const s = Math.max(0, Math.min(step, 12));
  if (s <= 6) return Array(6 - s).fill(20).concat(Array(s).fill(24));
  const upgraded = s - 6;
  return Array(12 - s).fill(24).concat(Array(upgraded).fill(32));
}
function swingTarget(week) {
  if (isIntroWeek(week)) return isIntroWeekPhase2(week) ? { sets: 4, reps: 10, weights: Array(4).fill(20) } : { sets: 3, reps: 10, weights: Array(3).fill(20) };
  if (isPostIntroDeload(week)) return { sets: 6, reps: 10, weights: Array(6).fill(20) };
  const pw = programWeek(week);
  const step = swingStepForWeek(pw);
  return { sets: 6, reps: 10, weights: swingWeightsForStep(step) };
}

// Horse stance (Musculation, Jour A) : démarre à 30 sec, barème par défaut +5s/niveau.
// Semaine de test : un seul champ durée, la surcharge reprend automatiquement +5 sec.
const HORSESTANCE_MUSCU_DEFAULT = [30, 35, 40, 45, 50, 55, 60, 65];
function horseStanceMuscuTarget(week) {
  if (isIntroWeek(week)) return { sets: 1, seconds: 30 };
  if (isPostIntroDeload(week)) return { sets: 1, seconds: 30 };
  const info = muscuWeekInfo(programWeek(week));
  const ov = overrideFor("horsestancemuscu", info.level);
  return { sets: 1, seconds: ov ? ov.seconds : HORSESTANCE_MUSCU_DEFAULT[info.level] };
}

// Tuck hang L-sit (Musculation, Jour B) : démarre à 10 sec, barème par défaut +2s/niveau.
const TUCKHANG_DEFAULT = [10, 12, 14, 16, 18, 20, 22, 24];
function tuckHangTarget(week) {
  if (isIntroWeek(week)) return { sets: 1, seconds: 10 };
  if (isPostIntroDeload(week)) return { sets: 1, seconds: 10 };
  const info = muscuWeekInfo(programWeek(week));
  const ov = overrideFor("tuckhang", info.level);
  return { sets: 1, seconds: ov ? ov.seconds : TUCKHANG_DEFAULT[info.level] };
}

const JOUR_A_EXERCISES = [
  {
    id: "ktpress",
    name: "KT press",
    kind: "weighted-single",
    getTarget: ktPressTarget,
    getName: (week) => {
      const lvl = muscuLevelForWeek(week);
      return (lvl !== null && nameOverrideFor("ktpress", lvl)) || "KT press";
    },
  },
  {
    id: "sldl",
    name: "KT single leg deadlift",
    kind: "weighted-single",
    getTarget: singleLegDeadliftTarget,
    getName: (week) => {
      const lvl = muscuLevelForWeek(week);
      return (lvl !== null && nameOverrideFor("sldl", lvl)) || "KT single leg deadlift";
    },
  },
  {
    id: "ringsrow",
    name: "Rings row (8)",
    kind: "repsonly",
    getTarget: ringsRowTarget,
    getName: (week) => {
      const lvl = muscuLevelForWeek(week);
      return (lvl !== null && nameOverrideFor("ringsrow", lvl)) || ringsRowTarget(week).name;
    },
  },
  {
    id: "pistolsquat",
    name: "Pistol squat",
    kind: "repsonly",
    getTarget: pistolSquatTarget,
    getName: (week) => {
      const lvl = muscuLevelForWeek(week);
      return (lvl !== null && nameOverrideFor("pistolsquat", lvl)) || pistolSquatTarget(week).name;
    },
  },
  {
    id: "horsestancemuscu",
    name: "Horse stance",
    kind: "duration-single",
    getTarget: horseStanceMuscuTarget,
    getName: (week) => {
      const lvl = muscuLevelForWeek(week);
      return (lvl !== null && nameOverrideFor("horsestancemuscu", lvl)) || "Horse stance";
    },
  },
];

const JOUR_B_EXERCISES = [
  {
    id: "pushup",
    name: "Push up",
    kind: "repsonly",
    getTarget: pushUpTarget,
    getName: (week) => {
      const lvl = muscuLevelForWeek(week);
      return (lvl !== null && nameOverrideFor("pushup", lvl)) || pushUpTarget(week).name;
    },
  },
  {
    id: "gobletsquat",
    name: "KT goblet squat",
    kind: "weighted",
    getTarget: squatTarget,
    getName: (week) => {
      const lvl = muscuLevelForWeek(week);
      return (lvl !== null && nameOverrideFor("gobletsquat", lvl)) || "KT goblet squat";
    },
  },
  {
    id: "pullup",
    name: "Pull up (assisté)",
    kind: "band",
    getTarget: pullUpTarget,
    getName: (week) => {
      const lvl = muscuLevelForWeek(week);
      return (lvl !== null && nameOverrideFor("pullup", lvl)) || "Pull up (assisté)";
    },
  },
  {
    id: "tuckhang",
    name: "Tuck hang L-sit",
    kind: "duration-single",
    getTarget: tuckHangTarget,
    getName: (week) => {
      const lvl = muscuLevelForWeek(week);
      return (lvl !== null && nameOverrideFor("tuckhang", lvl)) || "Tuck hang L-sit";
    },
  },
  { id: "swing", name: "KT swing", kind: "weighted", getTarget: swingTarget, isEmomFinisher: true },
];

const MUSCU_ROUTINES = {
  A: { label: "Routine A", exercises: JOUR_A_EXERCISES },
  B: { label: "Routine B", exercises: JOUR_B_EXERCISES },
};
const MUSCU_SEANCES = ["Séance 1", "Séance 2", "Séance 3"];

function exercisesForRoutine(routineId) {
  return MUSCU_ROUTINES[routineId].exercises;
}

function muscuSessionKey(routineId, week, seance) {
  return `session:muscu-${routineId}-w${week}-${seance}`;
}

function emptyMuscuSession(week, routineId) {
  const sets = {};
  const exerciseNotes = {};
  const testResults = {};
  exercisesForRoutine(routineId).forEach((ex) => {
    const t = ex.getTarget(week);
    sets[ex.id] = Array(t.sets).fill("");
    exerciseNotes[ex.id] = "";
    testResults[ex.id] = { max: "", nextReps: "", nextWeight: "", nextName: "" };
  });
  return { sets, exerciseNotes, testResults, notes: "" };
}

function isMuscuSessionComplete(sessionData, week, routineId) {
  if (!sessionData) return false;
  return exercisesForRoutine(routineId).every((ex) => {
    if (isMuscuTestWeek(week) && ex.id !== "gobletsquat" && ex.id !== "swing") {
      const t = sessionData.testResults?.[ex.id];
      if (ex.kind === "duration-single") return t && t.max !== "" && t.nextWeight !== "";
      return t && t.max !== "" && t.nextReps !== "" && t.nextWeight !== "";
    }
    const t = ex.getTarget(week);
    const vals = sessionData.sets?.[ex.id] || [];
    return vals.length >= t.sets && vals.slice(0, t.sets).every((v) => v !== "" && v !== undefined);
  });
}

function targetLabelMuscu(ex, t) {
  if (ex.kind === "weighted-single") return `${t.reps} reps @ ${t.weight > 0 ? t.weight + "kg" : "poids du corps"}`;
  if (ex.kind === "band") return `${t.reps} reps (bande ${t.band})`;
  if (ex.kind === "duration-single") return `${t.seconds} sec`;
  if (ex.kind === "weighted" && t.weights) return `${t.reps} reps — poids par set ci-dessous`;
  return `${t.reps} reps`;
}

function MuscuTab() {
  const [routineId, setRoutineId] = useState("A");
  const [week, setWeek] = useState(1);
  const [seanceIdx, setSeanceIdx] = useState(0);
  const [session, setSession] = useState(null);
  const [overview, setOverview] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [overridesVersion, setOverridesVersion] = useState(0);
  const [dateLog, setDateLog] = useState({});
  const [circuitView, setCircuitView] = useState(true);

  const routine = MUSCU_ROUTINES[routineId];
  const seance = MUSCU_SEANCES[seanceIdx];
  const exercises = exercisesForRoutine(routineId);
  const circuitExercises = exercises.filter((ex) => !ex.isEmomFinisher);
  const finisherExercises = exercises.filter((ex) => ex.isEmomFinisher);
  const testWeek = isMuscuTestWeek(week);
  const key = muscuSessionKey(routineId, week, seance);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const log = await loadDateLog("muscu");
      if (!cancelled) setDateLog(log);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const info = isIntroWeek(week)
    ? null
    : isPostIntroDeload(week)
    ? { cycle: 0, level: 0, deload: true, postIntro: true }
    : muscuWeekInfo(programWeek(week));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await storageGetWithRetry("session:muscu-overrides");
        if (!cancelled && res) {
          MUSCU_OVERRIDES = JSON.parse(res.value);
          setOverridesVersion((v) => v + 1);
        }
      } catch (e) {
        // pas d'overrides enregistrés, on garde le barème par défaut
      }
      try {
        const resNames = await storageGetWithRetry("session:muscu-name-overrides");
        if (!cancelled && resNames) {
          MUSCU_NAME_OVERRIDES = JSON.parse(resNames.value);
          setOverridesVersion((v) => v + 1);
        }
      } catch (e) {
        // pas de noms personnalisés enregistrés
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      try {
        const res = await storageGetWithRetry(key);
        if (!cancelled) {
          setSession(res ? JSON.parse(res.value) : emptyMuscuSession(week, routineId));
          setLoaded(true);
        }
      } catch (e) {
        if (!cancelled) {
          setSession(emptyMuscuSession(week, routineId));
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await storageGetWithRetry("session:muscu-overview");
        if (!cancelled) setOverview(res ? JSON.parse(res.value) : {});
      } catch (e) {
        if (!cancelled) setOverview({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    async (next) => {
      setSession(next);
      try {
        const result = await storageSetWithRetry(key, JSON.stringify(next));
        if (result) {
          setSaveError(false);
          const nextOverview = { ...overview, [key]: isMuscuSessionComplete(next, week, routineId) };
          setOverview(nextOverview);
          try {
            await storageSetWithRetry("session:muscu-overview", JSON.stringify(nextOverview));
          } catch (e) {
            // la vue d'ensemble peut échouer sans bloquer la sauvegarde de la séance elle-même
          }
          if (hasAnyInput(next)) {
            const nextLog = await markDateLog("muscu", routineId, dateLog);
            setDateLog(nextLog);
            saveHistoryEntry("muscu", {
              routine: routineId,
              routineLabel: routine.label,
              week,
              seance,
              testWeek: isMuscuTestWeek(week),
              exercises: exercises.map((ex) => {
                const t = ex.getTarget(week);
                return {
                  id: ex.id,
                  name: ex.getName ? ex.getName(week) : ex.name,
                  kind: ex.kind,
                  target: t,
                  saisi: next.sets?.[ex.id] ?? null,
                  test: next.testResults?.[ex.id] ?? null,
                  note: next.exerciseNotes?.[ex.id] ?? null,
                };
              }),
              notes: next.notes || "",
            });
          }
        } else {
          setSaveError(true);
        }
      } catch (e) {
        setSaveError(true);
      }
    },
    [key, week, seance, overview, dateLog, exercises]
  );

  const setRep = (exId, setIdx, value) => {
    if (!session) return;
    const arr = [...(session.sets[exId] || [])];
    arr[setIdx] = value;
    persist({ ...session, sets: { ...session.sets, [exId]: arr } });
  };

  const setTestField = (exId, field, value) => {
    if (!session) return;
    const current = session.testResults?.[exId] || { max: "", nextReps: "", nextWeight: "", nextName: "" };
    const nextTestResults = { ...session.testResults, [exId]: { ...current, [field]: value } };
    persist({ ...session, testResults: nextTestResults });

    const entry = nextTestResults[exId];
    if (!info || info.postIntro) return;
    const baseLevel = info.level + 1;

    // Nom personnalisé : s'applique à partir du niveau suivant, persiste jusqu'au prochain changement
    if (entry.nextName && entry.nextName.trim() !== "") {
      const updatedNames = { ...MUSCU_NAME_OVERRIDES, [`${exId}-${baseLevel}`]: entry.nextName.trim() };
      MUSCU_NAME_OVERRIDES = updatedNames;
      setOverridesVersion((v) => v + 1);
      storageSetWithRetry("session:muscu-name-overrides", JSON.stringify(updatedNames)).catch(() => {});
    }

    // Goblet squat : un seul poids renseigné relance l'alternance set1/set2 depuis ce nouveau poids
    if (exId === "gobletsquat") {
      if (entry.nextWeight !== "") {
        const weight = parseFloat(entry.nextWeight);
        if (!isNaN(weight)) {
          const schedule = buildSquatRestartSchedule(weight, baseLevel);
          const updated = { ...MUSCU_OVERRIDES };
          Object.keys(schedule).forEach((lvl) => {
            updated[`${exId}-${lvl}`] = { weights: schedule[lvl] };
          });
          MUSCU_OVERRIDES = updated;
          setOverridesVersion((v) => v + 1);
          storageSetWithRetry("session:muscu-overrides", JSON.stringify(updated)).catch(() => {});
        }
      }
      return;
    }

    // Horse stance / Tuck hang L-sit : un seul champ durée, surcharge = +5s (horse stance) ou +2s (tuck hang)
    if (exId === "horsestancemuscu" || exId === "tuckhang") {
      if (entry.nextWeight !== "") {
        const seconds = parseFloat(entry.nextWeight);
        if (!isNaN(seconds)) {
          const increment = exId === "horsestancemuscu" ? 5 : 2;
          const surchargeLevel = info.level + 2;
          const updated = { ...MUSCU_OVERRIDES };
          if (baseLevel <= 7) updated[`${exId}-${baseLevel}`] = { seconds };
          if (surchargeLevel <= 7) updated[`${exId}-${surchargeLevel}`] = { seconds: seconds + increment };
          MUSCU_OVERRIDES = updated;
          setOverridesVersion((v) => v + 1);
          storageSetWithRetry("session:muscu-overrides", JSON.stringify(updated)).catch(() => {});
        }
      }
      return;
    }

    // Autres exercices : reps + poids/bande du niveau suivant, surcharge = +2 reps automatiquement
    const surchargeLevel = info.level + 2;
    if (entry.nextReps !== "" && entry.nextWeight !== "") {
      const reps = parseInt(entry.nextReps, 10);
      const weight = parseFloat(entry.nextWeight);
      if (!isNaN(reps) && !isNaN(weight)) {
        const updated = { ...MUSCU_OVERRIDES };
        if (baseLevel <= 7) updated[`${exId}-${baseLevel}`] = { reps, weight };
        if (surchargeLevel <= 7) updated[`${exId}-${surchargeLevel}`] = { reps: reps + 2, weight };
        MUSCU_OVERRIDES = updated;
        setOverridesVersion((v) => v + 1);
        storageSetWithRetry("session:muscu-overrides", JSON.stringify(updated)).catch(() => {});
      }
    }
  };

  const setExerciseNote = (exId, value) => {
    if (!session) return;
    persist({ ...session, exerciseNotes: { ...session.exerciseNotes, [exId]: value } });
  };

  const setNotes = (value) => {
    if (!session) return;
    persist({ ...session, notes: value });
  };

  const changeWeek = (delta) => {
    setWeek(Math.min(MUSCU_TOTAL_WEEKS, Math.max(1, week + delta)));
  };

  return (
    <div>
      {saveError && (
        <div
          style={{
            background: "rgba(198,85,59,0.14)",
            border: "1px solid #C6553B",
            color: "#E8A08F",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12.5,
            marginBottom: 12,
          }}
        >
          ⚠ Échec de la sauvegarde — vos dernières coches n'ont pas été enregistrées.
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {Object.entries(MUSCU_ROUTINES).map(([id, r]) => (
          <button
            key={id}
            className="routine-tab"
            onClick={() => { setRoutineId(id); setSeanceIdx(0); }}
            style={{
              flex: 1,
              background: routineId === id ? "#3B5BDB" : "#1F2623",
              color: routineId === id ? "#F5F6FA" : "#B8BFB9",
              border: "none",
              borderRadius: 10,
              padding: "12px 14px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>{r.label}</div>
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1F2623",
          borderRadius: 10,
          padding: "10px 12px",
          marginBottom: 14,
        }}
      >
        <button
          onClick={() => changeWeek(-1)}
          disabled={week === 1}
          style={{ background: "transparent", border: "none", color: week === 1 ? "#4A524D" : "#EDE9DF", cursor: week === 1 ? "default" : "pointer", padding: 6 }}
          aria-label="Semaine précédente"
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div className="zen" style={{ fontWeight: 700, fontSize: 16 }}>
            Semaine {week}<span style={{ opacity: 0.5 }}> / {MUSCU_TOTAL_WEEKS}</span>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              marginTop: 2,
              padding: "2px 8px",
              borderRadius: 999,
              background: testWeek ? "#2A3B2E" : "#26304A",
              color: testWeek ? "#7FBF83" : "#8FA3E8",
            }}
          >
            {testWeek ? <Snowflake size={12} /> : <Flame size={12} />}
            {info === null
              ? "Mise en place — volume réduit"
              : info.postIntro
              ? "Décharge — avant le cycle 1"
              : testWeek
              ? `Cycle ${info.cycle} — Semaine de test`
              : `Cycle ${info.cycle} — Niveau ${info.level + 1}`}
          </div>
        </div>
        <button
          onClick={() => changeWeek(1)}
          disabled={week === MUSCU_TOTAL_WEEKS}
          style={{ background: "transparent", border: "none", color: week === MUSCU_TOTAL_WEEKS ? "#4A524D" : "#EDE9DF", cursor: week === MUSCU_TOTAL_WEEKS ? "default" : "pointer", padding: 6 }}
          aria-label="Semaine suivante"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div style={{ fontSize: 12, color: "#8B9490", marginBottom: 10 }}>
        3 séances par routine et par semaine — à répartir comme vous voulez
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {MUSCU_SEANCES.map((s, i) => {
          const k = muscuSessionKey(routineId, week, s);
          const done = overview[k];
          return (
            <button
              key={s}
              className="day-tab"
              onClick={() => setSeanceIdx(i)}
              style={{
                flex: 1,
                padding: "9px 6px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: seanceIdx === i ? "#3B5BDB" : "#2A322D",
                background: seanceIdx === i ? "rgba(59,91,219,0.12)" : "transparent",
                color: seanceIdx === i ? "#EDE9DF" : "#8B9490",
                cursor: "pointer",
                fontSize: 13,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              {s}
              {done ? <Check size={12} color="#4C8C4A" /> : <Circle size={8} color="#4A524D" fill="#4A524D" />}
            </button>
          );
        })}
      </div>

      {testWeek && (
        <div
          style={{
            background: "rgba(59,91,219,0.1)",
            border: "1px solid #3B5BDB",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 14,
            fontSize: 12.5,
            color: "#B8BFB9",
          }}
        >
          Semaine de test : la cible du jour reste identique au niveau précédent. Notez votre répétition max, puis choisissez vous-même les reps et le poids (ou la bande) du niveau suivant.
        </div>
      )}

      <CountdownTimer seconds={60} />

      {!testWeek && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button
            onClick={() => setCircuitView(true)}
            style={{
              flex: 1,
              padding: "9px 10px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: circuitView ? "#3B5BDB" : "#2A322D",
              background: circuitView ? "rgba(59,91,219,0.12)" : "transparent",
              color: circuitView ? "#EDE9DF" : "#8B9490",
              cursor: "pointer",
              fontSize: 12.5,
            }}
          >
            Vue circuit
          </button>
          <button
            onClick={() => setCircuitView(false)}
            style={{
              flex: 1,
              padding: "9px 10px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: !circuitView ? "#3B5BDB" : "#2A322D",
              background: !circuitView ? "rgba(59,91,219,0.12)" : "transparent",
              color: !circuitView ? "#EDE9DF" : "#8B9490",
              cursor: "pointer",
              fontSize: 12.5,
            }}
          >
            Vue par exercice
          </button>
        </div>
      )}

      {loaded && session && circuitView && !testWeek && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: Math.max(...circuitExercises.map((ex) => ex.getTarget(week).sets)) }).map((_, r) => (
            <div key={r} style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #3B5BDB" }}>
              <div className="zen" style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#8FA3E8", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Tour {r + 1}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {circuitExercises.map((ex) => {
                  const t = ex.getTarget(week);
                  if (r >= t.sets) return null;
                  const vals = session.sets[ex.id] || [];
                  return (
                    <div key={ex.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{ex.getName ? ex.getName(week) : ex.name}</div>
                        <div style={{ fontSize: 11, color: "#8B9490" }}>
                          {ex.kind === "weighted" && t.weights ? `${t.reps} reps · ${t.weights[r]}kg` : targetLabelMuscu(ex, t)}
                        </div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder={String(ex.kind === "duration-single" ? t.seconds : t.reps)}
                        value={vals[r] ?? ""}
                        onChange={(e) => setRep(ex.id, r, e.target.value)}
                        style={{
                          width: 70,
                          textAlign: "center",
                          background: "#161B19",
                          border: "1px solid #2A322D",
                          borderRadius: 8,
                          color: "#EDE9DF",
                          padding: "9px 4px",
                          fontSize: 14,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {finisherExercises.map((ex) => {
            const t = ex.getTarget(week);
            const vals = session.sets[ex.id] || [];
            return (
              <div key={ex.id} style={{ background: "rgba(198,85,59,0.08)", border: "1px solid #C6553B", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                  <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>{ex.getName ? ex.getName(week) : ex.name}</div>
                  <div style={{ fontSize: 11, color: "#E8A08F", background: "rgba(198,85,59,0.16)", padding: "2px 8px", borderRadius: 999 }}>
                    EMOM — fin de séance
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#8B9490", marginBottom: 8 }}>{targetLabelMuscu(ex, t)}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Array.from({ length: t.sets }).map((_, i) => (
                    <div key={i} style={{ flex: "1 1 0", minWidth: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <label style={{ fontSize: 11, color: "#8B9490", textAlign: "center" }}>
                        Min {i + 1}{ex.kind === "weighted" && t.weights ? ` · ${t.weights[i]}kg` : ""}
                      </label>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder={String(t.reps)}
                        value={vals[i] ?? ""}
                        onChange={(e) => setRep(ex.id, i, e.target.value)}
                        style={{
                          width: "100%",
                          textAlign: "center",
                          background: "#161B19",
                          border: "1px solid #2A322D",
                          borderRadius: 8,
                          color: "#EDE9DF",
                          padding: "9px 4px",
                          fontSize: 14,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px" }}>
            <label style={{ fontSize: 13, color: "#B8BFB9", display: "block", marginBottom: 6 }}>Notes de séance</label>
            <textarea
              value={session.notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ressenti, technique, ajustements..."
              rows={2}
              style={{ width: "100%", background: "#161B19", border: "1px solid #2A322D", borderRadius: 8, color: "#EDE9DF", padding: "10px", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}

      {loaded && session && (!circuitView || testWeek) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {exercises.map((ex) => {
            const t = ex.getTarget(week);
            const vals = session.sets[ex.id] || [];
            const testData = session.testResults?.[ex.id] || { max: "", nextReps: "", nextWeight: "", nextName: "" };
            const nextWeightLabel = ex.kind === "band" ? "Bande niveau suivant" : "Poids niveau suivant (kg)";
            return (
              <div key={ex.id} style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #3B5BDB" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>{ex.getName ? ex.getName(week) : ex.name}</div>
                  <div style={{ fontSize: 12, color: "#8B9490" }}>{t.sets} sets</div>
                </div>

                <div style={{ fontSize: 12, color: "#8B9490", marginBottom: 8 }}>{targetLabelMuscu(ex, t)}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Array.from({ length: t.sets }).map((_, i) => (
                    <div key={i} style={{ flex: "1 1 0", minWidth: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <label style={{ fontSize: 11, color: "#8B9490", textAlign: "center" }}>
                        Set {i + 1}{ex.kind === "weighted" && t.weights ? ` · ${t.weights[i]}kg` : ""}
                      </label>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder={String(ex.kind === "duration-single" ? t.seconds : t.reps)}
                        value={vals[i] ?? ""}
                        onChange={(e) => setRep(ex.id, i, e.target.value)}
                        style={{
                          width: "100%",
                          textAlign: "center",
                          background: "#161B19",
                          border: "1px solid #2A322D",
                          borderRadius: 8,
                          color: "#EDE9DF",
                          padding: "9px 4px",
                          fontSize: 14,
                        }}
                      />
                    </div>
                  ))}
                </div>

                {testWeek && ex.id !== "gobletsquat" && ex.id !== "swing" && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #2A322D" }}>
                    <label style={{ fontSize: 11, color: "#8FA3E8", display: "block", marginBottom: 4 }}>Répétition max aujourd'hui</label>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      placeholder="Max"
                      value={testData.max}
                      onChange={(e) => setTestField(ex.id, "max", e.target.value)}
                      style={{
                        width: "100%",
                        background: "#161B19",
                        border: "1px solid #3B5BDB",
                        borderRadius: 8,
                        color: "#EDE9DF",
                        padding: "9px 10px",
                        fontSize: 13.5,
                        marginBottom: 8,
                      }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      {ex.id !== "gobletsquat" && ex.kind !== "duration-single" && (
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, color: "#8B9490", display: "block", marginBottom: 4 }}>Reps niveau suivant</label>
                          <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            value={testData.nextReps}
                            onChange={(e) => setTestField(ex.id, "nextReps", e.target.value)}
                            style={{
                              width: "100%",
                              textAlign: "center",
                              background: "#161B19",
                              border: "1px solid #2A322D",
                              borderRadius: 8,
                              color: "#EDE9DF",
                              padding: "9px 4px",
                              fontSize: 14,
                            }}
                          />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: "#8B9490", display: "block", marginBottom: 4 }}>
                          {ex.id === "gobletsquat"
                            ? "Nouveau poids (relance l'alternance)"
                            : ex.kind === "duration-single"
                            ? "Durée niveau suivant (sec)"
                            : nextWeightLabel}
                        </label>
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={testData.nextWeight}
                          onChange={(e) => setTestField(ex.id, "nextWeight", e.target.value)}
                          style={{
                            width: "100%",
                            textAlign: "center",
                            background: "#161B19",
                            border: "1px solid #2A322D",
                            borderRadius: 8,
                            color: "#EDE9DF",
                            padding: "9px 4px",
                            fontSize: 14,
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <label style={{ fontSize: 11, color: "#8B9490", display: "block", marginBottom: 4 }}>
                        Nom (si vous changez de mouvement)
                      </label>
                      <input
                        type="text"
                        placeholder="Laisser vide pour garder le même exercice"
                        value={testData.nextName}
                        onChange={(e) => setTestField(ex.id, "nextName", e.target.value)}
                        style={{
                          width: "100%",
                          background: "#161B19",
                          border: "1px solid #2A322D",
                          borderRadius: 8,
                          color: "#EDE9DF",
                          padding: "9px 10px",
                          fontSize: 13.5,
                        }}
                      />
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  value={session.exerciseNotes?.[ex.id] ?? ""}
                  onChange={(e) => setExerciseNote(ex.id, e.target.value)}
                  placeholder="Note sur cet exercice (optionnel)"
                  style={{
                    width: "100%",
                    marginTop: 10,
                    background: "#161B19",
                    border: "1px solid #2A322D",
                    borderRadius: 8,
                    color: "#EDE9DF",
                    padding: "8px 10px",
                    fontSize: 12.5,
                    fontFamily: "inherit",
                  }}
                />
              </div>
            );
          })}

          <div style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px" }}>
            <label style={{ fontSize: 13, color: "#B8BFB9", display: "block", marginBottom: 6 }}>Notes de séance</label>
            <textarea
              value={session.notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ressenti, technique, ajustements..."
              rows={2}
              style={{ width: "100%", background: "#161B19", border: "1px solid #2A322D", borderRadius: 8, color: "#EDE9DF", padding: "10px", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}

      <RecapCalendar
        title="Récapitulatif — Musculation"
        dateLog={dateLog}
        colors={{ A: "#4C8C4A", B: "#C9A66B" }}
        legend={[
          { color: "#4C8C4A", label: "Routine A" },
          { color: "#C9A66B", label: "Routine B" },
        ]}
      />
    </div>
  );
}


/* ============================== MOBILITÉ SOIR (suivi semaine, même calendrier 25 semaines que Pied/Musculation) ============================== */

// Passive hang : démarre à 50 sec, +5 sec toutes les deux semaines, plafonne à 80 sec (atteint en
// début de cycle 3). Une fois à 80 sec, ça déclenche le one arm hang et la progression du passive
// hang s'arrête là (reste à 80 sec sur cycle 3 et cycle 4).
const PASSIVE_HANG_LEVELS = [60, 65, 70, 75, 80, 80, 80, 80];
const PASSIVE_HANG_INTRO_1 = 50; // semaines 1-2
const PASSIVE_HANG_INTRO_2 = 55; // semaines 3-4
const PASSIVE_HANG_POST_INTRO_DELOAD = 55; // semaine 5, continue sans réduction

// Reps de knee raise pendant le hang : 5 (mise en place) -> 20 au niveau 4, puis changement
// d'exercice (Hanging leg raise), reps repartent à 8 et continuent de monter.
const HANG_REPS_LEVELS = [8, 11, 14, 17, 20, 8, 13, 18];
const HANG_NAME_SWITCH_LEVEL = 5; // à partir de ce niveau : Hanging leg raise

function hangName(level) {
  return level === null || level < HANG_NAME_SWITCH_LEVEL ? "Hanging knee raise" : "Hanging leg raise";
}

function passiveHangTarget(week) {
  if (isPiedIntroWeek(week)) return { seconds: week > 2 ? PASSIVE_HANG_INTRO_2 : PASSIVE_HANG_INTRO_1, reps: 5, name: "Hanging knee raise" };
  if (isPiedPostIntroDeload(week)) return { seconds: PASSIVE_HANG_POST_INTRO_DELOAD, reps: 5, name: "Hanging knee raise" };
  const info = piedCycleInfo(week);
  return { seconds: PASSIVE_HANG_LEVELS[info.level], reps: HANG_REPS_LEVELS[info.level], name: hangName(info.level) };
}

// One arm hang : introduit au cycle 3 (niveau 4) quand le passive hang atteint 80 sec. Fixe à 10s
// sur les deux niveaux du cycle 3, puis progresse 15s/20s au cycle 4. Pas de réduction en décharge.
const ONE_ARM_HANG_LEVELS = [null, null, null, null, 10, 10, 15, 20];

function oneArmHangIntroduced(week) {
  if (isPiedIntroWeek(week) || isPiedPostIntroDeload(week)) return false;
  const info = piedCycleInfo(week);
  return info.level >= 4;
}

function oneArmHangTarget(week) {
  const info = piedCycleInfo(week);
  return { seconds: ONE_ARM_HANG_LEVELS[info.level] };
}

// Deep squat : 2 min fixe tout du long, 3 sets dès le cycle 1. Le poids diminue progressivement
// (16kg -> 10kg -> 5kg -> poids du corps) — la position chargée est plus simple pour l'utilisateur
// que la position sans charge, d'où la décharge progressive plutôt qu'une charge croissante.
// Pas de réduction spécifique en semaine de décharge.
const DEEP_SQUAT_LEVELS = [
  { sets: 3, weight: 16 },
  { sets: 3, weight: 16 },
  { sets: 3, weight: 10 },
  { sets: 3, weight: 10 },
  { sets: 3, weight: 5 },
  { sets: 3, weight: 5 },
  { sets: 3, weight: 0 },
  { sets: 3, weight: 0 },
];
const DEEP_SQUAT_INTRO = { sets: 2, weight: 16 };
const DEEP_SQUAT_POST_INTRO_DELOAD = { sets: 2, weight: 16 };

function deepSquatTarget(week) {
  if (isPiedIntroWeek(week)) return { seconds: 120, ...DEEP_SQUAT_INTRO };
  if (isPiedPostIntroDeload(week)) return { seconds: 120, ...DEEP_SQUAT_POST_INTRO_DELOAD };
  const info = piedCycleInfo(week);
  const entry = DEEP_SQUAT_LEVELS[info.level];
  return { seconds: 120, sets: entry.sets, weight: entry.weight };
}

const MOBSOIR_EXERCISES = [
  {
    id: "passivehang",
    name: "Hanging knee raise",
    type: "duration",
    unit: "sec",
    sets: 2,
    bilateral: true,
    getTarget: passiveHangTarget,
    getName: (week) => passiveHangTarget(week).name,
    logReps: true,
  },
  {
    id: "onearmhang",
    name: "One arm hang",
    type: "duration",
    unit: "sec",
    sets: 1,
    bilateral: false,
    getTarget: oneArmHangTarget,
    isIntroducedAt: oneArmHangIntroduced,
  },
  { id: "deepsquat", name: "Deep squat", type: "duration", unit: "sec", bilateral: true, getTarget: deepSquatTarget },
];

function mobSoirSidesFor(ex) {
  return ex.bilateral === false ? SIDES : BOTH;
}

const MOBSOIR_SEANCES = ["S1", "S2", "S3", "S4", "S5", "S6"];

function mobSoirKey(week, seance) {
  return `session:mobsoir-w${week}-${seance}`;
}

function mobSoirActiveExercises(week) {
  return MOBSOIR_EXERCISES.filter((ex) => !ex.isIntroducedAt || ex.isIntroducedAt(week));
}

function mobSoirSetsFor(ex, week) {
  if (ex.getTarget) return ex.getTarget(week).sets;
  return ex.sets;
}

function emptyMobSoirSession(week) {
  const sets = {};
  const exerciseNotes = {};
  const exerciseReps = {};
  mobSoirActiveExercises(week).forEach((ex) => {
    const sideState = {};
    const noteState = {};
    const repsState = {};
    const setCount = mobSoirSetsFor(ex, week);
    mobSoirSidesFor(ex).forEach(({ id: side }) => {
      sideState[side] = Array(setCount).fill(false);
      noteState[side] = "";
      if (ex.logReps) repsState[side] = Array(setCount).fill("");
    });
    sets[ex.id] = sideState;
    exerciseNotes[ex.id] = noteState;
    if (ex.logReps) exerciseReps[ex.id] = repsState;
  });
  return { sets, exerciseNotes, exerciseReps, notes: "" };
}

function isMobSoirSessionComplete(sessionData, week) {
  if (!sessionData) return false;
  return mobSoirActiveExercises(week).every((ex) => {
    const setCount = mobSoirSetsFor(ex, week);
    return mobSoirSidesFor(ex).every(({ id: side }) => {
      const vals = sessionData.sets?.[ex.id]?.[side] || [];
      return vals.length >= setCount && vals.slice(0, setCount).every(Boolean);
    });
  });
}

function MobSoirTab() {
  const [week, setWeek] = useState(1);
  const [seanceIdx, setSeanceIdx] = useState(0);
  const [session, setSession] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [overview, setOverview] = useState({});
  const [saveError, setSaveError] = useState(false);
  const [dateLog, setDateLog] = useState({});

  const badge = piedWeekBadge(week);
  const seance = MOBSOIR_SEANCES[seanceIdx];
  const key = mobSoirKey(week, seance);
  const activeExercises = mobSoirActiveExercises(week);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const log = await loadDateLog("mobsoir");
      if (!cancelled) setDateLog(log);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      try {
        const res = await storageGetWithRetry(key);
        if (!cancelled) {
          setSession(res ? JSON.parse(res.value) : emptyMobSoirSession(week));
          setLoaded(true);
        }
      } catch (e) {
        if (!cancelled) {
          setSession(emptyMobSoirSession(week));
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await storageGetWithRetry("session:mobsoir-overview");
        if (!cancelled) setOverview(res ? JSON.parse(res.value) : {});
      } catch (e) {
        if (!cancelled) setOverview({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    async (next) => {
      setSession(next);
      try {
        const result = await storageSetWithRetry(key, JSON.stringify(next));
        if (result) {
          setSaveError(false);
          const nextOverview = { ...overview, [key]: isMobSoirSessionComplete(next, week) };
          setOverview(nextOverview);
          try {
            await storageSetWithRetry("session:mobsoir-overview", JSON.stringify(nextOverview));
          } catch (e) {
            // la vue d'ensemble peut échouer sans bloquer la sauvegarde de la séance elle-même
          }
          if (hasAnyInput(next)) {
            const nextLog = await markDateLog("mobsoir", "done", dateLog);
            setDateLog(nextLog);
            saveHistoryEntry("mobsoir", {
              week,
              exercises: activeExercises.map((ex) => {
                const t = ex.getTarget ? ex.getTarget(week) : { seconds: ex.target, sets: ex.sets };
                return {
                  id: ex.id,
                  name: ex.name,
                  target: t,
                  saisi: next.sets?.[ex.id] ?? null,
                  note: next.exerciseNotes?.[ex.id] ?? null,
                  repsRealises: next.exerciseReps?.[ex.id] ?? null,
                };
              }),
              notes: next.notes || "",
            });
          }
        } else {
          setSaveError(true);
        }
      } catch (e) {
        setSaveError(true);
      }
    },
    [key, week, overview, dateLog, activeExercises]
  );

  const toggleSet = (exId, side, i) => {
    if (!session) return;
    const arr = [...(session.sets[exId]?.[side] || [])];
    arr[i] = !arr[i];
    persist({ ...session, sets: { ...session.sets, [exId]: { ...session.sets[exId], [side]: arr } } });
  };

  const setExerciseNote = (exId, side, value) => {
    if (!session) return;
    persist({
      ...session,
      exerciseNotes: { ...session.exerciseNotes, [exId]: { ...(session.exerciseNotes?.[exId] || {}), [side]: value } },
    });
  };

  const setRepsValue = (exId, side, i, value) => {
    if (!session) return;
    const arr = [...(session.exerciseReps?.[exId]?.[side] || [])];
    arr[i] = value;
    persist({
      ...session,
      exerciseReps: { ...session.exerciseReps, [exId]: { ...(session.exerciseReps?.[exId] || {}), [side]: arr } },
    });
  };

  const setNotes = (value) => {
    if (!session) return;
    persist({ ...session, notes: value });
  };

  const changeWeek = (delta) => {
    setWeek(Math.min(PIED_TOTAL_WEEKS, Math.max(1, week + delta)));
  };

  return (
    <div>
      {saveError && (
        <div
          style={{
            background: "rgba(198,85,59,0.14)",
            border: "1px solid #C6553B",
            color: "#E8A08F",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12.5,
            marginBottom: 12,
          }}
        >
          ⚠ Échec de la sauvegarde — vos dernières coches n'ont pas été enregistrées.
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1F2623",
          borderRadius: 10,
          padding: "10px 12px",
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => changeWeek(-1)}
          disabled={week === 1}
          style={{ background: "transparent", border: "none", color: week === 1 ? "#4A524D" : "#EDE9DF", cursor: week === 1 ? "default" : "pointer", padding: 6 }}
          aria-label="Semaine précédente"
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div className="zen" style={{ fontWeight: 700, fontSize: 16 }}>
            Semaine {week}<span style={{ opacity: 0.5 }}> / {PIED_TOTAL_WEEKS}</span>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              marginTop: 2,
              padding: "2px 8px",
              borderRadius: 999,
              background: badge.deload ? "#2A3B2E" : "#26304A",
              color: badge.deload ? "#7FBF83" : "#8FA3E8",
            }}
          >
            {badge.deload ? <Snowflake size={12} /> : <Flame size={12} />}
            {badge.label} — {badge.sub}
          </div>
        </div>
        <button
          onClick={() => changeWeek(1)}
          disabled={week === PIED_TOTAL_WEEKS}
          style={{ background: "transparent", border: "none", color: week === PIED_TOTAL_WEEKS ? "#4A524D" : "#EDE9DF", cursor: week === PIED_TOTAL_WEEKS ? "default" : "pointer", padding: 6 }}
          aria-label="Semaine suivante"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div style={{ fontSize: 12, color: "#8B9490", marginBottom: 10 }}>
        6 séances par semaine — à répartir comme vous voulez
      </div>

      <div style={{ display: "flex", gap: 5, marginBottom: 20, flexWrap: "wrap" }}>
        {MOBSOIR_SEANCES.map((s, i) => {
          const k = mobSoirKey(week, s);
          const done = overview[k];
          return (
            <button
              key={s}
              className="day-tab"
              onClick={() => setSeanceIdx(i)}
              style={{
                flex: "1 1 0",
                minWidth: 44,
                padding: "9px 4px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: seanceIdx === i ? "#3B5BDB" : "#2A322D",
                background: seanceIdx === i ? "rgba(59,91,219,0.12)" : "transparent",
                color: seanceIdx === i ? "#EDE9DF" : "#8B9490",
                cursor: "pointer",
                fontSize: 13,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              {s}
              {done ? <Check size={12} color="#4C8C4A" /> : <Circle size={8} color="#4A524D" fill="#4A524D" />}
            </button>
          );
        })}
      </div>

      {loaded && session && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activeExercises.map((ex) => {
            const t = ex.getTarget ? ex.getTarget(week) : { seconds: ex.target, sets: ex.sets };
            const setCount = t.sets ?? ex.sets;
            return (
              <div key={ex.id} style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #C9A66B" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>{ex.getName ? ex.getName(week) : ex.name}</div>
                  <div style={{ fontSize: 12, color: "#8B9490" }}>
                    {setCount} × {t.seconds} sec{t.reps !== undefined ? `, ${t.reps} reps` : ""}{t.weight !== undefined ? ` @ ${t.weight > 0 ? t.weight + "kg" : "poids du corps"}` : ""}
                  </div>
                </div>

                {mobSoirSidesFor(ex).map(({ id: side, label: sideLabel }) => {
                  const vals = session.sets[ex.id]?.[side] || [];
                  return (
                    <div key={side} style={{ marginBottom: 10 }}>
                      {sideLabel && (
                        <div style={{ fontSize: 11, color: "#8B9490", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                          {sideLabel}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {Array.from({ length: setCount }).map((_, i) => {
                          const done = !!vals[i];
                          return (
                            <button
                              key={i}
                              className="set-check"
                              onClick={() => toggleSet(ex.id, side, i)}
                              style={{
                                flex: "1 1 0",
                                minWidth: 64,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                padding: "10px 8px",
                                borderRadius: 8,
                                border: "1px solid",
                                borderColor: done ? "#4C8C4A" : "#2A322D",
                                background: done ? "rgba(76,140,74,0.14)" : "#161B19",
                                color: done ? "#7FBF83" : "#B8BFB9",
                                cursor: "pointer",
                                fontSize: 13,
                              }}
                            >
                              {done ? <Check size={14} /> : <Circle size={14} />}
                              Set {i + 1}
                            </button>
                          );
                        })}
                      </div>
                      {ex.logReps && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                          {Array.from({ length: setCount }).map((_, i) => {
                            const repsVals = session.exerciseReps?.[ex.id]?.[side] || [];
                            return (
                              <div key={i} style={{ flex: "1 1 0", minWidth: 64, display: "flex", alignItems: "center", gap: 4 }}>
                                <input
                                  type="number"
                                  min={0}
                                  inputMode="numeric"
                                  value={repsVals[i] ?? ""}
                                  onChange={(e) => setRepsValue(ex.id, side, i, e.target.value)}
                                  placeholder="reps"
                                  style={{
                                    width: "100%",
                                    background: "#161B19",
                                    border: "1px solid #2A322D",
                                    borderRadius: 8,
                                    color: "#EDE9DF",
                                    padding: "6px 8px",
                                    fontSize: 12.5,
                                    fontFamily: "inherit",
                                  }}
                                />
                                <span style={{ fontSize: 11, color: "#8B9490", whiteSpace: "nowrap" }}>
                                  leg raises
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                <input
                  type="text"
                  value={session.exerciseNotes?.[ex.id]?.[ex.bilateral === false ? "droite" : "both"] ?? ""}
                  onChange={(e) => setExerciseNote(ex.id, ex.bilateral === false ? "droite" : "both", e.target.value)}
                  placeholder="Note sur cet exercice (optionnel)"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    background: "#161B19",
                    border: "1px solid #2A322D",
                    borderRadius: 8,
                    color: "#EDE9DF",
                    padding: "8px 10px",
                    fontSize: 12.5,
                    fontFamily: "inherit",
                  }}
                />
              </div>
            );
          })}

          <div style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px" }}>
            <label style={{ fontSize: 13, color: "#B8BFB9", display: "block", marginBottom: 6 }}>Notes de séance</label>
            <textarea
              value={session.notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ressenti, souplesse, ajustements..."
              rows={2}
              style={{ width: "100%", background: "#161B19", border: "1px solid #2A322D", borderRadius: 8, color: "#EDE9DF", padding: "10px", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}

      <RecapCalendar
        title="Récapitulatif — Mobilité soir"
        dateLog={dateLog}
        colors={{ done: "#4C8C4A" }}
        legend={[{ color: "#4C8C4A", label: "Séance effectuée" }]}
      />
    </div>
  );
}


/* ============================== MOBILITÉ MATIN (2 routines de 5 exercices, même calendrier 25 semaines que Pied/Musculation) ============================== */

// Cossack squat : progression douce, reps réduites à chaque palier de poids, plafond à 10kg / 14 reps
const COSSACK_LEVELS = [
  { weight: 0, reps: 8 },
  { weight: 0, reps: 10 },
  { weight: 0, reps: 12 },
  { weight: 5, reps: 10 },
  { weight: 5, reps: 12 },
  { weight: 5, reps: 14 },
  { weight: 10, reps: 12 },
  { weight: 10, reps: 14 },
];
const COSSACK_INTRO = { weight: 0, reps: 8 };
const COSSACK_DELOAD = { weight: 0, reps: 6 };

function cossackTarget(week) {
  if (isPiedIntroWeek(week)) return COSSACK_INTRO;
  if (isPiedPostIntroDeload(week)) return COSSACK_DELOAD;
  const info = piedCycleInfo(week);
  if (info.deload) return COSSACK_DELOAD;
  return COSSACK_LEVELS[info.level];
}

// Horse stance : +5 sec à chaque niveau (base ET surcharge progressent)
const HORSESTANCE_LEVELS = [35, 40, 45, 50, 55, 60, 65, 70];

function horseStanceTarget(week) {
  if (isPiedIntroWeek(week)) return { seconds: 30 };
  if (isPiedPostIntroDeload(week)) return { seconds: 25 };
  const info = piedCycleInfo(week);
  if (info.deload) return { seconds: HORSESTANCE_LEVELS[info.level - 1] - 5 };
  return { seconds: HORSESTANCE_LEVELS[info.level] };
}

// Reverse table top : 5 reps + 10s tenue -> 10 reps + 30s tenue (proposition de progression lissée sur 8 niveaux)
const RTT_LEVELS = [
  { reps: 5, hold: 10 },
  { reps: 6, hold: 12 },
  { reps: 7, hold: 15 },
  { reps: 7, hold: 17 },
  { reps: 8, hold: 20 },
  { reps: 9, hold: 22 },
  { reps: 9, hold: 25 },
  { reps: 10, hold: 30 },
];
const RTT_BASE = { reps: 5, hold: 10 };

function rttTarget(week) {
  if (isPiedIntroWeek(week)) return RTT_BASE;
  if (isPiedPostIntroDeload(week)) return RTT_BASE;
  const info = piedCycleInfo(week);
  if (info.deload) return RTT_BASE;
  return RTT_LEVELS[info.level];
}

// KT halo : 2 sets par côté (droite ET gauche suivent le même schéma en parallèle).
// Seulement 16 et 20 kg disponibles. Mécanisme : les deux sets montent en reps à 16kg (2->6),
// puis set1 surcharge à 20kg en repartant de 2 reps et remonte à 6, puis set2 fait pareil.
const KT_INTRO = { set1: { weight: 16, reps: 2 }, set2: { weight: 16, reps: 2 } };
const KT_DELOAD = { set1: { weight: 16, reps: 2 }, set2: { weight: 16, reps: 2 } };
const KT_LEVELS = [
  { set1: { weight: 16, reps: 4 }, set2: { weight: 16, reps: 4 } }, // niveau 1 : les deux sets montent en reps
  { set1: { weight: 16, reps: 6 }, set2: { weight: 16, reps: 6 } }, // niveau 2 : les deux sets au max de reps à 16kg
  { set1: { weight: 20, reps: 2 }, set2: { weight: 16, reps: 6 } }, // niveau 3 : set1 surcharge à 20kg, repart à 2 reps
  { set1: { weight: 20, reps: 4 }, set2: { weight: 16, reps: 6 } }, // niveau 4 : set1 remonte en reps
  { set1: { weight: 20, reps: 6 }, set2: { weight: 16, reps: 6 } }, // niveau 5 : set1 au max à 20kg
  { set1: { weight: 20, reps: 6 }, set2: { weight: 20, reps: 2 } }, // niveau 6 : set2 surcharge à 20kg, repart à 2 reps
  { set1: { weight: 20, reps: 6 }, set2: { weight: 20, reps: 4 } }, // niveau 7 : set2 remonte en reps
  { set1: { weight: 20, reps: 6 }, set2: { weight: 20, reps: 6 } }, // niveau 8 : les deux sets au max à 20kg (objectif final)
];

function ktHaloTarget(week) {
  if (isPiedIntroWeek(week)) return KT_INTRO;
  if (isPiedPostIntroDeload(week)) return KT_DELOAD;
  const info = piedCycleInfo(week);
  if (info.deload) return KT_DELOAD;
  return KT_LEVELS[info.level];
}

const MOBMATIN_ROUTINES = {
  A: {
    label: "Routine A",
    days: ["Séance 1", "Séance 2", "Séance 3"],
    exercises: [
      { id: "spinalwave", name: "Spinal wave", type: "fixed", bilateral: true, seconds: 60 },
      { id: "bearwalk", name: "Bear walk", type: "fixed", bilateral: true, seconds: 60 },
      { id: "nine0nine0", name: "90/90", type: "fixed", bilateral: true, seconds: 60 },
      { id: "hiphingestick", name: "Hip hinge (bâton)", type: "fixed", bilateral: true, seconds: 60 },
      { id: "shoulderdislocate", name: "Shoulder dislocate", type: "fixed", bilateral: true, seconds: 60 },
      { id: "scapulapullup", name: "Scapula pull-up", type: "fixed", bilateral: true, seconds: 60 },
      { id: "cossack", name: "Cossack squat", type: "cossack", bilateral: false },
    ],
  },
  B: {
    label: "Routine B",
    days: ["Séance 1", "Séance 2", "Séance 3"],
    exercises: [
      { id: "spinalrotation", name: "Spinal rotation", type: "fixed", bilateral: true, seconds: 60 },
      { id: "duckwalk", name: "Duck walk", type: "fixed", bilateral: true, seconds: 60 },
      { id: "hiphingestick", name: "Hip hinge (bâton)", type: "fixed", bilateral: true, seconds: 60 },
      { id: "shoulderdislocate", name: "Shoulder dislocate", type: "fixed", bilateral: true, seconds: 60 },
      { id: "scapulapullup", name: "Scapula pull-up", type: "fixed", bilateral: true, seconds: 60 },
      { id: "spiderman", name: "Spiderman lunge", type: "fixed", bilateral: false, seconds: 60 },
      { id: "rtt", name: "Reverse table top", type: "reverse-table-top", bilateral: true },
    ],
  },
};

function mobMatinExTarget(ex, week) {
  if (ex.type === "fixed") return { mode: "duration", seconds: ex.seconds };
  if (ex.type === "horsestance") return { mode: "duration", ...horseStanceTarget(week) };
  if (ex.type === "cossack") return { mode: "reps-weight", ...cossackTarget(week) };
  if (ex.type === "reverse-table-top") return { mode: "reps-hold", ...rttTarget(week) };
  if (ex.type === "kt-halo") {
    const t = ktHaloTarget(week);
    return { mode: "multiset", sets: [t.set1, t.set2] };
  }
  return { mode: "duration", seconds: 60 };
}

function mobMatinSidesFor(ex) {
  return ex.bilateral ? BOTH : SIDES;
}

function mobMatinKey(routineId, week, day) {
  return `session:mobmatin-${routineId}-w${week}-${day}`;
}

function emptyMobMatinSession(routine) {
  const sets = {};
  const exerciseNotes = {};
  routine.exercises.forEach((ex) => {
    const sideState = {};
    const noteState = {};
    mobMatinSidesFor(ex).forEach(({ id: side }) => {
      sideState[side] = ex.type === "kt-halo" ? [false, false] : false;
      noteState[side] = "";
    });
    sets[ex.id] = sideState;
    exerciseNotes[ex.id] = noteState;
  });
  return { sets, exerciseNotes, notes: "" };
}

function isMobMatinSessionComplete(sessionData, routine) {
  if (!sessionData) return false;
  return routine.exercises.every((ex) =>
    mobMatinSidesFor(ex).every(({ id: side }) => {
      const v = sessionData.sets?.[ex.id]?.[side];
      if (ex.type === "kt-halo") return Array.isArray(v) && v[0] && v[1];
      return !!v;
    })
  );
}

function targetLabel(ex, t) {
  if (t.mode === "duration") return `${t.seconds} sec`;
  if (t.mode === "reps-weight") return `${t.reps} reps${t.weight > 0 ? ` @ ${t.weight}kg` : " (poids du corps)"}`;
  if (t.mode === "reps-hold") return `${t.reps} reps + ${t.hold}s tenue`;
  if (t.mode === "multiset")
    return t.sets.map((s) => `${s.reps}@${s.weight}kg`).join(" / ");
  return "";
}

/* ============================== MINUTEUR TRAVAIL / REPOS (réutilisable) ============================== */

function beep(freq) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // audio non disponible, pas bloquant
  }
}

function WorkRestTimer({ workSeconds, restSeconds }) {
  const [phase, setPhase] = useState("work");
  const [remaining, setRemaining] = useState(workSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setPhase("work");
    setRemaining(workSeconds);
    setRunning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workSeconds, restSeconds]);

  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        setPhase((p) => {
          const next = p === "work" ? "rest" : "work";
          beep(next === "work" ? 880 : 440);
          return next;
        });
        return null; // placeholder, corrigé juste après
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  // Quand la phase change (via le tick ci-dessus), on réinitialise le compte à rebours de la nouvelle phase
  useEffect(() => {
    if (remaining === null) {
      setRemaining(phase === "work" ? workSeconds : restSeconds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const toggle = () => setRunning((r) => !r);
  const reset = () => {
    setRunning(false);
    setPhase("work");
    setRemaining(workSeconds);
  };

  const isWork = phase === "work";

  return (
    <div
      style={{
        background: isWork ? "rgba(76,140,74,0.14)" : "rgba(201,166,107,0.14)",
        border: "1px solid",
        borderColor: isWork ? "#4C8C4A" : "#C9A66B",
        borderRadius: 10,
        padding: "12px 16px",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <div>
        <div style={{ fontSize: 11, color: "#8B9490", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {isWork ? "Travail" : "Repos"}
        </div>
        <div className="zen" style={{ fontSize: 28, fontWeight: 900, color: isWork ? "#7FBF83" : "#E3CB94", lineHeight: 1.1 }}>
          {remaining ?? (isWork ? workSeconds : restSeconds)}s
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={toggle}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid",
            borderColor: running ? "#C6553B" : "#4C8C4A",
            background: running ? "rgba(198,85,59,0.14)" : "rgba(76,140,74,0.14)",
            color: running ? "#E8A08F" : "#7FBF83",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {running ? "Pause" : "Démarrer"}
        </button>
        <button
          onClick={reset}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #2A322D",
            background: "#161B19",
            color: "#B8BFB9",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function CountdownTimer({ seconds }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setRemaining(seconds);
    setRunning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          beep(880);
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const toggle = () => {
    if (remaining <= 0) setRemaining(seconds);
    setRunning((r) => !r);
  };
  const reset = () => {
    setRunning(false);
    setRemaining(seconds);
  };

  return (
    <div
      style={{
        background: "rgba(59,91,219,0.1)",
        border: "1px solid #3B5BDB",
        borderRadius: 10,
        padding: "12px 16px",
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <div>
        <div style={{ fontSize: 11, color: "#8B9490", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Repos
        </div>
        <div className="zen" style={{ fontSize: 28, fontWeight: 900, color: "#8FA3E8", lineHeight: 1.1 }}>
          {remaining}s
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={toggle}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid",
            borderColor: running ? "#C6553B" : "#4C8C4A",
            background: running ? "rgba(198,85,59,0.14)" : "rgba(76,140,74,0.14)",
            color: running ? "#E8A08F" : "#7FBF83",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {running ? "Pause" : "Démarrer"}
        </button>
        <button
          onClick={reset}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #2A322D",
            background: "#161B19",
            color: "#B8BFB9",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function MobMatinTab() {
  const [routineId, setRoutineId] = useState("A");
  const [week, setWeek] = useState(1);
  const [dayIdx, setDayIdx] = useState(0);
  const [session, setSession] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [overview, setOverview] = useState({});
  const [saveError, setSaveError] = useState(false);
  const [dateLog, setDateLog] = useState({});

  const routine = MOBMATIN_ROUTINES[routineId];
  const badge = piedWeekBadge(week);
  const day = routine.days[dayIdx];
  const key = mobMatinKey(routineId, week, day);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const log = await loadDateLog("mobmatin");
      if (!cancelled) setDateLog(log);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      try {
        const res = await storageGetWithRetry(key);
        if (!cancelled) {
          setSession(res ? JSON.parse(res.value) : emptyMobMatinSession(routine));
          setLoaded(true);
        }
      } catch (e) {
        if (!cancelled) {
          setSession(emptyMobMatinSession(routine));
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await storageGetWithRetry(`session:mobmatin-${routineId}-overview`);
        if (!cancelled) setOverview(res ? JSON.parse(res.value) : {});
      } catch (e) {
        if (!cancelled) setOverview({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [routineId]);

  const persist = useCallback(
    async (next) => {
      setSession(next);
      try {
        const result = await storageSetWithRetry(key, JSON.stringify(next));
        if (result) {
          setSaveError(false);
          const nextOverview = { ...overview, [key]: isMobMatinSessionComplete(next, routine) };
          setOverview(nextOverview);
          try {
            await storageSetWithRetry(`session:mobmatin-${routineId}-overview`, JSON.stringify(nextOverview));
          } catch (e) {
            // la vue d'ensemble peut échouer sans bloquer la sauvegarde de la séance elle-même
          }
          if (hasAnyInput(next)) {
            const nextLog = await markDateLog("mobmatin", routineId, dateLog);
            setDateLog(nextLog);
            saveHistoryEntry("mobmatin", {
              routine: routineId,
              routineLabel: routine.label,
              week,
              day,
              exercises: routine.exercises.map((ex) => {
                const t = mobMatinExTarget(ex, week);
                return {
                  id: ex.id,
                  name: ex.name,
                  target: t,
                  saisi: next.sets?.[ex.id] ?? null,
                  note: next.exerciseNotes?.[ex.id] ?? null,
                };
              }),
              notes: next.notes || "",
            });
          }
        } else {
          setSaveError(true);
        }
      } catch (e) {
        setSaveError(true);
      }
    },
    [key, routine, routineId, overview, dateLog, week, day]
  );

  const toggleDone = (exId, side, setIdx) => {
    if (!session) return;
    if (setIdx !== undefined) {
      const arr = [...(session.sets[exId]?.[side] || [false, false])];
      arr[setIdx] = !arr[setIdx];
      persist({ ...session, sets: { ...session.sets, [exId]: { ...session.sets[exId], [side]: arr } } });
      return;
    }
    const current = !!session.sets[exId]?.[side];
    persist({ ...session, sets: { ...session.sets, [exId]: { ...session.sets[exId], [side]: !current } } });
  };

  const setExerciseNote = (exId, side, value) => {
    if (!session) return;
    persist({
      ...session,
      exerciseNotes: { ...session.exerciseNotes, [exId]: { ...(session.exerciseNotes?.[exId] || {}), [side]: value } },
    });
  };

  const setNotes = (value) => {
    if (!session) return;
    persist({ ...session, notes: value });
  };

  const switchRoutine = (id) => {
    setRoutineId(id);
    setDayIdx(0);
  };

  const changeWeek = (delta) => {
    setWeek(Math.min(PIED_TOTAL_WEEKS, Math.max(1, week + delta)));
  };

  return (
    <div>
      {saveError && (
        <div
          style={{
            background: "rgba(198,85,59,0.14)",
            border: "1px solid #C6553B",
            color: "#E8A08F",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12.5,
            marginBottom: 12,
          }}
        >
          ⚠ Échec de la sauvegarde — vos dernières coches n'ont pas été enregistrées.
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {Object.entries(MOBMATIN_ROUTINES).map(([id, r]) => (
          <button
            key={id}
            className="routine-tab"
            onClick={() => switchRoutine(id)}
            style={{
              flex: 1,
              background: routineId === id ? "#3B5BDB" : "#1F2623",
              color: routineId === id ? "#F5F6FA" : "#B8BFB9",
              border: "none",
              borderRadius: 10,
              padding: "12px 14px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>{r.label}</div>
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1F2623",
          borderRadius: 10,
          padding: "10px 12px",
          marginBottom: 14,
        }}
      >
        <button
          onClick={() => changeWeek(-1)}
          disabled={week === 1}
          style={{ background: "transparent", border: "none", color: week === 1 ? "#4A524D" : "#EDE9DF", cursor: week === 1 ? "default" : "pointer", padding: 6 }}
          aria-label="Semaine précédente"
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div className="zen" style={{ fontWeight: 700, fontSize: 16 }}>
            Semaine {week}<span style={{ opacity: 0.5 }}> / {PIED_TOTAL_WEEKS}</span>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              marginTop: 2,
              padding: "2px 8px",
              borderRadius: 999,
              background: badge.deload ? "#2A3B2E" : "#26304A",
              color: badge.deload ? "#7FBF83" : "#8FA3E8",
            }}
          >
            {badge.deload ? <Snowflake size={12} /> : <Flame size={12} />}
            {badge.label} — {badge.sub}
          </div>
        </div>
        <button
          onClick={() => changeWeek(1)}
          disabled={week === PIED_TOTAL_WEEKS}
          style={{ background: "transparent", border: "none", color: week === PIED_TOTAL_WEEKS ? "#4A524D" : "#EDE9DF", cursor: week === PIED_TOTAL_WEEKS ? "default" : "pointer", padding: 6 }}
          aria-label="Semaine suivante"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {routine.days.map((d, i) => {
          const k = mobMatinKey(routineId, week, d);
          const done = overview[k];
          return (
            <button
              key={d}
              className="day-tab"
              onClick={() => setDayIdx(i)}
              style={{
                flex: 1,
                padding: "9px 6px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: dayIdx === i ? "#3B5BDB" : "#2A322D",
                background: dayIdx === i ? "rgba(59,91,219,0.12)" : "transparent",
                color: dayIdx === i ? "#EDE9DF" : "#8B9490",
                cursor: "pointer",
                fontSize: 13,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              {d}
              {done ? <Check size={12} color="#4C8C4A" /> : <Circle size={8} color="#4A524D" fill="#4A524D" />}
            </button>
          );
        })}
      </div>

      {loaded && session && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {routine.exercises.map((ex) => {
            const t = mobMatinExTarget(ex, week);
            return (
              <div key={ex.id} style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #C9A66B" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                  <div style={{ fontSize: 12, color: "#8B9490" }}>{targetLabel(ex, t)}</div>
                </div>

                {mobMatinSidesFor(ex).map(({ id: side, label: sideLabel }) => {
                  if (t.mode === "multiset") {
                    const arr = session.sets[ex.id]?.[side] || [false, false];
                    return (
                      <div key={side} style={{ marginBottom: 10 }}>
                        {sideLabel && (
                          <div style={{ fontSize: 11, color: "#8B9490", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                            {sideLabel}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 8 }}>
                          {t.sets.map((s, i) => {
                            const done = !!arr[i];
                            return (
                              <button
                                key={i}
                                className="set-check"
                                onClick={() => toggleDone(ex.id, side, i)}
                                style={{
                                  flex: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 6,
                                  padding: "10px 8px",
                                  borderRadius: 8,
                                  border: "1px solid",
                                  borderColor: done ? "#4C8C4A" : "#2A322D",
                                  background: done ? "rgba(76,140,74,0.14)" : "#161B19",
                                  color: done ? "#7FBF83" : "#B8BFB9",
                                  cursor: "pointer",
                                  fontSize: 12.5,
                                }}
                              >
                                {done ? <Check size={13} /> : <Circle size={13} />}
                                Set {i + 1} · {s.reps} reps @ {s.weight}kg
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  const done = !!session.sets[ex.id]?.[side];
                  return (
                    <div key={side} style={{ marginBottom: 10 }}>
                      {sideLabel && (
                        <div style={{ fontSize: 11, color: "#8B9490", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                          {sideLabel}
                        </div>
                      )}
                      <button
                        className="set-check"
                        onClick={() => toggleDone(ex.id, side)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "10px 8px",
                          borderRadius: 8,
                          border: "1px solid",
                          borderColor: done ? "#4C8C4A" : "#2A322D",
                          background: done ? "rgba(76,140,74,0.14)" : "#161B19",
                          color: done ? "#7FBF83" : "#B8BFB9",
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        {done ? <Check size={14} /> : <Circle size={14} />}
                        {targetLabel(ex, t)}
                      </button>
                    </div>
                  );
                })}

                <input
                  type="text"
                  value={session.exerciseNotes?.[ex.id]?.[ex.bilateral ? "both" : "droite"] ?? ""}
                  onChange={(e) => setExerciseNote(ex.id, ex.bilateral ? "both" : "droite", e.target.value)}
                  placeholder="Note sur cet exercice (optionnel)"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    background: "#161B19",
                    border: "1px solid #2A322D",
                    borderRadius: 8,
                    color: "#EDE9DF",
                    padding: "8px 10px",
                    fontSize: 12.5,
                    fontFamily: "inherit",
                  }}
                />
              </div>
            );
          })}

          <div style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px" }}>
            <label style={{ fontSize: 13, color: "#B8BFB9", display: "block", marginBottom: 6 }}>Notes de séance</label>
            <textarea
              value={session.notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ressenti, souplesse, ajustements..."
              rows={2}
              style={{ width: "100%", background: "#161B19", border: "1px solid #2A322D", borderRadius: 8, color: "#EDE9DF", padding: "10px", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}

      <RecapCalendar
        title="Récapitulatif — Mobilité matin"
        dateLog={dateLog}
        colors={{ A: "#4C8C4A", B: "#C9A66B" }}
        legend={[
          { color: "#4C8C4A", label: "Routine A" },
          { color: "#C9A66B", label: "Routine B" },
        ]}
      />
    </div>
  );
}



/* ============================== CARDIO DU MIDI (suivi semaine, calendrier 25 semaines partagé) ============================== */

// 6 séances par semaine, sans jour imposé : 4 en semaine (2 marche seule, 2 marche + corde)
// et 2 le week-end (corde seule). L'utilisateur choisit lui-même quel jour il les fait.
const CARDIO_DAYS = ["Sem. 1", "Sem. 2", "Sem. 3", "Sem. 4", "WE 1", "WE 2"];
const MARCHE_DAYS = ["Sem. 1", "Sem. 2", "Sem. 3", "Sem. 4"]; // les 4 séances de semaine incluent la marche
const CORDE_DAYS = ["Sem. 1", "Sem. 2", "Sem. 3", "Sem. 4", "WE 1", "WE 2"]; // corde disponible chaque séance, coché librement selon ce qui est fait

// Corde à sauter / Flow rope : 8 premières semaines fixes à 5 min chaque corde (10 min total),
// puis +1 min par corde toutes les 2 semaines (un jour sur deux)
function cordeTarget(week) {
  if (week <= 8) {
    return { perCorde: 5, total: 10 };
  }
  const block = Math.floor((week - 9) / 2);
  const perCorde = 6 + block;
  return { perCorde, total: perCorde * 2 };
}

function cardioKey(week, day) {
  return `session:cardio-w${week}-${day}`;
}

function emptyCardioSession() {
  return {
    marche: { done: false, minutes: "" },
    corde: { done: false, minutes: "" },
    muaythai: { done: false },
    notes: "",
  };
}

// Une séance compte comme faite dès qu'une activité prévue ce jour-là est renseignée.
function isCardioSessionComplete(sessionData) {
  if (!sessionData) return false;
  const marcheOk = sessionData.marche?.minutes !== "" && sessionData.marche?.minutes !== undefined;
  const cordeOk = !!sessionData.corde?.done;
  const mtOk = !!sessionData.muaythai?.done;
  return marcheOk || cordeOk || mtOk;
}

function CardioTab() {
  const [week, setWeek] = useState(1);
  const [dayIdx, setDayIdx] = useState(0);
  const [session, setSession] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [overview, setOverview] = useState({});
  const [saveError, setSaveError] = useState(false);
  const [dateLog, setDateLog] = useState({});

  const badge = piedWeekBadge(week);
  const day = CARDIO_DAYS[dayIdx];
  const key = cardioKey(week, day);
  const corde = cordeTarget(week);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const log = await loadDateLog("cardio");
      if (!cancelled) setDateLog(log);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      try {
        const res = await storageGetWithRetry(key);
        if (!cancelled) {
          setSession(res ? JSON.parse(res.value) : emptyCardioSession());
          setLoaded(true);
        }
      } catch (e) {
        if (!cancelled) {
          setSession(emptyCardioSession());
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await storageGetWithRetry("session:cardio-overview");
        if (!cancelled) setOverview(res ? JSON.parse(res.value) : {});
      } catch (e) {
        if (!cancelled) setOverview({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    async (next) => {
      setSession(next);
      try {
        const result = await storageSetWithRetry(key, JSON.stringify(next));
        if (result) {
          setSaveError(false);
          const nextOverview = { ...overview, [key]: isCardioSessionComplete(next) };
          setOverview(nextOverview);
          try {
            await storageSetWithRetry("session:cardio-overview", JSON.stringify(nextOverview));
          } catch (e) {
            // la vue d'ensemble peut échouer sans bloquer la sauvegarde de la séance elle-même
          }
          if (isCardioSessionComplete(next)) {
            const tag = next.muaythai?.done ? "muaythai" : next.corde?.done ? "corde" : "marche";
            const nextLog = await markDateLog("cardio", tag, dateLog);
            setDateLog(nextLog);
            saveHistoryEntry("cardio", {
              week,
              seance: day,
              marche: next.marche ?? null,
              corde: { ...(next.corde ?? {}), objectif: cordeTarget(week) },
              muaythai: next.muaythai ?? null,
              notes: next.notes || "",
            });
          }
        } else {
          setSaveError(true);
        }
      } catch (e) {
        setSaveError(true);
      }
    },
    [key, overview, dateLog, week, day]
  );

  const setMarcheMinutes = (value) => {
    if (!session) return;
    persist({ ...session, marche: { ...session.marche, minutes: value, done: value !== "" } });
  };

  const toggleCorde = () => {
    if (!session) return;
    persist({ ...session, corde: { ...session.corde, done: !session.corde.done } });
  };

  const toggleMuayThai = () => {
    if (!session) return;
    persist({ ...session, muaythai: { done: !session.muaythai?.done } });
  };

  const setCordeMinutes = (value) => {
    if (!session) return;
    persist({ ...session, corde: { ...session.corde, minutes: value } });
  };

  const setNotes = (value) => {
    if (!session) return;
    persist({ ...session, notes: value });
  };

  const changeWeek = (delta) => {
    setWeek(Math.min(PIED_TOTAL_WEEKS, Math.max(1, week + delta)));
  };

  return (
    <div>
      {saveError && (
        <div
          style={{
            background: "rgba(198,85,59,0.14)",
            border: "1px solid #C6553B",
            color: "#E8A08F",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12.5,
            marginBottom: 12,
          }}
        >
          ⚠ Échec de la sauvegarde — vos dernières coches n'ont pas été enregistrées.
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1F2623",
          borderRadius: 10,
          padding: "10px 12px",
          marginBottom: 14,
        }}
      >
        <button
          onClick={() => changeWeek(-1)}
          disabled={week === 1}
          style={{ background: "transparent", border: "none", color: week === 1 ? "#4A524D" : "#EDE9DF", cursor: week === 1 ? "default" : "pointer", padding: 6 }}
          aria-label="Semaine précédente"
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div className="zen" style={{ fontWeight: 700, fontSize: 16 }}>
            Semaine {week}<span style={{ opacity: 0.5 }}> / {PIED_TOTAL_WEEKS}</span>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              marginTop: 2,
              padding: "2px 8px",
              borderRadius: 999,
              background: badge.deload ? "#2A3B2E" : "#26304A",
              color: badge.deload ? "#7FBF83" : "#8FA3E8",
            }}
          >
            {badge.deload ? <Snowflake size={12} /> : <Flame size={12} />}
            {badge.label} — {badge.sub}
          </div>
        </div>
        <button
          onClick={() => changeWeek(1)}
          disabled={week === PIED_TOTAL_WEEKS}
          style={{ background: "transparent", border: "none", color: week === PIED_TOTAL_WEEKS ? "#4A524D" : "#EDE9DF", cursor: week === PIED_TOTAL_WEEKS ? "default" : "pointer", padding: 6 }}
          aria-label="Semaine suivante"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {CARDIO_DAYS.map((d, i) => {
          const k = cardioKey(week, d);
          const done = overview[k];
          return (
            <button
              key={d}
              className="day-tab"
              onClick={() => setDayIdx(i)}
              style={{
                flex: 1,
                padding: "9px 4px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: dayIdx === i ? "#3B5BDB" : "#2A322D",
                background: dayIdx === i ? "rgba(59,91,219,0.12)" : "transparent",
                color: dayIdx === i ? "#EDE9DF" : "#8B9490",
                cursor: "pointer",
                fontSize: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              {d.slice(0, 3)}
              {done ? <Check size={12} color="#4C8C4A" /> : <Circle size={8} color="#4A524D" fill="#4A524D" />}
            </button>
          );
        })}
      </div>

      {loaded && session && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Marche à pied — uniquement les 4 séances de semaine */}
          {MARCHE_DAYS.includes(day) && (
            <div style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #3B5BDB" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>Marche à pied</div>
                <div style={{ fontSize: 12, color: "#8B9490" }}>4 séances / semaine</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Durée (ex. 35 min)"
                  value={session.marche.minutes}
                  onChange={(e) => setMarcheMinutes(e.target.value)}
                  style={{
                    flex: 1,
                    background: "#161B19",
                    border: "1px solid #2A322D",
                    borderRadius: 8,
                    color: "#EDE9DF",
                    padding: "9px 10px",
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
          )}

          {/* Corde à sauter / Flow rope — 2 jours de semaine (avec marche) + les 2 jours de week-end (seule) */}
          {CORDE_DAYS.includes(day) ? (
            <div style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #C9A66B" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>Corde à sauter / Flow rope</div>
                <div style={{ fontSize: 12, color: "#8B9490" }}>Cochez si fait</div>
              </div>
              <div style={{ fontSize: 12, color: "#8B9490", marginBottom: 10 }}>
                Objectif : {corde.perCorde} min corde à sauter + {corde.perCorde} min flow rope = {corde.total} min total
              </div>
              <button
                className="set-check"
                onClick={toggleCorde}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 8px",
                  borderRadius: 8,
                  border: "1px solid",
                  borderColor: session.corde.done ? "#4C8C4A" : "#2A322D",
                  background: session.corde.done ? "rgba(76,140,74,0.14)" : "#161B19",
                  color: session.corde.done ? "#7FBF83" : "#B8BFB9",
                  cursor: "pointer",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                {session.corde.done ? <Check size={14} /> : <Circle size={14} />}
                Séance faite
              </button>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Minutes réalisées (optionnel)"
                value={session.corde.minutes}
                onChange={(e) => setCordeMinutes(e.target.value)}
                style={{
                  width: "100%",
                  background: "#161B19",
                  border: "1px solid #2A322D",
                }}
              />
            </div>
          ) : (
            <div style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #2A322D", color: "#8B9490", fontSize: 13 }}>
              Pas de corde sur cette séance — corde prévue sur Sem. 3, Sem. 4, WE 1 et WE 2.
            </div>
          )}

          {/* Boxe Muay Thaï — à cocher librement, en plus des séances prévues */}
          <div style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #C6553B" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>Boxe Muay Thaï 🥊</div>
              <div style={{ fontSize: 12, color: "#8B9490" }}>Libre</div>
            </div>
            <button
              className="set-check"
              onClick={toggleMuayThai}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 8px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: session.muaythai?.done ? "#4C8C4A" : "#2A322D",
                background: session.muaythai?.done ? "rgba(76,140,74,0.14)" : "#161B19",
                color: session.muaythai?.done ? "#7FBF83" : "#B8BFB9",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {session.muaythai?.done ? <Check size={14} /> : <Circle size={14} />}
              Séance effectuée
            </button>
          </div>

          <div style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px" }}>
            <label style={{ fontSize: 13, color: "#B8BFB9", display: "block", marginBottom: 6 }}>Notes</label>
            <textarea
              value={session.notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ressenti, parcours, ajustements..."
              rows={2}
              style={{ width: "100%", background: "#161B19", border: "1px solid #2A322D", borderRadius: 8, color: "#EDE9DF", padding: "10px", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}

      <RecapCalendar
        title="Récapitulatif — Cardio"
        dateLog={dateLog}
        colors={{ marche: "#3B5BDB", corde: "#C9A66B", muaythai: "#C6553B" }}
        legend={[
          { color: "#3B5BDB", label: "Marche" },
          { color: "#C9A66B", label: "Corde" },
          { color: "#C6553B", label: "Muay Thaï" },
        ]}
      />
    </div>
  );
}



/* ============================== ROUTINE MATINALE (méditation + respiration, suivi par date) ============================== */

function todayISODate() {
  return isoDateStr(new Date());
}

const MATINALE_EXERCISES = [
  { id: "meditation", name: "Méditation silencieuse", target: "5 min" },
  { id: "breathing", name: "Respiration", target: "10 respirations" },
];

function matinaleKey(date) {
  return `session:matinale-${date}`;
}

function emptyMatinaleSession() {
  const sets = {};
  MATINALE_EXERCISES.forEach((ex) => {
    sets[ex.id] = false;
  });
  return { sets, notes: "" };
}

function isMatinaleSessionComplete(sessionData) {
  if (!sessionData) return false;
  return MATINALE_EXERCISES.every((ex) => !!sessionData.sets?.[ex.id]);
}

function RoutineMatinaleTab() {
  const [date, setDate] = useState(todayISODate());
  const [session, setSession] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [dateLog, setDateLog] = useState({});

  const key = matinaleKey(date);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const log = await loadDateLog("matinale");
      if (!cancelled) setDateLog(log);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      try {
        const res = await storageGetWithRetry(key);
        if (!cancelled) {
          setSession(res ? JSON.parse(res.value) : emptyMatinaleSession());
          setLoaded(true);
        }
      } catch (e) {
        if (!cancelled) {
          setSession(emptyMatinaleSession());
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const persist = useCallback(
    async (next) => {
      setSession(next);
      try {
        const result = await storageSetWithRetry(key, JSON.stringify(next));
        setSaveError(!result);
        if (result && hasAnyInput(next)) {
          const both = MATINALE_EXERCISES.every((ex) => !!next.sets?.[ex.id]);
          const nextLog = { ...dateLog, [date]: both ? "complet" : "partiel" };
          setDateLog(nextLog);
          try {
            await storageSetWithRetry("session:datelog-matinale", JSON.stringify(nextLog));
          } catch (e) {
            // best effort
          }
          saveHistoryEntry("matinale", {
            date,
            exercises: MATINALE_EXERCISES.map((ex) => ({
              id: ex.id,
              name: ex.name,
              target: ex.target,
              fait: !!next.sets?.[ex.id],
            })),
            notes: next.notes || "",
          });
        }
      } catch (e) {
        setSaveError(true);
      }
    },
    [key, date, dateLog]
  );

  const toggle = (exId) => {
    if (!session) return;
    persist({ ...session, sets: { ...session.sets, [exId]: !session.sets[exId] } });
  };

  const setNotes = (value) => {
    if (!session) return;
    persist({ ...session, notes: value });
  };

  return (
    <div>
      {saveError && (
        <div
          style={{
            background: "rgba(198,85,59,0.14)",
            border: "1px solid #C6553B",
            color: "#E8A08F",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12.5,
            marginBottom: 12,
          }}
        >
          ⚠ Échec de la sauvegarde — vos dernières coches n'ont pas été enregistrées.
        </div>
      )}

      {loaded && session && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MATINALE_EXERCISES.map((ex) => {
            const done = !!session.sets[ex.id];
            return (
              <div key={ex.id} style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #C9A66B" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                  <div style={{ fontSize: 12, color: "#8B9490" }}>{ex.target}</div>
                </div>
                <button
                  className="set-check"
                  onClick={() => toggle(ex.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "10px 8px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: done ? "#4C8C4A" : "#2A322D",
                    background: done ? "rgba(76,140,74,0.14)" : "#161B19",
                    color: done ? "#7FBF83" : "#B8BFB9",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {done ? <Check size={14} /> : <Circle size={14} />}
                  Fait
                </button>
              </div>
            );
          })}

          <div style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px" }}>
            <label style={{ fontSize: 13, color: "#B8BFB9", display: "block", marginBottom: 6 }}>Notes</label>
            <textarea
              value={session.notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ressenti, durée réelle, ajustements..."
              rows={2}
              style={{ width: "100%", background: "#161B19", border: "1px solid #2A322D", borderRadius: 8, color: "#EDE9DF", padding: "10px", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}

      <RecapCalendar
        title="Récapitulatif — Routine matinale"
        dateLog={dateLog}
        colors={{ complet: "#4C8C4A", partiel: "#C9A66B" }}
        legend={[
          { color: "#4C8C4A", label: "Complet" },
          { color: "#C9A66B", label: "Partiel" },
        ]}
      />
    </div>
  );
}

/* ============================== ÉTIREMENTS COMPLÉMENTAIRES (suivi par date, fixe 2×30s) ============================== */

const COMPLEMENT_STRETCHES = [
  { id: "pecstretchgenoux", name: "Prayer stretch", bilateral: true, sets: 2, target: 30 },
  { id: "couchstretch", name: "Couch stretch", bilateral: false, sets: 2, target: 30 },
  { id: "pigeon", name: "Pigeon stretch", bilateral: false, sets: 2, target: 30 },
  { id: "pancake", name: "Pancake stretch", bilateral: true, sets: 2, target: 30 },
  { id: "shoulderext", name: "Shoulder extension", bilateral: true, sets: 2, target: 30 },
];

function complementSidesFor(ex) {
  return ex.bilateral ? BOTH : SIDES;
}

function complementKey(date) {
  return `session:complement-${date}`;
}

function emptyComplementSession() {
  const sets = {};
  COMPLEMENT_STRETCHES.forEach((ex) => {
    const sideState = {};
    complementSidesFor(ex).forEach(({ id: side }) => {
      sideState[side] = Array(ex.sets).fill(false);
    });
    sets[ex.id] = sideState;
  });
  return { sets, notes: "" };
}

function isComplementSessionComplete(sessionData) {
  if (!sessionData) return false;
  return COMPLEMENT_STRETCHES.every((ex) =>
    complementSidesFor(ex).every(({ id: side }) => {
      const vals = sessionData.sets?.[ex.id]?.[side] || [];
      return vals.length >= ex.sets && vals.slice(0, ex.sets).every(Boolean);
    })
  );
}

function ComplementStretchesTab() {
  const [date, setDate] = useState(todayISODate());
  const [session, setSession] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [dateLog, setDateLog] = useState({});

  const key = complementKey(date);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const log = await loadDateLog("complement");
      if (!cancelled) setDateLog(log);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      try {
        const res = await storageGetWithRetry(key);
        if (!cancelled) {
          setSession(res ? JSON.parse(res.value) : emptyComplementSession());
          setLoaded(true);
        }
      } catch (e) {
        if (!cancelled) {
          setSession(emptyComplementSession());
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const persist = useCallback(
    async (next) => {
      setSession(next);
      try {
        const result = await storageSetWithRetry(key, JSON.stringify(next));
        setSaveError(!result);
        if (result && hasAnyInput(next)) {
          const complete = isComplementSessionComplete(next);
          const nextLog = { ...dateLog, [date]: complete ? "complet" : "partiel" };
          setDateLog(nextLog);
          try {
            await storageSetWithRetry("session:datelog-complement", JSON.stringify(nextLog));
          } catch (e) {
            // best effort
          }
          saveHistoryEntry("complement", {
            date,
            exercises: COMPLEMENT_STRETCHES.map((ex) => ({
              id: ex.id,
              name: ex.name,
              target: `${ex.sets} × ${ex.target}s`,
              saisi: next.sets?.[ex.id] ?? null,
            })),
            notes: next.notes || "",
          });
        }
      } catch (e) {
        setSaveError(true);
      }
    },
    [key, date, dateLog]
  );

  const toggleSet = (exId, side, i) => {
    if (!session) return;
    const arr = [...(session.sets[exId]?.[side] || [])];
    arr[i] = !arr[i];
    persist({ ...session, sets: { ...session.sets, [exId]: { ...session.sets[exId], [side]: arr } } });
  };

  const setNotes = (value) => {
    if (!session) return;
    persist({ ...session, notes: value });
  };

  return (
    <div>
      {saveError && (
        <div
          style={{
            background: "rgba(198,85,59,0.14)",
            border: "1px solid #C6553B",
            color: "#E8A08F",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12.5,
            marginBottom: 12,
          }}
        >
          ⚠ Échec de la sauvegarde — vos dernières coches n'ont pas été enregistrées.
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1F2623",
          borderRadius: 10,
          padding: "10px 12px",
          marginBottom: 20,
          gap: 10,
        }}
      >
        <label style={{ fontSize: 13, color: "#B8BFB9" }}>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            background: "#161B19",
            border: "1px solid #2A322D",
            borderRadius: 8,
            color: "#EDE9DF",
            padding: "7px 10px",
            fontSize: 13,
          }}
        />
      </div>

      {loaded && session && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {COMPLEMENT_STRETCHES.map((ex) => (
            <div key={ex.id} style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #C9A66B" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <div className="zen" style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                <div style={{ fontSize: 12, color: "#8B9490" }}>{ex.sets} × {ex.target} sec</div>
              </div>

              {complementSidesFor(ex).map(({ id: side, label: sideLabel }) => {
                const vals = session.sets[ex.id]?.[side] || [];
                return (
                  <div key={side} style={{ marginBottom: 10 }}>
                    {sideLabel && (
                      <div style={{ fontSize: 11, color: "#8B9490", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                        {sideLabel}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Array.from({ length: ex.sets }).map((_, i) => {
                        const done = !!vals[i];
                        return (
                          <button
                            key={i}
                            className="set-check"
                            onClick={() => toggleSet(ex.id, side, i)}
                            style={{
                              flex: "1 1 0",
                              minWidth: 64,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              padding: "10px 8px",
                              borderRadius: 8,
                              border: "1px solid",
                              borderColor: done ? "#4C8C4A" : "#2A322D",
                              background: done ? "rgba(76,140,74,0.14)" : "#161B19",
                              color: done ? "#7FBF83" : "#B8BFB9",
                              cursor: "pointer",
                              fontSize: 13,
                            }}
                          >
                            {done ? <Check size={14} /> : <Circle size={14} />}
                            Set {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <div style={{ background: "#1F2623", borderRadius: 10, padding: "14px 16px" }}>
            <label style={{ fontSize: 13, color: "#B8BFB9", display: "block", marginBottom: 6 }}>Notes</label>
            <textarea
              value={session.notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ressenti, souplesse, ajustements..."
              rows={2}
              style={{ width: "100%", background: "#161B19", border: "1px solid #2A322D", borderRadius: 8, color: "#EDE9DF", padding: "10px", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}

      <RecapCalendar
        title="Récapitulatif — Étirements complémentaires"
        dateLog={dateLog}
        colors={{ complet: "#4C8C4A", partiel: "#C9A66B" }}
        legend={[
          { color: "#4C8C4A", label: "Complet" },
          { color: "#C9A66B", label: "Partiel" },
        ]}
      />
    </div>
  );
}

/* ============================== APP — 6 onglets ============================== */

const TABS = [
  { id: "matinale", label: "Réveil", icon: Wind },
  { id: "mobmatin", label: "Mob. matin", icon: Sunrise },
  { id: "muscu", label: "Muscu", icon: Dumbbell },
  { id: "complement", label: "Étirements", icon: Feather },
  { id: "pied", label: "Pied", icon: Activity },
  { id: "mobsoir", label: "Mob. soir", icon: Moon },
  { id: "cardio", label: "Cardio", icon: Heart },
];

export default function App() {
  const [tab, setTab] = useState("muscu");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#161B19",
        color: "#EDE9DF",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        .zen { font-family: 'Zen Kaku Gothic New', sans-serif; }
        .tracker-root input[type="number"]::-webkit-inner-spin-button,
        .tracker-root input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .tracker-root input[type="number"] { -moz-appearance: textfield; }
        .set-check { transition: all 0.15s ease; }
        .set-check:active { transform: scale(0.94); }
        .day-tab { transition: all 0.15s ease; }
        .day-tab:focus-visible, .set-check:focus-visible, .routine-tab:focus-visible, .main-tab:focus-visible {
          outline: 2px solid #3B5BDB; outline-offset: 2px;
        }
      `}</style>

      <div className="tracker-root" style={{ maxWidth: 640, margin: "0 auto", padding: "20px 20px 90px" }}>
        <div style={{ marginBottom: 20 }}>
          <div className="zen" style={{ fontSize: 13, letterSpacing: "0.02em", color: "#8B9490", marginBottom: 4 }}>
            Suivi d'entraînement
          </div>
          <h1 className="zen" style={{ fontSize: 26, fontWeight: 900, margin: 0, lineHeight: 1.15 }}>
            {TABS.find((t) => t.id === tab).label === "Muscu" ? "Musculation" : TABS.find((t) => t.id === tab).label}
          </h1>
        </div>

        {tab === "muscu" && <MuscuTab />}
        {tab === "pied" && <PiedTab />}
        {tab === "mobmatin" && <MobMatinTab />}
        {tab === "matinale" && <RoutineMatinaleTab />}
        {tab === "mobsoir" && <MobSoirTab />}
        {tab === "cardio" && <CardioTab />}
        {tab === "complement" && <ComplementStretchesTab />}
      </div>

      {/* Bottom tab bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#1C2321",
          borderTop: "1px solid #2A322D",
          display: "flex",
          padding: "8px 10px calc(8px + env(safe-area-inset-bottom))",
          gap: 4,
        }}
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              className="main-tab"
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: active ? "#3B5BDB" : "#8B9490",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "6px 2px",
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              <span style={{ fontSize: 10.5 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
