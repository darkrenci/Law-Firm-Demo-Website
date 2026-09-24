import {
  FirmSettings,
  Attorney,
  PracticeArea,
  Article,
  NewsItem,
  FAQCategory,
  FAQItem,
  ConsultationRequest,
  ContactMessage,
  MediaItem,
  MenuItem,
  User,
  ActivityLog,
  Page,
} from '../types';

export const initialSettings: FirmSettings = {
  general: {
    firmName: 'Lalusis & Partners',
    tagline: 'Legal Precision.',
    headline: 'Legal Precision.',
    subheadline: 'Providing decisive advocacy and sophisticated legal counsel to sovereign entities, multinational conglomerates, and high-net-worth families.',
    establishedYear: 1998,
    logoUrl: '',
    secondaryLogoUrl: '',
    faviconUrl: '',
  },
  contact: {
    address: '888 Ayala Avenue, Grand Tower One',
    suiteFloor: '32nd Floor, Suites 3201-3208',
    cityStateZip: 'Makati City, Metro Manila 1226',
    country: 'Philippines',
    telephone: '+63 (2) 8845-9200',
    emergencyLine: '+63 917 800 5258',
    email: 'contact@lalusislaw.com',
    consultationEmail: 'consultations@lalusislaw.com',
    officeHoursWeekday: 'Monday – Friday: 8:30 AM – 6:30 PM (PHT)',
    officeHoursWeekend: 'Saturday: By Prior Appointment Only',
    googleMapEmbedUrl: 'https://maps.google.com/maps?q=Ayala+Avenue+Makati&t=&z=15&ie=UTF8&iwloc=&output=embed',
  },
  social: {
    linkedin: 'https://linkedin.com/company/lalusis-partners',
    facebook: 'https://facebook.com/lalusislaw',
    twitter: 'https://twitter.com/lalusislaw',
    barDirectory: 'https://sc.judiciary.gov.ph/lawyers-list',
  },
  branding: {
    primaryAccent: '#c59b63',
    secondaryAccent: '#d4af7a',
    backgroundColor: '#0b0b0e',
    cardBackgroundColor: '#141418',
    headingFont: 'Cinzel',
    bodyFont: 'Plus Jakarta Sans',
  },
  seo: {
    defaultTitle: 'Lalusis & Partners | Attorneys at Law – Legal Precision',
    defaultDescription: 'Lalusis & Partners is an elite full-service law firm renowned for commercial dispute resolution, cross-border M&A, intellectual property, and high-stakes advocacy.',
    socialPreviewImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    indexSite: true,
  },
};

