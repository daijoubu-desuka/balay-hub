// Demo faces for seeded accounts (stock portraits). Real uploads replace them.
const P = (g: 'men' | 'women', n: number) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`
export const DEMO_FACES: Record<string, string> = {
  'u-client': P('men', 52), 'u-agent': P('women', 44), 'u-admin': P('women', 12),
  'seed-leo': P('men', 32), 'seed-jon': P('men', 75), 'seed-dan': P('men', 46), 'seed-carlo': P('men', 22)
}

// Face for any user id: their profile photo, else an agent's 2x2 photo, else the demo portrait, else '' (initials)
export function useFace() {
  const profiles = useProfileStore()
  const creds = useCredentialStore()
  return (id?: string) => (id ? profiles.of(id).photo || creds.of(id)?.photoUrl || DEMO_FACES[id] || '' : '')
}

// Shrinks an uploaded image to a small JPEG data URL so it fits in localStorage (PDFs give '').
export function toThumb(file: File | null, max = 480): Promise<string> {
  if (!file || !file.type.startsWith('image/')) return Promise.resolve('')
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve('') }
    img.src = url
  })
}
