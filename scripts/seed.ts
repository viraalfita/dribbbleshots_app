import { db } from '../lib/db';
import { themeLibrary, users, aiEvaluations, adminReviews, notifications, shotPlans } from '../lib/db/schema';
import bcrypt from 'bcryptjs';

const seedThemes = [
    // North America - US
    { macroTheme: 'United States', nicheName: 'AI Sales CRM for SMB', countryFit: ['US'], buyerFit: ['SaaS founders', 'PMs', 'agencies'], visualPotential: 80, authorityScore: 70, businessRelevance: 85, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'United States', nicheName: 'FinOps + Cloud Cost Control', countryFit: ['US'], buyerFit: ['SaaS founders', 'PMs', 'agencies'], visualPotential: 85, authorityScore: 90, businessRelevance: 95, discoveryScore: 85, genericPenalty: 0 },
    { macroTheme: 'United States', nicheName: 'Healthcare Appointment + Claims Companion', countryFit: ['US'], buyerFit: ['SaaS founders', 'PMs', 'agencies'], visualPotential: 75, authorityScore: 85, businessRelevance: 90, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'United States', nicheName: 'Logistics Dispatch + Driver App', countryFit: ['US'], buyerFit: ['SaaS founders', 'PMs', 'agencies'], visualPotential: 70, authorityScore: 80, businessRelevance: 90, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'United States', nicheName: 'Construction Field Ops', countryFit: ['US'], buyerFit: ['SaaS founders', 'PMs', 'agencies'], visualPotential: 70, authorityScore: 80, businessRelevance: 95, discoveryScore: 70, genericPenalty: 0 },
    { macroTheme: 'United States', nicheName: 'Creator / Influencer Brand Deal Manager', countryFit: ['US'], buyerFit: ['SaaS founders', 'PMs', 'agencies'], visualPotential: 85, authorityScore: 70, businessRelevance: 80, discoveryScore: 85, genericPenalty: 0 },
    { macroTheme: 'United States', nicheName: 'HR Hiring Pipeline + Interview Scorecards', countryFit: ['US'], buyerFit: ['SaaS founders', 'PMs', 'agencies'], visualPotential: 80, authorityScore: 75, businessRelevance: 85, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'United States', nicheName: 'Property Maintenance / Work Order System', countryFit: ['US'], buyerFit: ['SaaS founders', 'PMs', 'agencies'], visualPotential: 75, authorityScore: 80, businessRelevance: 90, discoveryScore: 70, genericPenalty: 0 },
    { macroTheme: 'United States', nicheName: 'B2B Subscription Billing Portal', countryFit: ['US'], buyerFit: ['SaaS founders', 'PMs', 'agencies'], visualPotential: 85, authorityScore: 90, businessRelevance: 95, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'United States', nicheName: 'Cybersecurity Training + Phishing Simulator', countryFit: ['US'], buyerFit: ['SaaS founders', 'PMs', 'agencies'], visualPotential: 80, authorityScore: 85, businessRelevance: 90, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'United States', nicheName: 'E-commerce Returns + Post-Purchase App', countryFit: ['US'], buyerFit: ['SaaS founders', 'PMs', 'agencies'], visualPotential: 85, authorityScore: 75, businessRelevance: 85, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'United States', nicheName: 'Micro-SaaS "Ops Dashboard" for founders', countryFit: ['US'], buyerFit: ['SaaS founders', 'PMs', 'agencies'], visualPotential: 80, authorityScore: 70, businessRelevance: 80, discoveryScore: 85, genericPenalty: 0 },

    // Europe - UK
    { macroTheme: 'United Kingdom', nicheName: 'Insurtech Claims Tracking', countryFit: ['UK'], buyerFit: ['B2B', 'service quality', 'trust'], visualPotential: 80, authorityScore: 85, businessRelevance: 90, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'United Kingdom', nicheName: 'SME Accounting + Invoice Chase', countryFit: ['UK'], buyerFit: ['B2B', 'service quality', 'trust'], visualPotential: 85, authorityScore: 80, businessRelevance: 95, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'United Kingdom', nicheName: 'Recruitment Agency Client Portal', countryFit: ['UK'], buyerFit: ['B2B', 'service quality', 'trust'], visualPotential: 75, authorityScore: 75, businessRelevance: 85, discoveryScore: 70, genericPenalty: 0 },
    { macroTheme: 'United Kingdom', nicheName: 'Real-estate Viewing + Offer Workflow', countryFit: ['UK'], buyerFit: ['B2B', 'service quality', 'trust'], visualPotential: 80, authorityScore: 75, businessRelevance: 85, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'United Kingdom', nicheName: 'Compliance / Policy Management', countryFit: ['UK'], buyerFit: ['B2B', 'service quality', 'trust'], visualPotential: 70, authorityScore: 90, businessRelevance: 90, discoveryScore: 70, genericPenalty: 0 },

    // Europe - Germany
    { macroTheme: 'Germany (DACH)', nicheName: 'Manufacturing Maintenance (CMMS light)', countryFit: ['DE', 'AT', 'CH'], buyerFit: ['systems', 'reliability', 'workflows'], visualPotential: 70, authorityScore: 90, businessRelevance: 95, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'Germany (DACH)', nicheName: 'Warehouse Picking + Inventory App', countryFit: ['DE', 'AT', 'CH'], buyerFit: ['systems', 'reliability', 'workflows'], visualPotential: 75, authorityScore: 85, businessRelevance: 95, discoveryScore: 70, genericPenalty: 0 },
    { macroTheme: 'Germany (DACH)', nicheName: 'B2B Quoting + Order Approvals', countryFit: ['DE', 'AT', 'CH'], buyerFit: ['systems', 'reliability', 'workflows'], visualPotential: 80, authorityScore: 85, businessRelevance: 90, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'Germany (DACH)', nicheName: 'Fleet Management + Incident Logs', countryFit: ['DE', 'AT', 'CH'], buyerFit: ['systems', 'reliability', 'workflows'], visualPotential: 75, authorityScore: 85, businessRelevance: 90, discoveryScore: 70, genericPenalty: 0 },
    { macroTheme: 'Germany (DACH)', nicheName: 'Industrial SaaS Admin Console', countryFit: ['DE', 'AT', 'CH'], buyerFit: ['systems', 'reliability', 'workflows'], visualPotential: 85, authorityScore: 90, businessRelevance: 95, discoveryScore: 80, genericPenalty: 0 },

    // Europe - Netherlands
    { macroTheme: 'Netherlands', nicheName: 'B2B Marketplace for services', countryFit: ['NL'], buyerFit: ['tech-forward', 'marketplaces', 'UX'], visualPotential: 85, authorityScore: 80, businessRelevance: 85, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'Netherlands', nicheName: 'Sustainability / Carbon Tracking dashboard', countryFit: ['NL'], buyerFit: ['tech-forward', 'marketplaces', 'UX'], visualPotential: 85, authorityScore: 85, businessRelevance: 90, discoveryScore: 85, genericPenalty: 0 },
    { macroTheme: 'Netherlands', nicheName: 'Mobility subscription app', countryFit: ['NL'], buyerFit: ['tech-forward', 'marketplaces', 'UX'], visualPotential: 90, authorityScore: 75, businessRelevance: 80, discoveryScore: 85, genericPenalty: 0 },
    { macroTheme: 'Netherlands', nicheName: 'Fintech budgeting for SMEs', countryFit: ['NL'], buyerFit: ['tech-forward', 'marketplaces', 'UX'], visualPotential: 85, authorityScore: 85, businessRelevance: 90, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'Netherlands', nicheName: 'Remote team time + cost tracker', countryFit: ['NL'], buyerFit: ['tech-forward', 'marketplaces', 'UX'], visualPotential: 80, authorityScore: 75, businessRelevance: 85, discoveryScore: 75, genericPenalty: 0 },

    // Europe - France
    { macroTheme: 'France', nicheName: 'Luxury resale authentication app', countryFit: ['FR'], buyerFit: ['brand taste', 'strong visual identity'], visualPotential: 95, authorityScore: 85, businessRelevance: 85, discoveryScore: 90, genericPenalty: 0 },
    { macroTheme: 'France', nicheName: 'Clinic / beauty booking app', countryFit: ['FR'], buyerFit: ['brand taste', 'strong visual identity'], visualPotential: 90, authorityScore: 80, businessRelevance: 85, discoveryScore: 85, genericPenalty: 0 },
    { macroTheme: 'France', nicheName: 'Food supply ordering for restaurants', countryFit: ['FR'], buyerFit: ['brand taste', 'strong visual identity'], visualPotential: 85, authorityScore: 85, businessRelevance: 90, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'France', nicheName: 'Event ticketing + community app', countryFit: ['FR'], buyerFit: ['brand taste', 'strong visual identity'], visualPotential: 90, authorityScore: 75, businessRelevance: 80, discoveryScore: 85, genericPenalty: 0 },
    { macroTheme: 'France', nicheName: 'Creative agency client portal', countryFit: ['FR'], buyerFit: ['brand taste', 'strong visual identity'], visualPotential: 95, authorityScore: 80, businessRelevance: 85, discoveryScore: 90, genericPenalty: 0 },

    // Europe - Sweden
    { macroTheme: 'Sweden', nicheName: 'Wellness subscription + habit tracker', countryFit: ['SE'], buyerFit: ['simplicity', 'product clarity', 'accessibility'], visualPotential: 90, authorityScore: 70, businessRelevance: 75, discoveryScore: 85, genericPenalty: 0 },
    { macroTheme: 'Sweden', nicheName: 'Edtech micro-learning + progress app', countryFit: ['SE'], buyerFit: ['simplicity', 'product clarity', 'accessibility'], visualPotential: 85, authorityScore: 75, businessRelevance: 80, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'Sweden', nicheName: 'Home energy monitoring dashboard', countryFit: ['SE'], buyerFit: ['simplicity', 'product clarity', 'accessibility'], visualPotential: 90, authorityScore: 85, businessRelevance: 85, discoveryScore: 85, genericPenalty: 0 },
    { macroTheme: 'Sweden', nicheName: 'SaaS onboarding + self-serve setup wizard', countryFit: ['SE'], buyerFit: ['simplicity', 'product clarity', 'accessibility'], visualPotential: 85, authorityScore: 85, businessRelevance: 90, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'Sweden', nicheName: 'Nonprofit donation + volunteer app', countryFit: ['SE'], buyerFit: ['simplicity', 'product clarity', 'accessibility'], visualPotential: 80, authorityScore: 70, businessRelevance: 75, discoveryScore: 80, genericPenalty: 0 },

    // Oceania - Australia
    { macroTheme: 'Australia', nicheName: 'Tradie quoting + job scheduling', countryFit: ['AU'], buyerFit: ['tradies', 'SMB ops', 'field apps', 'compliance'], visualPotential: 75, authorityScore: 80, businessRelevance: 95, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'Australia', nicheName: 'NDIS care scheduling + notes', countryFit: ['AU'], buyerFit: ['tradies', 'SMB ops', 'field apps', 'compliance'], visualPotential: 75, authorityScore: 85, businessRelevance: 90, discoveryScore: 70, genericPenalty: 0 },
    { macroTheme: 'Australia', nicheName: 'Mining / site safety checklist + incident reporting', countryFit: ['AU'], buyerFit: ['tradies', 'SMB ops', 'field apps', 'compliance'], visualPotential: 70, authorityScore: 90, businessRelevance: 95, discoveryScore: 70, genericPenalty: 0 },
    { macroTheme: 'Australia', nicheName: 'SME payroll + timesheet app', countryFit: ['AU'], buyerFit: ['tradies', 'SMB ops', 'field apps', 'compliance'], visualPotential: 80, authorityScore: 85, businessRelevance: 90, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'Australia', nicheName: 'Construction procurement + supplier portal', countryFit: ['AU'], buyerFit: ['tradies', 'SMB ops', 'field apps', 'compliance'], visualPotential: 80, authorityScore: 85, businessRelevance: 95, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'Australia', nicheName: 'Hospitality staff rostering app', countryFit: ['AU'], buyerFit: ['tradies', 'SMB ops', 'field apps', 'compliance'], visualPotential: 85, authorityScore: 80, businessRelevance: 90, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'Australia', nicheName: 'Local logistics + last-mile proof-of-delivery', countryFit: ['AU'], buyerFit: ['tradies', 'SMB ops', 'field apps', 'compliance'], visualPotential: 75, authorityScore: 85, businessRelevance: 90, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'Australia', nicheName: 'Property manager inspections app', countryFit: ['AU'], buyerFit: ['tradies', 'SMB ops', 'field apps', 'compliance'], visualPotential: 80, authorityScore: 80, businessRelevance: 90, discoveryScore: 80, genericPenalty: 0 },

    // Middle East - UAE
    { macroTheme: 'United Arab Emirates', nicheName: 'Luxury real estate lead + viewing app', countryFit: ['UAE'], buyerFit: ['premium brand', 'fast ops', 'multi-location'], visualPotential: 95, authorityScore: 85, businessRelevance: 90, discoveryScore: 90, genericPenalty: 0 },
    { macroTheme: 'United Arab Emirates', nicheName: 'Clinic chain booking + patient follow-up', countryFit: ['UAE'], buyerFit: ['premium brand', 'fast ops', 'multi-location'], visualPotential: 90, authorityScore: 85, businessRelevance: 90, discoveryScore: 85, genericPenalty: 0 },
    { macroTheme: 'United Arab Emirates', nicheName: 'Hospitality concierge / guest app', countryFit: ['UAE'], buyerFit: ['premium brand', 'fast ops', 'multi-location'], visualPotential: 95, authorityScore: 85, businessRelevance: 90, discoveryScore: 90, genericPenalty: 0 },
    { macroTheme: 'United Arab Emirates', nicheName: 'B2B procurement approvals', countryFit: ['UAE'], buyerFit: ['premium brand', 'fast ops', 'multi-location'], visualPotential: 80, authorityScore: 90, businessRelevance: 95, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'United Arab Emirates', nicheName: 'Recruitment / staffing portal', countryFit: ['UAE'], buyerFit: ['premium brand', 'fast ops', 'multi-location'], visualPotential: 85, authorityScore: 85, businessRelevance: 90, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'United Arab Emirates', nicheName: 'Logistics tracking + customs documents', countryFit: ['UAE'], buyerFit: ['premium brand', 'fast ops', 'multi-location'], visualPotential: 80, authorityScore: 90, businessRelevance: 95, discoveryScore: 75, genericPenalty: 0 },

    // Middle East - KSA
    { macroTheme: 'Saudi Arabia', nicheName: 'Government-style service portal', countryFit: ['KSA'], buyerFit: ['large initiatives', 'enterprise workflows', 'scale'], visualPotential: 85, authorityScore: 95, businessRelevance: 95, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'Saudi Arabia', nicheName: 'Mega project vendor onboarding + compliance', countryFit: ['KSA'], buyerFit: ['large initiatives', 'enterprise workflows', 'scale'], visualPotential: 80, authorityScore: 95, businessRelevance: 95, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'Saudi Arabia', nicheName: 'Education platform + parent app', countryFit: ['KSA'], buyerFit: ['large initiatives', 'enterprise workflows', 'scale'], visualPotential: 85, authorityScore: 85, businessRelevance: 90, discoveryScore: 85, genericPenalty: 0 },
    { macroTheme: 'Saudi Arabia', nicheName: 'Healthcare queue + appointment app', countryFit: ['KSA'], buyerFit: ['large initiatives', 'enterprise workflows', 'scale'], visualPotential: 85, authorityScore: 85, businessRelevance: 90, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'Saudi Arabia', nicheName: 'Retail loyalty + offers app', countryFit: ['KSA'], buyerFit: ['large initiatives', 'enterprise workflows', 'scale'], visualPotential: 90, authorityScore: 80, businessRelevance: 85, discoveryScore: 85, genericPenalty: 0 },
    { macroTheme: 'Saudi Arabia', nicheName: 'Construction progress reporting dashboard', countryFit: ['KSA'], buyerFit: ['large initiatives', 'enterprise workflows', 'scale'], visualPotential: 85, authorityScore: 90, businessRelevance: 95, discoveryScore: 80, genericPenalty: 0 },

    // Middle East - Qatar
    { macroTheme: 'Qatar', nicheName: 'Event operations app', countryFit: ['QA'], buyerFit: ['events', 'facilities', 'premium services'], visualPotential: 90, authorityScore: 85, businessRelevance: 90, discoveryScore: 85, genericPenalty: 0 },
    { macroTheme: 'Qatar', nicheName: 'Facility management requests + vendor dispatch', countryFit: ['QA'], buyerFit: ['events', 'facilities', 'premium services'], visualPotential: 80, authorityScore: 90, businessRelevance: 95, discoveryScore: 75, genericPenalty: 0 },
    { macroTheme: 'Qatar', nicheName: 'Corporate travel / booking approvals', countryFit: ['QA'], buyerFit: ['events', 'facilities', 'premium services'], visualPotential: 85, authorityScore: 85, businessRelevance: 90, discoveryScore: 80, genericPenalty: 0 },
    { macroTheme: 'Qatar', nicheName: 'Sports club membership app', countryFit: ['QA'], buyerFit: ['events', 'facilities', 'premium services'], visualPotential: 90, authorityScore: 80, businessRelevance: 85, discoveryScore: 85, genericPenalty: 0 },
    { macroTheme: 'Qatar', nicheName: 'High-end property maintenance subscription', countryFit: ['QA'], buyerFit: ['events', 'facilities', 'premium services'], visualPotential: 85, authorityScore: 85, businessRelevance: 90, discoveryScore: 80, genericPenalty: 0 },
];

async function seed() {
    console.log('Seeding database...');

    console.log('Clearing existing data...');
    await db.delete(aiEvaluations);
    await db.delete(adminReviews);
    await db.delete(notifications);
    await db.delete(shotPlans);
    await db.delete(themeLibrary);
    await db.delete(users);

    console.log('Seeding users...');
    const adminHash = await bcrypt.hash('admin123', 10);
    const designerHash = await bcrypt.hash('designer123', 10);
    await db.insert(users).values([
        { username: 'admin', passwordHash: adminHash, role: 'admin' },
        { username: 'designer1', passwordHash: designerHash, role: 'designer' },
        { username: 'designer2', passwordHash: designerHash, role: 'designer' },
    ]);

    console.log('Seeding theme library...');
    await db.insert(themeLibrary).values(seedThemes);

    console.log('Done. Default credentials:');
    console.log('  admin / admin123');
    console.log('  designer1 / designer123');
    console.log('  designer2 / designer123');
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