export const initialAttorneys: Attorney[] = [
  {
    id: 'atty-1',
    slug: 'atty-leo-lalusis',
    fullName: 'Atty. Leo Lalusis',
    professionalTitle: 'Founding Partner, High-Profile Litigation & Criminal Defense',
    portraitUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80',
    primarySpecialization: 'High-Profile Criminal Defense, Sandiganbayan & Congressional Inquiries',
    biography: 'Atty. Leo Lalusis is a founding partner of Lalusis & Partners and the son of the late NBI Chief Danielito Q. Lalusis, who served the National Bureau of Investigation for almost 30 years. Atty. Leo passed the Bar in 2019 (the last handwritten Bar Examination) in his only attempt. Upon passing, he entered the NBI as Legal Officer assigned in the Legal Division, specifically in Prosecution and High Profile Cases, receiving commendations including for the PNP-PDEA incident. During his tenure with the NBI, he represented the bureau in various Senate and House of Representatives hearings and completed specialized investigative courses. Certified as a Data Protection Officer by UP Open University (2023), he has successfully handled high-profile cases before the DOJ and Sandiganbayan and represented prominent clients in congressional hearings—including the landmark Senate Blue Ribbon Committee hearing on flood control projects. He actively advises high-profile celebrities, media personalities, and institutional figures, and is one of the youngest Master of Laws (LL.M.) candidates in the Graduate School of San Beda University.',
    practiceAreaIds: ['pa-litigation', 'pa-criminal', 'pa-privacy'],
    education: [
      'Master of Laws (LL.M.) Candidate, Graduate School of Law, San Beda University',
      'Certified Data Protection Officer (DPO), UP Open University (2023)',
      'Juris Doctor / Bachelor of Laws',
    ],
    barAdmissions: [
      'Supreme Court of the Philippines (2019 Bar Examination - Passed in Only Attempt, Last Handwritten Bar)',
    ],
    professionalExperience: [
      'Founding Partner, Lalusis & Partners (Present)',
      'Legal Officer, Prosecution & High Profile Cases, Legal Division, National Bureau of Investigation (NBI)',
      'Official Representative for NBI before Senate and House of Representatives Hearings',
      'Trial Counsel before Department of Justice (DOJ) & Sandiganbayan',
    ],
    memberships: [
      'Integrated Bar of the Philippines (IBP)',
      'Certified Data Protection Officers Guild',
    ],
    awards: [
      'NBI Commendation for PNP-PDEA Investigation & Prosecution',
      'Special Recognition for Congressional Inquiries Advocacy',
    ],
    selectedPublications: [
      'Data Privacy Compliance and Corporate Governance in the Philippines (2024)',
      'Procedural Rights in Legislative and Congressional Inquiries (2023)',
    ],
    email: 'leolalusis@lalusislaw.com',
    directPhone: '+63 (2) 8845-9201',
    linkedinUrl: 'https://linkedin.com/in/leolalusis',
    isPartner: true,
    isFeatured: true,
    order: 1,
    isPublished: true,
  },
  {
    id: 'atty-2',
    slug: 'atty-levy-john-lalusis',
    fullName: 'Atty. Levy John Lalusis',
    professionalTitle: 'Founding Partner, Anti-Corruption, Tax & Regulatory Advisory',
    portraitUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    primarySpecialization: 'Anti-Corruption, Tax Specialization & Government Regulatory Advisory',
    biography: 'Atty. Levy John Lalusis is a founding partner of the firm and son of the late NBI Chief Danielito Q. Lalusis. He passed the 2024 Bar Examination. Prior to passing the bar, he served across key government integrity bodies, notably the Presidential Anti-Corruption Commission (PACC) as a Graft Investigator, as well as the Department of Transportation (DOTr). Atty. Levy is a Certified Tax Specialist with multiple government and professional accreditations. Along with his brother Atty. Leo Lalusis, he represents prominent clients before the Sandiganbayan, appellate divisions, and regulatory agencies in matters involving anti-graft investigations, tax structuring, and compliance.',
    practiceAreaIds: ['pa-taxation', 'pa-corporate', 'pa-criminal'],
    education: [
      'Juris Doctor / Bachelor of Laws',
      'Certified Tax Specialist (Multiple Accredited Certifications)',
      'Public Governance & Anti-Corruption Training, PACC',
    ],
    barAdmissions: [
      'Supreme Court of the Philippines (2024 Bar Examination)',
    ],
    professionalExperience: [
      'Founding Partner, Lalusis & Partners (Present)',
      'Graft Investigator, Presidential Anti-Corruption Commission (PACC)',
      'Legal & Regulatory Officer, Department of Transportation (DOTr)',
      'Counsel before Sandiganbayan & Court of Tax Appeals',
    ],
    memberships: [
      'Integrated Bar of the Philippines (IBP)',
      'Philippine Institute of Certified Tax Specialists',
    ],
    awards: [
      'Outstanding Public Service Citation, PACC',
      'Excellence in Anti-Corruption Investigation Award',
    ],
    selectedPublications: [
      'Tax Specialization and Asset Defense in High-Net-Worth Scrutiny (2025)',
      'Navigating Anti-Graft and Corrupt Practices Investigations (2024)',
    ],
    email: 'levylalusis@lalusislaw.com',
    directPhone: '+63 (2) 8845-9202',
    linkedinUrl: 'https://linkedin.com/in/levyjohnlalusis',
    isPartner: true,
    isFeatured: true,
    order: 2,
    isPublished: true,
  },
  {
    id: 'atty-3',
    slug: 'atty-diosdado-anselmo-lalusis',
    fullName: 'Atty. Diosdado Anselmo Lalusis',
    professionalTitle: 'Senior Partner & Senior Advisory Counsel',
    portraitUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    primarySpecialization: 'Administrative Law, Professional Regulation & Superior Appellate Counsel',
    biography: 'Atty. Diosdado Anselmo Lalusis serves as Senior Partner and Senior Advisory Counsel to Lalusis & Partners. A seasoned and veteran lawyer with decades of distinguished public service and private trial practice, Atty. Diosdado headed the Legal Division of the Professional Regulation Commission (PRC) for more than a decade. He brings unmatched institutional depth, administrative jurisprudence mastery, and seasoned appellate guidance to the firm’s most complex regulatory and judicial engagements.',
    practiceAreaIds: ['pa-litigation', 'pa-corporate', 'pa-labor'],
    education: [
      'Bachelor of Laws (LL.B.)',
      'Advanced Administrative Jurisprudence Fellowship',
    ],
    barAdmissions: [
      'Supreme Court of the Philippines',
    ],
    professionalExperience: [
      'Senior Partner & Senior Advisory Counsel, Lalusis & Partners (Present)',
      'Head, Legal Division, Professional Regulation Commission (PRC) (Over 10 Years)',
      'Chief Legal Consultant to State Regulatory Boards',
    ],
    memberships: [
      'Integrated Bar of the Philippines (IBP)',
      'Government Lawyers Association of the Philippines',
    ],
    awards: [
      'Decade of Distinguished Public Service Award, PRC',
      'Senior Jurist Citation for Administrative Law Excellence',
    ],
    selectedPublications: [
      'Administrative Due Process in Professional Regulatory Bodies (2023)',
      'Jurisprudential Standards in Board of Examiners Administrative Inquiries',
    ],
    email: 'diosdadolalusis@lalusislaw.com',
    directPhone: '+63 (2) 8845-9203',
    linkedinUrl: 'https://linkedin.com/in/diosdadolalusis',
    isPartner: true,
    isFeatured: true,
    order: 3,
    isPublished: true,
  },
  {
    id: 'atty-4',
    slug: 'beatrice-clare-tan',
    fullName: 'Beatrice Clare N. Tan',
    professionalTitle: 'Partner, Labor & Executive Compensation',
    portraitUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
    primarySpecialization: 'Labor Law, Executive Compensation & Restructuring',
    biography: 'Beatrice Clare Tan counsels boards of directors and executive committees on corporate re-organizations, collective bargaining agreements, high-profile executive exits, and cross-border employee mobility.',
    practiceAreaIds: ['pa-labor'],
    education: [
      'Bachelor of Civil Law (BCL), University of Oxford (Distinction)',
      'Juris Doctor (J.D.), Ateneo de Manila University School of Law',
      'B.A. in Political Science, University of the Philippines',
    ],
    barAdmissions: [
      'Supreme Court of the Philippines (2011, Top 10)',
    ],
    professionalExperience: [
      'Partner, Lalusis & Partners (2018 – Present)',
      'Senior Associate, Picazo Buyco Tan Fider & Santos (2011 – 2018)',
    ],
    memberships: [
      'People Management Association of the Philippines (Legal Committee)',
      'Employers Confederation of the Philippines (ECOP)',
    ],
    awards: [
      'Labor Lawyer of the Year – Chambers Diversity & Inclusion Awards (2024)',
      'Rising Star – Legal 500 Asia-Pacific',
    ],
    selectedPublications: [
      'Executive Golden Parachutes and Fiduciary Responsibilities in Takeovers (2024)',
      'The New Remote Work Paradigm in Philippine Labor Jurisprudence (2022)',
    ],
    email: 'bctan@lalusislaw.com',
    directPhone: '+63 (2) 8845-9204',
    linkedinUrl: 'https://linkedin.com/in/bctanlaw',
    isPartner: true,
    isFeatured: false,
    order: 4,
    isPublished: true,
  },
  {
    id: 'atty-5',
    slug: 'joaquin-miguel-santos',
    fullName: 'Joaquin Miguel F. Santos',
    professionalTitle: 'Senior Associate, White-Collar Defense',
    portraitUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    primarySpecialization: 'Criminal Defense, Government Investigations & Anti-Corruption',
    biography: 'Atty. Santos concentrates on white-collar defense, securities enforcement, and corporate internal investigations. He has represented corporate directors before regulatory bodies, congressional inquiries, and trial courts.',
    practiceAreaIds: ['pa-criminal', 'pa-litigation'],
    education: [
      'LL.M. in Criminal Justice, Georgetown University Law Center',
      'Juris Doctor (J.D.), Ateneo de Manila University School of Law',
    ],
    barAdmissions: [
      'Supreme Court of the Philippines (2016)',
    ],
    professionalExperience: [
      'Senior Associate, Lalusis & Partners (2019 – Present)',
      'Public Prosecutor (Special Assignment), Department of Justice (2016 – 2019)',
    ],
    memberships: [
      'Integrated Bar of the Philippines',
      'Association of Certified Fraud Examiners (Associate Member)',
    ],
    awards: [
      'Next Generation Partner – Legal 500',
    ],
    selectedPublications: [
      'Anti-Money Laundering Compliance in Decentralized Finance (2025)',
    ],
    email: 'jmsantos@lalusislaw.com',
    directPhone: '+63 (2) 8845-9205',
    linkedinUrl: 'https://linkedin.com/in/jmsantoslaw',
    isPartner: false,
    isFeatured: false,
    order: 5,
    isPublished: true,
  },
  {
    id: 'atty-6',
    slug: 'sophia-isabelle-mendoza',
    fullName: 'Sophia Isabelle R. Mendoza',
    professionalTitle: 'Senior Associate, Real Estate & Infrastructure',
    portraitUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    primarySpecialization: 'Real Estate Syndications, Energy & Public-Private Partnerships',
    biography: 'Sophia Mendoza advises major property developers, private equity funds, and sovereign concessionaires on land acquisition, zoning, master-planned townships, and infrastructure financing.',
    practiceAreaIds: ['pa-real-estate', 'pa-corporate'],
    education: [
      'Juris Doctor (J.D.), University of the Philippines College of Law (Honors)',
      'B.S. in Management Engineering, Ateneo de Manila University',
    ],
    barAdmissions: [
      'Supreme Court of the Philippines (2017)',
    ],
    professionalExperience: [
      'Senior Associate, Lalusis & Partners (2020 – Present)',
      'In-House Legal Counsel, Megaworld Capital Projects (2017 – 2020)',
    ],
    memberships: [
      'Urban Land Institute (Philippines Young Leaders)',
      'Integrated Bar of the Philippines',
    ],
    awards: [
      'In-House Counsel Award Alumni Recognition (2023)',
    ],
    selectedPublications: [
      'Public-Private Partnership Code: Navigating Concessionaire Rights (2024)',
    ],
    email: 'simendoza@lalusislaw.com',
    directPhone: '+63 (2) 8845-9206',
    linkedinUrl: 'https://linkedin.com/in/simendozalaw',
    isPartner: false,
    isFeatured: false,
    order: 6,
    isPublished: true,
  },
];

