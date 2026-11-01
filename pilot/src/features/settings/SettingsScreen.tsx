import * as React from "react"
import {
  BellRing,
  ChevronRight,
  Database,
  Dumbbell,
  RotateCcw,
  ShieldCheck,
  Timer,
  Weight,
  Wrench,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  loadPilotSettings,
  readLegacySummary,
  resetPilotSettings,
  savePilotSettings,
  type PilotSettings,
  type RestSeconds,
} from "@/lib/settings-repository"

function getStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function initialSettings(): PilotSettings {
  const storage = getStorage()
  return storage ? loadPilotSettings(storage) : { soundEnabled: true, restSeconds: 0 }
}

const timingOptions: Array<{ value: RestSeconds; label: string }> = [
  { value: 0, label: "Harekete göre" },
  { value: 90, label: "90 saniye" },
  { value: 120, label: "120 saniye" },
  { value: 150, label: "150 saniye" },
  { value: 180, label: "180 saniye" },
]

function SettingRow({
  children,
  icon: Icon,
  name,
  detail,
}: {
  children: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  name: string
  detail?: string
}) {
  return (
    <div className="flex min-h-16 items-center gap-3 py-3">
      <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{name}</p>
        {detail && <p className="mt-1 text-xs leading-snug text-muted-foreground">{detail}</p>}
      </div>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  )
}

export function SettingsScreen() {
  const [settings, setSettings] = React.useState<PilotSettings>(initialSettings)
  const [message, setMessage] = React.useState("")
  const storage = getStorage()
  const legacy = storage ? readLegacySummary(storage) : { present: false, sessions: 0 }

  function changeSettings(next: PilotSettings) {
    setSettings(next)
    const saved = storage ? savePilotSettings(storage, next) : false
    setMessage(saved ? "Pilot tercihi kaydedildi." : "Tercih bu oturumda güncellendi; kalıcı kayıt kullanılamıyor.")
  }

  function resetSettings() {
    const cleared = storage ? resetPilotSettings(storage) : false
    setSettings(initialSettings())
    setMessage(cleared ? "Pilot ayarları sıfırlandı; eski kayıtlar değişmedi." : "Kalıcı depolamaya erişilemiyor.")
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-[550px] border-x border-border bg-background pb-[max(2.5rem,env(safe-area-inset-bottom))] text-foreground">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary"><Dumbbell className="size-5" /></span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight">ARM 5×5</p>
            <p className="text-xs text-muted-foreground">React + shadcn/ui</p>
          </div>
        </div>
        <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">PILOT · v0.9</span>
      </header>

      <div className="space-y-5 px-4 pb-8 pt-6 sm:px-5">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">KİŞİSEL ANTRENMAN</p>
          <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Gerçek shadcn/ui bileşenleriyle hazırlanan izole tasarım denemesi.
          </p>
        </div>

        <div role="note" className="flex gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <p>Bu pilot yalnızca kendi tercihlerini kaydeder. Mevcut ARM 5×5 antrenman verilerini <strong className="text-foreground">değiştirmez</strong>.</p>
        </div>

        <Card className="gap-0 py-0">
          <CardHeader className="gap-1 border-b border-border px-4 py-4">
            <CardTitle className="text-base">Antrenman tercihleri</CardTitle>
            <CardDescription className="text-xs">Günlük kullanım kontrolleri</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border px-4">
            <SettingRow icon={Timer} name="Dinlenme süresi" detail="Setler arasındaki varsayılan mola">
              <Select value={String(settings.restSeconds)} onValueChange={(value) => changeSettings({ ...settings, restSeconds: Number(value) as RestSeconds })}>
                <SelectTrigger aria-label="Dinlenme süresi" className="h-11 w-[135px] max-w-[40vw] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timingOptions.map((item) => <SelectItem value={String(item.value)} key={item.value}>{item.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow icon={BellRing} name="Sesli bildirim" detail="Set ve mola bildirim tercihi">
              <label className="flex min-h-11 min-w-11 cursor-pointer items-center justify-end" htmlFor="pilotSound">
                <Switch id="pilotSound" aria-label="Sesli bildirimler" checked={settings.soundEnabled} onCheckedChange={(checked) => changeSettings({ ...settings, soundEnabled: checked })} />
              </label>
            </SettingRow>
            <SettingRow icon={Weight} name="Ölçü birimi" detail="Antrenman ağırlıkları">
              <span className="rounded-lg border border-border px-3 py-2 text-xs font-semibold">kg</span>
            </SettingRow>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="gap-1 border-b border-border px-4 py-4">
            <CardTitle className="text-base">Araçlar</CardTitle>
            <CardDescription className="text-xs">Mevcut uygulamadan sonraki aşamada taşınacak</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border px-4">
            <SettingRow icon={Wrench} name="Plaka hesaplayıcı" detail="Pilotun bu aşamasında etkin değil">
              <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground/50" />
            </SettingRow>
            <SettingRow icon={Dumbbell} name="1RM hesaplayıcı" detail="Pilotun bu aşamasında etkin değil">
              <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground/50" />
            </SettingRow>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="gap-1 border-b border-border px-4 py-4">
            <CardTitle className="text-base">Veri güvenliği</CardTitle>
            <CardDescription className="text-xs">Mevcut kayıtlarla güvenli uyumluluk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4">
            <div className="flex items-start gap-3 pt-4">
              <Database aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Mevcut antrenman kayıtları</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {legacy.present
                    ? String(legacy.sessions) + " kayıtlı seans bu tarayıcı kökeninde bulundu. Yalnızca okundu."
                    : "Bu tarayıcı kökeninde mevcut uygulama verisi bulunamadı. Başka alan adındaki kayıtlar okunamaz."}
                </p>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-11 w-full" type="button" variant="outline"><RotateCcw className="size-4" /> Pilot ayarlarını sıfırla</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pilot tercihlerini sıfırla?</DialogTitle>
                  <DialogDescription>Yalnızca bu pilot için saklanan ses ve dinlenme süresi tercihleri temizlenir. ARM 5×5 antrenman kayıtları etkilenmez.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild><Button className="h-11" variant="outline">Vazgeç</Button></DialogClose>
                  <DialogClose asChild><Button className="h-11" onClick={resetSettings}>Pilot ayarlarını sıfırla</Button></DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {message && <p role="status" aria-live="polite" className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">{message}</p>}
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">Bağımsız geliştirme prototipi · Üretim sürümü değildir</p>
      </div>
    </main>
  )
}
