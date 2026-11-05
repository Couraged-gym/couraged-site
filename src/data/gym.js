// Everything the client may want to edit lives here. The build also turns it into the
// search data in index.html (JSON-LD, crawlable text) and /llms.txt, see vite.config.js.

export const GYM = {
  name: 'CourageD Fitness Hub',
  address: '3rd Floor CRD Bldg., Miñoza St., Talamban, Cebu City 6000',
  street: '3rd Floor CRD Bldg., Miñoza St., Talamban',
  city: 'Cebu City',
  postalCode: '6000',
  url: 'https://couragedph.com',
  mapsQuery: 'CRD Bldg Miñoza St Talamban Cebu City',
  phone: '0933 816 9412',
  phoneHref: 'tel:+639338169412',
  email: 'couragedph@gmail.com',
  facebook: 'https://www.facebook.com/couragedfitnesshub',
  // Day 0 = Sunday. Times in 24h "HH:MM".
  hours: [
    { day: 'Sunday', open: '06:00', close: '12:00' },
    { day: 'Monday', open: '06:30', close: '21:30' },
    { day: 'Tuesday', open: '06:30', close: '21:30' },
    { day: 'Wednesday', open: '06:30', close: '21:30' },
    { day: 'Thursday', open: '06:30', close: '21:30' },
    { day: 'Friday', open: '06:30', close: '21:30' },
    { day: 'Saturday', open: '06:30', close: '21:30' },
  ],
  about: {
    text: 'A neighbourhood gym in Talamban, Cebu City for strength, fitness and coaching. Free weights, machines and cardio under one air-conditioned roof, with coaches who know your name.',
    founded: '2024',
    members: '600+',
  },
}

// Legal pages. The owner must fill in the DPO before launch (see README › Launch checklist).
export const LEGAL = {
  owner: 'CourageD Fitness Hub', // registered business name on the DTI/SEC certificate
  dpo: { email: 'couragedph@gmail.com' },
  privacyUpdated: 'November 5, 2026',
  termsUpdated: 'November 4, 2026',
  refunds: "If you can't use a plan you paid for, talk to the front desk; refunds are handled case by case and as the law requires.",
}

// Prices are not here: the website reads them live from the POS (Members › Plans).

export const COACHES = [
  {
    name: 'Coach Art',
    role: 'Head Coach',
    photo: null, // drop a file in public/assets/ and set e.g. '/assets/coach-art.jpg'
    focus: ['Strength & powerlifting', 'Program design', 'Form clinics'],
  },
  {
    name: 'Coach Karl',
    role: 'Coach',
    photo: null,
    focus: ['Fat loss & conditioning', 'Circuit training', 'Beginner onboarding'],
  },
  {
    name: 'Coach Wilmer',
    role: 'Coach',
    photo: null,
    focus: ['Hypertrophy', 'Mobility', 'Personal training'],
  },
]

// Shown on the home page and published as FAQ data for search and AI answers. Keep answers factual.
export const FAQ = [
  ['Where is CourageD Fitness Hub?', `On the 3rd floor of the CRD Building, Miñoza St., Talamban, Cebu City. There is parking on site.`],
  ['What are the gym hours?', 'Monday to Saturday 6:30 AM to 9:30 PM, and Sunday 6:00 AM to 12:00 noon.'],
  ['Do you offer fitness coaching?', 'Yes. Head Coach Art and Coaches Karl and Wilmer coach on the gym floor. Message us on Facebook or call 0933 816 9412 to train with a coach.'],
  ['Can I walk in without a membership?', 'Yes. Buy a day pass at the front desk. Members pay a lower day-pass rate, and monthly plans are listed under Membership.'],
  ['Is there a student discount?', 'Yes. Students, seniors and PWD get a discounted price with a valid ID at the front desk.'],
  ["What's included with a visit?", 'Air-conditioning, free Wi-Fi, free drinking water, a free locker and shower, and parking.'],
  ['How long has CourageD been open?', 'Since 2024, and over 600 members have trained with us.'],
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
