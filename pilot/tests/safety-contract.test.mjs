import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const fromRoot = (path) => readFileSync(fileURLToPath(new URL("../" + path, import.meta.url)), "utf8")

test("pilot is configured as an independent Vite + React + TS app", () => {
  const pkg = JSON.parse(fromRoot("package.json"))
  assert.ok(pkg.dependencies["react"])
  assert.ok(pkg.dependencies["radix-ui"])
  assert.ok(pkg.devDependencies["@tailwindcss/vite"])
  assert.match(fromRoot("vite.config.ts"), /tailwindcss\(\)/)
  assert.match(fromRoot("components.json"), /"style": "new-york"/)
})

test("settings production state cannot be mutated by pilot repository", () => {
  const code = fromRoot("src/lib/settings-repository.ts")
  assert.match(code, /export const LEGACY_KEY/)
  assert.match(code, /export const PILOT_KEY/)
  assert.doesNotMatch(code, /setItem\(LEGACY_KEY/)
  assert.doesNotMatch(code, /removeItem\(LEGACY_KEY/)
  assert.match(code, /setItem\(PILOT_KEY/)
  assert.match(code, /removeItem\(PILOT_KEY/)
})

test("real shadcn/ui source components are present", () => {
  for (const path of ["button", "card", "switch", "select", "dialog"]) {
    assert.match(fromRoot("src/components/ui/" + path + ".tsx"), /data-slot=/)
  }
})

test("pilot settings controls use accessible Radix primitives and no fake production actions", () => {
  const screen = fromRoot("src/features/settings/SettingsScreen.tsx")
  assert.match(screen, /<Select /)
  assert.match(screen, /<Switch /)
  assert.match(screen, /<Dialog>/)
  assert.match(screen, /aria-label="Sesli bildirimler"/)
  assert.match(screen, /Pilotun bu aşamasında etkin değil/)
})
