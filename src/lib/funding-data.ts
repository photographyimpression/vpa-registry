// Funding opportunity and human task queue types + seed data

export type FundingCategory = 'grant' | 'tax-credit' | 'loan' | 'accelerator';
export type FundingStatus = 'discovered' | 'evaluating' | 'drafting' | 'ready-for-review' | 'submitted' | 'approved' | 'rejected';
export type TaskType = 'review-draft' | 'upload-document' | 'verify-info' | 'schedule-call' | 'sign-document' | 'answer-question';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'approved' | 'rejected' | 'skipped';

export interface FundingOpportunity {
    id: string;
    name: string;
    provider: string;
    country: string;
    province?: string;
    category: FundingCategory;
    maxAmount: number;
    deadline?: string;
    eligibilityScore: number;
    status: FundingStatus;
    description: string;
    url: string;
    requirements: string[];
    aiNotes: string;
}

export interface HumanTask {
    id: string;
    fundingId: string;
    fundingName: string;
    type: TaskType;
    title: string;
    description: string;
    aiSuggestion: string;
    priority: TaskPriority;
    deadline?: string;
    status: TaskStatus;
    createdAt: string;
}

// ── Seed data: real Canadian + international funding programs ──

export const FUNDING_OPPORTUNITIES: FundingOpportunity[] = [
    {
        id: 'sred-2026',
        name: 'SR&ED Tax Credit (2025 Fiscal Year)',
        provider: 'Canada Revenue Agency',
        country: 'Canada',
        province: 'Federal',
        category: 'tax-credit',
        maxAmount: 45000,
        deadline: '2027-06-30',
        eligibilityScore: 92,
        status: 'drafting',
        description: 'Scientific Research & Experimental Development tax incentive. Claim up to 35% of eligible R&D expenditures as a refundable tax credit for CCPCs.',
        url: 'https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program.html',
        requirements: [
            'T661 form with project descriptions',
            'Detailed time tracking for R&D activities',
            'Financial statements showing R&D expenditures',
            'Technical documentation of experiments',
        ],
        aiNotes: 'VPA\'s image hashing algorithm, QR verification system, and AI-detection pipeline all qualify as eligible SR&ED activities. Estimated claim: $35K-$45K based on 2025 dev costs.',
    },
    {
        id: 'irap-2026',
        name: 'NRC IRAP — Innovation Assistance',
        provider: 'National Research Council Canada',
        country: 'Canada',
        province: 'Federal',
        category: 'grant',
        maxAmount: 350000,
        deadline: undefined,
        eligibilityScore: 78,
        status: 'evaluating',
        description: 'Advisory services and financial assistance for technology innovation. Non-repayable contributions for SMEs with fewer than 500 employees.',
        url: 'https://nrc.canada.ca/en/support-technology-innovation/nrc-irap-program',
        requirements: [
            'Incorporated Canadian business',
            'Fewer than 500 employees',
            'Innovative technology project',
            'Growth-oriented business plan',
            'Interview with IRAP Industrial Technology Advisor',
        ],
        aiNotes: 'VPA fits the profile well — anti-counterfeiting SaaS is innovative, no direct competitors in Canada. Main hurdle: IRAP requires a phone interview. I\'ve drafted talking points for you.',
    },
    {
        id: 'canexport-2026',
        name: 'CanExport Innovation',
        provider: 'Global Affairs Canada',
        country: 'Canada',
        province: 'Federal',
        category: 'grant',
        maxAmount: 75000,
        deadline: '2026-09-30',
        eligibilityScore: 85,
        status: 'discovered',
        description: 'Funding for Canadian businesses to develop, adapt, and validate products for new export markets. Covers up to 75% of eligible costs.',
        url: 'https://www.tradecommissioner.gc.ca/funding-financement/canexport/innovation.aspx',
        requirements: [
            'Canadian-incorporated company',
            'Product with export potential',
            'Target market identification',
            'Export market development plan',
        ],
        aiNotes: 'VPA\'s city-by-city expansion model targets international luxury markets. Initial focus: US luxury resale market (NYC, LA). CanExport could fund the US market entry.',
    },
    {
        id: 'investqc-2026',
        name: 'Investissement Québec — ESSOR',
        provider: 'Investissement Québec',
        country: 'Canada',
        province: 'Quebec',
        category: 'loan',
        maxAmount: 250000,
        deadline: undefined,
        eligibilityScore: 70,
        status: 'discovered',
        description: 'Low-interest loans for Quebec businesses pursuing innovation, modernization, or expansion. Favorable terms for tech startups.',
        url: 'https://www.investquebec.com/quebec/en/financial-products/all-our-solutions/essor.html',
        requirements: [
            'Quebec-based company',
            'Innovation or growth project',
            'Business plan with financial projections',
            'Proof of market traction',
        ],
        aiNotes: 'As a Montreal-based SaaS, VPA qualifies. The loan terms are very favorable (below prime rate). Requires a detailed business plan — I can draft this from your existing materials.',
    },
    {
        id: 'pmemtl-2026',
        name: 'PME MTL — Startup Financing',
        provider: 'PME MTL',
        country: 'Canada',
        province: 'Quebec',
        category: 'loan',
        maxAmount: 50000,
        deadline: undefined,
        eligibilityScore: 82,
        status: 'evaluating',
        description: 'Montreal-specific startup financing for innovative businesses. Loans with favorable terms, plus mentorship and networking.',
        url: 'https://pmemtl.com/en/financing',
        requirements: [
            'Montreal-based business',
            'Innovative product or service',
            'Business plan',
            'Financial projections',
        ],
        aiNotes: 'PME MTL is very accessible for Montreal startups. They also provide mentorship which could help with the sales strategy. Application is straightforward.',
    },
    {
        id: 'cdap-2026',
        name: 'Canada Digital Adoption Program',
        provider: 'Innovation, Science and Economic Development Canada',
        country: 'Canada',
        province: 'Federal',
        category: 'grant',
        maxAmount: 15000,
        deadline: '2026-12-31',
        eligibilityScore: 88,
        status: 'discovered',
        description: 'Micro-grants to help Canadian businesses adopt digital technologies. Boost Your Business Technology stream provides up to $15,000.',
        url: 'https://ised-isde.canada.ca/site/canada-digital-adoption-program/en',
        requirements: [
            'Canadian-owned SME',
            'Revenue between $500K-$100M',
            'Digital adoption plan',
        ],
        aiNotes: 'Easy application, relatively quick approval. $15K can fund marketing automation tools or CRM integration for VPA. Worth applying even if other larger grants are in progress.',
    },
    {
        id: 'sbir-us-2026',
        name: 'SBIR Phase I — Anti-Counterfeiting',
        provider: 'U.S. Small Business Administration',
        country: 'United States',
        category: 'grant',
        maxAmount: 275000,
        deadline: '2026-11-15',
        eligibilityScore: 45,
        status: 'discovered',
        description: 'Small Business Innovation Research grants for anti-counterfeiting and supply chain security technologies. Phase I feasibility study.',
        url: 'https://www.sbir.gov/',
        requirements: [
            'US-based small business (may need US entity)',
            'Novel technology approach',
            'Technical proposal',
            'Commercialization plan',
        ],
        aiNotes: 'Would require setting up a US subsidiary. High reward but lower eligibility score for now. Worth revisiting once US expansion begins.',
    },
];

