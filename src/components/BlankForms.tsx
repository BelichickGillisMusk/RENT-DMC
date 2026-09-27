import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Bug,
  ClipboardList,
  ExternalLink,
  PawPrint,
  Printer,
  Receipt,
  type LucideIcon,
} from 'lucide-react';
// @ts-ignore logo asset has no type declaration in this project
import dmcHeader from '../assets/images/dmc-properties-header.png';

type FormId = 'receipt' | 'lead' | 'bedbug' | 'pet' | 'checklist';

interface FormCard {
  id: FormId;
  title: string;
  summary: string;
  icon: LucideIcon;
}

const FORM_CARDS: FormCard[] = [
  {
    id: 'receipt',
    title: 'Payment / move-in receipt',
    summary: 'Blank lines for rent, deposit, pet, other, total, method, and signatures.',
    icon: Receipt,
  },
  {
    id: 'lead',
    title: 'Lead-based paint disclosure',
    summary: 'EPA-style disclosure for pre-1978 housing. Initials, pamphlet receipt, and signature lines.',
    icon: ClipboardList,
  },
  {
    id: 'bedbug',
    title: 'Bed bug notice',
    summary: 'California Civil Code § 1954.603 information sheet, 11-point body, report line, and signatures.',
    icon: Bug,
  },
  {
    id: 'pet',
    title: 'Pet acknowledgment',
    summary: 'Blank pet name and type. Pet money is part of the security deposit.',
    icon: PawPrint,
  },
  {
    id: 'checklist',
    title: 'Official PDF checklist',
    summary: 'Links to the Oakland RAP notice, Fair Chance notice, and EPA lead pamphlet. Print those PDFs as-is.',
    icon: ExternalLink,
  },
];

const OFFICIAL_PDFS = [
  {
    title: 'Oakland RAP Notice (English, Spanish, and Chinese)',
    note: 'Notice to Tenants of the Residential Rent Adjustment Program. Serve the city form at move-in and with every rent increase.',
    href: 'https://www.oaklandca.gov/files/assets/city/v/1/housing-comm-dev/documents/tenants/en-ch-sp_12.30.24-form-notice-to-tenants-of-rap-notice.pdf',
    pageLabel: 'City of Oakland RAP notice page',
    page: 'https://www.oaklandca.gov/Community/Housing-Programs-Support/Rent-Adjustment-Program-RAP/For-Property-Owners/Notice-to-Tenants-of-the-Rent-Adjustment-Program',
  },
  {
    title: 'Oakland Fair Chance notice',
    note: 'Ronald V. Dellums and Simarashe Sherry Fair Chance Access to Housing Ordinance (O.M.C. 8.25). This city PDF includes the notice to applicants and tenants.',
    href: 'https://www.oaklandca.gov/files/assets/city/v/1/housing-comm-dev/documents/fair-chance/website-landlord-notive-with-tenant-notice-attached.pdf',
    pageLabel: 'City of Oakland Fair Chance page',
    page: 'https://www.oaklandca.gov/Community/Housing-Programs-Support/Fair-Chance-Housing-Ordinance',
  },
  {
    title: 'EPA pamphlet: Protect Your Family from Lead in Your Home',
    note: 'Federally approved pamphlet (January 2026). Give it with the lead disclosure.',
    href: 'https://www.epa.gov/system/files/documents/2026-02/protectyourfamily_pamphlet_2026_3.pdf',
    pageLabel: 'EPA pamphlet page',
    page: 'https://www.epa.gov/lead/protect-your-family-lead-your-home-english',
  },
] as const;

function formTitle(id: FormId): string {
  switch (id) {
    case 'receipt':
      return 'Payment / Move-In Receipt';
    case 'lead':
      return 'Disclosure of Information on Lead-Based Paint and/or Lead-Based Paint Hazards';
    case 'bedbug':
      return 'Bed Bug Notice';
    case 'pet':
      return 'Pet Acknowledgment';
    case 'checklist':
      return 'Move-In Official PDF Checklist';
    default: {
      const unreachable: never = id;
      return unreachable;
    }
  }
}

