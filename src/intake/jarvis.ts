/**
 * Jarvis voice-intake for Foundry.
 *
 * Flow: the user dictates tasks / schedule items to Jarvis. Jarvis replies with a
 * magic link of the form:
 *
 *   https://foundry0.vercel.app/#jarvis=<base64url(JSON payload)>
 *
 * When the app boots it calls `consumeJarvisHash()` (wired in src/main.tsx before
 * React renders). If a #jarvis= hash is present it is decoded, merged into the
 * same `weekPlan:<weekStart>` localStorage records the app itself uses, and the
 * hash is cleared so a refresh never double-applies.
 *
 * Payload shape:
 *   {
 *     "nonce": "uuid — guards against double-tap duplicates",
 *     "tasks":  [{ "title": "Buy milk", "day": "today" | "tomorrow" | "week" | "2026-09-24" | "friday" }],
 *     "events": [{ "title": "Dentist", "time": "3:00 PM", "day": "today" | "tomorrow" | "2026-09-24" | "friday" }]
 *   }
 *
 * - `day: "week"` on a task appends to the current week's WEEKLY TODOS.
 * - Events always land on a concrete day (default: today); `"week"` falls back to today.
 * - Times accept "3pm", "15:00", "3:00 PM", etc. and are normalized to "h:mm AM/PM".
 */

import { generateId } from '../utils/ids';
import { today, getWeekStart } from '../utils/dates';
import type { WeekPlan, DayPlan, DayTask, DayEvent, WeeklyTodo } from '../hooks/useWeeklyPlan';

export const JARVIS_HASH_PREFIX = '#jarvis=';

const CONSUMED_NONCES_KEY = 'jarvis:intake:consumed';
const MAX_CONSUMED_NONCES = 50;

/** Minimal storage surface so the core logic is testable without a browser. */
export interface IntakeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface IntakeTaskInput {
  title: string;
  day?: string;
}

export interface IntakeEventInput {
  title: string;
  time?: string;
  day?: string;
}

export interface IntakePayload {
  nonce?: string;
  tasks?: IntakeTaskInput[];
  events?: IntakeEventInput[];
}

export interface IntakeResult {
  tasksAdded: number;
  eventsAdded: number;
  skipped: number;
  duplicate: boolean;
  error?: string;
}

/* ------------------------------------------------------------------ */
/* Day resolution                                                      */
/* ------------------------------------------------------------------ */

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return toLocalDateStr(dt);
}

type ResolvedDay = { kind: 'week' } | { kind: 'date'; date: string } | { kind: 'invalid' };

export function resolveDay(rawDay: string | undefined): ResolvedDay {
  const day = (rawDay || 'today').trim().toLowerCase();
  if (day === 'week') return { kind: 'week' };
  if (day === 'today') return { kind: 'date', date: today() };
  if (day === 'tomorrow' || day === 'tmr' || day === 'tmrw') {
    return { kind: 'date', date: addDays(today(), 1) };
  }
  const weekdayIdx = WEEKDAY_NAMES.indexOf(day);
  if (weekdayIdx >= 0) {
    const now = new Date();
    const delta = (weekdayIdx - now.getDay() + 7) % 7; // next occurrence, today if it matches
    return { kind: 'date', date: addDays(today(), delta) };
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const [y, m, d] = day.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d) {
      return { kind: 'date', date: day };
    }
  }
  return { kind: 'invalid' };
}

/* ------------------------------------------------------------------ */
/* Time normalization + event sorting (mirrors useWeeklyPlan)          */
/* ------------------------------------------------------------------ */

function parseTimeToMinutes(timeStr: string): number {
  const normalized = timeStr.trim().toLowerCase();
  const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3];
  if (meridiem === 'pm' && hours !== 12) hours += 12;
  else if (meridiem === 'am' && hours === 12) hours = 0;
  else if (!meridiem && hours === 24) hours = 0;
  if (hours > 23 || minutes > 59) return 0;
  return hours * 60 + minutes;
}