export const initialPracticeAreas: PracticeArea[] = [
  {
    id: 'pa-corporate',
    slug: 'corporate-law-mergers-acquisitions',
    title: 'Corporate Law & Mergers & Acquisitions',
    iconName: 'Building2',
    shortDescription: 'Comprehensive strategic counsel for multi-billion acquisitions, joint ventures, capital raising, and regulatory compliance.',
    fullDescription: `Lalusis & Partners maintains a premier corporate advisory practice recognized for delivering decisive commercial counsel in transformative transactions. We partner with multinational enterprises, sovereign investment funds, private equity sponsors, and high-growth corporations navigating the complexities of domestic and cross-border commercial law.

### Core Capabilities
- **Cross-Border Mergers & Acquisitions:** End-to-end transaction structuring, antitrust clearance, deep legal due diligence, and negotiation of share purchase agreements.
- **Corporate Governance & Board Advisory:** Formulating executive bylaws, fiduciary conflict navigation, internal compliance policies, and stakeholder dispute mitigation.
- **Foreign Investment & Market Entry:** Facilitating multinational entity registration, negative-list structuring, BOI/PEZA tax incentive registration, and regulatory permits.
- **Joint Ventures & Consortiums:** Drafting bespoke shareholder agreements, voting trusts, and governance dead-lock mechanisms.`,
    featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-1', 'atty-6'],
    faqs: [
      {
        question: 'What approval thresholds trigger mandatory notification before the Philippine Competition Commission?',
        answer: 'Transactions exceeding the statutory Size of Person and Size of Transaction thresholds require formal pre-merger notification before the PCC prior to closing. We conduct immediate preliminary antitrust audits for all deal structures.',
      },
      {
        question: 'How do you handle foreign equity restrictions in regulated industries?',
        answer: 'We assist international investors in crafting legally tested holding structures, joint venture arrangements, and permissible contractual controls strictly compliant with the Foreign Investments Act and Constitution.',
      },
    ],
    seoTitle: 'Corporate Law & M&A Attorneys | Lalusis & Partners',
    seoDescription: 'Elite corporate law and M&A attorneys providing strategic structuring, cross-border transactional counsel, and regulatory defense.',
    status: 'published',
    order: 1,
  },
  {
    id: 'pa-litigation',
    slug: 'civil-commercial-litigation',
    title: 'Civil & Commercial Litigation',
    iconName: 'Scale',
    shortDescription: 'Formidable trial advocacy and dispute resolution before superior appellate courts and international arbitral panels.',
    fullDescription: `When multi-million commercial interests, proprietary assets, or institutional reputations are at stake, our trial team delivers unyielding advocacy. Led by seasoned litigators with decades of supreme appellate and arbitration experience, we approach every dispute with disciplined preparation, rigorous legal analysis, and incisive courtroom strategy.

### Areas of Focus
- **Complex Commercial Disputes:** Shareholder derivative suits, breach of fiduciary obligations, contractual rescissions, and emergency injunctive relief.
- **International & Domestic Arbitration:** Representation under PDRCI, ICC, SIAC, and UNCITRAL arbitration rules.
- **Appellate Practice:** Direct petitions for review before the Court of Appeals and Supreme Court of the Philippines.
- **Asset Recovery & Enforcement:** Cross-border recognition of foreign judgments, attachments, and receivership orders.`,
    featuredImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-2', 'atty-5'],
    faqs: [
      {
        question: 'Can emergency preliminary injunctions be secured prior to full trial on the merits?',
        answer: 'Yes. Upon showing an urgent and grave necessity, irreparable injury, and a clear legal right, our trial litigators frequently obtain temporary restraining orders (TROs) and preliminary writs within days.',
      },
      {
        question: 'What is your success rate in international commercial arbitrations?',
        answer: 'Our partners have successfully secured and enforced multi-million dollar arbitral awards under SIAC, ICC, and PDRCI rules across maritime, construction, and corporate joint ventures.',
      },
    ],
    seoTitle: 'Commercial Litigation & Dispute Resolution | Lalusis & Partners',
    seoDescription: 'Renowned commercial trial attorneys representing clients in high-stakes disputes, arbitration, and supreme appellate litigation.',
    status: 'published',
    order: 2,
  },
  {
    id: 'pa-criminal',
    slug: 'white-collar-defense-investigations',
    title: 'White Collar Defense & Investigations',
    iconName: 'ShieldAlert',
    shortDescription: 'Discreet, vigorous defense for executives, directors, and organizations facing government investigations and financial offenses.',
    fullDescription: `Our white-collar defense attorneys provide immediate, discreet counsel to corporations, managing directors, and high-profile individuals confronting allegations of regulatory violations, financial crime, or government inquiries. We emphasize preemptive risk mitigation, crisis response, and decisive trial representation.

### Defense Capabilities
- **Securities & Financial Crimes:** Defense against insider trading, market manipulation, and AMLA violations.
- **Government & Congressional Inquiries:** Counsel during Senate, House, and Ombudsman investigations.
- **Anti-Graft & Corrupt Practices Act (RA 3019):** Vigorous representation before the Sandiganbayan and Office of the Special Prosecutor.
- **Internal Corporate Inquiries:** Independent internal forensic investigations, compliance audits, and whistleblower protocol reviews.`,
    featuredImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-2', 'atty-5'],
    faqs: [
      {
        question: 'What immediate steps should a corporate executive take upon receipt of a government subpoena?',
        answer: 'Preserve all documents, avoid informal communications with investigators, and immediately retain external defense counsel before making statements or producing evidence.',
      },
    ],
    seoTitle: 'White Collar Defense & Investigations | Lalusis & Partners',
    seoDescription: 'Premier criminal defense and government investigation attorneys defending executives and institutions against corporate and financial charges.',
    status: 'published',
    order: 3,
  },
  {
    id: 'pa-ip',
    slug: 'intellectual-property-technology',
    title: 'Intellectual Property & Technology',
    iconName: 'ShieldCheck',
    shortDescription: 'Safeguarding proprietary algorithms, patents, trademarks, and trade secrets in an evolving digital frontier.',
    fullDescription: `Intellectual property constitutes the lifeblood of today’s modern enterprise. Lalusis & Partners delivers forward-thinking IP strategies that maximize the commercial value of patents, trademarks, software code, and creative works, while vigorously defending against infringement, counterfeiting, and trade secret misappropriation.

### Key Practices
- **Patent & Trademark Prosecution:** Global portfolio filing, trademark opposition, and patent clearance opinions.
- **Technology Licensing & SaaS Contracts:** Enterprise software agreements, IP monetization, and open-source compliance.
- **IP Enforcement & Litigation:** Border seizures with Bureau of Customs, preliminary injunctions against counterfeiters, and damages litigation before the Special Commercial Courts.`,
    featuredImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-3'],
    faqs: [
      {
        question: 'How does the firm safeguard trade secrets during executive employee departures?',
        answer: 'We draft enforceable non-disclosure and non-compete agreements, issue immediate preservation warnings, and pursue emergency injunctive relief if proprietary code or customer databases are compromised.',
      },
    ],
    seoTitle: 'Intellectual Property & Technology Law | Lalusis & Partners',
    seoDescription: 'Elite IP attorneys managing trademark prosecution, patent protection, technology transfer, and high-stakes infringement litigation.',
    status: 'published',
    order: 4,
  },
  {
    id: 'pa-labor',
    slug: 'labor-executive-compensation',
    title: 'Labor, Employment & Executive Strategy',
    iconName: 'Briefcase',
    shortDescription: 'Strategic employment counsel, union negotiations, executive compensation frameworks, and restructuring advisory.',
    fullDescription: `We guide multinational employers through complex workforce management challenges. In an environment characterized by stringent labor regulations, our team balances corporate business agility with strict statutory compliance.

### Practice Highlights
- **Executive Agreements & Golden Parachutes:** Severance terms, restrictive covenants, equity incentive schemes, and non-solicitation covenants.
- **Corporate Restructuring & Redundancy:** Structuring legally defensible downsizings, closures, and retrenchment programs.
- **Collective Bargaining & Labor Unions:** Managing negotiations, grievance handling, and strike prevention.
- **National Labor Relations Commission (NLRC) Litigation:** Defense against illegal dismissal claims, constructive dismissal, and monetary claims.`,
    featuredImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-4'],
    faqs: [
      {
        question: 'What are the legal requisites for implementing a valid redundancy or retrenchment program?',
        answer: 'Philippine labor law mandates proof of actual financial losses or redundant positions, adoption of fair and reasonable selection criteria, 30-day prior written notice to the DOLE and affected staff, and payment of statutory separation pay.',
      },
    ],
    seoTitle: 'Labor & Employment Lawyers | Lalusis & Partners',
    seoDescription: 'Strategic employment counsel for boards and executives on restructuring, compensation, collective bargaining, and NLRC defense.',
    status: 'published',
    order: 5,
  },
  {
    id: 'pa-real-estate',
    slug: 'real-estate-infrastructure-projects',
    title: 'Real Estate & Infrastructure Projects',
    iconName: 'Compass',
    shortDescription: 'Structuring master-planned developments, PPP concessions, land titles, and complex property acquisitions.',
    fullDescription: `From sovereign public-private partnerships (PPP) to mega-township land assemblies, our real estate attorneys provide end-to-end guidance. We structure joint development agreements, oversee due diligence over complex titled estates, and resolve conflicting land claims with utmost diligence.`,
    featuredImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-6', 'atty-1'],
    faqs: [
      {
        question: 'How do you verify land title authenticity and encumbrances for large tract acquisitions?',
        answer: 'We conduct rigorous forensic title traces through the Registry of Deeds, Land Registration Authority, DAR, and DENR to ensure undisputed, unencumbered ownership before fund disbursement.',
      },
    ],
    seoTitle: 'Real Estate & Infrastructure Law Firm | Lalusis & Partners',
    seoDescription: 'Advising institutional developers and concessionaires on infrastructure financing, land title diligence, and property syndication.',
    status: 'published',
    order: 6,
  },
  {
    id: 'pa-taxation',
    slug: 'taxation-wealth-preservation',
    title: 'Taxation & Family Wealth Preservation',
    iconName: 'Coins',
    shortDescription: 'Sophisticated cross-border tax advisory, family trust architectures, and Bureau of Internal Revenue controversy defense.',
    fullDescription: `Our taxation lawyers structure tax-efficient corporate holding vehicles, advise on bilateral tax treaty relief, and build multi-generational trust and succession structures for distinguished family enterprises.`,
    featuredImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-1', 'atty-4'],
    faqs: [
      {
        question: 'How do you handle disputed tax assessments with the Bureau of Internal Revenue (BIR)?',
        answer: 'We represent taxpayers from the issuance of the Notice of Discrepancy through the Court of Tax Appeals (CTA) and Supreme Court, challenging arbitrary assessments and procedural defects.',
      },
    ],
    seoTitle: 'Taxation & Wealth Preservation Law | Lalusis & Partners',
    seoDescription: 'Bespoke tax optimization, family estate architectures, and aggressive BIR assessment defense.',
    status: 'published',
    order: 7,
  },
  {
    id: 'pa-privacy',
    slug: 'data-privacy-cybersecurity',
    title: 'Data Privacy & Cybersecurity',
    iconName: 'Lock',
    shortDescription: 'National Privacy Commission compliance, cross-border data transfer mechanisms, and ransomware crisis management.',
    fullDescription: `We guide data controllers and processors through the complexities of the Data Privacy Act of 2012 (RA 10173) and international frameworks like GDPR. We structure privacy impact assessments, cross-border transfer agreements, and rapid-response protocols for data breach events.`,
    featuredImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-3'],
    faqs: [
      {
        question: 'What is the mandatory timeline for reporting a data breach to the National Privacy Commission (NPC)?',
        answer: 'Data controllers must notify the NPC and affected data subjects within 72 hours from knowledge of a breach involving sensitive personal information or financial data.',
      },
    ],
    seoTitle: 'Data Privacy & Cybersecurity Legal Counsel | Lalusis & Partners',
    seoDescription: 'Navigating NPC data regulations, international transfer architectures, and cyber incident breach response.',
    status: 'published',
    order: 8,
  },
];

