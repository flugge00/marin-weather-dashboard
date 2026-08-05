import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = join(__dirname, 'icon-source.svg')
const outDir = join(__dirname, '..', 'public')

const targets = [
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'maskable-icon-512x512.png', size: 512, padded: true },
]

for (const { file, size, padded } of targets) {
  const image = sharp(src).resize(size, size)
  if (padded) {
    const inner = Math.round(size * 0.8)
    await sharp(src)
      .resize(inner, inner)
      .extend({
        top: Math.round((size - inner) / 2),
        bottom: Math.round((size - inner) / 2),
        left: Math.round((size - inner) / 2),
        right: Math.round((size - inner) / 2),
        background: '#0b0e14',
      })
      .png()
      .toFile(join(outDir, file))
  } else {
    await image.png().toFile(join(outDir, file))
  }
  console.log(`wrote ${file}`)
}