// ── Human approval queue: tasks that need Moshe's input ──

export const HUMAN_TASKS: HumanTask[] = [
    {
        id: 'task-001',
        fundingId: 'sred-2026',
        fundingName: 'SR&ED Tax Credit',
        type: 'review-draft',
        title: 'Review SR&ED project description',
        description: 'I\'ve drafted the T661 project description covering VPA\'s 3 eligible R&D activities: (1) perceptual image hashing algorithm, (2) QR-based verification system, (3) AI-generated content detection pipeline.',
        aiSuggestion: 'The draft claims $42,800 in eligible expenditures based on your 2025 development costs. The 3 project descriptions follow CRA guidelines — each describes the technological uncertainty, systematic investigation, and advancement achieved. Ready for your accountant to file with the T2 return.',
        priority: 'high',
        deadline: '2026-06-15',
        status: 'pending',
        createdAt: '2026-04-15',
    },
    {
        id: 'task-002',
        fundingId: 'sred-2026',
        fundingName: 'SR&ED Tax Credit',
        type: 'upload-document',
        title: 'Upload 2025 financial statements',
        description: 'Your accountant needs to include the T661 with the corporate tax return. I need the 2025 financial statements to calculate eligible expenditures.',
        aiSuggestion: 'I need your 2025 T2 Corporate Tax Return or draft financial statements. If your accountant uses QuickBooks or Xero, you can export the P&L statement directly. The key figures I need: total salaries paid to developers, contractor costs, and hosting/infrastructure costs.',
        priority: 'high',
        deadline: '2026-06-15',
        status: 'pending',
        createdAt: '2026-04-15',
    },
    {
        id: 'task-003',
        fundingId: 'irap-2026',
        fundingName: 'NRC IRAP',
        type: 'review-draft',
        title: 'Review IRAP application draft',
        description: 'I\'ve prepared the initial IRAP application describing VPA as an innovative anti-counterfeiting SaaS platform. The application highlights the technical innovation (no-hardware authentication) and market opportunity.',
        aiSuggestion: 'The application positions VPA as solving a $4.2T global counterfeiting problem with a software-only approach. Key claims: 10x cheaper than Entrupy, no manufacturing changes unlike Certilogo, no blockchain complexity unlike VeChain. I recommend submitting this to get an ITA (Industrial Technology Advisor) assigned — they\'ll guide the detailed proposal.',
        priority: 'high',
        deadline: undefined,
        status: 'pending',
        createdAt: '2026-04-14',
    },
    {
        id: 'task-004',
        fundingId: 'irap-2026',
        fundingName: 'NRC IRAP',
        type: 'schedule-call',
        title: 'Prepare for IRAP advisor phone call',
        description: 'After application submission, IRAP assigns an Industrial Technology Advisor for a phone interview. This is a required step.',
        aiSuggestion: 'I\'ve prepared talking points covering: (1) Technical innovation — perceptual hashing vs. blockchain, (2) Market size — $4.2T counterfeiting globally, (3) Traction — current certificate count and growth rate, (4) Team capabilities, (5) 12-month development roadmap. The call is typically 30 minutes. Want me to prepare a one-page cheat sheet you can reference during the call?',
        priority: 'medium',
        deadline: undefined,
        status: 'pending',
        createdAt: '2026-04-14',
    },
    {
        id: 'task-005',
        fundingId: 'canexport-2026',
        fundingName: 'CanExport Innovation',
        type: 'verify-info',
        title: 'Confirm US market expansion targets',
        description: 'The CanExport application needs specific target markets. I\'ve suggested the US luxury resale market as the primary target.',
        aiSuggestion: 'Based on your strategy, I\'ve listed: Primary market: US (NYC, LA luxury resale). Secondary: UK (London). The application needs 2-3 specific activities you\'d fund with the grant: (1) US market research & validation ($25K), (2) US-targeted marketing campaigns ($25K), (3) Integration partnerships with US resale platforms ($25K). Does this align with your expansion plans?',
        priority: 'medium',
        deadline: '2026-08-30',
        status: 'pending',
        createdAt: '2026-04-13',
    },
    {
        id: 'task-006',
        fundingId: 'pmemtl-2026',
        fundingName: 'PME MTL',
        type: 'review-draft',
        title: 'Review PME MTL business plan draft',
        description: 'PME MTL requires a business plan for the loan application. I\'ve drafted one using your existing materials and revenue targets.',
        aiSuggestion: 'The business plan covers: Executive summary, market opportunity ($4.2T counterfeiting), product description (no-hardware SaaS), revenue model (freemium → paid tiers), financial projections ($1M ARR in 12-18 months from 5 Enterprise + 10 Business + 25 Pro + 60 Starter accounts), competitive advantage (vs. Entrupy, Certilogo, VeChain), and team. Requesting $50K for marketing and sales automation infrastructure.',
        priority: 'medium',
        deadline: undefined,
        status: 'pending',
        createdAt: '2026-04-12',
    },
];