export const initialArticles: Article[] = [
  {
    id: 'art-1',
    slug: 'navigating-cross-border-merger-controls-asean',
    title: 'Navigating Cross-Border Merger Controls in Southeast Asian Tech Consolidation',
    featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    authorId: 'atty-1',
    category: 'Legal Insights',
    tags: ['Mergers & Acquisitions', 'Antitrust', 'Competition Law', 'Corporate Governance'],
    excerpt: 'As regional tech ecosystems mature, multi-jurisdictional competition authorities are scrutinizing acquisitions with unprecedented vigor. Here is how transaction principals must structure merger filings.',
    content: `## The Modern Antitrust Landscape in ASEAN

In the past three fiscal years, competition regulators across the ASEAN bloc—most notably the Philippine Competition Commission (PCC), Singapore's CCCS, and Indonesia's KPPU—have moved toward coordinated enforcement frameworks. 

Acquirers can no longer treat national antitrust reviews as isolated post-closing formalities. The consequences of premature consummation ("gun jumping") range from nullification of the acquisition to severe monetary penalties levied directly against corporate directors.

### 1. Mandatory vs. Voluntary Threshold Triggers

Under statutory guidelines, merger notification rules are generally triggered by dual tests:
* **Size of Person (SoP):** The aggregate value of assets or revenues of the ultimate parent entity.
* **Size of Transaction (SoT):** The transaction value or gross assets of the target company.

> "A comprehensive pre-merger notification audit must be initiated concurrently with the preliminary term sheet, not after final documentation has been signed."

### 2. Identifying Non-Horizontal and Digital Market Harms

Modern competition authorities increasingly scrutinize acquisitions of nascent competitors ("killer acquisitions") where traditional revenue thresholds may understate market dominance. Regulators look at data aggregation, network effects, and algorithmic barriers to entry.

### 3. Practical Recommendations for Corporate Boards
1. **Insert Robust Antitrust Conditions Precedent:** Ensure purchase agreements provide sufficient long-stop dates accommodating extended Phase II regulatory investigations.
2. **Institute Clean Team Protocols:** Prevent pre-closing sharing of competitively sensitive pricing and operational data during diligence.
3. **Prepare Proactive Remedy Packages:** Formulate voluntary behavioral or structural undertakings early in the review lifecycle.`,
    publishedAt: '2026-08-18',
    readingTimeMinutes: 7,
    relatedAttorneyId: 'atty-1',
    relatedPracticeAreaId: 'pa-corporate',
    seoTitle: 'Cross-Border Merger Controls in ASEAN | Lalusis & Partners',
    metaDescription: 'Strategic analysis of multi-jurisdictional merger notification hurdles and competition compliance for cross-border acquisitions in Southeast Asia.',
    status: 'published',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-18T14:30:00Z',
  },
  {
    id: 'art-2',
    slug: 'enforcing-foreign-arbitral-awards-supreme-court-doctrine',
    title: 'Enforcing Foreign Arbitral Awards: Recent Supreme Court Doctrines on Public Policy Defense',
    featuredImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    authorId: 'atty-2',
    category: 'Case Discussions',
    tags: ['Arbitration', 'Appellate Litigation', 'Commercial Law'],
    excerpt: 'An analysis of landmark rulings clarifying that the "public policy" ground under the New York Convention must be construed narrowly to preserve pro-enforcement bias.',
    content: `## The Pro-Arbitration Stance of Philippine Courts

The Philippine Supreme Court has consistently reaffirmed its steadfast pro-enforcement doctrine regarding international commercial arbitral awards rendered under the 1958 New York Convention.

Historically, recalcitrant award debtors frequently invoked the vague defense of "violation of public policy" under Article V(2)(b) of the Convention to relitigate issues of fact and substantive law already resolved by the arbitral tribunal.

### Narrow Interpretation of Public Policy
In recent jurisprudence, the High Court held that "public policy" encompasses only those fundamental principles of justice, morality, and deep-rooted public interest whose violation would shock the judicial conscience of the State. 

Errors of law or misappreciation of factual evidence committed by an arbitrator do *not* constitute violations of public policy.

### Key Takeaways for Commercial Counsel
* **Confirmation is Summary in Nature:** Special ADR Rules strictly limit the scope of review in confirmation proceedings.
* **Prohibition Against Interlocutory Appeals:** Orders confirming an arbitral award are immediately executory unless enjoined by a temporary restraining order issued under exceptional circumstances.`,
    publishedAt: '2026-07-29',
    readingTimeMinutes: 6,
    relatedAttorneyId: 'atty-2',
    relatedPracticeAreaId: 'pa-litigation',
    seoTitle: 'Enforcing Foreign Arbitral Awards Doctrine | Lalusis & Partners',
    metaDescription: 'Authoritative review of Supreme Court rulings on the recognition and enforcement of international arbitral awards and public policy defenses.',
    status: 'published',
    createdAt: '2026-07-20T09:00:00Z',
    updatedAt: '2026-07-29T11:15:00Z',
  },
  {
    id: 'art-3',
    slug: 'generative-ai-trade-secrets-corporate-liability',
    title: 'Generative AI, Enterprise Trade Secrets, and Fiduciary Liability in 2026',
    featuredImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    authorId: 'atty-3',
    category: 'Legal Updates',
    tags: ['Intellectual Property', 'Technology', 'Data Privacy', 'Artificial Intelligence'],
    excerpt: 'Enterprise deployment of Large Language Models introduces immediate legal exposure: prompt confidentiality loss, copyright infringement risks, and corporate governance liabilities.',
    content: `## The Dual Threat to Enterprise Intellectual Capital

As corporate executives integrate generative artificial intelligence into core workflows—such as financial modeling, software development, and proprietary contract drafting—the legal safeguards protecting trade secrets are facing unprecedented challenges.

### 1. Inadvertent Waiver of Trade Secret Status
Under settled trade secret jurisprudence, proprietary information retains legal protection *only* if the owner undertakes reasonable measures under the circumstances to maintain secrecy.

When employees paste proprietary source code or financial projections into public-facing cloud AI models whose terms of service permit model training on user inputs, **trade secret status may be deemed forfeited as a matter of law**.

### 2. Emerging Standards of Care for Boards
Boards of directors must implement institutional AI Governance Frameworks, including:
- Dedicated zero-data-retention enterprise licenses.
- Mandatory prompt auditing and data loss prevention (DLP) tools.
- Explicit copyright indemnity protections in vendor service agreements.`,
    publishedAt: '2026-06-14',
    readingTimeMinutes: 5,
    relatedAttorneyId: 'atty-3',
    relatedPracticeAreaId: 'pa-ip',
    seoTitle: 'Generative AI & Enterprise Trade Secrets | Lalusis & Partners',
    metaDescription: 'Legal risks of enterprise LLM deployment, loss of trade secrets, and governance standards for corporate boards.',
    status: 'published',
    createdAt: '2026-06-05T08:30:00Z',
    updatedAt: '2026-06-14T16:00:00Z',
  },
];

