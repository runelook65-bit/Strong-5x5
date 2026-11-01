/**
 * Settings pilot storage boundary: production workout state is READ ONLY.
 */
export const LEGACY_KEY = "arm_5x5_app_state_v1"
export const PILOT_KEY = "arm_5x5_shadcn_settings_pilot_v1"

export const REST_OPTIONS = [0, 90, 120, 150, 180] as const
export type RestSeconds = (typeof REST_OPTIONS)[number]

export type PilotSettings = {
  soundEnabled: boolean
  restSeconds: RestSeconds
}

export type LegacySummary = {
  present: boolean
  sessions: number
}

type StorageReader = Pick<Storage, "getItem">
type StorageWriter = Pick<Storage, "setItem" | "removeItem">

const DEFAULT_SETTINGS: PilotSettings = {
  soundEnabled: true,
  restSeconds: 0,
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function parseStored(reader: StorageReader, key: string): Record<string, unknown> | null {
  try {
    const raw = reader.getItem(key)
    return raw === null ? null : objectValue(JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

function normalize(source: Record<string, unknown> | null, fallback: PilotSettings): PilotSettings {
  const soundEnabled = typeof source?.soundEnabled === "boolean"
    ? source.soundEnabled : fallback.soundEnabled
  const rest = source?.restSeconds ?? source?.v7RestSeconds
  const restSeconds = typeof rest === "number" && REST_OPTIONS.includes(rest as RestSeconds)
    ? rest as RestSeconds : fallback.restSeconds
  return { soundEnabled, restSeconds }
}

export function readLegacySummary(reader: StorageReader): LegacySummary {
  const raw = parseStored(reader, LEGACY_KEY)
  return {
    present: raw !== null,
    sessions: Array.isArray(raw?.workoutLogs) ? raw.workoutLogs.length : 0,
  }
}

export function loadPilotSettings(reader: StorageReader): PilotSettings {
  const legacy = normalize(parseStored(reader, LEGACY_KEY), DEFAULT_SETTINGS)
  return normalize(parseStored(reader, PILOT_KEY), legacy)
}

export function savePilotSettings(writer: StorageWriter, next: PilotSettings): boolean {
  const valid = normalize(objectValue(next), DEFAULT_SETTINGS)
  try {
    writer.setItem(PILOT_KEY, JSON.stringify(valid))
    return true
  } catch {
    return false
  }
}

export function resetPilotSettings(writer: StorageWriter): boolean {
  try {
    writer.removeItem(PILOT_KEY)
    return true
  } catch {
    return false
  }
}
