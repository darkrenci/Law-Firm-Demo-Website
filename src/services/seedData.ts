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
    address: '110, Unit 20, Suite J, Future Point Plaza Suites, Panay Avenue',
    suiteFloor: 'Unit 20, Suite J, Future Point Plaza Suites',
    cityStateZip: 'South Triangle, 1103, Quezon City, NCR, Second District',
    country: 'Philippines',
    telephone: '+63 917 327 5931',
    emergencyLine: '+63 917 327 5931',
    email: 'lalusispartners@gmail.com',
    consultationEmail: 'lalusispartners@gmail.com',
    officeHoursWeekday: 'Monday – Friday: 8:30 AM – 6:30 PM (PHT)',
    officeHoursWeekend: 'Saturday: By Prior Appointment Only',
    googleMapEmbedUrl: 'https://maps.google.com/maps?q=Future+Point+Plaza+Suites+Panay+Avenue+Quezon+City&t=&z=16&ie=UTF8&iwloc=&output=embed',
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
    id: 'atty-2',
    slug: 'atty-levy-john-lalusis',
    fullName: 'Atty. Levy John L.V. Lalusis',
    professionalTitle: 'Founding Partner · Corporate Regulatory Compliance, Tax & Real Estate',
    portraitUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    primarySpecialization: 'Corporate Regulatory Compliance, Tax & Estate Planning, Real Estate & Housing, and Government Investigations',
    biography: 'Atty. Levy John L.V. Lalusis passed the 2024 Bar Examinations. Prior to passing the Bar, Atty. Levy gained deep, first-hand legal experience working across key government agencies. These include the Presidential Anti-Corruption Commission (PACC) as a graft investigator; the National Privacy Commission (NPC), as a lead investigator; and the Department of Transportation (DoT) as a member of the Technical Working Group of its Centralized Bids and Awards Committee.\n\nAtty. Levy was a working student who built a successful career as a Financial and Business Consultant for various firms. During this period, Atty. Levy also honed his skills as an election legal officer, having served in that capacity for the 2013, 2016, 2019 and 2022 National and Local Elections and the 2018 Barangay Elections.\n\nOn top of the practical application of his legal education in the storied career before even earning his law degree and title, Atty. Levy further enriched his legal mind by acquiring several certifications from reputed government agencies and legal education providers such as the Center for Global Best Practices, the Intellectual Property Office of the Philippines (IPOPHL), the Department of Information and Communication Technology (DICT), the PACC, and the NBI, to name a few.\n\nAtty. Levy is likewise a Certified Data Privacy Officer, having received his Certificate from the UP Open University in 2023. Recently, Atty. Levy completed his certification course as Tax Compliance Specialist (TCS).\n\nHis legal acumen is sought after, as before the FIRM’s foundation, Atty. Levy was tapped as external counsel by several esteemed Law Firms in the Country.\n\nCurrently, Atty. Levy specializes in corporate regulatory compliance and housekeeping, tax and estate planning/settlement, housing and real estate. He is also seasoned in the art of litigation, being adept at civil, criminal, administrative and other proceedings, applying both practical and theoretical skills acquired in the course of building his extensive career.',
    practiceAreaIds: [
      'pa-corporate-commercial-projects',
      'pa-tax-estate',
      'pa-real-estate-dhsud',
      'pa-election-law',
      'pa-admin-regulatory',
      'pa-procurement-laws',
      'pa-transportation-laws',
      'pa-ip-law',
      'pa-it-data-privacy',
      'pa-criminal-admin-litigation',
      'pa-civil-family',
    ],
    education: [
      'Tax Compliance Specialist (TCS) Certification',
      'Certified Data Privacy Officer (DPO), UP Open University (2023)',
      'Specialized Certifications: Center for Global Best Practices, IPOPHL, DICT, PACC & NBI',
      'Juris Doctor / Bachelor of Laws',
      'Financial and Business Consultancy Certifications',
    ],
    barAdmissions: [
      'Supreme Court of the Philippines (2024 Bar Examinations)',
    ],
    professionalExperience: [
      'Founding Partner, Lalusis & Partners',
      'Graft Investigator, Presidential Anti-Corruption Commission (PACC)',
      'Lead Investigator, National Privacy Commission (NPC)',
      'Member, Technical Working Group, Centralized Bids and Awards Committee, Department of Transportation (DOTr)',
      'Election Legal Officer (2013, 2016, 2019, 2022 National & Local Elections; 2018 Barangay Elections)',
      'External Counsel to Esteemed Philippine Law Firms',
      'Financial and Business Consultant for Various Corporate Firms',
      'Litigation Counsel in Civil, Criminal, Administrative & Regulatory Proceedings',
    ],
    memberships: [
      'Integrated Bar of the Philippines (IBP)',
      'National Data Privacy Officers Guild (UP Open University)',
      'Philippine Association of Tax Compliance Specialists',
    ],
    awards: [
      'Tax Compliance Specialist (TCS) Credential',
      'Certified Data Privacy Officer (DPO) Credential – UP Open University (2023)',
      'Government Integrity & Regulatory Service Commendations (PACC, NPC & DOTr)',
    ],
    selectedPublications: [
      'Corporate Regulatory Housekeeping and Statutory Compliance in the Philippines (2024)',
      'Navigating Tax Assessments and Estate Settlement: Practical Legal Approaches (2024)',
      'Data Privacy Impact Assessments and Regulatory Governance for Philippine Enterprises (2023)',
    ],
    email: 'lalusispartners@gmail.com',
    directPhone: '+63 917 327 5931',
    linkedinUrl: 'https://linkedin.com/in/levyjohnlalusis',
    isPartner: true,
    isFeatured: true,
    order: 1,
    isPublished: true,
  },
  {
    id: 'atty-3',
    slug: 'atty-diosdado-anselmo-lalusis',
    fullName: 'Atty. Diosdado Anselmo Q. Lalusis',
    professionalTitle: 'Senior Partner · Senior Advisory Counsel & Academician',
    portraitUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    primarySpecialization: 'Administrative Law & Regulatory Compliance, Professional Regulation, Academic & Criminological Jurisprudence, and Trial Advocacy',
    biography: 'Atty. Diosdado is a seasoned and veteran lawyer and academician, a licensed professional teacher no less, with forty years of experience, having passed the grueling 1986 Bar Exams, which were marked by a period of transition, legally and politically, for the Republic.\n\nAmong his badges of honor is heading the Professional Regulation Commission’s (PRC) Legal Division for more than a decade. In this role, he evaluated administrative complaints involving various professionals, including doctors, engineers, architects, nurses, and professional teachers, among others. He further distinguished himself at the PRC by serving as Officer-in-Charge (OIC) of the Office of the Director – Licensure Office and Office of the Chief – Examination Division, respectively.\n\nAs an academician, Atty. Diosdado taught at multiple universities in Metro Manila, including St. Jude College and the Universidad de Manila. On top of his experience as an educator, he also served as the Acting Dean of the Philippine College of Criminology’s (PCCR) Criminology School where he mentored and guided numerous police officers through his tutelage who later became distinguished themselves in their careers.',
    practiceAreaIds: [
      'pa-admin-regulatory',
      'pa-civil-family',
      'pa-criminal-admin-litigation',
      'pa-labor-law',
      'pa-corporate-governance',
    ],
    education: [
      'Licensed Professional Teacher (LPT) – Board Licensure',
      'Bachelor of Laws (LL.B.) / Juris Doctor',
      'Former Acting Dean, Philippine College of Criminology (PCCR) Criminology School',
      'Law and Criminology Faculty, Universidad de Manila & St. Jude College',
    ],
    barAdmissions: [
      'Supreme Court of the Philippines (Grueling 1986 Bar Examinations – 40 Years of Legal Excellence)',
    ],
    professionalExperience: [
      'Senior Partner & Senior Advisory Counsel, Lalusis & Partners (40 Years of Experience)',
      'Head, Legal Division, Professional Regulation Commission (PRC) (Over a Decade)',
      'Officer-in-Charge (OIC), Office of the Director – Licensure Office, PRC',
      'Officer-in-Charge (OIC), Office of the Chief – Examination Division, PRC',
      'Evaluated Administrative Complaints Involving Doctors, Engineers, Architects, Nurses, and Professional Teachers',
      'Acting Dean, Philippine College of Criminology (PCCR) Criminology School',
      'Law Professor & Academician, Universidad de Manila & St. Jude College',
      'Senior Trial & Appellate Counsel before Regional Trial Courts, Court of Appeals & Supreme Court',
    ],
    memberships: [
      'Integrated Bar of the Philippines (IBP)',
      'Licensed Professional Teachers Association of the Philippines',
      'Philippine Association of Law Professors and Criminologists',
    ],
    awards: [
      'Distinguished Service Leadership Award – PRC Legal Division',
      'Exemplary Educator Citation – Philippine College of Criminology (PCCR)',
      'Four Decades of Honorable Legal Advocacy – Supreme Court Roll Citation',
    ],
    selectedPublications: [
      'Administrative Due Process and Disciplinary Adjudication in Professional Regulation (2023)',
      'Standards of Evidence in Malpractice and Professional Conduct Inquiries',
      'Pedagogy in Criminal Jurisprudence and Law Enforcement Education',
    ],
    email: 'lalusispartners@gmail.com',
    directPhone: '+63 917 327 5931',
    linkedinUrl: 'https://linkedin.com/in/diosdadolalusis',
    isPartner: true,
    isFeatured: true,
    order: 2,
    isPublished: true,
  },
  {
    id: 'atty-1',
    slug: 'atty-leo-lalusis',
    fullName: 'Atty. Leo Anselmo L.V. Lalusis',
    professionalTitle: 'Founding Partner · High-Profile Litigation & Criminal Defense',
    portraitUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80',
    primarySpecialization: 'High-Profile Criminal Defense, Congressional Inquiries, DOJ/Ombudsman/Sandiganbayan Advocacy, and Data Privacy',
    biography: 'Atty. Leo Lalusis passed the Bar in 2019, the last traditional (handwritten) Bar Examination, in his first and only attempt.\n\nAfter being admitted to the Bar, he followed in his father\'s footsteps and joined the NBI as a Legal Officer. There, he was assigned to the Bureau’s Legal Division, specifically the Prosecution and High-Profile Cases Team, where he received several commendations for working on cases such as the sensational PNP-PDEA Shootout in 2021 and the investigation into the murder of Percival “Percy Lapid” Mabasa in 2022, among others. During his time with the NBI, he attended several investigative courses and was also tasked with representing the premier investigative agency in various Senate and House of Representatives hearings.\n\nAs a litigation lawyer, Atty. Leo is well experienced, having attended several high-profile cases before the Department of Justice (DOJ), the Office of the Ombudsman, and the Sandiganbayan.\n\nHaving compiled a portfolio of several high-profile cases, Atty. Leo has also represented clients before the Senate of the Philippines, among which includes the controversial probe on the Flood Control Scam conducted by the Senate Blue Ribbon Committee. This earned him the trust and confidence of several high-profile celebrities and social media influencers who continue to retain his services for delivering satisfactory representation.\n\nWith a desire to deepen his legal knowledge, Atty. Leo attended several legal trainings and certificate courses to keep abreast of the complexities of emerging fields of law and ensure that the client’s best interests are delivered. He became a Certified Data Protection Officer, certified by the University of the Philippines (UP) Open University in 2021, and is currently taking his Master of Laws (LL.M.) at the San Beda University Graduate School of Law, one of the youngest in his class.',
    practiceAreaIds: [
      'pa-criminal-admin-litigation',
      'pa-it-data-privacy',
      'pa-civil-family',
      'pa-corporate-governance',
      'pa-election-law',
    ],
    education: [
      'Master of Laws (LL.M.) Candidate, Graduate School of Law, San Beda University (One of the youngest in his class)',
      'Certified Data Protection Officer (DPO), UP Open University (2021)',
      'Specialized Investigative Courses, National Bureau of Investigation (NBI)',
      'Juris Doctor / Bachelor of Laws',
    ],
    barAdmissions: [
      'Supreme Court of the Philippines (2019 Bar Examination – Passed on First & Only Attempt, Last Traditional Handwritten Bar)',
    ],
    professionalExperience: [
      'Founding Partner, Lalusis & Partners',
      'Legal Officer, Prosecution & High-Profile Cases Team, Legal Division, National Bureau of Investigation (NBI)',
      'Official Representative for the NBI before Senate and House of Representatives Hearings',
      'Trial Counsel before Department of Justice (DOJ), Office of the Ombudsman, and Sandiganbayan',
      'Counsel in Landmark Senate Blue Ribbon Committee Hearings (Flood Control Scam Probe)',
      'Retained Legal Counsel to High-Profile Celebrities, Social Media Influencers, and Institutional Clients',
    ],
    memberships: [
      'Integrated Bar of the Philippines (IBP)',
      'Certified Data Protection Officers Guild',
      'San Beda University Graduate School of Law Jurisdictional Society',
    ],
    awards: [
      'NBI Commendation for PNP-PDEA Shootout Investigation and Prosecution (2021)',
      'NBI Commendation for Percival "Percy Lapid" Mabasa Murder Case Investigation (2022)',
      'Special Recognition for Congressional Inquiries Advocacy (Senate & House)',
    ],
    selectedPublications: [
      'Investigative Jurisprudence and Evidence Handling in High-Profile Prosecutions (2024)',
      'Rights and Privileges of Witnesses and Resource Persons in Legislative Inquiries (2023)',
      'Data Privacy Compliance and Corporate Governance under Republic Act 10173 (2022)',
    ],
    email: 'lalusispartners@gmail.com',
    directPhone: '+63 917 327 5931',
    linkedinUrl: 'https://linkedin.com/in/leolalusis',
    isPartner: true,
    isFeatured: true,
    order: 3,
    isPublished: true,
  },
];