export const initialNews: NewsItem[] = [
  {
    id: 'news-1',
    slug: 'chambers-global-2026-lalusis-partners-named-top-tier',
    title: 'Lalusis & Partners Ranked as Top-Tier Firm in Corporate M&A and Dispute Resolution by Chambers Asia-Pacific 2026',
    category: 'award',
    excerpt: 'The global legal directory recognized Lalusis & Partners with Band 1 rankings, praising the firm’s strategic excellence and client dedication.',
    content: 'Chambers Asia-Pacific has officially unveiled its 2026 guide, honoring Lalusis & Partners with Band 1 rankings in both Corporate & Mergers and Acquisitions and Commercial Dispute Resolution. Managing Partner Gabriel M. Lalusis and Senior Partner Victoria Elena Lalusis were each named leading individuals.',
    date: '2026-09-02',
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'news-2',
    slug: 'lalusis-partners-advises-metro-infrastructure-concession',
    title: 'Firm Advises Concessionaire on ₱48-Billion Regional Tollway & Transit Expansion',
    category: 'announcement',
    excerpt: 'Lalusis & Partners acted as sole transaction counsel for the public-private partnership consortium in securing national infrastructure approvals.',
    content: 'Our Real Estate & Infrastructure Practice Group, led by Sophia Isabelle Mendoza and Gabriel Lalusis, advised the concessionaire on closing financial documentation, right-of-way indemnity agreements, and sovereign guarantees for the 48-billion infrastructure initiative.',
    date: '2026-08-14',
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'news-3',
    slug: 'international-arbitration-symposium-paris',
    title: 'Victoria Elena Lalusis to Address International Chamber of Commerce (ICC) Arbitration Summit in Paris',
    category: 'event',
    excerpt: 'Senior Partner Victoria Elena Lalusis will present the keynote on appellate oversight of arbitral procedures across Asian emerging markets.',
    content: 'Victoria Elena Lalusis has been invited by the ICC International Court of Arbitration to present a keynote address at the biennial Paris Summit on modern trends in provisional measures and interim relief in cross-border disputes.',
    date: '2026-07-20',
    status: 'published',
    featuredImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
  },
];

export const initialFAQCategories: FAQCategory[] = [
  { id: 'cat-general', name: 'General & Engagement', order: 1 },
  { id: 'cat-consultation', name: 'Consultations & Conflict Checks', order: 2 },
  { id: 'cat-billing', name: 'Fee Structures & Retainers', order: 3 },
  { id: 'cat-confidentiality', name: 'Confidentiality & Attorney-Client Privilege', order: 4 },
];

export const initialFAQs: FAQItem[] = [
  {
    id: 'faq-1',
    categoryId: 'cat-general',
    question: 'How do I retain Lalusis & Partners as legal counsel?',
    answer: 'Engaging our firm begins with a preliminary inquiry through our Request Consultation portal or by calling our managing partners’ office. Once an initial scope is evaluated and a conflict of interest check is successfully cleared, our firm executes a formal Engagement Letter detailing scope, staffing, fee structures, and deliverables.',
    order: 1,
    isPublished: true,
  },
  {
    id: 'faq-2',
    categoryId: 'cat-consultation',
    question: 'Does submitting a website consultation form establish an attorney-client relationship?',
    answer: 'No. Submitting an inquiry through our website, via email, or by telephone does not automatically create an attorney-client relationship. An attorney-client relationship is strictly formed only after our firm conducts a mandatory conflict-of-interest check and both parties sign a written engagement agreement.',
    order: 2,
    isPublished: true,
  },
  {
    id: 'faq-3',
    categoryId: 'cat-consultation',
    question: 'What types of consultation formats are available?',
    answer: 'We provide three consultation formats: In-Person conferences at our executive offices on Ayala Avenue, Secure Encrypted Video Conferences for international or provincial clients, and Confidential Telephone Consultations with our assigned partners.',
    order: 3,
    isPublished: true,
  },
  {
    id: 'faq-4',
    categoryId: 'cat-billing',
    question: 'What fee structures does Lalusis & Partners utilize?',
    answer: 'Depending on the nature and complexity of the matter, we utilize competitive corporate fee arrangements including: Hourly Rates based on attorney seniority, Milestone-Based Fixed Retainers for transactional M&A and regulatory licensing, and Monthly General Corporate Retainers for ongoing corporate secretarial and operational advisory.',
    order: 4,
    isPublished: true,
  },
  {
    id: 'faq-5',
    categoryId: 'cat-confidentiality',
    question: 'How does the firm ensure absolute confidentiality of client communications?',
    answer: 'Under Canon 21 of the Code of Professional Responsibility and Accountable Conduct, all information disclosed to our attorneys is protected by rigorous attorney-client privilege. Our technical infrastructure utilizes military-grade encryption, isolated client repositories, and air-gapped forensic archives.',
    order: 5,
    isPublished: true,
  },
  {
    id: 'faq-6',
    categoryId: 'cat-general',
    question: 'Does the firm represent international clients with no local entity in the Philippines?',
    answer: 'Yes. A substantial portion of our practice entails representing international enterprises, overseas funds, foreign governments, and non-resident individuals requiring Philippine corporate structuring, dispute defense, or local asset recovery.',
    order: 6,
    isPublished: true,
  },
];

export const initialConsultations: ConsultationRequest[] = [
  {
    id: 'cr-1001',
    referenceNumber: 'LP-2026-0891',
    fullName: 'David Sterling',
    emailAddress: 'd.sterling@pacificvanguard.hk',
    contactNumber: '+852 9123 4567',
    practiceAreaId: 'pa-corporate',
    preferredConsultationType: 'online',
    preferredDate: '2026-09-20',
    preferredTime: '10:00 AM PHT',
    briefConcern: 'Structuring a $45M series-B minority equity investment in a regional logistics provider, including cross-border shareholding vehicles and Philippine antitrust compliance.',
    privacyConsent: true,
    status: 'scheduled',
    internalNotes: 'Initial conflict check cleared on Sept 12. Lead Partner assigned: Gabriel Lalusis. Zoom link generated and dispatched to client.',
    createdAt: '2026-09-12T03:15:00Z',
    updatedAt: '2026-09-12T06:45:00Z',
  },
  {
    id: 'cr-1002',
    referenceNumber: 'LP-2026-0892',
    fullName: 'Maria Teresa Roxas-Vargas',
    emailAddress: 'mt.roxas@vargasproperties.ph',
    contactNumber: '+63 918 882 1900',
    practiceAreaId: 'pa-litigation',
    preferredConsultationType: 'in_person',
    preferredDate: '2026-09-22',
    preferredTime: '2:30 PM PHT',
    briefConcern: 'Urgent commercial injunction required regarding a disputed land joint-venture development contract in Bonifacio Global City.',
    privacyConsent: true,
    status: 'new',
    internalNotes: 'Awaiting preliminary conflicts clearance against counterparty BGC Consortium Ltd. Assigned to Atty. Victoria Lalusis.',
    createdAt: '2026-09-13T01:20:00Z',
    updatedAt: '2026-09-13T01:20:00Z',
  },
  {
    id: 'cr-1003',
    referenceNumber: 'LP-2026-0888',
    fullName: 'Alexander Wright',
    emailAddress: 'awright@fintechsolutions.sg',
    contactNumber: '+65 6789 0123',
    practiceAreaId: 'pa-ip',
    preferredConsultationType: 'online',
    preferredDate: '2026-09-18',
    preferredTime: '4:00 PM PHT',
    briefConcern: 'Patenting our proprietary cryptographic tokenization engine in the Philippines and reviewing trademark opposition risks.',
    privacyConsent: true,
    status: 'contacted',
    internalNotes: 'Partner Ramon Valderrama sent introductory questionnaire and fee schedule. Follow-up call set for Sept 15.',
    createdAt: '2026-09-11T09:40:00Z',
    updatedAt: '2026-09-12T04:10:00Z',
  },
];

export const initialContactMessages: ContactMessage[] = [
  {
    id: 'msg-1',
    fullName: 'Eleanor Vance',
    emailAddress: 'evance@globalholdings.com',
    contactNumber: '+1 415 555 0192',
    subject: 'Request for Firm Credentials & Practice Group Profile',
    message: 'We are updating our Asia-Pacific panel of external legal counsel for 2027. Kindly transmit your current firm credentials and dispute resolution representative case list.',
    status: 'unread',
    createdAt: '2026-09-12T14:22:00Z',
  },
  {
    id: 'msg-2',
    fullName: 'Judge Renato S. Beltran (Ret.)',
    emailAddress: 'rbeltran@arbitrationcouncil.org',
    contactNumber: '+63 (2) 8812-4400',
    subject: 'Invitation to Deliver Keynote on Appellate Ethics',
    message: 'On behalf of the Philippine Dispute Resolution Institute, we formally invite Atty. Victoria Elena Lalusis to chair the opening plenary session on November 14.',
    status: 'replied',
    internalNotes: 'Invitation accepted. Executive Assistant coordinating schedule.',
    createdAt: '2026-09-10T08:15:00Z',
  },
];