// ── Helper functions ──

export function getTasksByStatus(status: TaskStatus): HumanTask[] {
    return HUMAN_TASKS.filter(t => t.status === status);
}

export function getPendingTasks(): HumanTask[] {
    return HUMAN_TASKS.filter(t => t.status === 'pending');
}

export function getFundingByStatus(status: FundingStatus): FundingOpportunity[] {
    return FUNDING_OPPORTUNITIES.filter(f => f.status === status);
}

export function getTotalPotentialFunding(): number {
    return FUNDING_OPPORTUNITIES
        .filter(f => f.status !== 'rejected')
        .reduce((sum, f) => sum + f.maxAmount, 0);
}

export function getHighPriorityTaskCount(): number {
    return HUMAN_TASKS.filter(t => t.status === 'pending' && t.priority === 'high').length;
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
    high: 'Urgent',
    medium: 'Normal',
    low: 'Low Priority',
};

export const STATUS_LABELS: Record<FundingStatus, string> = {
    discovered: 'Discovered',
    evaluating: 'Evaluating',
    drafting: 'AI Drafting',
    'ready-for-review': 'Needs Review',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
};

export const CATEGORY_LABELS: Record<FundingCategory, string> = {
    grant: 'Grant',
    'tax-credit': 'Tax Credit',
    loan: 'Loan',
    accelerator: 'Accelerator',
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
    'review-draft': 'Review Draft',
    'upload-document': 'Upload Document',
    'verify-info': 'Verify Information',
    'schedule-call': 'Schedule Call',
    'sign-document': 'Sign Document',
    'answer-question': 'Answer Question',
};