export const initialPracticeAreas: PracticeArea[] = [
  {
    id: 'pa-criminal-admin-litigation',
    slug: 'criminal-and-administrative-litigation',
    title: 'Criminal and Administrative Litigation',
    iconName: 'ShieldAlert',
    shortDescription: 'Aggressive trial advocacy and crisis defense before superior courts, the DOJ, Sandiganbayan, and administrative tribunals.',
    fullDescription: `Lalusis & Partners delivers formidable trial and appellate representation across high-profile criminal litigation, white-collar defense, government enforcement, and administrative disciplinary proceedings. Led by former government prosecution counsel with extensive trial experience, we protect institutional and individual reputations under intense regulatory and public scrutiny.

### Core Capabilities
- **High-Profile Criminal Defense:** Representation in preliminary investigations before the DOJ, Ombudsman, and trial defense before Regional Trial Courts and Sandiganbayan.
- **Administrative Disciplinary Proceedings:** Defense before the Civil Service Commission (CSC), Office of the President, and department-level investigative panels.
- **Congressional & Legislative Inquiries:** Decisive representation during Senate Blue Ribbon and House Committee investigations.
- **Anti-Graft & Financial Crimes:** Defense against allegations under Republic Act No. 3019 (Anti-Graft and Corrupt Practices Act) and AMLA enforcement.`,
    featuredImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-1', 'atty-2', 'atty-3'],
    faqs: [
      {
        question: 'What immediate actions are taken upon receipt of a government subpoena or show-cause order?',
        answer: 'We secure all records, coordinate immediate legal representation, assess exposure, and prepare comprehensive counter-affidavits within statutory deadlines.',
      },
    ],
    seoTitle: 'Criminal and Administrative Litigation | Lalusis & Partners',
    seoDescription: 'Elite criminal defense and administrative litigation counsel before trial courts, the DOJ, and Sandiganbayan.',
    status: 'published',
    order: 1,
  },
  {
    id: 'pa-civil-family',
    slug: 'civil-and-family-laws',
    title: 'Civil and Family Laws',
    iconName: 'Scale',
    shortDescription: 'Discreet and comprehensive legal counsel in complex contractual obligations, torts, property actions, and matrimonial matters.',
    fullDescription: `We navigate sensitive civil and domestic relations matters with utmost discretion, empathy, and uncompromising legal precision. Our advocates represent clients in complex civil actions, matrimonial dissolutions, child custody, and family wealth protections.

### Key Practices
- **Civil Actions & Damages:** Breach of contract actions, specific performance, quasi-delicts, tort liability, and injunctions.
- **Matrimonial Law:** Petitions for declaration of nullity of marriage, legal separation, and judicial recognition of foreign divorce decrees.
- **Custody, Support & Paternity:** Child custody determinations, spousal and child support enforcement, and habeas corpus for minor custody.
- **Family Estate & Partition:** Judicial and extrajudicial settlement of conjugal partnerships and absolute community properties.`,
    featuredImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-3', 'atty-1'],
    faqs: [
      {
        question: 'How are foreign divorce decrees recognized in Philippine courts?',
        answer: 'We initiate judicial recognition petitions before Regional Trial Courts, proving the foreign decree and foreign governing law pursuant to Rule 108 and Supreme Court jurisprudence.',
      },
    ],
    seoTitle: 'Civil and Family Laws Attorneys | Lalusis & Partners',
    seoDescription: 'Premier civil litigation, family law, annulment, and property dispute counsel in the Philippines.',
    status: 'published',
    order: 2,
  },
  {
    id: 'pa-corporate-commercial-projects',
    slug: 'corporate-commercial-and-special-projects',
    title: 'Corporate, Commercial, and Special Projects',
    iconName: 'Building2',
    shortDescription: 'Strategic corporate structuring, commercial contracts, cross-border investments, and high-impact special commercial projects.',
    fullDescription: `We provide comprehensive legal architecture for domestic and multinational enterprises. From day-to-day corporate housekeeping to multi-million cross-border transactions and infrastructure joint ventures, our counsel is commercially pragmatic and legally resilient.

### Core Capabilities
- **Entity Formation & Market Entry:** Domestic corporations, branch offices, regional operating headquarters (ROHQs), and foreign investment clearance.
- **Mergers & Acquisitions:** End-to-end deal structuring, legal due diligence, antitrust pre-clearance, and drafting share and asset purchase agreements.
- **Special Commercial Projects:** Public-private collaborations, concessions, joint ventures, and syndicated financing structures.
- **Commercial Contracts:** Bespoke distribution, supply, licensing, and master service agreements.`,
    featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-2', 'atty-1'],
    faqs: [
      {
        question: 'How does the firm support foreign corporate entrants into restricted industries?',
        answer: 'We structure compliant corporate vehicles in strict adherence to the Foreign Investment Negative List and relevant ownership thresholds.',
      },
    ],
    seoTitle: 'Corporate, Commercial & Special Projects Law | Lalusis & Partners',
    seoDescription: 'Corporate structuring, commercial transactions, and specialized commercial project counsel.',
    status: 'published',
    order: 3,
  },
  {
    id: 'pa-election-law',
    slug: 'election-law',
    title: 'Election Law',
    iconName: 'Vote',
    shortDescription: 'Formidable counsel in certificate of candidacy filings, pre-proclamation controversies, disqualifications, and election protests.',
    fullDescription: `Election campaigns and post-election contests require immediate, decisive legal intervention. Lalusis & Partners represents political candidates, parties, and party-lists before the Commission on Elections (COMELEC) and the Supreme Court.

### Areas of Focus
- **Candidacy & Qualification:** Petitions to deny due course or cancel Certificate of Candidacy (COC), nuisance candidate petitions, and disqualifications.
- **Canvassing & Pre-Proclamation Controversies:** Board of Canvassers monitoring, automated election system audit interventions, and objections.
- **Election Contests & Protests:** Quo warranto proceedings, recount and revision petitions before Municipal Courts, RTCs, COMELEC, HRET, and SET.
- **Campaign Finance Compliance:** Statement of Contributions and Expenditures (SOCE) compliance and election offense defense.`,
    featuredImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-1', 'atty-3'],
    faqs: [
      {
        question: 'What is the strict prescriptive period for filing an election protest?',
        answer: 'Under COMELEC rules, an election protest must be filed within ten (10) days following the official proclamation of election results.',
      },
    ],
    seoTitle: 'Election Law Attorneys | Lalusis & Partners',
    seoDescription: 'Premier election law advocates handling COMELEC protests, disqualifications, and electoral litigation.',
    status: 'published',
    order: 4,
  },
  {
    id: 'pa-immigration-law',
    slug: 'immigration-law',
    title: 'Immigration Law',
    iconName: 'Globe',
    shortDescription: 'Seamless visa processing, alien registrations, deportation defense, and Bureau of Immigration regulatory advocacy.',
    fullDescription: `We advise multinational corporations, expatriates, and foreign investors on immigration clearance and cross-border mobility. We maintain active representation before the Bureau of Immigration (BI) and Department of Labor and Employment (DOLE).

### Core Services
- **Employment Visas & Work Permits:** 9(g) Pre-arranged Commercial Visas, Alien Employment Permits (AEP), and Special Work Permits (SWP).
- **Investor & Retirement Visas:** Special Investor’s Resident Visa (SIRV) and Special Resident Retiree’s Visa (SRRV).
- **Deportation Defense & Blacklist Lifting:** Representation in summary deportation proceedings and petitions for lifting of blacklist/hold departure orders.
- **Citizenship & Dual Nationality:** Dual citizenship retention/re-acquisition (RA 9225) and judicial or administrative naturalization.`,
    featuredImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-1', 'atty-2'],
    faqs: [
      {
        question: 'How do you assist foreign executives in obtaining an Alien Employment Permit (AEP)?',
        answer: 'We coordinate end-to-end filings with DOLE, ensuring full compliance with labor market verification and qualification documentary rules.',
      },
    ],
    seoTitle: 'Immigration Law Firm | Lalusis & Partners',
    seoDescription: 'Comprehensive Philippine immigration, employment visas, and Bureau of Immigration advocacy.',
    status: 'published',
    order: 5,
  },
  {
    id: 'pa-ip-law',
    slug: 'intellectual-property-law',
    title: 'Intellectual Property Law',
    iconName: 'Sparkles',
    shortDescription: 'Vigorous registration, monetization, and courtroom defense of trademarks, patents, copyrights, and proprietary trade secrets.',
    fullDescription: `Intellectual capital represents the core value of contemporary enterprises. Lalusis & Partners safeguards brands, technical inventions, software code, and creative assets before the Intellectual Property Office of the Philippines (IPOPHL) and the courts.

### Practice Highlights
- **Trademark Prosecution & Portfolio Defense:** Trademark availability searches, domestic and Madrid Protocol filings, and opposition/cancellation proceedings.
- **Patent Prosecution & Utility Models:** Technical patent clearance, drafting claims, and utility model registrations.
- **IP Litigation & Anti-Counterfeiting:** Search warrants, preliminary injunctions, customs border protection seizures, and unfair competition suits.
- **Licensing & Technology Transfer:** Commercial technology transfer agreements and software IP assignments.`,
    featuredImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-1', 'atty-3'],
    faqs: [
      {
        question: 'How fast can an emergency IP injunction be obtained against counterfeit products?',
        answer: 'Through Special Commercial Courts, we can apply for provisional remedies and search-and-seizure orders within days upon demonstrating irreparable harm.',
      },
    ],
    seoTitle: 'Intellectual Property Law | Lalusis & Partners',
    seoDescription: 'Premier intellectual property attorneys for trademark prosecution, patent defense, and anti-counterfeiting litigation.',
    status: 'published',
    order: 6,
  },
  {
    id: 'pa-tax-estate',
    slug: 'tax-and-estate-settlement',
    title: 'Tax and Estate Settlement',
    iconName: 'Coins',
    shortDescription: 'Strategic corporate taxation, BIR audit defense, wealth preservation, and judicial or extrajudicial estate settlement.',
    fullDescription: `Led by certified tax specialists, our tax practice provides sophisticated transactional tax structuring, aggressive Bureau of Internal Revenue (BIR) assessment defense, and generational estate preservation architectures.

### Key Practices
- **Tax Controversy & BIR Assessment Defense:** Representation from Notice of Discrepancy (ND) and Final Assessment Notice (FAN) to the Court of Tax Appeals (CTA).
- **Corporate Tax Advisory:** Tax-free exchanges, corporate reorganizations, tax treaty relief applications, and VAT refunds.
- **Estate Planning & Wealth Preservation:** Testamentary trusts, family holding architectures, lifetime asset transfers, and donor planning.
- **Estate Settlement:** Comprehensive extrajudicial settlements with BIR clearances (CAR issuance), judicial probate, and partition of estates.`,
    featuredImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-2', 'atty-3'],
    faqs: [
      {
        question: 'What are the required steps to secure an eCAR for inherited real properties?',
        answer: 'We prepare the estate tax return, execute the Deed of Extrajudicial Settlement, compute applicable estate taxes, settle with the BIR RDO, and obtain the electronic Certificate Authorizing Registration (eCAR).',
      },
    ],
    seoTitle: 'Tax and Estate Settlement Lawyers | Lalusis & Partners',
    seoDescription: 'Certified tax specialists handling BIR assessment defense, CTA appeals, and estate settlement.',
    status: 'published',
    order: 7,
  },
  {
    id: 'pa-real-estate-dhsud',
    slug: 'real-estate-dhsud-hsac-land-titling',
    title: 'Real Estate (DHSUD, HSAC, and land titling/transfer)',
    iconName: 'Compass',
    shortDescription: 'End-to-end property development compliance, DHSUD permits, HSAC dispute litigation, title transfers, and forensic title cleansing.',
    fullDescription: `We guide property developers, institutional buyers, and landholders across the entire lifecycle of real property transactions. Our counsel spans Department of Human Settlements and Urban Development (DHSUD) compliance, Human Settlements Adjudication Commission (HSAC) litigation, and Land Registration Authority (LRA) titling.

### Areas of Focus
- **DHSUD Regulatory Compliance:** Subdivision and condominium licenses to sell, certificate of registration, and master-deed approvals.
- **HSAC Litigation:** Adjudication of buyer-developer disputes, delayed turnovers, cancellation of contracts, and homeowners association (HOA) controversies.
- **Land Titling & Transfers:** Registry of Deeds transactions, reconstitution of lost titles, forensic title trace, and cancellation of adverse claims.
- **Agrarian Reform (DAR) & Conversions:** Certificates of agrarian reform exemption, land use conversions, and DENR environmental clearances.`,
    featuredImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-2', 'atty-3'],
    faqs: [
      {
        question: 'How do you resolve overlapping or spurious land titles in the Philippines?',
        answer: 'We execute forensic boundary surveys, trace historical decrees via LRA and DENR archives, and file petitions for cancellation of overlapping titles before Regional Trial Courts.',
      },
    ],
    seoTitle: 'Real Estate Law, DHSUD & HSAC Adjudication | Lalusis & Partners',
    seoDescription: 'Leading real estate attorneys for DHSUD licensing, HSAC disputes, and title transfer diligence.',
    status: 'published',
    order: 8,
  },
  {
    id: 'pa-labor-law',
    slug: 'labor',
    title: 'Labor',
    iconName: 'Briefcase',
    shortDescription: 'Strategic employer-employee counsel, collective bargaining negotiations, NLRC litigation, and corporate workforce restructuring.',
    fullDescription: `We advise domestic corporations and multinational enterprises on the complex framework of Philippine labor law. We balance executive management prerogative with statutory protections to safeguard enterprise continuity.

### Core Capabilities
- **NLRC Litigation:** Decisive trial advocacy in illegal dismissal cases, money claims, and unfair labor practice charges before Labor Arbiters.
- **Workforce Restructuring:** Legally bulletproof redundancy, retrenchment, and company closure programs complying with DOLE requirements.
- **Union Relations & Collective Bargaining:** CBA negotiation strategy, grievance handling, strike prevention, and mandatory conciliation-mediation.
- **Executive Contracts & Policies:** Drafting executive severance, non-compete agreements, code of conduct, and workplace policy manuals.`,
    featuredImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-3', 'atty-1'],
    faqs: [
      {
        question: 'What are the essential requisites for a valid termination due to redundancy?',
        answer: 'Strict requirements include written notice to DOLE and the employee 30 days prior, payment of separation pay (at least 1 month per year of service), good faith, and objective selection criteria.',
      },
    ],
    seoTitle: 'Labor Law & Employment Defense | Lalusis & Partners',
    seoDescription: 'Premier employer labor defense, NLRC litigation, collective bargaining, and redundancy counsel.',
    status: 'published',
    order: 9,
  },
  {
    id: 'pa-admin-regulatory',
    slug: 'administrative-and-regulatory-compliance-sec-bir-lgu',
    title: 'Administrative and Regulatory Compliance (SEC, BIR, LGU, etc.)',
    iconName: 'FileCheck',
    shortDescription: 'Proactive regulatory compliance, permits, and defense before the SEC, BIR, Local Government Units, and government agencies.',
    fullDescription: `Navigating multi-tiered regulatory requirements in the Philippines demands deep institutional knowledge. We interface directly with regulators to secure permits, resolve audit discrepancies, and maintain pristine compliance standings.

### Regulatory Interfaces
- **Securities and Exchange Commission (SEC):** Mandatory disclosures, beneficial ownership declarations, capital increases, and penalty contestations.
- **Bureau of Internal Revenue (BIR):** Tax clearances, authority to print, transfer clearances, and administrative protests.
- **Local Government Units (LGUs):** Mayor's and business permits, local business tax (LBT) assessment defense, and zoning clearances.
- **Sectoral Regulators:** Regulatory approvals before FDA, PRC, LTFRB, DICT, and other statutory oversight bodies.`,
    featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-3', 'atty-2'],
    faqs: [
      {
        question: 'How do you contest arbitrary Local Business Tax (LBT) assessments from City Treasurers?',
        answer: 'We file formal written protests under Section 195 of the Local Government Code within sixty (60) days, appealing adverse rulings to Regional Trial Courts.',
      },
    ],
    seoTitle: 'Administrative & Regulatory Compliance Law | Lalusis & Partners',
    seoDescription: 'Strategic regulatory compliance before SEC, BIR, LGUs, and government regulatory agencies.',
    status: 'published',
    order: 10,
  },
  {
    id: 'pa-it-data-privacy',
    slug: 'information-and-technology-and-data-privacy-law',
    title: 'Information and Technology, and Data Privacy Law',
    iconName: 'Lock',
    shortDescription: 'National Privacy Commission compliance, certified DPO services, cyber incident breach protocols, and tech commercial contracts.',
    fullDescription: `Led by certified Data Protection Officers (UP Open University), our practice provides forward-looking legal architecture for digital enterprises, fintech platforms, and data-intensive corporations under RA 10173 (Data Privacy Act of 2012).

### Focus Areas
- **NPC Registration & Compliance:** Enterprise privacy impact assessments (PIA), privacy manuals, and certified DPO representation.
- **Cybersecurity & Data Breach Management:** 72-hour mandatory NPC breach notification, forensics coordination, and crisis mitigation.
- **Technology & Cloud Contracts:** Software-as-a-Service (SaaS), data sharing agreements (DSA), cross-border transfers, and API agreements.
- **Fintech & Digital Commerce:** E-commerce regulatory compliance, electronic signatures, and cybercrime defense.`,
    featuredImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-1', 'atty-2'],
    faqs: [
      {
        question: 'What is the required timeline for reporting a data breach to the NPC?',
        answer: 'The Data Privacy Act mandates notification to the National Privacy Commission and affected data subjects within seventy-two (72) hours upon knowledge of a breach.',
      },
    ],
    seoTitle: 'Data Privacy & IT Law | Lalusis & Partners',
    seoDescription: 'Certified Data Protection Officers and tech law attorneys advising on NPC compliance and cyber response.',
    status: 'published',
    order: 11,
  },
  {
    id: 'pa-corporate-governance',
    slug: 'public-and-private-corporate-governance',
    title: 'Public and Private Corporate Governance',
    iconName: 'Landmark',
    shortDescription: 'Boardroom advisory, fiduciary compliance, shareholder dispute management, ESG policies, and corporate integrity structures.',
    fullDescription: `We counsel boards of directors, audit committees, and controlling shareholders of both public companies and major private corporations. We design governance structures that mitigate legal liabilities and uphold fiduciary standards.

### Core Capabilities
- **Boardroom Advisory & Fiduciary Duties:** Counseling independent directors, navigating conflicts of interest, and director liability mitigation.
- **Shareholder Relations & Dispute Management:** Proxy contests, minority shareholder rights protection, voting trust arrangements, and dead-lock resolution.
- **Internal Compliance & Ethics:** Whistleblower frameworks, anti-bribery policies, and corporate code of conduct audits.
- **ESG & Sustainable Governance:** Environmental, Social, and Governance compliance architectures aligning with global standards.`,
    featuredImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-3', 'atty-2'],
    faqs: [
      {
        question: 'How do you safeguard minority shareholder rights in private corporations?',
        answer: 'We advise on appraisal rights, books inspection under the Revised Corporation Code, derivative suits, and negotiated buy-outs.',
      },
    ],
    seoTitle: 'Public & Private Corporate Governance Law | Lalusis & Partners',
    seoDescription: 'Elite boardroom advisory, corporate governance architecture, and fiduciary compliance counsel.',
    status: 'published',
    order: 12,
  },
  {
    id: 'pa-transportation-laws',
    slug: 'transportation-laws',
    title: 'Transportation Laws',
    iconName: 'Truck',
    shortDescription: 'Comprehensive regulatory advocacy, franchise certificates, DOTr/LTFRB/MARINA permits, and logistics legal structures.',
    fullDescription: `With senior partners possessing investigative and legal service backgrounds within the Department of Transportation (DOTr), Lalusis & Partners provides unmatched insight into aviation, maritime, road transport, and logistics law.

### Key Practices
- **Franchise & Regulatory Permitting:** Certificates of Public Convenience (CPC) before the LTFRB, MARINA vessel registrations, and CAB aviation permits.
- **Logistics & Supply Chain Contracts:** Master freight forwarding agreements, charter parties, carrier liabilities, and multimodal transport terms.
- **Regulatory Defense & Administrative Inquiries:** Representation in DOTr, LTFRB, and Marina show-cause hearings, accident inquiries, and compliance audits.
- **Infrastructure & Concession Agreements:** Public transit concession contracts, port operations, and tollway joint projects.`,
    featuredImage: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-2', 'atty-1'],
    faqs: [
      {
        question: 'How do you handle CPC cancellation proceedings before the LTFRB?',
        answer: 'We prepare verified answers, appear at formal hearings, file motions for reconsideration, and pursue appellate relief before the DOTr and Court of Appeals.',
      },
    ],
    seoTitle: 'Transportation Laws Attorneys | Lalusis & Partners',
    seoDescription: 'Experienced transportation and logistics attorneys handling DOTr, LTFRB, and maritime regulatory compliance.',
    status: 'published',
    order: 13,
  },
  {
    id: 'pa-procurement-laws',
    slug: 'procurement-laws',
    title: 'Procurement Laws',
    iconName: 'FileText',
    shortDescription: 'Government procurement advisory under RA 9184 & the New Government Procurement Act, bidding protests, and PhilGEPS compliance.',
    fullDescription: `Government procurement in the Philippines is governed by stringent statutory rules. Our attorneys guide private contractors and sovereign agencies through the complexities of Republic Act No. 9184 and the recently enacted New Government Procurement Act (RA 12009).

### Areas of Practice
- **Bid Preparation & Compliance Diligence:** Review of Bidding Documents, eligibility requirements, and technical/financial bid compliance.
- **Protest Mechanisms & Bidding Disputes:** Filing formal requests for reconsideration before Bids and Awards Committees (BAC) and protests before the Head of Procuring Entity (HoPE).
- **Post-Award & Contract Execution:** Contract performance bonds, warranty securities, variations, and liquidated damages mitigation.
- **Defense Against Blacklisting:** Vigorous defense in administrative blacklisting proceedings initiated by procuring entities before the GPPB and the courts.`,
    featuredImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    relatedAttorneyIds: ['atty-1', 'atty-2', 'atty-3'],
    faqs: [
      {
        question: 'What is the mandatory procedure for protesting a BAC disqualification?',
        answer: 'A bidder must file a written Request for Reconsideration within three (3) calendar days. If denied, a verified protest accompanied by a protest fee must be filed with the HoPE within seven (7) calendar days.',
      },
    ],
    seoTitle: 'Procurement Laws & Government Bidding Attorneys | Lalusis & Partners',
    seoDescription: 'Strategic legal counsel for public procurement, RA 9184 / RA 12009 compliance, and BAC bidding protests.',
    status: 'published',
    order: 14,
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
    answer: 'We provide three consultation formats: In-Person conferences at our executive offices at Future Point Plaza Suites on Panay Avenue, Quezon City, Secure Encrypted Video Conferences for international or provincial clients, and Confidential Telephone Consultations with our assigned partners.',
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
    id: 'med-group-portrait',
    name: 'Founding Partners Institutional Chamber Portrait',
    url: '/assets/group-picture.svg',
    fileType: 'image',
    format: 'SVG',
    sizeBytes: 18450,
    category: 'branding',
    altText: 'Founding Partners of Lalusis & Partners: Atty. Levy John L.V. Lalusis, Senior Partner Atty. Diosdado Anselmo Q. Lalusis, and Atty. Leo Anselmo L.V. Lalusis',
    createdAt: '2026-09-01',
  },
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
    name: 'Executive Chambers Future Point Plaza Suites',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    fileType: 'image',
    format: 'JPEG',
    sizeBytes: 1240000,
    category: 'offices',
    altText: 'Lalusis & Partners Executive Chambers Suite, Future Point Plaza, Quezon City',
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
          videos: [
            {
              id: 'vid-1',
              title: 'Decisive Trial Advocacy & Bureau Leadership',
              subtitle: 'Atty. Leo Lalusis · Managing Partner',
              description: 'Decades of seasoned trial litigation, landmark prosecution commendations, and high-profile public defense.',
              duration: '03:45',
              tag: 'Trial Eminence',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
            },
            {
              id: 'vid-2',
              title: '150+ Supreme Court Rulings & Appellate Advocacy',
              subtitle: 'Senior Partner Atty. Diosdado Anselmo Lalusis',
              description: 'Over 150 superior appellate rulings, landmark constitutional advocacy, and unmatched jurisprudential depth.',
              duration: '04:12',
              tag: 'Supreme Court Practice',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
            },
            {
              id: 'vid-3',
              title: '₱180B+ Transactions Advised & Tier 1 Practice',
              subtitle: 'Atty. Levy John Lalusis · Partner & Tax Specialist',
              description: 'Cross-border mergers and acquisitions, sovereign regulatory compliance, and premier corporate counsel.',
              duration: '03:18',
              tag: 'Corporate & M&A',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
            },
          ],
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
          eyebrow: '',
          heading: '',
          imageUrl: '/assets/group-picture.svg',
          imageAlt: 'Lalusis & Partners Founding Partners – Atty. Levy John Lalusis, Atty. Diosdado Anselmo Lalusis, and Atty. Leo Lalusis',
          imageCaption: 'Founding Partners of Lalusis & Partners · Atty. Levy John Lalusis · Atty. Diosdado Anselmo Lalusis · Atty. Leo Lalusis',
          body: "The FIRM is founded by Atty. Leo Lalusis and Atty. Levy John Lalusis, under the guidance of their senior partner, Atty. Diosdado Anselmo Lalusis. Brothers Lalusis, is the son of the late NBI Chief Danielito Q. Lalusis, who served the NBI for almost 30 years prior to his untimely passing.\n\nAtty. Leo Lalusis passed the Bar in 2019 (the last handwritten Bar Examination) in his only attempt. Upon passing, he entered the NBI as Legal Officer assigned in the Legal Division, specifically in Prosecution and High Profile Cases, where he received several commendations, including for the PNP-PDEA incident. During his stay with the NBI, he was also tasked to represent the bureau in various Senate and House of Representatives hearings and attended several specialized investigative courses. Atty. Leo is also a certified Data Protection Officer (UP Open University, 2023) and has handled high-profile cases before the DOJ and Sandiganbayan. He has represented prominent clients in congressional hearings, including the landmark Senate Blue Ribbon Committee hearings in flood control cases, as well as leading public figures and influencers. To further broaden his jurisprudential acumen, he is one of the youngest Master of Laws candidates in the Graduate School of San Beda University.\n\nMeanwhile, Atty. Levy John Lalusis passed the 2024 Bar Examination. Prior to his admission to the bar, he served with distinguished government bodies, specifically within the Presidential Anti-Corruption Commission (PACC) as a graft investigator and the Department of Transportation (DOTr). Atty. Levy is a certified Tax Specialist with multiple accreditations. Alongside his brother Atty. Leo, he has appeared before the Sandiganbayan representing high-profile institutional and private clients in contentious matters.\n\nOn the other hand, Atty. Diosdado Anselmo Lalusis is a seasoned and veteran lawyer who headed the Professional Regulation Commission (PRC) Legal Division for more than a decade. Atty. Diosdado brings seasoned appellate advocacy, exemplary institutional integrity, and foundational legal mentorship to the firm's sovereign and corporate clientele.",
        },
      },
      {
        id: 'sec-partners',
        type: 'attorneys',
        title: 'Featured Partners',
        subtitle: 'Leadership & Senior Counsel',
        isVisible: true,
        order: 3,
        content: {
          eyebrow: 'Partners',
          heading: 'Distinguished Partners',
          description: 'Under the guidance of senior leadership, our founding and senior partners direct high-stakes litigation, supreme court appeals, and complex corporate transactions with precision and discretion.',
          limit: 3,
        },
      },
      {
        id: 'sec-practices',
        type: 'practiceAreas',
        title: 'Core Practice Areas',
        subtitle: 'Our Fields of Strategic Counsel',
        isVisible: true,
        order: 4,
        content: {
          eyebrow: 'Practice Areas',
          heading: 'Comprehensive Capabilities across Disciplines',
          description: 'Fourteen dedicated disciplines encompassing trial litigation, corporate restructuring, regulatory compliance, elections, and specialized transactional legal affairs.',
          limit: 14,
          showAllLink: true,
        },
      },
      {
        id: 'sec-why-us',
        type: 'imageText',
        title: 'Why Choose Lalusis & Partners',
        subtitle: 'Distinctive Value Proposition',
        isVisible: true,
        order: 5,
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
          phoneText: '+63 917 327 5931',
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
          subheading: '110, Unit 20, Suite J, Future Point Plaza Suites, Panay Avenue, Quezon City',
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
          phoneText: '+63 917 327 5931',
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
          phoneText: '+63 917 327 5931',
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
    seoDescription: 'Principal legal chambers and communications directory for Lalusis & Partners, Quezon City, Philippines.',
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
          subheading: 'Direct access to senior partners, confidential intake desks, and consultation scheduling in Quezon City.',
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
          subheadline: 'Future Point Plaza Suites, Panay Avenue, South Triangle, Quezon City. Consultations by appointment.',
          phone: '+63 917 327 5931',
          email: 'lalusispartners@gmail.com',
          addressTitle: 'Principal Legal Chambers',
          address: '110, Unit 20, Suite J, Future Point Plaza Suites, Panay Avenue, South Triangle, 1103, Quezon City, NCR, Second District, Philippines',
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