function FilledOrLine({ value, wide }: { value: string; wide?: boolean }) {
  return (
    <span className={`dmc-blank ${wide ? 'dmc-blank-wide' : ''}`}>
      {value.trim() || '\u00a0'}
    </span>
  );
}

function LineInput({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
}) {
  return (
    <label className="dmc-field">
      <span className="dmc-field-label">{label}</span>
      <span className="dmc-field-control">
        {prefix ? <span className="dmc-prefix">{prefix}</span> : null}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="dmc-line"
          aria-label={label}
        />
      </span>
    </label>
  );
}

function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <label className="dmc-check-line">
      <input type="checkbox" className="dmc-check" />
      <span>{children}</span>
    </label>
  );
}

function SignOff({ role }: { role: string }) {
  const [date, setDate] = useState('');
  return (
    <div className="dmc-sign">
      <div>
        <span className="dmc-sign-line" />
        <span className="dmc-caption">{role} signature</span>
      </div>
      <label>
        <input
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="dmc-line"
          aria-label={`${role} date`}
        />
        <span className="dmc-caption">{role} date</span>
      </label>
    </div>
  );
}

function Letterhead({
  title,
  cite,
  unit,
  tenant,
}: {
  title: string;
  cite?: string;
  unit: string;
  tenant: string;
}) {
  return (
    <header className="dmc-letterhead">
      <div className="dmc-letterhead-brand">
        <img src={dmcHeader} alt="DMC Properties" className="dmc-logo" />
        <div>
          <p className="dmc-brand-kicker">DMC Properties · San Francisco</p>
          <p className="dmc-brand-address">3875 Ruby Street, Oakland, CA 94609</p>
          <p className="dmc-brand-address">(415) 900-8563 · Powered by Silverback AI</p>
        </div>
      </div>
      <h2 className="dmc-form-title">{title}</h2>
      {cite ? <p className="dmc-cite">{cite}</p> : null}
      <div className="dmc-identity">
        <p>
          <span className="dmc-field-label">Unit #</span> <FilledOrLine value={unit} />
        </p>
        <p>
          <span className="dmc-field-label">Tenant</span> <FilledOrLine value={tenant} wide />
        </p>
      </div>
    </header>
  );
}

function parseMoney(raw: string): number | null {
  const trimmed = raw.trim().replace(/[$,]/g, '');
  if (trimmed === '') return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  return Math.round(Number(trimmed) * 100) / 100;
}

