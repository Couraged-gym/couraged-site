import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { GYM, LEGAL } from '../data/gym.js'

function Page({ title, updated, children }) {
  return (
    <main className="min-h-dvh bg-mist px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 text-ink">
      <article className="mx-auto max-w-2xl">
        <Link to="/" className="inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-smoke hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden="true" /> {GYM.name}
        </Link>
        <h1 className="mt-6 font-display text-5xl font-black uppercase leading-[0.9]">{title}</h1>
        <p className="mt-3 text-sm text-smoke">Last updated {updated}</p>
        <div className="legal mt-8 space-y-6 leading-relaxed text-pretty">{children}</div>
      </article>
    </main>
  )
}

const H = ({ children }) => <h2 className="pt-2 font-display text-2xl font-extrabold uppercase">{children}</h2>

export function Privacy() {
  const dpo = LEGAL.dpo
  return (
    <Page title="Privacy notice" updated={LEGAL.privacyUpdated}>
      <p>
        {LEGAL.owner} (“CourageD”, “we”) runs {GYM.name} at {GYM.address}. This notice explains what personal data we collect through this website and at the front
        desk, why, and your rights under the Data Privacy Act of 2012 (Republic Act No. 10173).
      </p>

      <H>What we collect</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>Account: your email address and a password (stored only as a one-way hash by our sign-in provider; we can never see it).</li>
        <li>Membership: your full name, mobile number, gym code, plans bought, start and end dates.</li>
        <li>Visits: the date and time you check in with your QR code.</li>
        <li>Payments: what you paid, how (cash, GCash or card), and a payment reference. We never receive or store your card number.</li>
        <li>Age: that you are 18 or older, or that a parent or guardian agrees to your membership.</li>
        <li>Lifts, if you log them: exercise, weight, reps, date and any note. Only you can see them; our staff cannot.</li>
        <li>Friends, if you add any: who you are friends with, and the two sharing choices below.</li>
      </ul>

      <H>Friends and what they see</H>
      <p>
        Friends are other members you add with their friend code, and who accept. A friend sees only your first name and last initial. Two switches on your
        pass, both off until you turn them on, decide anything more: <strong>Share my visits</strong> shows friends whether you trained today and the date of your
        last visit; <strong>Share my lifts</strong> puts your best sets on their leaderboard. You can turn either off, or remove a friend, at any time, and it
        takes effect straight away. Someone who sends you a request learns nothing about you unless you accept.
      </p>

      <H>Why, and on what basis</H>
      <p>
        To create and run your membership, let you into the gym, record payments and issue receipts, and contact you about your membership, including a reminder email before your plan ends (you can turn these off on your pass). Lifts and friends are optional extras you choose to use; you can delete them with your account. The basis is the
        contract you enter when you join (Sec. 12(b), RA 10173) and our legal duty to keep tax records (Sec. 12(c)). We ask for your consent when you set up your
        pass. We do not sell your data or use it for advertising.
      </p>

      <H>Who else handles it</H>
      <p>
        Our staff (except your lifts, which they cannot see), friends you accept (only what is described above), and these service providers acting on our instructions: Supabase (database and sign-in, servers outside the Philippines), our email
        provider (account emails), and PayMongo (online payments, once offered). Each is bound to protect your data. Data stored abroad stays under our
        responsibility under the Data Privacy Act. We share data with government agencies only when the law requires it.
      </p>

      <H>How long we keep it</H>
      <p>
        Your account stays while you are a member. You can delete it yourself from your pass at any time. When you do, we delete your sign-in account and stop using your details for anything else, but keep
        membership and payment records for as long as Philippine tax and accounting rules require, then delete them.
      </p>

      <H>How we protect it</H>
      <p>
        Encrypted connections (HTTPS), row-level access rules so each member sees only their own pass, staff access by role, and logs of changes. Your QR code
        is a random code that reveals nothing about you; you can replace it from your pass at any time. If a breach puts your data at real risk, we will tell
        you and the National Privacy Commission within 72 hours of finding out.
      </p>

      <H>Your rights</H>
      <p>
        You can ask to be informed, to see your data, to correct it, to object to processing, to have it deleted or blocked, to get a copy (data portability),
        and to be compensated for damage. Members under 18 need a parent or guardian to agree for them.
      </p>

      <H>Contact us</H>
      <p>
        Our Data Protection Officer: <a className="font-semibold underline underline-offset-4" href={`mailto:${dpo.email}`}>{dpo.email}</a>, {GYM.phone}. If
        you are not satisfied with our answer, you can complain to the National Privacy Commission (privacy.gov.ph).
      </p>
    </Page>
  )
}

export function Terms() {
  return (
    <Page title="Terms of use" updated={LEGAL.termsUpdated}>
      <p>These terms cover your CourageD account and pass. By creating an account you agree to them and to our <Link className="font-semibold underline underline-offset-4" to="/privacy">privacy notice</Link>.</p>
      <H>Your account and pass</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>One account per person. Your QR pass is for you only: letting someone else use it can end your membership.</li>
        <li>Keep your password private. If you think someone else has your pass, make a new QR code from your pass page and tell the front desk.</li>
        <li>Give us your real name and a mobile number we can reach you on.</li>
      </ul>
      <H>Plans and prices</H>
      <p>
        Prices are shown in Philippine pesos and set by the gym; the price at the time you pay applies. A plan starts on the day you pay, or the day after your
        current plan ends if you renew early. {LEGAL.refunds}
      </p>
      <H>At the gym</H>
      <p>Follow staff instructions and the house rules posted at the gym. Train within your limits and tell a coach about any health condition before you start.</p>
      <H>Changes</H>
      <p>We may update these terms; the date above shows the latest version. For questions, contact the front desk at {GYM.phone}.</p>
    </Page>
  )
}