export function normalizeTime(raw: string | undefined): string {
  const text = (raw || '').trim();
  if (!text) return '';
  const normalized = text.toLowerCase();
  const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!match) return text; // keep the user's text rather than dropping the event
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3];
  if (!meridiem && (hours > 23 || minutes > 59)) return text;
  if (meridiem === 'pm' && hours !== 12) hours += 12;
  else if (meridiem === 'am' && hours === 12) hours = 0;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function sortEventsByTime(events: DayEvent[]): DayEvent[] {
  return [...events].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
}

/* ------------------------------------------------------------------ */
/* Week-plan loading (same record shape the app itself uses)           */
/* ------------------------------------------------------------------ */

function emptyWeekPlan(weekStart: string): WeekPlan {
  // Mirrors the empty-plan construction in useWeeklyPlan exactly.
  const days: DayPlan[] = Array(7)
    .fill(null)
    .map((_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        events: [],
        tasks: [],
      };
    });
  return { weekStart, days, weeklyHabits: [], weeklyTodos: [] };
}

function loadWeekPlan(storage: IntakeStorage, weekStart: string): WeekPlan {
  const key = `weekPlan:${weekStart}`;
  try {
    const stored = storage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored) as WeekPlan;
      if (parsed && Array.isArray(parsed.days) && parsed.days.length === 7) return parsed;
    }
  } catch {
    // fall through to a fresh plan
  }
  const fresh = emptyWeekPlan(weekStart);
  storage.setItem(key, JSON.stringify(fresh));
  return fresh;
}

/* ------------------------------------------------------------------ */
/* Idempotency: a tapped-twice link must not duplicate items            */
/* ------------------------------------------------------------------ */

function readConsumedNonces(storage: IntakeStorage): string[] {
  try {
    const raw = storage.getItem(CONSUMED_NONCES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

function markNonceConsumed(storage: IntakeStorage, nonce: string): void {
  const nonces = readConsumedNonces(storage);
  nonces.push(nonce);
  storage.setItem(CONSUMED_NONCES_KEY, JSON.stringify(nonces.slice(-MAX_CONSUMED_NONCES)));
}

/* ------------------------------------------------------------------ */
/* Core: merge a payload into localStorage                              */
/* ------------------------------------------------------------------ */

export function applyIntake(payload: IntakePayload, storage: IntakeStorage): IntakeResult {
  const result: IntakeResult = { tasksAdded: 0, eventsAdded: 0, skipped: 0, duplicate: false };

  if (!payload || typeof payload !== 'object') {
    result.error = 'Empty intake payload.';
    return result;
  }

  if (payload.nonce) {
    if (readConsumedNonces(storage).includes(payload.nonce)) {
      result.duplicate = true;
      return result;
    }
  }

  // Cache week plans touched by this payload so each is read/written once.
  const planCache = new Map<string, WeekPlan>();
  const getPlan = (weekStart: string): WeekPlan => {
    let plan = planCache.get(weekStart);
    if (!plan) {
      plan = loadWeekPlan(storage, weekStart);
      planCache.set(weekStart, plan);
    }
    return plan;
  };

  const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];
  for (const item of tasks) {
    const title = typeof item?.title === 'string' ? item.title.trim() : '';
    if (!title) {
      result.skipped += 1;
      continue;
    }
    const resolved = resolveDay(item.day);
    if (resolved.kind === 'invalid') {
      result.skipped += 1;
      continue;
    }
    if (resolved.kind === 'week') {
      const plan = getPlan(getWeekStart(today()));
      const todo: WeeklyTodo = { id: generateId(), title, completed: false };
      plan.weeklyTodos = [...(plan.weeklyTodos || []), todo];
      result.tasksAdded += 1;
      continue;
    }
    const plan = getPlan(getWeekStart(resolved.date));
    const day = plan.days.find((d) => d.date === resolved.date);
    if (!day) {
      result.skipped += 1;
      continue;
    }
    const task: DayTask = { id: generateId(), title, completed: false, order: day.tasks.length };
    day.tasks = [...day.tasks, task];
    result.tasksAdded += 1;
  }

  const events = Array.isArray(payload.events) ? payload.events : [];
  for (const item of events) {
    const title = typeof item?.title === 'string' ? item.title.trim() : '';
    if (!title) {
      result.skipped += 1;
      continue;
    }
    const resolved = resolveDay(item.day);
    // Events need a concrete day; "week" falls back to today.
    const date =
      resolved.kind === 'date' ? resolved.date : resolved.kind === 'week' ? today() : null;
    if (!date) {
      result.skipped += 1;
      continue;
    }
    const plan = getPlan(getWeekStart(date));
    const day = plan.days.find((d) => d.date === date);
    if (!day) {
      result.skipped += 1;
      continue;
    }
    const event: DayEvent = { id: generateId(), time: normalizeTime(item.time), title };
    day.events = sortEventsByTime([...day.events, event]);
    result.eventsAdded += 1;
  }

  for (const [weekStart, plan] of planCache) {
    storage.setItem(`weekPlan:${weekStart}`, JSON.stringify(plan));
  }

  if (payload.nonce) markNonceConsumed(storage, payload.nonce);
  return result;
}

/* ------------------------------------------------------------------ */
/* Hash decoding                                                       */
/* ------------------------------------------------------------------ */

function base64UrlDecode(input: string): string {
  let b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeIntakePayload(payload: IntakePayload): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeIntakePayload(hash: string): IntakePayload {
  const raw = hash.startsWith(JARVIS_HASH_PREFIX) ? hash.slice(JARVIS_HASH_PREFIX.length) : hash;
  let json: string | null = null;
  try {
    json = base64UrlDecode(raw);
    JSON.parse(json); // validate before falling back
  } catch {
    json = null;
  }
  if (json === null) {
    // Fallback: raw URI-encoded JSON.
    json = decodeURIComponent(raw);
  }
  const payload = JSON.parse(json) as IntakePayload;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Intake payload must be a JSON object.');
  }
  return payload;
}

/**
 * Call once at boot (before React renders). Returns null when there is no
 * intake hash. Always clears the hash afterwards.
 */
export function consumeJarvisHash(): IntakeResult | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash.startsWith(JARVIS_HASH_PREFIX)) return null;

  let result: IntakeResult;
  try {
    const payload = decodeIntakePayload(hash);
    result = applyIntake(payload, window.localStorage);
  } catch {
    result = {
      tasksAdded: 0,
      eventsAdded: 0,
      skipped: 0,
      duplicate: false,
      error: 'Could not read that Jarvis link.',
    };
  }

  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  return result;
}

