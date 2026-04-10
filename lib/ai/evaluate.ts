import OpenAI from 'openai';

let openai: OpenAI | null = null;
try {
  openai = new OpenAI();
} catch (e) {
  console.warn('OpenAI not configured. Add OPENAI_API_KEY to .env.local');
}
const SYSTEM_PROMPT = `
You are the **Elux Dribbble Shot Planner** — an internal strategic planning engine built for Elux Space, a premium UI/UX agency based in Yogyakarta, Indonesia.

Your job is to **evaluate Dribbble/Behance shot plans submitted by UI Designers** so the team publishes only high-authority, buyer-relevant, commercially strong shots. You are NOT a brainstorming chatbot. You are a decision engine.

---

## Core Behavior

Evaluate every submitted plan on these dimensions (total = 100):

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Region Timing Fit | 20 | How suitable for the selected country + publish month |
| Buyer Fit | 20 | How relevant to the selected target market segment |
| Authority Fit | 20 | How strongly this positions Elux as premium and capable |
| Visual Potential | 15 | How likely this produces a rich, premium-looking UI shot |
| Business Relevance | 15 | How close to real buyers with real budgets |
| Discovery Potential | 10 | How well this supports clear title, description, and tags |
| Generic Penalty | -15 | Deduction for broad, overused, consumer-ish, or low-trust themes |

### Label Recommendations
Based on final score:
- **85–100** → Produce Now
- **70–84** → Secondary Queue
- **55–69** → Experimental
- **Below 55** → Reject / Low Priority

### Always Generate Actionable Output
Every recommendation must include:
- Score breakdown
- Short qualitative feedback for each inputted field
- Overall verdict (1–2 sentences, no fluff)
- Provide feedback indicating if there's a mismatch between the general theme chosen and the input details provided.

---
## Theme Preferences

### Always Prefer
- B2B SaaS, operations dashboards, admin systems, workflow products
- Service delivery tools, approvals, scheduling, portals
- Field ops, healthcare ops, billing/finance ops
- Recruitment/onboarding, logistics, property ops, procurement
- Compliance / trust-heavy products

### Always Penalize
- Consumer habit apps, random AI chatbots, personal budgeting apps
- Generic note/task/crypto apps
- Ultra-trendy but shallow concepts
- Neon fintech clichés, banking card explorations without business context
- Social media dashboards without clear angle
- "Dribbble for Dribbble" concepts (visually flashy, commercially empty)

---

## Decision Rules

1. **Never recommend a theme only because it sounds visually trendy.**
2. **Between two equal themes, prefer the one that feels more expensive, more operationally real, closer to buyer problems, and gives Elux stronger authority.**
3. **Penalize broad containers. Demand sharp product angles.**
4. **Topics must be framed as product/use-case concepts, not abstract categories.**

---

Return JSON structured exactly as requested. Do not return markdown formatted json (\`\`\`json \`\`\`), just the raw JSON object.
`;

export async function evaluatePlan(planData: any, generalThemeContext: any) {
  const prompt = `
Please evaluate the following Dribbble Shot Plan submission.

### Context
General Theme Chosen from Library: ${generalThemeContext.niche_name} (${generalThemeContext.macro_theme})
Original Country Fit for Theme: ${(generalThemeContext.country_fit ?? []).join(', ')}
Original Buyer Fit for Theme: ${(generalThemeContext.buyer_fit ?? []).join(', ')}

### Designer Submission
Specific Theme: ${planData.specificTheme}
Title: ${planData.title}
Target Market: ${planData.targetMarket}
Product Type: ${planData.productType}
Sections/Screens/Pages: ${JSON.stringify(planData.sectionsJson || planData.screensJson || planData.pagesJson, null, 2)}
App Explanation: ${planData.appExplanation}

Respond with exactly this JSON structure:
{
  "score": number (0-100),
  "label": "Produce Now" | "Secondary Queue" | "Experimental" | "Reject",
  "score_breakdown": {
    "region_timing_fit": number,
    "buyer_fit": number,
    "authority_fit": number,
    "visual_potential": number,
    "business_relevance": number,
    "discovery_potential": number,
    "generic_penalty": number
  },
  "field_feedback": {
    "specific_theme": "feedback string",
    "title": "feedback string",
    "target_market": "feedback string",
    "sections_or_screens": "feedback string",
    "app_explanation": "feedback string"
  },
  "overall_verdict": "feedback string"
}
`;

  if (!openai) {
    console.warn("OpenAI API key missing. Returning mock evaluation.");
    return {
      score: 75,
      label: "Secondary Queue",
      score_breakdown: {
        region_timing_fit: 15,
        buyer_fit: 15,
        authority_fit: 15,
        visual_potential: 10,
        business_relevance: 15,
        discovery_potential: 5,
        generic_penalty: 0
      },
      field_feedback: {
        specific_theme: "Mock feedback: good specific theme.",
        title: "Mock feedback: clear title.",
        target_market: "Mock feedback: well defined target.",
        sections_or_screens: "Mock feedback: structure looks solid.",
        app_explanation: "Mock feedback: clear explanation."
      },
      overall_verdict: "This is a mock evaluation because OPENAI_API_KEY is not set. The idea shows potential."
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from OpenAI");
    return JSON.parse(content);
  } catch (error) {
    console.error("Evaluation failed:", error);
    throw new Error("AI Evaluation failed");
  }
}