export const initialMedia: MediaItem[] = [
  {
    id: 'med-1',
    name: 'Firm Executive Monogram Gold',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    fileType: 'image',
    format: 'PNG',
    sizeBytes: 245760,
    category: 'branding',
    altText: 'Official Lalusis & Partners Gold Monogram Emblem',
    createdAt: '2026-09-01',
  },
  {
    id: 'med-2',
    name: 'Executive Boardroom Ayala Avenue',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    fileType: 'image',
    format: 'JPEG',
    sizeBytes: 1240000,
    category: 'offices',
    altText: 'Lalusis & Partners Grand Boardroom Suite, Makati City',
    createdAt: '2026-09-01',
  },
  {
    id: 'med-3',
    name: 'Law Firm Library & Archives',
    url: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
    fileType: 'image',
    format: 'JPEG',
    sizeBytes: 1480000,
    category: 'offices',
    altText: 'Lalusis & Partners Law Library and Jurisprudence Repository',
    createdAt: '2026-09-01',
  },
  {
    id: 'med-4',
    name: 'Supreme Court Architecture',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    fileType: 'image',
    format: 'JPEG',
    sizeBytes: 980000,
    category: 'insights',
    altText: 'Classical Pillars and Scales of Justice',
    createdAt: '2026-09-02',
  },
];

export const initialNavigation: MenuItem[] = [
  { id: 'nav-home', label: 'HOME', path: '/', isVisible: true, order: 1 },
  { id: 'nav-about', label: 'ABOUT', path: '/about', isVisible: true, order: 2 },
  { id: 'nav-attorneys', label: 'PARTNERS', path: '/attorneys', isVisible: true, order: 3 },
  {
    id: 'nav-practice',
    label: 'PRACTICE AREAS',
    path: '/practice-areas',
    isVisible: true,
    order: 4,
    children: [
      { id: 'sub-corp', label: 'Corporate & M&A', path: '/practice-areas/corporate-law-mergers-acquisitions', isVisible: true, order: 1 },
      { id: 'sub-lit', label: 'Commercial Litigation', path: '/practice-areas/civil-commercial-litigation', isVisible: true, order: 2 },
      { id: 'sub-crim', label: 'White Collar Defense', path: '/practice-areas/white-collar-defense-investigations', isVisible: true, order: 3 },
      { id: 'sub-ip', label: 'Intellectual Property', path: '/practice-areas/intellectual-property-technology', isVisible: true, order: 4 },
      { id: 'sub-labor', label: 'Labor & Employment', path: '/practice-areas/labor-executive-compensation', isVisible: true, order: 5 },
      { id: 'sub-re', label: 'Real Estate & Infrastructure', path: '/practice-areas/real-estate-infrastructure-projects', isVisible: true, order: 6 },
    ],
  },
  // Commented out / hidden per user request (uncomment to restore in header navigation):
  // { id: 'nav-insights', label: 'INSIGHTS', path: '/insights', isVisible: false, order: 5 },
  // { id: 'nav-news', label: 'NEWS', path: '/news', isVisible: false, order: 6 },
  // { id: 'nav-faqs', label: 'FAQS', path: '/faqs', isVisible: false, order: 7 },
  { id: 'nav-contact', label: 'CONTACT', path: '/contact', isVisible: true, order: 8 },
];

export const initialUsers: User[] = [
  {
    id: 'usr-1',
    name: 'Atty. Gabriel M. Lalusis',
    email: 'admin@lalusislaw.com',
    role: 'SUPER_ADMIN',
    title: 'Senior Managing Partner',
    avatarUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    createdAt: '2026-01-01',
    lastLogin: '2026-09-13T08:15:00Z',
  },
  {
    id: 'usr-2',
    name: 'Sarah D. Alcantara',
    email: 'admin.cms@lalusislaw.com',
    role: 'ADMINISTRATOR',
    title: 'Director of Practice Operations',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    createdAt: '2026-02-15',
    lastLogin: '2026-09-12T16:20:00Z',
  },
  {
    id: 'usr-3',
    name: 'Atty. Victoria Elena Lalusis',
    email: 'velalusis@lalusislaw.com',
    role: 'ATTORNEY',
    title: 'Senior Partner, Head of Litigation',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    createdAt: '2026-01-01',
    lastLogin: '2026-09-11T11:05:00Z',
  },
  {
    id: 'usr-4',
    name: 'Marcus K. Ocampo',
    email: 'editor@lalusislaw.com',
    role: 'EDITOR',
    title: 'Legal Publications Manager',
    isActive: true,
    createdAt: '2026-03-01',
    lastLogin: '2026-09-10T09:30:00Z',
  },
  {
    id: 'usr-5',
    name: 'Clara S. Villanueva',
    email: 'reviewer@lalusislaw.com',
    role: 'REVIEWER',
    title: 'Senior Legal Research Analyst',
    isActive: true,
    createdAt: '2026-04-10',
    lastLogin: '2026-09-08T14:40:00Z',
  },
  {
    id: 'usr-6',
    name: 'Jonathan L. Perez',
    email: 'staff@lalusislaw.com',
    role: 'STAFF',
    title: 'Intake & Client Liaison Officer',
    isActive: true,
    createdAt: '2026-05-01',
    lastLogin: '2026-09-12T08:00:00Z',
  },
  {
    id: 'usr-7',
    name: 'Auditor External View',
    email: 'viewer@compliance.org',
    role: 'VIEWER',
    title: 'External Compliance Auditor',
    isActive: true,
    createdAt: '2026-06-01',
  },
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    userId: 'usr-1',
    userName: 'Atty. Gabriel M. Lalusis',
    userRole: 'SUPER_ADMIN',
    action: 'Published Article',
    module: 'Legal Insights',
    recordId: 'art-1',
    details: 'Published "Navigating Cross-Border Merger Controls in Southeast Asian Tech Consolidation"',
    timestamp: '2026-09-13T08:10:00Z',
  },
  {
    id: 'log-2',
    userId: 'usr-2',
    userName: 'Sarah D. Alcantara',
    userRole: 'ADMINISTRATOR',
    action: 'Updated Status',
    module: 'Consultation Requests',
    recordId: 'cr-1001',
    details: 'Changed status from "CONTACTED" to "SCHEDULED" for David Sterling ($45M M&A inquiry)',
    timestamp: '2026-09-12T16:20:00Z',
  },
  {
    id: 'log-3',
    userId: 'usr-2',
    userName: 'Sarah D. Alcantara',
    userRole: 'ADMINISTRATOR',
    action: 'Modified Section',
    module: 'Page Builder',
    recordId: 'page-home',
    details: 'Updated Hero Section supporting statement and CTA styling',
    timestamp: '2026-09-12T14:45:00Z',
  },
  {
    id: 'log-4',
    userId: 'usr-4',
    userName: 'Marcus K. Ocampo',
    userRole: 'EDITOR',
    action: 'Created News Item',
    module: 'News',
    recordId: 'news-1',
    details: 'Drafted Chambers Asia-Pacific 2026 Top Tier announcement',
    timestamp: '2026-09-11T10:15:00Z',
  },
  {
    id: 'log-5',
    userId: 'usr-1',
    userName: 'Atty. Gabriel M. Lalusis',
    userRole: 'SUPER_ADMIN',
    action: 'Updated Website Settings',
    module: 'Website Settings',
    recordId: 'settings',
    details: 'Modified emergency consultation hotline and primary office suite address',
    timestamp: '2026-09-10T11:00:00Z',
  },
];