/* ------------------------------------------------------------------ */
/* Confirmation toast (plain DOM, matches the HUD aesthetic)            */
/* ------------------------------------------------------------------ */

export function showIntakeToast(result: IntakeResult): void {
  if (typeof document === 'undefined') return;
  if (result.duplicate) return;
  const total = result.tasksAdded + result.eventsAdded;
  if (total === 0 && !result.error) return;

  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  const ok = !result.error;
  el.style.cssText = [
    'position:fixed',
    'left:50%',
    'bottom:28px',
    'transform:translateX(-50%)',
    'z-index:99999',
    'padding:10px 18px',
    'border-radius:10px',
    `border:1px solid ${ok ? 'rgba(120,255,180,0.35)' : 'rgba(255,120,120,0.4)'}`,
    `background:${ok ? 'rgba(10,25,16,0.92)' : 'rgba(30,10,10,0.92)'}`,
    `color:${ok ? '#b8ffd2' : '#ffc9c9'}`,
    'font-family:monospace',
    'font-size:12px',
    'letter-spacing:0.06em',
    'box-shadow:0 8px 32px rgba(0,0,0,0.6)',
    'backdrop-filter:blur(8px)',
    'pointer-events:none',
    'opacity:0',
    'transition:opacity 300ms ease-out',
  ].join(';');

  if (result.error) {
    el.textContent = `JARVIS INTAKE — ${result.error}`;
  } else {
    const parts: string[] = [];
    if (result.tasksAdded) parts.push(`${result.tasksAdded} task${result.tasksAdded === 1 ? '' : 's'}`);
    if (result.eventsAdded) parts.push(`${result.eventsAdded} event${result.eventsAdded === 1 ? '' : 's'}`);
    el.textContent = `JARVIS INTAKE — added ${parts.join(' + ')}`;
  }

  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
  });
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 350);
  }, 4500);
}
