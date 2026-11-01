import test from "node:test"
import assert from "node:assert/strict"
import {
  LEGACY_KEY, PILOT_KEY, loadPilotSettings, readLegacySummary,
  savePilotSettings, resetPilotSettings,
} from "../src/lib/settings-repository.ts"

function storage(initial = {}) {
  const contents = new Map(Object.entries(initial))
  const writes = []
  return {
    contents, writes,
    getItem: (key) => contents.get(key) ?? null,
    setItem(key, value) { writes.push(key); contents.set(key, value) },
    removeItem(key) { writes.push(key); contents.delete(key) },
  }
}

test("fresh pilot uses legacy-compatible defaults without writing to production state", () => {
  const s = storage()
  assert.deepEqual(loadPilotSettings(s), { soundEnabled: true, restSeconds: 0 })
  assert.deepEqual(s.writes, [])
  assert.deepEqual(readLegacySummary(s), { present: false, sessions: 0 })
})

test("reads legacy settings and sessions without changing the legacy key", () => {
  const original = JSON.stringify({ soundEnabled: false, v7RestSeconds: 120, workoutLogs: [{ id: "a" }] })
  const s = storage({ [LEGACY_KEY]: original })
  assert.deepEqual(loadPilotSettings(s), { soundEnabled: false, restSeconds: 120 })
  assert.deepEqual(readLegacySummary(s), { present: true, sessions: 1 })
  assert.equal(s.contents.get(LEGACY_KEY), original)
  assert.deepEqual(s.writes, [])
})

test("pilot writes to its own key only", () => {
  const original = JSON.stringify({ workoutLogs: [{ id: "w1_d0" }] })
  const s = storage({ [LEGACY_KEY]: original })
  assert.equal(savePilotSettings(s, { soundEnabled: false, restSeconds: 180 }), true)
  assert.deepEqual(loadPilotSettings(s), { soundEnabled: false, restSeconds: 180 })
  assert.deepEqual(s.writes, [PILOT_KEY])
  assert.equal(s.contents.get(LEGACY_KEY), original)
})

test("corrupted and invalid settings never crash or override safe defaults", () => {
  const s = storage({
    [LEGACY_KEY]: "{ broken",
    [PILOT_KEY]: JSON.stringify({ restSeconds: 111, soundEnabled: "not a bool" }),
  })
  assert.deepEqual(loadPilotSettings(s), { soundEnabled: true, restSeconds: 0 })
  assert.deepEqual(readLegacySummary(s), { present: false, sessions: 0 })
})

test("reset removes only pilot data and restores read-only legacy preference", () => {
  const original = JSON.stringify({ soundEnabled: false, v7RestSeconds: 150 })
  const s = storage({ [LEGACY_KEY]: original })
  savePilotSettings(s, { soundEnabled: true, restSeconds: 90 })
  assert.equal(resetPilotSettings(s), true)
  assert.deepEqual(loadPilotSettings(s), { soundEnabled: false, restSeconds: 150 })
  assert.equal(s.contents.get(LEGACY_KEY), original)
  assert.deepEqual(s.writes, [PILOT_KEY, PILOT_KEY])
})

test("denied browser storage is handled safely", () => {
  const blocked = { getItem() { throw Error("blocked") }, setItem() { throw Error("blocked") }, removeItem() { throw Error("blocked") } }
  assert.deepEqual(loadPilotSettings(blocked), { soundEnabled: true, restSeconds: 0 })
  assert.equal(savePilotSettings(blocked, { soundEnabled: true, restSeconds: 0 }), false)
  assert.equal(resetPilotSettings(blocked), false)
})
