import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { AMENITIES, COACHES, FAQ, GYM } from './src/data/gym.js'

// Search data built from src/data/gym.js, so hours and FAQs are edited in one place:
// JSON-LD for Google, plain HTML inside #root for crawlers and AI bots that don't run JS
// (React replaces it on load), and /llms.txt for AI assistants.
const ampm = (t) => {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const week = [1, 2, 3, 4, 5, 6, 0].map((d) => GYM.hours[d])
const intro = `${GYM.name} is an air-conditioned gym in Talamban, Cebu City offering strength training, cardio and personal fitness coaching. Open since ${GYM.about.founded}, with ${GYM.about.members} members.`

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ExerciseGym',
      '@id': GYM.url + '/#gym',
      name: GYM.name,
      description: intro,
      url: GYM.url,
      logo: GYM.url + '/assets/icon-512.png',
      image: ['gym-dumbbells', 'gym-cardio', 'gym-training', 'gym-smith'].map((f) => `${GYM.url}/assets/${f}.jpg`),
      telephone: GYM.phoneHref.replace('tel:', ''),
      email: GYM.email,
      foundingDate: GYM.about.founded,
      address: { '@type': 'PostalAddress', streetAddress: GYM.street, addressLocality: GYM.city, addressRegion: 'Cebu', postalCode: GYM.postalCode, addressCountry: 'PH' },
      areaServed: ['Talamban', 'Cebu City'],
      hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(GYM.mapsQuery)}`,
      sameAs: [GYM.facebook],
      openingHoursSpecification: GYM.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.day, opens: h.open, closes: h.close })),
      amenityFeature: AMENITIES.map((a) => ({ '@type': 'LocationFeatureSpecification', name: a, value: true })),
      employee: COACHES.map((c) => ({ '@type': 'Person', name: c.name, jobTitle: c.role })),
      knowsAbout: ['Gym', 'Fitness', 'Strength training', 'Fitness coaching', 'Personal training', 'Cardio'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ],
}

const snapshot = `<main style="max-width:40rem;margin:0 auto;padding:2rem 1rem;font-family:system-ui,sans-serif;color:#f4f1ea;background:#19171B">
      <h1>${esc(GYM.name)}: gym and fitness coaching in Talamban, Cebu City</h1>
      <p>${esc(intro)}</p>
      <h2>Hours</h2>
      <ul>${week.map((h) => `<li>${h.day}: ${ampm(h.open)} to ${ampm(h.close)}</li>`).join('')}</ul>
      <h2>Location</h2>
      <p>${esc(GYM.address)}. Phone <a href="${GYM.phoneHref}">${esc(GYM.phone)}</a>. <a href="${GYM.facebook}">Facebook</a>.</p>
      <h2>Coaches</h2>
      <ul>${COACHES.map((c) => `<li>${esc(c.name)}, ${esc(c.role)}</li>`).join('')}</ul>
      <h2>Questions</h2>
      ${FAQ.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}
    </main>`

const llms = `# ${GYM.name}

> ${intro}

Website: ${GYM.url}

## Hours
${week.map((h) => `- ${h.day}: ${ampm(h.open)} to ${ampm(h.close)}`).join('\n')}

## Location and contact
- Address: ${GYM.address}
- Phone: ${GYM.phone}
- Email: ${GYM.email}
- Facebook: ${GYM.facebook}

## Coaches
${COACHES.map((c) => `- ${c.name}, ${c.role}`).join('\n')}

## Included with every visit
${AMENITIES.map((a) => `- ${a}`).join('\n')}

## Membership and prices
Day passes and monthly plans, with student, senior and PWD prices. Current prices: ${GYM.url}/#membership

## FAQ
${FAQ.map(([q, a]) => `### ${q}\n${a}`).join('\n\n')}
`

const seo = {
  name: 'gym-seo',
  transformIndexHtml: (html) =>
    html
      .replace('<!--json-ld-->', `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`)
      .replace('<div id="root"></div>', `<div id="root">\n    ${snapshot}\n    </div>`),
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'llms.txt', source: llms })
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seo],
})
