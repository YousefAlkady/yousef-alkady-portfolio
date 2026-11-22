// Beats live in Supabase storage bucket "beats": every audio file there is a track (upload = publish).
// Titles are always "Track #1", "Track #2"… in play order (file names and table titles are not shown).
// Optional table public.beats adds genre/bpm/cover/sort per file, or hides one (published = false).
// Plain REST, no client library; the env vars are the public publishable key, safe in the browser.
export type Beat = { id: string; title: string; genre: string | null; bpm: number | null; audio_path: string; cover_path: string | null };
type Row = Partial<Beat> & { audio_path: string; sort?: number; published?: boolean };

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const H = { apikey: KEY ?? "", Authorization: `Bearer ${KEY}` };
const AUDIO = /\.(mp3|wav|flac|aac|m4a)$/i;

export const beatsReady = Boolean(URL_ && KEY);
export const fileUrl = (path: string) => `${URL_}/storage/v1/object/public/beats/${path.split("/").map(encodeURIComponent).join("/")}`;

export async function loadBeats(): Promise<Beat[]> {
  if (!beatsReady) return [];
  const [files, rows] = await Promise.all([
    fetch(`${URL_}/storage/v1/object/list/beats`, {
      method: "POST", headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: 200, sortBy: { column: "created_at", order: "desc" } }),
    }).then((r) => (r.ok ? r.json() : [])) as Promise<{ id: string; name: string }[]>,
    fetch(`${URL_}/rest/v1/beats?select=*`, { headers: H }).then((r) => (r.ok ? r.json() : [])).catch(() => []) as Promise<Row[]>,
  ]);
  const extra = new Map(rows.map((r) => [r.audio_path, r]));
  return files
    .filter((f) => f.id && AUDIO.test(f.name) && extra.get(f.name)?.published !== false)
    .map((f, n) => {
      const r = extra.get(f.name);
      return {
        beat: { id: f.id, title: "", genre: r?.genre ?? null, bpm: r?.bpm ?? null, audio_path: f.name, cover_path: r?.cover_path ?? null },
        sort: r?.sort ?? 0, n,
      };
    })
    .sort((a, b) => a.sort - b.sort || a.n - b.n)
    .map((x, k) => ({ ...x.beat, title: `Track #${k + 1}` })); // Yousef (2026-11-18): every beat shows as "Track #n", in play order
}