function PaymentReceipt({ unit, tenant }: { unit: string; tenant: string }) {
  const [date, setDate] = useState('');
  const [period, setPeriod] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [pet, setPet] = useState('');
  const [otherLabel, setOtherLabel] = useState('');
  const [other, setOther] = useState('');
  const [method, setMethod] = useState('');
  const [receivedBy, setReceivedBy] = useState('');

  const total = useMemo(() => {
    const parts = [rent, deposit, pet, other];
    if (parts.every((part) => part.trim() === '')) return '';
    const amounts = parts.map(parseMoney);
    if (amounts.some((amount) => amount === null)) return '';
    const sum = amounts.reduce((acc, amount) => acc + (amount ?? 0), 0);
    return sum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [rent, deposit, pet, other]);

  return (
    <>
      <Letterhead title={formTitle('receipt')} unit={unit} tenant={tenant} />
      <div className="dmc-stack">
        <p className="dmc-readout">
          <span className="dmc-field-label">Received from</span> <FilledOrLine value={tenant} wide />
        </p>
        <p className="dmc-readout">
          <span className="dmc-field-label">Unit #</span> <FilledOrLine value={unit} />
        </p>
        <LineInput label="Date" value={date} onChange={setDate} />
        <LineInput label="First month rent" value={rent} onChange={setRent} prefix="$" />
        <LineInput label="Rent period" value={period} onChange={setPeriod} />
        <LineInput label="Security deposit" value={deposit} onChange={setDeposit} prefix="$" />
        <LineInput label="Pet" value={pet} onChange={setPet} prefix="$" />
        <LineInput label="Other label" value={otherLabel} onChange={setOtherLabel} />
        <LineInput label="Other amount" value={other} onChange={setOther} prefix="$" />
        <p className="dmc-total">
          <span className="dmc-field-label">Total</span>{' '}
          <span className="dmc-blank dmc-blank-wide">{total ? `$${total}` : '\u00a0'}</span>
        </p>
        <LineInput label="Method" value={method} onChange={setMethod} />
        <LineInput label="Received by (DMC)" value={receivedBy} onChange={setReceivedBy} />
      </div>
      <SignOff role="Tenant" />
      <SignOff role="DMC Properties" />
    </>
  );
}

function LeadDisclosure({ unit, tenant }: { unit: string; tenant: string }) {
  const [property, setProperty] = useState('');
  const [lessor, setLessor] = useState('');
  const [knownExplain, setKnownExplain] = useState('');
  const [recordsList, setRecordsList] = useState('');

  return (
    <>
      <Letterhead
        title={formTitle('lead')}
        cite="Lead warning for housing built before 1978. 3875 Ruby Street, est. 1924."
        unit={unit}
        tenant={tenant}
      />
      <p className="dmc-prose">
        Housing built before 1978 may contain lead-based paint. Lead from paint, paint chips, and dust can pose health hazards if not managed properly. Lead exposure is especially harmful to young children and pregnant women. Before renting pre-1978 housing, lessors must disclose the presence of known lead-based paint and/or lead-based paint hazards in the dwelling. Lessees must also receive a federally approved pamphlet on lead poisoning prevention.
      </p>
      <div className="dmc-stack">
        <LineInput label="Property" value={property} onChange={setProperty} />
        <p className="dmc-readout">
          <span className="dmc-field-label">Unit #</span> <FilledOrLine value={unit} />
        </p>
        <p className="dmc-readout">
          <span className="dmc-field-label">Lessee</span> <FilledOrLine value={tenant} wide />
        </p>
        <LineInput label="Lessor" value={lessor} onChange={setLessor} />
      </div>

      <h3 className="dmc-section">Lessor&apos;s disclosure (initial)</h3>
      <p className="dmc-prose">Presence of lead-based paint and/or lead-based paint hazards (check one):</p>
      <CheckLine>
        Known lead-based paint and/or lead-based paint hazards are present in the housing (explain).
      </CheckLine>
      <LineInput label="Explanation" value={knownExplain} onChange={setKnownExplain} />
      <CheckLine>
        Lessor has no knowledge of lead-based paint and/or lead-based paint hazards in the housing.
      </CheckLine>

      <p className="dmc-prose dmc-gap">Records and reports available to the lessor (check one):</p>
      <CheckLine>
        Lessor has provided the lessee with all available records and reports pertaining to lead-based paint and/or lead-based paint hazards in the housing (list documents).
      </CheckLine>
      <LineInput label="Documents" value={recordsList} onChange={setRecordsList} />
      <CheckLine>
        Lessor has no reports or records pertaining to lead-based paint and/or lead-based paint hazards in the housing.
      </CheckLine>

      <h3 className="dmc-section">Lessee&apos;s acknowledgment (initial)</h3>
      <CheckLine>Lessee has received copies of all information listed above.</CheckLine>
      <CheckLine>Lessee has received the pamphlet Protect Your Family from Lead in Your Home.</CheckLine>

      <h3 className="dmc-section">Agent&apos;s acknowledgment (initial)</h3>
      <CheckLine>
        Agent has informed the lessor of the lessor&apos;s obligations under 42 U.S.C. 4852d and is aware of his/her responsibility to ensure compliance.
      </CheckLine>

      <h3 className="dmc-section">Certification of accuracy</h3>
      <p className="dmc-prose">
        The following parties have reviewed the information above and certify, to the best of their knowledge, that the information they have provided is true and accurate.
      </p>
      <SignOff role="Lessor" />
      <SignOff role="Lessee" />
      <SignOff role="Agent" />
    </>
  );
}

function BedBugNotice({ unit, tenant }: { unit: string; tenant: string }) {
  const [property, setProperty] = useState('');
  const [landlord, setLandlord] = useState('');

  return (
    <>
      <Letterhead
        title={formTitle('bedbug')}
        cite="California Civil Code § 1954.603"
        unit={unit}
        tenant={tenant}
      />
      <div className="dmc-stack">
        <LineInput label="Property" value={property} onChange={setProperty} />
        <p className="dmc-readout">
          <span className="dmc-field-label">Unit #</span> <FilledOrLine value={unit} />
        </p>
        <LineInput label="Landlord" value={landlord} onChange={setLandlord} />
        <p className="dmc-readout">
          <span className="dmc-field-label">Tenant</span> <FilledOrLine value={tenant} wide />
        </p>
      </div>
      <div className="dmc-statute">
        <h3>Information about Bed Bugs</h3>
        <p>
          <strong>Bed bug Appearance:</strong> Bed bugs have six legs. Adult bed bugs have flat bodies about 1/4 of an inch in length. Their color can vary from red and brown to copper colored. Young bed bugs are very small. Their bodies are about 1/16 of an inch in length. They have almost no color. When a bed bug feeds, its body swells, may lengthen, and becomes bright red, sometimes making it appear to be a different insect. Bed bugs do not fly. They can either crawl or be carried from place to place on objects, people, or animals. Bed bugs can be hard to find and identify because they are tiny and try to stay hidden.
        </p>
        <p>
          <strong>Life Cycle and Reproduction:</strong> An average bed bug lives for about 10 months. Female bed bugs lay one to five eggs per day. Bed bugs grow to full adulthood in about 21 days.
        </p>
        <p>Bed bugs can survive for months without feeding.</p>
        <p>
          <strong>Bed bug Bites:</strong> Because bed bugs usually feed at night, most people are bitten in their sleep and do not realize they were bitten. A person&apos;s reaction to insect bites is an immune response and so varies from person to person. Sometimes the red welts caused by the bites will not be noticed until many days after a person was bitten, if at all.
        </p>
        <p>Common signs and symptoms of a possible bed bug infestation:</p>
        <ul>
          <li>Small red to reddish brown fecal spots on mattresses, box springs, bed frames, mattresses, linens, upholstery, or walls.</li>
          <li>Molted bed bug skins, white, sticky eggs, or empty eggshells.</li>
          <li>Very heavily infested areas may have a characteristically sweet odor.</li>
          <li>Red, itchy bite marks, especially on the legs, arms, and other body parts exposed while sleeping. However, some people do not show bed bug lesions on their bodies even though bed bugs may have fed on them.</li>
        </ul>
        <p>
          For more information, see the Internet Web sites of the United States Environmental Protection Agency and the National Pest Management Association.
        </p>
        <p>
          <strong>How to report:</strong> Report a suspected infestation promptly, in writing, to DMC Properties at (415) 900-8563.
        </p>
      </div>
      <SignOff role="Landlord" />
      <SignOff role="Tenant" />
    </>
  );
}

function PetAcknowledgment({ unit, tenant }: { unit: string; tenant: string }) {
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');

  return (
    <>
      <Letterhead title={formTitle('pet')} unit={unit} tenant={tenant} />
      <div className="dmc-stack">
        <p className="dmc-readout">
          <span className="dmc-field-label">Unit #</span> <FilledOrLine value={unit} />
        </p>
        <p className="dmc-readout">
          <span className="dmc-field-label">Tenant</span> <FilledOrLine value={tenant} wide />
        </p>
        <LineInput label="Pet name" value={petName} onChange={setPetName} />
        <LineInput label="Pet type" value={petType} onChange={setPetType} />
      </div>
      <p className="dmc-prose dmc-gap">
        Any money collected because of a pet is part of the security deposit. The total security deposit, including any pet amount, is not more than one month&apos;s rent.
      </p>
      <SignOff role="Tenant" />
      <SignOff role="DMC Properties" />
    </>
  );
}

function OfficialChecklist({ unit, tenant }: { unit: string; tenant: string }) {
  return (
    <>
      <Letterhead
        title={formTitle('checklist')}
        cite="Print helper. Not a substitute for the official notices."
        unit={unit}
        tenant={tenant}
      />
      <p className="dmc-prose">
        Print the city and EPA PDFs as-is. Do not rewrite them. Open each link, then print that official file.
      </p>
      <ol className="dmc-links">
        {OFFICIAL_PDFS.map((item) => (
          <li key={item.href}>
            <label className="dmc-check-line">
              <input type="checkbox" className="dmc-check" />
              <span>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </span>
            </label>
            <p className="dmc-link-note">{item.note}</p>
            <p className="dmc-url">{item.href}</p>
            <p className="dmc-url">
              <a href={item.page} target="_blank" rel="noopener noreferrer">
                {item.pageLabel}
              </a>
              {' · '}
              {item.page}
            </p>
          </li>
        ))}
      </ol>
    </>
  );
}

function FormBody({ id, unit, tenant }: { id: FormId; unit: string; tenant: string }) {
  switch (id) {
    case 'receipt':
      return <PaymentReceipt unit={unit} tenant={tenant} />;
    case 'lead':
      return <LeadDisclosure unit={unit} tenant={tenant} />;
    case 'bedbug':
      return <BedBugNotice unit={unit} tenant={tenant} />;
    case 'pet':
      return <PetAcknowledgment unit={unit} tenant={tenant} />;
    case 'checklist':
      return <OfficialChecklist unit={unit} tenant={tenant} />;
    default: {
      const unreachable: never = id;
      return unreachable;
    }
  }
}

export const BlankForms: React.FC = () => {
  const [active, setActive] = useState<FormId | null>(null);
  const [unit, setUnit] = useState('');
  const [tenant, setTenant] = useState('');

  useEffect(() => {
    document.getElementById('print-forms')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div>
      <div className="dmc-no-print mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-sm bg-app-accent px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white">
            Est. 1924 · Blank templates
          </div>
          <h2 className="font-serif text-4xl font-black text-app-text">
            Print <span className="italic">forms</span>
          </h2>
          <p className="mt-2 max-w-xl text-sm font-medium text-app-text/60">
            Blank DMC Properties forms for any unit at 3875 Ruby Street. Leave unit and tenant empty, or type them before you print.
          </p>
        </div>
        <img src={dmcHeader} alt="DMC Properties" className="h-16 w-auto object-contain object-left" />
      </div>

      {active === null ? (
        <div className="dmc-no-print grid grid-cols-1 gap-6 md:grid-cols-2">
          {FORM_CARDS.map((card, index) => (
            <motion.button
              key={card.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => setActive(card.id)}
              className="rounded-[2rem] border border-app-border bg-app-card p-8 text-left shadow-lg transition hover:border-app-accent/40"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="rounded-2xl bg-app-accent/10 p-3 text-app-accent">
                  <card.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-text/40">Blank</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-app-text">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-app-text/60">{card.summary}</p>
            </motion.button>
          ))}
        </div>
      ) : (
        <>
          <div className="dmc-no-print sticky top-24 z-30 mb-6 flex flex-col gap-3 rounded-[2rem] border border-app-border bg-app-card/95 p-4 shadow-lg backdrop-blur-md md:flex-row md:items-end">
            <button
              type="button"
              onClick={() => setActive(null)}
              className="inline-flex items-center gap-2 self-start rounded-full border border-app-border px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-app-text"
            >
              <ArrowLeft className="h-4 w-4" /> All forms
            </button>
            <label className="flex-1 text-[10px] font-bold uppercase tracking-widest text-app-text/50">
              Unit #
              <input
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                className="mt-1 w-full rounded-xl border border-app-border bg-app-bg px-3 py-2 text-base font-semibold normal-case tracking-normal text-app-text"
                aria-label="Unit number"
              />
            </label>
            <label className="flex-[2] text-[10px] font-bold uppercase tracking-widest text-app-text/50">
              Tenant
              <input
                value={tenant}
                onChange={(event) => setTenant(event.target.value)}
                className="mt-1 w-full rounded-xl border border-app-border bg-app-bg px-3 py-2 text-base font-semibold normal-case tracking-normal text-app-text"
                aria-label="Tenant name"
              />
            </label>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-app-accent px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white"
            >
              <Printer className="h-4 w-4" /> Print form
            </button>
          </div>
          <article className="dmc-print-root dmc-paper">
            <FormBody id={active} unit={unit} tenant={tenant} />
          </article>
        </>
      )}
    </div>
  );
};