export const initialPages: Page[] = [
  {
    id: 'page-home',
    title: 'Home',
    slug: '',
    isPublished: true,
    template: 'editorial',
    updatedAt: '2026-09-13T08:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    seoTitle: 'Lalusis & Partners | Attorneys at Law – Legal Precision',
    seoDescription: 'Lalusis & Partners provides decisive advocacy and sophisticated legal counsel to sovereign entities, multinational conglomerates, and high-net-worth families.',
    sections: [
      {
        id: 'sec-hero',
        type: 'hero',
        title: 'Hero Section',
        subtitle: 'Main entrance presentation',
        isVisible: true,
        order: 1,
        content: {
          headline: 'Legal Precision.',
          subheadline: 'Representing multinational corporations, prominent families, and industry pioneers across high-stakes corporate transactions, commercial litigation, and appellate advocacy.',
          ctaPrimaryText: 'Request Consultation',
          ctaPrimaryLink: '/consultation',
          ctaSecondaryText: 'Explore Practice Areas',
          ctaSecondaryLink: '/practice-areas',
          showLogoHero: true,
          establishedText: 'ESTABLISHED 1998 · MAKATI CITY',
        },
      },
      {
        id: 'sec-intro',
        type: 'richText',
        title: 'Firm Introduction',
        subtitle: 'Institutional Overview',
        isVisible: true,
        order: 2,
        content: {
          eyebrow: 'Institutional Heritage',
          heading: 'Advocacy Defined by Precision and Discretion',
          body: "The FIRM is founded by Atty. Leo Lalusis and Atty. Levy John Lalusis, under the guidance of their senior partner, Atty. Diosdado Anselmo Lalusis. Brothers Lalusis, is the son of the late NBI Chief Danielito Q. Lalusis, who served the NBI for almost 30 years prior to his untimely passing. Atty. Leo Lalusis- passed the Bar in 2019 (the last handwritten Bar Examination) in his only attempt.  Upon passing, he entered the NBI as Legal Officer  assigned in Legal Division, specifically in Prosecution and High Profile Cases, where he received several commendations like the PNP-PDEA Shootout. During his stay with the NBI, he was also tasked to represent the NBI in various Senate and House of Representative hearings. He attended several investigative courses. Atty. Leo is also a certified Data Protection Officer certified by UP open university in 2023. He is also attended several high profile cases before the DOJ and Sandiganbayan. He has also represented clients in senate hearings specifically the famous Senate Blue Committee Hearing in Flood Control Cases. He also represents high profile celebriti s, social media influencers and others. To even broaden his knowledge in the field of law, he is also one of the youngest Masters of Laws student in the Graduate School of San Beda University. Meanwhile, Atty. Levy lalusis passed the 2024 Bar Examination. Prior to passing the Bar, he previously worked before various government agencies speficially in Presidential Anti-Corruption Commission (PACC) as graft investigator. He also worked in Department of Transportation. Atty Levy is also a certified Tax Specialist and received several certification accredition. Atty. Levy, along with brotherX Atty Leo, both appeared in Sandiganbayan and represented several high profile clients. On the otherhand, Atty. Diosdado Lalusis, is a seasoned and veteran lawyer, who previously head the Professional Regulation Commision Legal Division for more than a decade. Atty. Diosdado is also known",
          stat1Number: '28+',
          stat1Label: 'Years of Appellate Advocacy',
          stat2Number: '₱120B+',
          stat2Label: 'In High-Stakes M&A & Projects',
          stat3Number: '99.4%',
          stat3Label: 'Client Retention & Trust Rate',
        },
      },
      {
        id: 'sec-practices',
        type: 'practiceAreas',
        title: 'Core Practice Areas',
        subtitle: 'Our Fields of Strategic Counsel',
        isVisible: true,
        order: 3,
        content: {
          eyebrow: 'Practice Areas',
          heading: 'Comprehensive Capabilities across Disciplines',
          description: 'From cross-border corporate mergers and supreme court appeals to digital privacy defense and white-collar government enforcement.',
          limit: 6,
          showAllLink: true,
        },
      },
      {
        id: 'sec-why-us',
        type: 'imageText',
        title: 'Why Choose Lalusis & Partners',
        subtitle: 'Distinctive Value Proposition',
        isVisible: true,
        order: 4,
        content: {
          eyebrow: 'The Lalusis Standard',
          heading: 'Uncompromising Ethics. Unrivaled Strategic Depth.',
          body: 'We do not operate as an impersonal volume practice. Every matter is directed by senior partners who bring decades of courtroom mastery, specialized regulatory knowledge, and absolute discretion to the table.',
          points: [
            'Partner-Led Engagement: Your matters are actively strategized and executed by senior partners, not passed off to junior associates.',
            'Supreme Court & Arbitral Track Record: Proven triumphs in landmark commercial litigations before superior appellate bodies.',
            'Discretion & Confidentiality: Ironclad privacy protocols protecting your trade secrets, transactions, and institutional reputation.',
            'Commercial Precision: Legal strategies aligned rigorously with your overarching commercial and balance-sheet objectives.',
          ],
          imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        },
      },
      {
        id: 'sec-attorneys',
        type: 'attorneys',
        title: 'Featured Partners',
        subtitle: 'Leadership & Senior Counsel',
        isVisible: true,
        order: 5,
        content: {
          eyebrow: 'Partners',
          heading: 'Distinguished Partners',
          description: 'Our partners combine elite global academic credentials from Harvard, Columbia, and Oxford with decades of top-tier Philippine bar leadership.',
          limit: 3,
        },
      },
      {
        id: 'sec-stats',
        type: 'stats',
        title: 'Firm Milestones',
        subtitle: 'Quantitative Track Record',
        isVisible: true,
        order: 6,
        content: {
          items: [
            { number: '1998', label: 'Year Established', sublabel: 'Over 28 years of institutional continuity' },
            { number: 'Band 1', label: 'Chambers Asia-Pacific', sublabel: 'Ranked in Corporate M&A & Litigation' },
            { number: '150+', label: 'Landmark Decisions', sublabel: 'Supreme Court & Appellate rulings' },
            { number: '100%', label: 'Confidentiality', sublabel: 'Strict attorney-client privilege' },
          ],
        },
      },
      {
        id: 'sec-cta',
        type: 'cta',
        title: 'Consultation Banner',
        subtitle: 'Direct engagement prompt',
        isVisible: true,
        order: 7,
        content: {
          headline: 'Schedule a Confidential Strategic Consultation',
          body: 'Whether confronting complex regulatory inquiries or orchestrating high-stakes commercial acquisitions, our senior partners are prepared to assist.',
          buttonText: 'Request Consultation',
          buttonLink: '/consultation',
          secondaryText: 'Speak to Managing Partners Directly',
          phoneText: '+63 (2) 8845-9200',
        },
      },
      {
        id: 'sec-contact-info',
        type: 'contactInfo',
        title: 'Office & Location',
        subtitle: 'Executive offices detail',
        isVisible: true,
        order: 8,
        content: {
          heading: 'Executive Chambers',
          subheading: 'Grand Tower One, Ayala Avenue, Makati City',
        },
      },
    ],
  },
  {
    id: 'page-about',
    title: 'About the Firm',
    slug: 'about',
    isPublished: true,
    template: 'editorial',
    updatedAt: '2026-09-12T10:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    seoTitle: 'About Lalusis & Partners | Heritage, Mission & Values',
    seoDescription: 'Discover the institutional heritage, founding partners, core principles, and elite legal advocacy of Lalusis & Partners, Attorneys at Law.',
    sections: [
      {
        id: 'sec-about-hero',
        type: 'heading',
        title: 'About Hero Header',
        isVisible: true,
        order: 1,
        content: {
          eyebrow: 'About the Firm',
          heading: 'A Legacy of Strategic Rigor and Uncompromising Advocacy',
          subheading: 'Founded in 1998, Lalusis & Partners stands as a pillar of legal craftsmanship, counseling high-growth pioneers and established market leaders through high-consequence challenges.',
        },
      },
      {
        id: 'sec-about-story',
        type: 'imageText',
        title: 'Our Heritage & Story',
        isVisible: true,
        order: 2,
        content: {
          eyebrow: 'Our Story',
          heading: 'Forged in Complex Advocacy, Driven by Principle',
          body: 'Lalusis & Partners was established by founding partners Atty. Gabriel M. Lalusis and Atty. Victoria Elena Lalusis following distinguished careers in premier corporate practices and international appellate arbitration. Their goal was deliberate: to build a firm where intellectual depth takes precedence over volume, and where every client receives direct partner engagement. Over the past quarter century, the firm has grown into one of the country’s most respected full-service practices while maintaining the intimacy, agility, and bespoke discretion of a specialized legal institution.',
          imageUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
        },
      },
      {
        id: 'sec-about-values',
        type: 'richText',
        title: 'Mission, Vision & Core Values',
        isVisible: true,
        order: 3,
        content: {
          eyebrow: 'Guiding Principles',
          heading: 'Pillars of the Lalusis Standard',
          body: `**Our Mission:** To provide decisive, surgical, and ethical legal counsel that enables our clients to prevail in their most critical endeavors and protect their enduring legacies.

**Our Vision:** To remain the law firm of first choice for sovereign entities, multinational conglomerates, and high-net-worth families navigating transformative opportunities and existential crises.

**Core Values:**
- **Intellectual Rigor:** We scrutinize every factual nuance, precedent, and statutory interpretation to formulate airtight legal positions.
- **Uncompromised Integrity:** Absolute adherence to ethical standards, transparency, and fiduciary loyalty.
- **Strategic Discretion:** Safeguarding client confidentiality with the highest standards of digital and physical security.
- **Institutional Excellence:** Cultivating legal scholarship and mentoring future bar leaders.`,
        },
      },
      {
        id: 'sec-about-awards',
        type: 'awards',
        title: 'Awards & Recognitions',
        isVisible: true,
        order: 4,
        content: {
          eyebrow: 'Industry Distinctions',
          heading: 'Recognized by Leading Global Legal Directories',
          items: [
            { award: 'Band 1 Corporate & Finance', organization: 'Chambers Asia-Pacific', year: '2018–2026' },
            { award: 'Top Tier Dispute Resolution', organization: 'The Legal 500 Asia-Pacific', year: '2019–2026' },
            { award: 'Philippine Law Firm of the Year', organization: 'Asian Legal Business Awards', year: '2024' },
            { award: 'Leading IP Practice', organization: 'World Trademark Review (WTR 1000)', year: '2022–2026' },
          ],
        },
      },
    ],
  },
  {
    id: 'page-attorneys',
    title: 'Partners',
    slug: 'attorneys',
    isPublished: true,
    template: 'editorial',
    updatedAt: '2026-09-15T12:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    seoTitle: 'Distinguished Partners | Lalusis & Partners',
    seoDescription: 'Meet the founding partners and senior leadership of Lalusis & Partners, Attorneys at Law.',
    sections: [
      {
        id: 'sec-attorneys-hero',
        type: 'heading',
        title: 'Partners Hero Header',
        isVisible: true,
        order: 1,
        content: {
          eyebrow: 'Firm Leadership',
          heading: 'Partners',
          subheading: 'Founded by former NBI prosecution officers and senior government legal leaders, representing clients in Sandiganbayan, congressional inquiries, and superior courts.',
        },
      },
      {
        id: 'sec-attorneys-grid',
        type: 'attorneys',
        title: 'Partners Directory',
        subtitle: 'Our Senior Partners',
        isVisible: true,
        order: 2,
        content: {
          eyebrow: 'Partner Roster',
          heading: 'Partners',
          description: 'Our partners blend specialized government investigative backgrounds with rigorous private sector advocacy.',
          limit: 12,
        },
      },
      {
        id: 'sec-attorneys-cta',
        type: 'cta',
        title: 'Partner Consultation Banner',
        subtitle: 'Schedule direct meeting',
        isVisible: true,
        order: 3,
        content: {
          headline: 'Consult with Our Senior Partners Directly',
          body: 'Schedule a confidential evaluation of your dispute, criminal defense matter, or regulatory challenge.',
          buttonText: 'Request Consultation',
          buttonLink: '/consultation',
          phoneText: '+63 (2) 8845-9200',
        },
      },
    ],
  },
  {
    id: 'page-practice-areas',
    title: 'Practice Areas',
    slug: 'practice-areas',
    isPublished: true,
    template: 'editorial',
    updatedAt: '2026-09-15T12:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    seoTitle: 'Practice Areas & Disciplines | Lalusis & Partners',
    seoDescription: 'Comprehensive legal capabilities spanning high-profile criminal defense, Sandiganbayan litigation, corporate advisory, tax specialization, and appellate advocacy.',
    sections: [
      {
        id: 'sec-pa-hero',
        type: 'heading',
        title: 'Practice Areas Header',
        isVisible: true,
        order: 1,
        content: {
          eyebrow: 'Fields of Counsel',
          heading: 'Comprehensive Capabilities Across High-Stakes Legal Disciplines',
          subheading: 'From high-profile criminal defense and Sandiganbayan appearances to corporate restructuring and tax defense.',
        },
      },
      {
        id: 'sec-pa-grid',
        type: 'practiceAreas',
        title: 'Practice Areas Grid',
        subtitle: 'Specialized Practice Groups',
        isVisible: true,
        order: 2,
        content: {
          eyebrow: 'Specialized Disciplines',
          heading: 'Our Core Fields of Practice',
          description: 'Explore our multi-disciplinary practices led by experienced partners.',
          limit: 12,
          showAllLink: false,
        },
      },
      {
        id: 'sec-pa-cta',
        type: 'cta',
        title: 'Retainer & Counsel Call to Action',
        subtitle: 'Engagement inquiry',
        isVisible: true,
        order: 3,
        content: {
          headline: 'Retain Strategic Counsel for Your Legal Matters',
          body: 'Whether navigating complex regulatory inquiries or corporate dispute resolution, our legal team stands ready.',
          buttonText: 'Schedule Consultation',
          buttonLink: '/consultation',
          phoneText: '+63 (2) 8845-9200',
        },
      },
    ],
  },
  {
    id: 'page-contact',
    title: 'Chambers & Location',
    slug: 'contact',
    isPublished: true,
    template: 'editorial',
    updatedAt: '2026-09-15T12:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    seoTitle: 'Contact Our Legal Chambers | Lalusis & Partners',
    seoDescription: 'Principal legal chambers and communications directory for Lalusis & Partners, Makati City, Philippines.',
    sections: [
      {
        id: 'sec-contact-hero',
        type: 'heading',
        title: 'Contact Header',
        isVisible: true,
        order: 1,
        content: {
          eyebrow: 'Executive Chambers',
          heading: 'Connect with Our Chambers & Partners',
          subheading: 'Direct access to senior partners, confidential intake desks, and consultation scheduling in Makati City.',
        },
      },
      {
        id: 'sec-contact-main',
        type: 'contactInfo',
        title: 'Chambers Directory & Intake',
        subtitle: 'Locations & Inquiries',
        isVisible: true,
        order: 2,
        content: {
          eyebrow: 'Principal Office',
          headline: 'Official Legal Chambers & Direct Telephone Lines',
          subheadline: 'Ayala Triangle Tower Two, Ayala Avenue, Makati City. Consultations by appointment.',
          phone: '+63 (2) 8845-9200',
          email: 'contact@lalusislaw.com',
          addressTitle: 'Principal Legal Chambers',
          address: '32nd Floor, Ayala Triangle Tower Two, Ayala Avenue, Makati City 1226, Metro Manila, Philippines',
        },
      },
    ],
  },
  {
    id: 'page-consultation',
    title: 'Request Consultation',
    slug: 'consultation',
    isPublished: true,
    template: 'editorial',
    updatedAt: '2026-09-15T12:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    seoTitle: 'Request Legal Consultation | Lalusis & Partners',
    seoDescription: 'Submit your legal matter for conflict clearance and evaluation by the partners of Lalusis & Partners.',
    sections: [
      {
        id: 'sec-consult-hero',
        type: 'heading',
        title: 'Consultation Header',
        isVisible: true,
        order: 1,
        content: {
          eyebrow: 'Confidential Matter Intake',
          heading: 'Request a Strategic Legal Consultation',
          subheading: 'All matters undergo formal conflict check clearance prior to consultation and formal engagement.',
        },
      },
      {
        id: 'sec-consult-form',
        type: 'consultationForm',
        title: 'Intake Questionnaire Form',
        subtitle: 'Secure Transmission',
        isVisible: true,
        order: 2,
        content: {},
      },
    ],
  },
  /* Commented out / hidden pages per user request (uncomment to restore full CMS pages):
  {
    id: 'page-insights',
    title: 'Legal Insights',
    slug: 'insights',
    isPublished: false,
    template: 'editorial',
    updatedAt: '2026-09-12T10:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    seoTitle: 'Legal Insights & Jurisprudence | Lalusis & Partners',
    seoDescription: 'Scholarly jurisprudential analysis, regulatory advisories, and commercial briefings authored by chamber advocates.',
    sections: [
      {
        id: 'sec-insights-head',
        type: 'heading',
        title: 'Insights Header',
        isVisible: true,
        order: 1,
        content: {
          eyebrow: 'Jurisprudential Scholarship',
          heading: 'Legal Insights & Briefings',
          subheading: 'Analysis of appellate doctrine, regulatory compliance developments, and cross-border commercial trends.',
        },
      },
      {
        id: 'sec-insights-grid',
        type: 'articles',
        title: 'Articles Grid',
        isVisible: true,
        order: 2,
        content: { limit: 12 },
      },
    ],
  },
  {
    id: 'page-news',
    title: 'News & Announcements',
    slug: 'news',
    isPublished: false,
    template: 'editorial',
    updatedAt: '2026-09-11T14:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    seoTitle: 'Chamber News & Dispatches | Lalusis & Partners',
    seoDescription: 'Recent firm announcements, transactional closing dispatches, and professional recognitions from Lalusis & Partners.',
    sections: [
      {
        id: 'sec-news-head',
        type: 'heading',
        title: 'News Header',
        isVisible: true,
        order: 1,
        content: {
          eyebrow: 'Chamber Dispatches',
          heading: 'Firm News & Announcements',
          subheading: 'Institutional milestones, landmark transactions, and appointments.',
        },
      },
      {
        id: 'sec-news-grid',
        type: 'news',
        title: 'News Grid',
        isVisible: true,
        order: 2,
        content: { limit: 12 },
      },
    ],
  },
  {
    id: 'page-faqs',
    title: 'FAQs & Retainer Protocol',
    slug: 'faqs',
    isPublished: false,
    template: 'editorial',
    updatedAt: '2026-09-10T12:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    seoTitle: 'Frequently Asked Questions | Lalusis & Partners',
    seoDescription: 'Answers regarding our institutional retainer protocol, billing schedules, and confidential matter intake.',
    sections: [
      {
        id: 'sec-faq-head',
        type: 'heading',
        title: 'FAQ Header',
        isVisible: true,
        order: 1,
        content: {
          eyebrow: 'Retainer Protocol',
          heading: 'Frequently Asked Questions',
          subheading: 'Procedural guidance regarding confidential matter intake and institutional retention.',
        },
      },
      {
        id: 'sec-faq-acc',
        type: 'faq',
        title: 'FAQ Accordion',
        isVisible: true,
        order: 2,
        content: {},
      },
    ],
  },
  */
];
