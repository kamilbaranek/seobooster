
export interface PlanLimit {
    webs: number;
    articlesPerMonth: number;
    regenerations: number;
}

export interface Plan {
    id: string;
    name: string;
    priceId: string; // Stripe Price ID
    limits: PlanLimit;
}

export const PLANS: Record<string, Plan> = {
    'tier1': {
        id: 'tier1',
        name: 'Starter',
        priceId: process.env.STRIPE_PRICE_TIER1_ID || 'price_tier1_placeholder',
        limits: {
            webs: 3,
            articlesPerMonth: 20,
            regenerations: 0
        }
    },
    'tier2': {
        id: 'tier2',
        name: 'Pro',
        priceId: process.env.STRIPE_PRICE_TIER2_ID || 'price_tier2_placeholder',
        limits: {
            webs: 15,
            articlesPerMonth: 450,
            regenerations: 3
        }
    },
    'tier3': {
        id: 'tier3',
        name: 'Agency',
        priceId: process.env.STRIPE_PRICE_TIER3_ID || 'price_tier3_placeholder',
        limits: {
            webs: 50,
            articlesPerMonth: 1500,
            regenerations: 5
        }
    }
};

export const getPlanByPriceId = (priceId: string): Plan | undefined => {
    return Object.values(PLANS).find(p => p.priceId === priceId);
};

export const getPlanById = (planId: string): Plan | undefined => {
    return PLANS[planId];
};
