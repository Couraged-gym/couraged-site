# CourageD Fitness Hub: PayMongo online payments, legal and regulatory audit

**Prepared:** 2026-11-04 · **Scope:** small Philippine gym (Talamban, Cebu City; assumed DTI-registered sole proprietorship, under 250 employees) selling memberships on its own website through PayMongo hosted Checkout, with member accounts (name, email, phone, possibly photo) and a QR code for door check-in, with data hosted on Supabase outside the Philippines.

> **This is research, not legal or tax advice.** It summarises primary sources where I could reach them and secondary sources (law-firm alerts, news) where I could not. Anything marked **UNVERIFIED** could not be confirmed against a primary source. Before launch, have a Philippine lawyer and a BIR-accredited accountant confirm the items in [What a lawyer/accountant should confirm](#what-a-ph-lawyer--accountant-should-confirm).

---

## Bottom line

- **PayMongo is properly licensed.** I confirmed both entities on the BSP's own registers: **PayMongo Philippines, Inc.** is a BSP-registered Operator of Payment System (OPS), registration no. **OPSCOR-2020-0067**, issued 17 Apr 2020 (BSP OPS list as of 28 Aug 2026). **PayMongo Payments Inc** is a BSP-supervised Electronic Money Issuer, non-bank (BSP EMI list as of 31 May 2026). That licensing covers PayMongo. It does not license the gym, which needs no BSP licence just to *accept* payments. I found no public BSP enforcement action against PayMongo.
- **Biggest practical blocker: PayMongo new sign-ups are paused right now.** The signup page, homepage and Terms all say "New sign-ups are on pause while we upgrade," with no reopening date (checked 2026-11-04). Have a fallback ready (another BSP-registered gateway such as Xendit, Maya Business or HitPay) or join the waitlist.
- **What PayMongo needs from a sole proprietor:** DTI Business Name certificate, BIR Form 2303, the owner's government ID (1 primary or 2 secondary), and a payout bank account in the business or proprietor name. The website must be live and complete, with prices in PHP, a Philippine address that matches the documents, Terms & Conditions, a Privacy Policy, a Return & Refund Policy, and contact details. PayMongo does not list a mayor's permit, but Cebu City still requires one to operate. QR Ph is on automatically. GCash and Maya take about 3–7 business days to enable, cards 5–10. Manual risk review can take up to 14 business days.
- **Fees (paymongo.com/pricing, VAT-exclusive):** QR Ph 1.34%, GCash 2.23%, Maya 1.79%, local cards 3.125% + ₱13.39, international cards 4.02% + ₱13.39, payouts ₱10 each. No setup or monthly fee for basic processing. PayMongo's own pages give two different Maya rates, so confirm in the dashboard.
- **Tax: two live items for the next 60 days.**
  1. PayMongo already withholds **0.5% of gross remittances** (RR 16-2023 as amended by RR 5-2025, reaffirmed by RMC 55-2026). The gym can avoid it with a sworn declaration plus its 2303, as long as total gateway and marketplace remittances stay at or under ₱500,000 a year. Withheld amounts are creditable through Form 2307.
  2. **Mandatory e-invoicing (RMC 98-2026)** applies by **31 Dec 2026** to "Small" taxpayers and above (₱3M or more in gross sales) that are engaged in e-commerce. **Micro taxpayers (under ₱3M) are exempt.** Either way, the gym must issue its **own BIR-registered invoice** for every sale (EOPT/RR 7-2024; "Official Receipt" is no longer the primary document). PayMongo's payment email is not a BIR invoice.
- **Data privacy:** the gym is a Personal Information Controller under RA 10173. It needs a privacy notice, a designated DPO, security measures, a written processor agreement with Supabase (and PayMongo where relevant), and a breach plan: notify NPC and affected members **within 72 hours**, with a full report within 5 days. NPC registration is mandatory only at 250+ employees, **sensitive** personal information of 1,000+ individuals, or automated decision-making/profiling. Birthdates and health or waiver answers count as sensitive, so a growing gym can cross the 1,000 line. Below the threshold, file a notarised Sworn Declaration and Undertaking instead. Members under 18 need parental or guardian consent.
- **Internet Transactions Act (RA 11967):** selling on its own site makes the gym an **"e-retailer."** It must show its trade name, physical address, phone and email on the homepage, issue invoices for all sales, keep a complaints process, and protect data under RA 10173. The DTI E-Commerce Trustmark is **voluntary until 31 Dec 2026**, and DTI has said it will review the policy by then. There is no statutory cooling-off period, but the Consumer Act bars deceptive or unfair terms and **voids clauses that exempt a service provider from liability for defective services** (Art. 106). That limits what an online injury waiver can do.
- **Card data and PCI:** with PayMongo **hosted Checkout (full redirect)**, the gym's servers never see card numbers. The gym is in the lightest PCI DSS scope (SAQ A-type). It still needs HTTPS, a trusted redirect, verification of the webhook signature (`X-Paymongo-Signature`, HMAC-SHA256), membership activation only on the verified webhook, secret keys kept off the client, and MFA on the PayMongo dashboard.

---

## Checklist

| Item | Required? | Who does it | Source |
|---|---|---|---|
| DTI Business Name registration (sole prop) | Yes (PayMongo KYB, and to operate under a trade name) | Owner | PayMongo Philippine Entities doc (upd. 2026-05-07) |
| BIR registration, Form 2303 COR, books of accounts; "online/e-commerce" activity on the registration | Yes | Owner + accountant | PayMongo docs; RMC 60-2020 (via Grant Thornton/Juan.tax) |
| Cebu City Mayor's/Business Permit + barangay clearance (plus fire/sanitary as the LGU requires) | Yes to operate (PayMongo does not list it) | Owner | Local Government Code / Cebu City BPLO. Specifics **UNVERIFIED** |
| Owner government ID: 1 primary or 2 secondary; liveness/face match | Yes (PayMongo KYC) | Owner | PayMongo KYC Accepted IDs (upd. 2026-09-03); Account setup (upd. 2026-08-27) |
| Payout bank account in business/proprietor name | Yes | Owner | PayMongo Account setup; PayMongo FAQ |
| PayMongo account signup | Yes, but **sign-ups currently paused** | Owner | dashboard.paymongo.com/signup (checked 2026-11-04) |
| Website live, not placeholder, publicly accessible | Yes (PayMongo) | Developer | PayMongo Website Guidelines (upd. 2026-05-18) |
| Prices in PHP on site | Yes (PayMongo; Consumer Act Art. 81/83; RA 11967 Sec 23(a)) | Developer/owner | PayMongo Website Guidelines; RA 7394; RA 11967 |
| Homepage disclosure: trade name, physical PH address, mobile/landline, email | Yes (RA 11967 Sec 23(f); PayMongo) | Developer/owner | RA 11967 (lawphil) |
| Terms & Conditions page | Yes (PayMongo) | Owner (lawyer review) | PayMongo Website Guidelines |
| Return & Refund Policy page (clear membership cancellation/refund/freeze rules) | Yes (PayMongo; Consumer Act fairness) | Owner (lawyer review) | PayMongo Website Guidelines; RA 7394 Arts. 50, 52 |
| Privacy Policy / privacy notice (DPA Sec 16 contents) | Yes | Owner + DPO | RA 10173 Secs 11, 16; NPC Circular 2023-04 |
| Consent capture at signup (separate, unbundled; parental consent for under-18) | Yes where consent is the basis (photo, marketing, health data) | Developer + DPO | RA 10173 Secs 12–13; NPC Circular 2023-04 |
| Designate a Data Protection Officer | Yes (all PICs) | Owner | RA 10173 Sec 21; IRR Sec 26 |
| NPC registration (NPCRS), **or** notarised Sworn Declaration & Undertaking if below threshold | Register if 250+ staff, 1,000+ individuals' sensitive PI, or automated decision-making; else SDAU | Owner/DPO | NPC Circular 2022-04 Sec 5 (via secondary sources) |
| Processor/outsourcing agreement with Supabase (sign its DPA); pick nearest region (e.g. Singapore) | Yes (accountability for transfers) | Owner + developer | RA 10173 Sec 21; NPC Advisory 2024-01 (MCCs voluntary); Supabase DPA |
| Security measures (RLS, encryption, access control, MFA, backups) | Yes | Developer | RA 10173 Sec 20 |
| Breach response plan: NPC + data-subject notice within 72 h, full report within 5 days; via DBNMS | Yes | DPO | NPC Circular 16-03; NPC Advisory 2026-02 |
| Annual Security Incident Report (2025 period due 10 Nov 2026, even if zero) | Yes for covered PICs/PIPs. Whether it applies to a non-registered micro gym is **UNVERIFIED** | DPO | NPC Advisory 2026-03 (via Quisumbing Torres) |
| Retention schedule + deletion of lapsed members' data | Yes | DPO + developer | RA 10173 Sec 11(e) |
| BIR-registered invoice for every sale (manual ATP invoices, or registered e-invoice/CAS) | Yes | Owner + accountant | RA 11976 (EOPT); RR 7-2024 as amended by RR 11-2024 |
| Mandatory e-invoicing (PTI, EIS certification) by 31 Dec 2026 | Only if Small or bigger (₱3M+ gross sales) and engaged in e-commerce; Micro exempt | Accountant | RMC 98-2026 (BIR, 2026-09-22) |
| Sworn declaration to PayMongo to avoid 0.5% withholding (if ≤ ₱500k remittances/yr) | Optional; otherwise 0.5% withheld | Owner + accountant | PayMongo Taxes doc (upd. 2026-06-24); RR 16-2023; RR 5-2025 |
| Tax info (TIN, classification, VAT status) in PayMongo settings | Yes (or payouts may be affected) | Owner | PayMongo Troubleshooting doc (upd. 2026-10-26) |
| Claim withheld tax via Form 2307 in ITR | Yes if withheld | Accountant | PayMongo Taxes doc |
| E-Commerce Philippine Trustmark | Voluntary until 31 Dec 2026; watch for 2027 change | Owner | DTI (2025-09); Philstar/BusinessWorld (2025-12) |
| Complaint-handling process published | Yes | Owner | RA 11967 Sec 23(i) |
| Webhook signature verification; activate only on verified `checkout_session.payment.paid` | Yes (security; PayMongo best practice) | Developer | PayMongo Best practices (upd. 2026-05-07); Hosted Checkout (upd. 2026-10-30) |
| Never collect/store card data; use hosted redirect; HTTPS; MFA on dashboard | Yes | Developer | PayMongo Best practices; PCI DSS v4.0.1 SAQ A |
| Annual PCI SAQ (if PayMongo or acquirer asks) | Possibly; scope is minimal with redirect | Owner/developer | PayMongo Best practices ("maintain your own SAQ") |
| No card surcharge / "convenience fee" by payment method | Recommended (likely prohibited) | Owner | **UNVERIFIED** (commentary only) |
| Liability waiver / assumption-of-risk + health declaration at signup | Recommended; cannot waive Consumer Act liability for defective service or Civil Code fraud/gross negligence | Owner (lawyer drafts) | RA 7394 Arts. 99, 106; Civil Code Art. 1171 |
| Parent/guardian consent and contract signature for minors | Yes | Owner + developer | Civil Code (minors' contracts voidable); NPC opinions (via DataGuidance) |
| Use a merchant (not personal) account for collections | Yes (BSP direction per PayMongo blog) | Owner | PayMongo blog on BSP Memo M-2026-017 (BSP text **UNVERIFIED**) |

---

## 1. PayMongo's regulatory status

**Licences (verified on BSP primary sources):**

- **PayMongo Philippines, Inc.**: on the BSP's *List of BSP-Registered Operator of Payment System (OPS)*, **as of 28 August 2026**, row 195: trade names "PAYMONGO; PPI", **Registration No. OPSCOR-2020-0067**, date of issuance **April 17, 2020**. Source: https://www.bsp.gov.ph/PaymentAndSettlement/COR.pdf (PDF metadata created 1 Sep 2026; accessed 2026-11-04).
- **PayMongo Payments Inc**: on the BSP's *List of BSP Supervised Electronic Money Issuers (EMIs)*, **as of 31 May 2026**, row 21 under non-bank EMIs. Source: https://www.bsp.gov.ph/Lists/Directories/Attachments/7/emi.pdf (accessed 2026-11-04). The EMI licence was first reported in 2022 (Manila Bulletin, 2022-06-07).
- PayMongo's Terms of Use (version dated 15 May 2026) define "PayMongo" as PayMongo Philippines, Inc. (BSP-licensed OPS) and/or PayMongo Payments, Inc. (BSP-licensed EMI). The footer shows two NPC registration certificates, a SOC report badge and a PCI DSS badge. https://www.paymongo.com/terms
- PayMongo describes itself as a **PCI DSS Service Provider Level 1**. https://docs.paymongo.com/docs/payment-acceptance-best-practices (upd. 2026-05-07). I did not check this against the Visa/Mastercard service-provider registries (**UNVERIFIED** independently).

**Does it cover merchants?** The OPS registration and EMI licence authorise *PayMongo* to run a payment system and issue e-money. A merchant that only accepts payments through a registered OPS does not operate a payment system and needs no BSP licence. The merchant is bound contractually by PayMongo's Terms, Acceptable Use Policy and Prohibited/Restricted Business lists, and it gets the benefit of BSP rules applied *to PayMongo* (e.g. AFASA fraud-management duties, Circular 1238 fee-transparency rules). Merchants are not themselves BSP-supervised.

**Enforcement and issues:**
- I found no BSP, NPC or court enforcement action against PayMongo in 2024–2026 news or regulator releases (extended search, 2026-11-04). Absence of results is not proof. **UNVERIFIED** beyond public search.
- **Operational issue:** new sign-ups are **paused** "while we upgrade." The notice appears on https://dashboard.paymongo.com/signup, the homepage, /pricing and /terms (checked 2026-11-04). No dates are given.
- **2026 BSP context for merchants** (from PayMongo's blog, 2026-08-05; BSP texts not independently read): Circular 1238 (signed 17 Jun 2026) requires cost-based, transparent merchant and transfer fees and eases onboarding for low-risk merchants. Memo M-2026-017 (8 May 2026) requires providers to separate merchant accounts from personal accounts. QR Ph is for person-to-merchant payments, with fees borne by the merchant. Direct Debit PH launched 29 Jul 2026 (relevant later for recurring billing). Circular 1238 is corroborated by news (GMA, Inquirer, Philstar, July 2026).

## 2. Activating a live PayMongo account

**KYB documents (PayMongo docs):**

| Sole proprietorship | Corporation |
|---|---|
| DTI Certificate of Business Name Registration | SEC Certificate of Incorporation |
| Government ID of registered owner (1 primary or 2 secondary). If someone else signs up: notarised SPA + their ID | Articles of Incorporation and By-Laws (all pages) |
| BIR Certificate of Registration (Form 2303) | Latest GIS received by SEC, incl. Ultimate Beneficial Owner page |
| | Authorised representative's ID |
| | BIR Form 2303 |
| | Notarised Secretary's Certificate (authorises signatory; confirms settlement account) |

Sources: https://docs.paymongo.com/docs/account-settings-philippine-entities (upd. 2026-05-07); https://docs.paymongo.com/docs/account-settings-account-setup (upd. 2026-08-27). **Mayor's/business permit is not listed** by PayMongo. It is still legally required to operate the gym in Cebu City, and PayMongo may ask for it under enhanced due diligence.

**KYC:** government ID + liveness check + face match. Primary IDs include Driver's License, UMID, SSS, PRC, Passport and PhilSys/ePhilID. Secondary IDs include NBI or Police Clearance, PhilHealth, TIN ID, Pag-IBIG, Postal ID, Barangay Clearance and Voter's ID. https://docs.paymongo.com/docs/account-settings-kyc-accepted-ids (upd. 2026-09-03).

**Bank account:** bank name, account name and number. The payout account must be in the business or proprietor's name. Changes need an OTP. (Account setup doc; PayMongo Intercom FAQ "Does the bank account need to be named under the account holder".)

**Website requirements (all must be met):** publicly accessible, complete and functional (no placeholder), **prices or price ranges in PHP**, **physical Philippine address matching business documents**, visible **Terms & Conditions**, **Privacy Policy**, **Return & Refund Policy**, and **customer contact details**. A public Facebook Business Page is accepted as an alternative. App-store links, password-protected sites and private social profiles are not. https://docs.paymongo.com/docs/account-settings-website-guidelines (upd. 2026-05-18). The Verification requirements hub (upd. 2026-08-03) says the live Dashboard and PayMongo emails take precedence over the docs.

**Eligibility:** sole proprietors are eligible for cards and Google Pay. Plain "Individual" accounts are not. Visa/Mastercard need a registered business type. **Subscriptions on cards and Maya are by email request only.** https://docs.paymongo.com/docs/account-settings-account-capabilities (upd. 2026-10-07).

**Timing:** most activations complete "within minutes," but manual risk review can take **up to 14 business days** (PayMongo docs, activation best practices). After activation: QR Ph is automatic. GCash, Maya, GrabPay and ShopeePay take **3–7 business days**. Visa/Mastercard take **5–10 business days**. Bank direct debit takes 1–3 business days. BillEase takes 2–3 business days (Account capabilities, upd. 2026-10-07). Older Academy pages said "2 weeks."

**Fees** (https://paymongo.com/pricing, accessed 2026-11-04; VAT-exclusive, VAT-inclusive in brackets):

| Method | Fee |
|---|---|
| QR Ph | 1.34% (≈1.50%) |
| QR Ph with Instant Settlement | 2.23% (≈2.50%) |
| GCash | 2.23% (≈2.50%) |
| Maya | 1.79% (≈2.00%). A third-party snippet of PayMongo's developer docs showed 1.96%, so confirm in dashboard |
| GrabPay | 1.96% (≈2.20%) |
| ShopeePay | 1.70% (≈1.90%) |
| Cards, local Visa/MC | 3.125% + ₱13.39 (≈3.5% + ₱15) |
| Cards, international | 4.02% + ₱13.39 (≈4.5% + ₱15) |
| Direct Online Banking | 0.71% or ₱13.39 |
| BillEase (BNPL) | 1.34% |
| Payouts / transfers | ₱10 per transaction (InstaPay/PesoNET) |
| Account setup | Free. No general monthly fee for payment processing listed |

Refund windows (https://docs.paymongo.com/docs/payment-acceptance-refunds, upd. 2026-09-04): cards 60 days, GCash 180 days, Maya 12 months (same-day refunds must be full), QR Ph 30 days, ShopeePay 365 days, GrabPay 90 days. Whether PayMongo returns its fee on refunds is not stated (**UNVERIFIED**). Write the gym's refund policy to fit inside these windows.

## 3. Data Privacy Act (RA 10173), IRR and NPC issuances

**Role.** The gym is a **Personal Information Controller (PIC)**. Supabase (hosting), PayMongo (to the extent it processes on the gym's behalf) and any email/SMS vendor are processors or separate controllers. PayMongo is also a controller in its own right for payment data under its own NPC registration.

**Lawful basis (RA 10173 Sec 12, Sec 13; https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html):**
- Name, email, phone and membership/payment records: **contract** (Sec 12(b)), i.e. needed to provide the membership. Consent is not required for these.
- Check-in logs (QR scans): contract and/or **legitimate interest** (Sec 12(f); NPC Circular 2023-07 on legitimate interest, 13 Dec 2023) for access control and security.
- **Member photo:** if used only to let staff visually match the QR holder, contract or legitimate interest is arguable. Many PH practitioners still take **consent** for photos. If the photo is used for automated facial recognition, it becomes biometric processing that likely needs a PIA and registration (draft 2026 PIA circular). Recommendation: optional photo, separate consent tickbox.
- **Sensitive personal information (Sec 3(l))** includes **age/birthdate, health, and government IDs**. Health declarations (PAR-Q, injuries) and birthdate need a Sec 13 basis, typically **consent "specific to the purpose prior to the processing"** or legal claims. Collect only what is needed.
- Marketing emails/SMS: separate, opt-in **consent**.
- **NPC Circular 2023-04 (Guidelines on Consent, 7 Nov 2023)**: consent must be freely given, specific, informed, an indication of will, and evidenced. No bundling, no deceptive design (with NPC Advisory 2023-01 on deceptive design). Sources differ on the compliance date (late Nov 2023 vs 27 May 2024). Sources: Baker McKenzie via GlobalComplianceNews (2023-11-18); ACCRA via Chambers.

**Privacy notice contents (Sec 16(b)):** what data is collected; purposes; basis; recipients (e.g. PayMongo, Supabase, email provider); cross-border transfer (Supabase region); retention period; data subject rights and how to exercise them; identity and contact details of the PIC and DPO. NPC Advisory on Child-Oriented Transparency (17 Dec 2024) asks for a child-friendly version where minors are likely users. https://privacy.gov.ph/wp-content/uploads/2024/12/Advisory-2024.12.17-Guidelines-on-Child-Oriented-Transparency-w-SGD.pdf (could not fetch directly; via search).

**DPO:** every PIC must designate accountable individuals (Sec 21) and a DPO (IRR Sec 26; NPC Advisory 2017-01). For a sole proprietor this can be the owner or a staff member. Publish DPO contact details.

**NPC registration (NPC Circular 2022-04, effective 11 Jan 2023):** mandatory if the PIC/PIP **employs 250 or more**, **or processes sensitive personal information of 1,000 or more individuals**, or carries out **automated decision-making/profiling**, or other risk factors. Otherwise file a **notarised Sworn Declaration and Undertaking** through the NPC Registration System. Sources: Mondaq/Baker McKenzie summaries; NPC reminder page (privacy.gov.ph returned 403 to my fetches, so primary text **UNVERIFIED** by me). Note: storing birthdates or health answers for 1,000+ members likely **triggers mandatory registration**. NPC enforcement is active: show-cause orders to Meta, Roblox, Reddit and Discord on 22 Sep 2026 over registration (via search results).

**Breach notification (Sec 20(f); NPC Circular 16-03):** notify **NPC and affected data subjects within 72 hours** of knowledge or reasonable belief of a breach involving sensitive PI or identity-fraud-enabling information with real risk of serious harm. Full report within **5 days**. File through the **DBNMS** online platform. **NPC Advisory 2026-02 (11 May 2026)**: requests for postponement or exemption do not stop the clock, and NPC silence is not approval (Baker McKenzie, 2026-06-04). **Annual Security Incident Report**: the 2025 report deadline was extended to **10 Nov 2026** (NPC Advisory 2026-03); file even with zero incidents. Penalty for continued non-filing is up to ₱50,000 (Quisumbing Torres, 2026-09-30). Whether an unregistered micro PIC must file is **UNVERIFIED**. Ask the DPO or counsel.

**Retention (Sec 11(e)):** keep data only as long as necessary for the declared purpose, legal claims or legal requirements. Practical schedule: tax and invoice records per BIR rules (accountant to confirm period; commonly cited as 5 years under the EOPT-amended Tax Code, **UNVERIFIED**); check-in logs short (e.g. 6–12 months); delete or anonymise lapsed accounts after a stated period.

**Photos and CCTV:** member profile photos are ordinary personal data (biometric only if used for automated recognition). If the gym also runs **CCTV**, **NPC Circular 2024-02 (CCTV Systems, effective ~27 Aug 2024)** applies: purpose limitation, visible notices/signage near cameras, limited retention and access controls. https://privacy.gov.ph/wp-content/uploads/2024/08/NPC-Circular-No.-2024-02-CCTV-Systems.pdf (via Baker McKenzie / GlobalComplianceNews 2024-09-03; the exact retention period is **UNVERIFIED**).

**Minors (members under 18):** NPC guidance and opinions treat minors as generally unable to give valid consent. Obtain **parent/guardian consent** before processing (DataGuidance commentary citing NPC opinion; Chambers). NPC's Sept 2026 statement signals intensified oversight of platforms used by children. Contracts by minors are voidable under the Civil Code, so the membership contract also needs guardian signature or consent.

**Cross-border transfer (Supabase outside PH):** the DPA has **no data-localisation or adequacy-approval requirement**. Under **Sec 21**, the PIC stays responsible for data transferred abroad and must use **contracts or other reasonable means** to ensure "a comparable level of protection." **NPC Advisory 2024-01 (30 May 2024)** offers model contractual clauses (ASEAN MCCs, EU SCCs, etc.). Using them is **voluntary**, and NPC will not review them. https://privacy.gov.ph/wp-content/uploads/2024/06/Published-NPC-Advisory-No.-2024-01-Contractual-Clauses-for-Cross-Border-Transfers_30May24.pdf; BCCS Law summary. What to do:
1. Accept Supabase's **DPA** (current version issued by Supabase Pte. Ltd., dated 2026; https://supabase.com/legal/customer-resources/data-processing-addendum). It works as the IRR outsourcing agreement.
2. Choose the **Singapore (ap-southeast-1)** region. Supabase's DPA allows processing wherever it or its sub-processors have facilities.
3. Disclose the transfer in the privacy notice.
4. Keep a record. A 2026 **draft** NPC PIA circular (consultation Aug 2026) may require a PIA for transfers to jurisdictions without adequate protection. It is not final (**UNVERIFIED** status).

**Penalties:** e.g. unauthorised processing ₱500k–₱2M (₱4M if sensitive), 1–6 years imprisonment; concealment of a breach ₱500k–₱1M, 1.5–5 years (RA 10173 Secs 25–33). NPC administrative fines are under NPC Circular 2022-01.

## 4. Internet Transactions Act (RA 11967) and IRR

- **Coverage:** B2B and B2C internet transactions within DTI's mandate (Sec 3). A gym selling memberships (services) directly on **its own website** is an **"e-retailer"** (Sec 4(f): selling goods or services directly to online consumers through its own website). "Online merchant" in Sec 4(j) technically means selling through an e-marketplace or third-party platform, but Sec 23 imposes obligations on **both** e-retailers and online merchants. https://lawphil.net/statutes/repacts/ra2023/ra_11967_2023.html (approved 5 Dec 2023).
- **IRR:** Joint Administrative Order No. 24-03 (signed ~22–24 May 2024). Full enforcement began **20 June 2025** after the transition period (DTI via SunStar/Tribune, 2025-06-29). https://dti.gov.ph/sdm_downloads/implementing-rules-and-regulations-of-the-internet-transactions-act-of-2023 (I could not read the full IRR text, so IRR-specific detail is **UNVERIFIED**).
- **Required disclosures and duties (Sec 23):** (a) prices per Consumer Act Art. 81; (e) services delivered as contracted and advertised; **(f) homepage shows corporate/trade name, physical business address, mobile or landline number and email**, plus relevant professional memberships. These are submitted to the E-Commerce Bureau with at least one government ID or registration document, and consumer data must be protected under RA 10173 with minimum security standards; **(h) paper or electronic invoices for all sales**; **(i) accessible complaint-handling process**.
- **Online Business Database (Sec 10)** and **E-Commerce Bureau registration (Sec 8(c), 23(f))**: the statute contemplates e-retailers submitting details to the Bureau. DTI DAO 25-12 (4 Sep 2025) tried to make Trustmark/ECB registration mandatory (deadline 30 Sep 2025, then 31 Dec 2025). After backlash, DTI made the **Trustmark voluntary until 31 Dec 2026**, with a review by end-2026 (Philstar 2025-12-30; BusinessWorld 2025-12-22; DTI release 2025-09-19). Fee ₱1,000/yr, waived for BMBEs (assets ≤ ₱3M), half for small enterprises. I found **no announcement yet for 2027** (searched 2026-11-04). Re-check in December.
- **Cooling-off / refunds:** the Act has **no general cooling-off period**. Sec 19 limits consumer cancellation of paid delivery orders. Sec 20 gives repair/replace/refund remedies for defects under RA 7394. Liability: the e-retailer is **primarily liable** to the consumer (Sec 25). DTI fines under Sec 29 apply, e.g. for Sec 23(a), (f), (i) violations.

## 5. BIR: invoicing, e-invoicing, withholding

**Invoices after EOPT (RA 11976, effective Jan 2024; RR 7-2024 effective 27 Apr 2024; amended by RR 11-2024; RMC 77-2024):**
- The **invoice** (sales invoice / service invoice) is now the single primary evidence of sale for goods **and services**. The "Official Receipt" is only a supplementary document. Unused ORs can be converted by striking "Official Receipt" and stamping "Invoice," or used as supplementary documents (RR 11-2024). E-receipting or POS documents titled "Official Receipt" issued after RR 7-2024 are not valid for input-tax claims. Sources: PwC "Compliance change on invoicing under EoPT" (2024); Grant Thornton RR 7-2024/11-2024 notes; Forvis Mazars.
- **Threshold:** invoices are required for each sale of **₱500 or more**. Sales below ₱500 can be aggregated, with an invoice issued at end of day once the aggregate exceeds ₱500 (RR 7-2024; RMC 77-2024; via Grant Thornton). Gym memberships will almost always exceed ₱500, so issue **one invoice per online payment**, emailed or downloadable.
- **PayMongo's payment confirmation is not the gym's BIR invoice.** The gym must issue its own registered invoice: BIR-authorised printed invoices, or a registered CAS/e-invoicing system with a Permit to Use / Permit to Issue. RA 11967 Sec 23(h) says the same. (Inference from Sec 237 Tax Code, RR 7-2024 and RMC 60-2020; confirm with accountant.)
- **Taxpayer size (RR 8-2024):** Micro < ₱3M gross sales; Small ₱3M–<₱20M; Medium ₱20M–<₱1B; Large ≥ ₱1B (net of VAT). New registrants are classified from their BIR Form 1901 declaration (PwC Tax Alert 20; Grant Thornton).

**Mandatory e-invoicing, RMC 98-2026 (issued 22 Sep 2026, effective immediately; implements RR 8-2022 and RR 11-2025 as amended by RR 26-2025).** Primary source read: https://bir-cdn.bir.gov.ph/BIR/pdf/RMC%20No.%2098-2026%20redacted.pdf; BIR press release 23 Sep 2026: https://bir-cdn.bir.gov.ph/BIR/pdf/PR101SEP2326.pdf
- Covered: (1) **taxpayers engaged in e-commerce or internet transactions classified as Small, Medium or Large ("Micro Taxpayers are exempted")**; (2) LTS taxpayers; (3) Large taxpayers; (4) **CAS/CBA users with e-invoicing or other invoicing software**; (5) others the Commissioner requires.
- Deadline: issue compliant e-invoices **on or before 31 December 2026**.
- An e-invoice must be generated by registered or accredited software in structured format, transmitted electronically to the buyer (email, online viewing, QR, app, web), and be electronically extractable. Word/Excel/Google Sheets invoices do not count. A **Permit to Issue** is needed first, and **EIS certification** within 6 months (Grant Thornton alert 2026-09-24).
- **Electronic sales reporting** is a separate obligation, deferred until BIR issues implementing rules.
- **Implication for CourageD:** if gross sales are **under ₱3M (Micro)**, mandatory e-invoicing does not apply (it may opt in), but registered invoices are still required. If **₱3M or more** and selling online, it must issue e-invoices by 31 Dec 2026. Watch for the 4th category too: adopting a CAS with invoicing software pulls the gym in regardless of size. Taxpayers reclassified downward must keep e-invoicing once approved.

**Withholding by DFSPs / payment gateways (RR 16-2023 → RR 5-2025 → RMC 55-2026):**
- **RR 16-2023** (issued 21 Dec 2023, effective ~11 Jan 2024): e-marketplace operators and **digital financial services providers** withhold on gross remittances to online sellers. DFSP compliance was extended to July 2024, then to 12 Oct 2024 (RMC 79-2024).
- **RR 5-2025** (27 Feb 2025, under RA 12066 CREATE MORE): the rate is now **½% (0.5%) of gross remittances**, replacing "1% of one-half" (Grant Thornton 2025; PayMongo Taxes doc).
- **RMC 55-2026** (26 May 2026): reaffirms the 0.5% and sets alphalist filing duties for platforms (PwC Tax Alert 32; Tribune 2026-05-28).
- **Does it apply via PayMongo? Yes, in practice.** PayMongo's Taxes page (upd. 2026-06-24) says it is required to withhold from merchant payouts at 0.5% of gross remittances, shows the amount as a debit adjustment, and issues **Form 2307** through Settings > Taxes. https://docs.paymongo.com/docs/account-settings-taxes
- **Exemption:** prior-year total remittances ≤ ₱500,000, or current-year cumulative ≤ ₱500,000 (withholding starts once exceeded). The threshold is counted across **all** platforms and DFSPs. Submit a **signed Sworn Declaration + BIR 2303** to PayMongo (tax@paymongo.com).
- **Inconsistency to resolve:** PayMongo's Troubleshooting page (upd. 2026-10-26) says "Effective April 1, 2026, PayMongo implemented BIR Digital Tax Withholding" and lists "1% for certain business types; 12% (VAT equivalent) for VAT-registered businesses." That conflicts with the Taxes page (0.5%). https://docs.paymongo.com/docs/account-settings-troubleshooting. Ask PayMongo in writing which rate it will apply to a non-VAT sole proprietor.
- The withheld tax is **creditable**, not final. The accountant credits Form 2307 amounts against quarterly and annual income tax. The gym's own business tax (3% percentage tax if non-VAT, or the 8% income-tax option for qualifying individuals, or 12% VAT above ₱3M) is separate. Accountant to confirm.

## 6. Consumer protection

- **Consumer Act (RA 7394)**, https://lawphil.net/statutes/repacts/ra1992/ra_7394_1992.html:
  - Art. 50 deceptive sales acts (false claims, fake discounts, misdescribed terms). Art. 52 unfair or unconscionable sales acts (one-sided terms, exploiting consumer ignorance).
  - Art. 81 price tags and no charging above posted price (Art. 83 lets DTI regulate price display for services).
  - Art. 69 implied warranty that services are rendered with due care and skill.
  - **Art. 99**: service suppliers are liable **regardless of fault** for damage from defective services or inadequate information.
  - **Art. 106**: contractual clauses that prevent, exempt or reduce this liability are **prohibited**.
- **Membership refunds:** no PH statute mandates a cooling-off period or a pro-rata refund for gym memberships (**UNVERIFIED** beyond secondary commentary). The policy must be clear, disclosed before payment, and not unconscionable. Practical norms: refund or credit if the gym closes or relocates, or cannot provide the service. Medical freeze option. State non-refundability of used periods plainly. Tie timelines to PayMongo refund windows (cards 60 days, QR Ph 30 days).
- **Auto-renewal / recurring billing:** I found **no PH statute or DTI order specifically regulating auto-renewal**. Commentary citing DTI orders (e.g. "DAO 23-01", "30-day notice") is **UNVERIFIED**. Under Arts. 50/52, any auto-renewal must be disclosed prominently, consented to explicitly (unticked box), easy to cancel, and preceded by a reminder. PayMongo Subscriptions on cards/Maya need approval by email (Account capabilities doc). Simplest path for v1: **no auto-renewal**. Members pay each period via Checkout.
- **RA 11765 (Financial Products and Services Consumer Protection Act, 2022) and BSP Circular 1160:** apply to **financial service providers** under BSP, SEC, IC or CDA jurisdiction, i.e. PayMongo, not the gym. Relevance: members with payment complaints can go to PayMongo's consumer assistance and then the BSP. The gym should cooperate with PayMongo disputes and chargebacks.
- **Surcharges:** charging a "card fee" or "convenience fee" on top of the displayed price is widely described as prohibited in PH (commentary citing DTI and BSP FAQs; **UNVERIFIED** in primary text). Absorb the MDR, or price it in uniformly.

## 7. Card data / PCI DSS with hosted Checkout

- With **PayMongo Hosted Checkout**, the server creates a Checkout Session and **redirects** the customer to PayMongo's `checkout_url`. The customer enters card or e-wallet details on PayMongo's page. https://docs.paymongo.com/docs/payment-channels-hosted-checkout (upd. 2026-10-30). The gym's website and servers **never receive card numbers, expiry or CVC**. PayMongo's guidance: "Your server should never receive raw card numbers… and should never store card data, even temporarily." (Best practices, upd. 2026-05-07). That page's note that client code collects card details applies to the **direct API / Payment Method** integration, not hosted Checkout.
- **PCI DSS scope:** PayMongo says merchants should "maintain your own SAQ based on your integration type." A full redirect to a PCI-compliant provider fits **SAQ A**. Under **PCI DSS v4.0.1 SAQ A (effective 31 Mar 2025)**, requirements 6.4.3 and 11.6.1 were removed and replaced with an eligibility criterion about script attacks. Guidance indicates a **full redirect is not subject to** the payment-page script criterion that applies to iframes. Sources: Adyen SAQ A eligibility doc; Compass IT; Schellman (vendor sources; the PCI SSC primary SAQ A text was not opened, **UNVERIFIED**).
- **What the gym must still do:**
  1. HTTPS on the whole site, so the redirect cannot be tampered with.
  2. Create sessions server-side only; secret key only on the server (Vercel env vars), never in the browser.
  3. **Verify `X-Paymongo-Signature`** (HMAC-SHA256 of raw body with the webhook secret) and reject mismatches.
  4. Activate a membership only from the verified `checkout_session.payment.paid` webhook, never from the success redirect URL alone. Make the handler idempotent.
  5. MFA and least-privilege on the PayMongo dashboard and Supabase.
  6. Don't log full webhook payloads containing personal data longer than needed.
  7. Complete an SAQ or attestation if PayMongo or an acquirer asks.

## 8. Other things a small PH gym should know

- **Cybercrime Prevention Act (RA 10175):** the gym is unlikely to be a "service provider" under Sec 3(n) (communications services). Its main exposure is as a *victim* (illegal access, Sec 4(a)) and as a recipient of court-warranted disclosure orders (Sec 14: produce data within 72 hours). Keep basic access logs. The 6-month traffic-data preservation duty (Sec 13) targets service providers. https://lawphil.net/statutes/repacts/ra2012/ra_10175_2012.html
- **AFASA (RA 12010, approved 20 Jul 2024)** and BSP Circulars 1213/1214/1215 (effective 25 Jun 2025, 1-year transition): obligations fall on **BSP-supervised institutions** (fraud management systems, phase-out of SMS/email OTP for high-risk actions, temporary holding of disputed funds up to 30 days). **No direct merchant obligations found.** Relevance:
  - PayMongo may **hold disputed funds** for investigation.
  - Circular 1213 defines "unsecure merchants" (no industry-standard authentication, or a fraud history). Hosted Checkout with 3DS keeps the gym on the right side.
  - Never ask members for OTPs or card details by chat or phone. Social engineering and money-muling are AFASA crimes.
  - Sources: BSP Circular 1213 PDF (https://www.bsp.gov.ph/Regulations/Issuances/2025/1213.pdf); 1215 PDF; AFASA booklet (https://www.bsp.gov.ph/Regulations/Banking%20Laws/AFASA-Booklet-with-IRRs.pdf). Read via search excerpts. A BSP **draft** on merchant payment integrity (unique merchant IDs, verified settlement accounts) is not final (**UNVERIFIED**).
- **Merchant vs personal accounts:** per PayMongo's summary of BSP Memo M-2026-017, business collections should go to a proper merchant account, not a personal GCash/bank account (BSP primary **UNVERIFIED**).
- **SIM Registration Act (RA 11934):** no merchant obligation. If the gym uses SMS OTP for member login, use a registered business SIM or an SMS provider.
- **Liability waiver for injuries (online sign-up):**
  - E-signatures and click-wrap acceptance are valid under the E-Commerce Act (RA 8792).
  - **Consumer Act Art. 106** voids clauses that exempt or reduce the service supplier's liability for defective services (Art. 99 strict liability). Civil Code Art. 1171 makes waivers of future fraud void. Waivers of gross negligence are generally unenforceable (lawyer to confirm).
  - A waiver is therefore useful mainly as an **assumption-of-risk acknowledgement, health declaration, and house-rules agreement**, not a shield.
  - Pair it with real safety measures: equipment maintenance, supervision, first aid, incident logs. Consider insurance.
  - Health declarations are **sensitive personal information**, so use specific consent and restricted access.
  - Under-18s need a parent/guardian to accept.
- **Local permits:** Cebu City business/mayor's permit, barangay clearance, fire safety inspection, sanitary permit, signage. Renew each January. Specific Cebu City requirements **UNVERIFIED** (check the Cebu City BPLO).
- **Display requirements:** BIR COR (Form 2303) and "Ask for an invoice" notice at the physical premises. Online, RA 11967 homepage disclosures apply.
- **QR door check-in:** the member QR should be an opaque random token (not an encoded member ID or email), revocable on lapse or theft. Check-in logs are personal data, so follow the retention schedule above.

---

## What a PH lawyer / accountant should confirm

**Lawyer:**
1. Terms & Conditions, Refund/Cancellation Policy and any auto-renewal language under RA 7394 Arts. 50/52 and RA 11967. Whether any DTI order now regulates subscriptions or auto-renewal.
2. Liability waiver / assumption-of-risk wording, given RA 7394 Arts. 99/106 and Civil Code Arts. 1171–1172. Minors' sign-up and guardian consent.
3. Privacy notice, consent flows and lawful bases (photo, birthdate, health data). Whether CourageD must **register with NPC** or file an SDAU. Whether the **Annual Security Incident Report** (10 Nov 2026) applies.
4. The Supabase DPA as the Sec 21 / IRR outsourcing agreement, and whether to add ASEAN MCCs.
5. Status of the DTI Trustmark / E-Commerce Bureau registration for 2027, and IRR (JAO 24-03) disclosure details for e-retailers.
6. Whether any LGU (Cebu City) permit category or ordinance applies to fitness centres.

**Accountant:**
1. CourageD's **taxpayer classification** (Micro vs Small) and whether it falls under **mandatory e-invoicing by 31 Dec 2026** (RMC 98-2026), including the CAS/invoicing-software trigger.
2. How to issue a **BIR-registered invoice for each online payment** (ATP printed invoices vs registered e-invoicing/CAS; PTU/PTI), and registering "online" activity and the website with the RDO.
3. Whether to file the **PayMongo sworn declaration** (≤ ₱500k remittances). Which withholding rate PayMongo will actually apply (0.5% vs the 1%/12% wording on its troubleshooting page). Crediting Form 2307.
4. Business tax regime (3% percentage tax / 8% option / VAT), treatment of PayMongo fees as deductible expenses, and record-retention periods.

---

## Sources

All accessed 2026-11-04 unless stated. "Upd." is the page's own last-updated date.

**Regulators / primary law**
1. BSP, List of BSP-Registered Operator of Payment System (OPS), as of 28 Aug 2026: https://www.bsp.gov.ph/PaymentAndSettlement/COR.pdf
2. BSP, List of BSP Supervised Electronic Money Issuers, as of 31 May 2026: https://www.bsp.gov.ph/Lists/Directories/Attachments/7/emi.pdf
3. BSP Circular 1213 (2025): https://www.bsp.gov.ph/Regulations/Issuances/2025/1213.pdf. Circular 1215 (2025): https://www.bsp.gov.ph/Regulations/Issuances/2025/1215.pdf. AFASA booklet with IRRs: https://www.bsp.gov.ph/Regulations/Banking%20Laws/AFASA-Booklet-with-IRRs.pdf (via search excerpts)
4. BIR RMC No. 98-2026 (22 Sep 2026): https://bir-cdn.bir.gov.ph/BIR/pdf/RMC%20No.%2098-2026%20redacted.pdf
5. BIR press release, 23 Sep 2026: https://bir-cdn.bir.gov.ph/BIR/pdf/PR101SEP2326.pdf
6. RA 10173 Data Privacy Act (2012): https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html
7. RA 11967 Internet Transactions Act (approved 5 Dec 2023): https://lawphil.net/statutes/repacts/ra2023/ra_11967_2023.html
8. RA 7394 Consumer Act (1992): https://lawphil.net/statutes/repacts/ra1992/ra_7394_1992.html
9. RA 10175 Cybercrime Prevention Act (2012): https://lawphil.net/statutes/repacts/ra2012/ra_10175_2012.html
10. DTI, ITA IRR download page: https://dti.gov.ph/sdm_downloads/implementing-rules-and-regulations-of-the-internet-transactions-act-of-2023 (title only read)
11. DTI release "DTI extends Trustmark registration to year-end, reiterates waiver of fees for BMBEs" (2025-09-19/25): https://www.dti.gov.ph/dti-archives/dti-news-archived/dti-extends-trustmark-registration-year-end-reiterates-waiver-fees-bmbes
12. NPC Circular 2022-04 PDF: https://privacy.gov.ph/wp-content/uploads/2023/05/Circular-2022-04.pdf (blocked to my fetch; content via secondary sources)
13. NPC Circular 2024-02 CCTV Systems: https://privacy.gov.ph/wp-content/uploads/2024/08/NPC-Circular-No.-2024-02-CCTV-Systems.pdf (via secondary)
14. NPC Advisory 2024-01 Model Contractual Clauses (30 May 2024): https://privacy.gov.ph/wp-content/uploads/2024/06/Published-NPC-Advisory-No.-2024-01-Contractual-Clauses-for-Cross-Border-Transfers_30May24.pdf (via search excerpt)
15. NPC Child-Oriented Transparency guidelines (17 Dec 2024): https://privacy.gov.ph/wp-content/uploads/2024/12/Advisory-2024.12.17-Guidelines-on-Child-Oriented-Transparency-w-SGD.pdf (via search)
16. NPC draft PIA circular for consultation (Aug 2026): https://privacy.gov.ph/wp-content/uploads/2026/08/For-Public-Consultation-Draft-Circular-Updated-PIA-Guidelines.pdf (via search)
17. NPC Circular 2023-07 Legitimate Interest (13 Dec 2023): https://newsbytes.ph/wp-content/uploads/2024/08/NPC-Circular-No.-2023-07_Guidelines-on-Legitimate-Interest_13-December-2023.pdf (via search)

**PayMongo (first-party)**
18. Pricing: https://paymongo.com/pricing
19. Terms of Use (version 15 May 2026): https://www.paymongo.com/terms
20. Signup page (pause notice): https://dashboard.paymongo.com/signup
21. Account setup (upd. 2026-08-27): https://docs.paymongo.com/docs/account-settings-account-setup
22. Philippine Entities (upd. 2026-05-07): https://docs.paymongo.com/docs/account-settings-philippine-entities
23. Verification requirements (upd. 2026-08-03): https://docs.paymongo.com/docs/account-settings-verification-requirements
24. Website Guidelines (upd. 2026-05-18): https://docs.paymongo.com/docs/account-settings-website-guidelines
25. KYC Accepted IDs (upd. 2026-09-03): https://docs.paymongo.com/docs/account-settings-kyc-accepted-ids
26. Account capabilities (upd. 2026-10-07): https://docs.paymongo.com/docs/account-settings-account-capabilities
27. Taxes (upd. 2026-06-24): https://docs.paymongo.com/docs/account-settings-taxes
28. Troubleshooting (upd. 2026-10-26): https://docs.paymongo.com/docs/account-settings-troubleshooting
29. Payment acceptance best practices (upd. 2026-05-07): https://docs.paymongo.com/docs/payment-acceptance-best-practices
30. Hosted Checkout (upd. 2026-10-30): https://docs.paymongo.com/docs/payment-channels-hosted-checkout
31. Refunds (upd. 2026-09-04): https://docs.paymongo.com/docs/payment-acceptance-refunds
32. PayMongo blog "BSP Updates 2026" (2026-08-05): https://www.paymongo.com/blog/bsp-updates-2026

**Supabase**
33. Data Processing Addendum: https://supabase.com/legal/customer-resources/data-processing-addendum. Regions: https://supabase.com/docs/guides/platform/regions

**Secondary (law firms, news)**
34. Grant Thornton, RR 5-2025 / CREATE MORE withholding (2025): https://www.grantthornton.com.ph/technical-alerts/tax-alert/2025/updates-on-tax-base-and-rate-for-certain-creditable-withholding-taxes-pursuant-to-republic-act-ra-no-12066-or-the-create-more-act/
35. PwC Tax Alert 32, RMC 55-2026 (2026-05-26): https://www.pwc.com/ph/en/tax/tax-publications/tax-alerts/2026/tax-alert-32.html (search excerpt; page 403)
36. Daily Tribune, "BIR orders digital platforms to withhold 0.5%" (2026-05-28): https://tribune.net.ph/2026/05/28/bir-orders-digital-platforms-to-withhold-05-of-seller-remittances
37. Grant Thornton, RR 16-2023 summary: https://www.grantthornton.com.ph/insights/articles-and-updates1/tax-notes/online-sellers-subject-to-1-expanded-withholding-tax/
38. Grant Thornton, RMC 98-2026 alert (2026-09-24): https://www.grantthornton.com.ph/technical-alerts/tax-alert/2026/bir-issues-guidelines-on-electronic-invoicing-retains-31-dec-2026-deadline/
39. PwC, "Compliance change on invoicing under EoPT" (2024): https://www.pwc.com/ph/en/tax/tax-publications/taxwise-or-otherwise/2024/compliance-change-on-invoicing-under-eopt.html. Grant Thornton RR 7-2024/11-2024: https://www.grantthornton.com.ph/insights/articles-and-updates1/tax-notes/clarification-on-the-invoicing-requirements-per-rr-no-7-2024-as-amended-by-rr-no-11-2024/
40. PwC Tax Alert 20, RR 8-2024 classification: https://pwc.com/ph/en/tax/tax-publications/tax-alerts/2024/tax-alert-20.html. Grant Thornton classification note: https://www.grantthornton.com.ph/insights/articles-and-updates1/tax-notes/eopt-is-here-guidelines-for-classification-of-business-taxpayers/
41. Juan.tax / Grant Thornton on RMC 60-2020: https://juan.tax/blog/rmc-60-2020-obligations-of-persons-conducting-business-transactions-through-any-forms-of-electronic-media-and-notice-to-unregistered-businesses/
42. Mondaq, "All Things Registration" (NPC Circular 2022-04): https://mondaq.com/privacy-protection/1319392/all-things-registration-national-privacy-commission-issues-new-rules-on-registration-of-data-processing-systems
43. Baker McKenzie, NPC Advisory 2026-02 breach notification (2026-06-04): https://www.bakermckenzie.com/en/insight/publications/2026/06/philippines-data-breach-notification-procedure-further-clarified
44. Quisumbing Torres, NPC Advisory 2026-03 annual SIR deadline (2026-09-30): https://www.quisumbingtorres.com/en/alerts/2026/09/npc-extends-deadline-submission-annual-security-incident-reports
45. ndvlaw, "When must Philippine companies report data breaches?": https://ndvlaw.com/when-must-philippine-companies-report-data-breaches/ (search excerpt)
46. Baker McKenzie via GlobalComplianceNews, NPC consent guidelines (2023-11-18): https://www.globalcompliancenews.com/2023/11/18/https-insightplus-bakermckenzie-com-bm-data-technology-philippines-national-privacy-commission-issues-comprehensive-guidelines-on-consent_11162023/
47. GlobalComplianceNews / Baker McKenzie, CCTV circular (2024-09-03): https://www.globalcompliancenews.com/2024/09/03/philippines-updated-framework-issued-on-the-use-of-closed-circuit-television-systems
48. BCCS Law, NPC Advisory 2024-01: https://bccslaw.com/npc-advisory-no-2024-01-model-contractual-clauses-for-cross-border-transfers-of-personal-data/
49. Philstar, DTI trustmark deadline (2025-09-12): https://www.philstar.com/business/2025/09/12/2472107/dti-sets-september-30-deadline-online-sellers-trustmark-registration. Philstar, trustmark voluntary until end-2026 (2025-12-30): https://www.philstar.com/business/2025/12/30/2497533/dti-e-commerce-trustmark-remain-voluntary-until-end-2026. BusinessWorld (2025-12-22): https://www.bworldonline.com/economy/2025/12/22/720522/trustmark-voluntary-registration-period-extended-by-one-year/
50. Tribune, "DTI starts e-commerce law's full enforcement" (2025-06-29): https://tribune.net.ph/2025/06/29/dti-starts-e-commerce-laws-full-enforcement
51. Manila Bulletin, "BSP authorizes PayMongo to operate as an EMI" (2022-06-07): https://mb.com.ph/2022/06/07/bsp-authorizes-paymongo-to-operate-as-an-emi
52. GMA News on BSP Circular 1238 (Jul 2026): https://www.gmanetwork.com/news/money/economy/991913/bsp-rolls-out-rules-for-lower-digital-transfer-fees-free-payments-for-small-merchants/story/
53. Adyen, SAQ A eligibility: https://docs.adyen.com/development-resources/pci-dss-compliance-guide/saq-a-eligibility. Compass IT on SAQ A change: https://www.compassitc.com/blog/saq-a-requirements-6.4.3-11.6.1-what-the-eligibility-change-means
54. Respicio & Co. commentary on gym auto-renewal/refunds (low-reliability, used only to flag issues): https://www.respicio.ph/commentaries/are-automatic-renewal-clauses-in-gym-memberships-legal-in-the-philippines
