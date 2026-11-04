// Everything the client may want to edit lives here.
// Entries marked `placeholder: true` are sample content and render with a "Sample" tag.

export const GYM = {
  name: 'CourageD Fitness Hub',
  address: '3rd Floor CRD Bldg., Miñoza St., Talamban, Cebu City 6000',
  mapsQuery: 'CRD Bldg Miñoza St Talamban Cebu City',
  phone: '0933 816 9412',
  phoneHref: 'tel:+639338169412',
  email: 'couragedph@gmail.com',
  facebook: 'https://www.facebook.com/couragedfitnesshub',
  // Day 0 = Sunday. Times in 24h "HH:MM".
  hours: [
    { day: 'Sunday', open: '06:30', close: '12:00' },
    { day: 'Monday', open: '06:30', close: '21:00' },
    { day: 'Tuesday', open: '06:30', close: '21:00' },
    { day: 'Wednesday', open: '06:30', close: '21:00' },
    { day: 'Thursday', open: '06:30', close: '21:00' },
    { day: 'Friday', open: '06:30', close: '21:00' },
    { day: 'Saturday', open: '06:30', close: '21:00' },
  ],
  about: {
    placeholder: true,
    text: 'A neighbourhood strength and conditioning gym on Miñoza St. Free weights, machines and cardio under one air-conditioned roof, with coaches who know your name.',
    founded: '2019',
    members: '300+',
  },
}

// Legal pages. The owner must fill in the DPO before launch (see README › Launch checklist).
export const LEGAL = {
  owner: 'CourageD Fitness Hub', // registered business name on the DTI/SEC certificate
  dpo: { email: 'couragedph@gmail.com' },
  privacyUpdated: 'November 4, 2026',
  termsUpdated: 'November 4, 2026',
  refunds: "If you can't use a plan you paid for, talk to the front desk; refunds are handled case by case and as the law requires.",
}

// Prices are not here: the website reads them live from the POS (Members › Plans).

export const COACHES = [
  {
    name: 'Coach Art',
    role: 'Head Coach',
    photo: null, // drop a file in public/assets/ and set e.g. '/assets/coach-art.jpg'
    placeholder: true,
    focus: ['Strength & powerlifting', 'Program design', 'Form clinics'],
  },
  {
    name: 'Coach Karl',
    role: 'Coach',
    photo: null,
    placeholder: true,
    focus: ['Fat loss & conditioning', 'Circuit training', 'Beginner onboarding'],
  },
  {
    name: 'Coach Wilmer',
    role: 'Coach',
    photo: null,
    placeholder: true,
    focus: ['Hypertrophy', 'Mobility', 'Personal training'],
  },
]

export const AMENITIES = ['Parking', 'Free Wi-Fi', 'Air-conditioned', 'Free water', 'Free locker & shower']

export const peso = (n) => '₱' + Math.round(n).toLocaleString('en-PH')

// Returns { open: boolean, label } for the given Date against GYM.hours.
export function openStatus(now = new Date()) {
  const h = GYM.hours[now.getDay()]
  const mins = now.getHours() * 60 + now.getMinutes()
  const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3)
  const fmt = (t) =>
    new Date(2000, 0, 1, +t.slice(0, 2), +t.slice(3)).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })
  if (mins >= toMin(h.open) && mins < toMin(h.close)) return { open: true, label: `Open now · until ${fmt(h.close)}` }
  const next = mins < toMin(h.open) ? h : GYM.hours[(now.getDay() + 1) % 7]
  return { open: false, label: `Closed · opens ${mins < toMin(h.open) ? '' : next.day + ' '}${fmt(next.open)}` }
}
