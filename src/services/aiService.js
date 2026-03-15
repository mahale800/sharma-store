console.debug("OpenRouter key at runtime:", import.meta.env.VITE_OPENROUTER_API_KEY ? "Present" : "Missing");

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Internal utility to call OpenRouter API
async function callAI(messages, temperature = 0.5, max_tokens = 500) {
    if (!API_KEY) {
        console.warn("OpenRouter API key missing. AI features disabled.");
        return null;
    }

    try {
        let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "HTTP-Referer": window.location.origin,
                "X-Title": "Sharma Store",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages,
                temperature,
                max_tokens
            })
        });

        if (!response.ok) {
            console.warn("Primary AI model failed, attempting fallback...");
            response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "Sharma Store",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-chat",
                    messages,
                    temperature,
                    max_tokens
                })
            });
        }

        if (!response.ok) {
            console.error("OpenRouter API Error on Both Models:", response.status, response.statusText);
            return null;
        }

        const data = await response.json();
        return data?.choices?.[0]?.message?.content || null;
    } catch (error) {
        console.error("AI error:", error);
        return null;
    }
}

const SYSTEM_PROMPT = `
You are Sharma Store’s intelligent assistant.
You help customers, analyze feedback, recommend improvements,
and assist admins with product and business insights.
Be concise, helpful, and honest.
Do not hallucinate data.
Do not promise actions or delivery timelines.
`;

export const getChatResponse = async (history) => {
    const response = await callAI([
        { role: "system", content: SYSTEM_PROMPT },
        ...history
    ], 0.7, 200);

    return response || "I'm having trouble thinking right now. Please try again.";
};

export const getRecommendations = async (context, products) => {
    // Create a simplified list for the AI to save tokens
    const productList = products.map(p => `- ${p.name} (ID: ${p.id}, Category: ${p.category})`).join('\n');

    const RECO_PROMPT = `
    You are an AI Recommendation Engine for Sharma Store.
    
    Context:
    ${context}

    Available Products:
    ${productList}

    Task:
    Recommend 3-5 products from the list above that best match the context.
    Return ONLY a JSON array of Product IDs. No text, no explanations.
    Example: ["id1", "id2", "id3"]
    `;

    const response = await callAI([{ role: "user", content: RECO_PROMPT }], 0.5, 100);

    if (response) {
        const jsonMatch = response.match(/\[.*\]/s);
        if (jsonMatch) {
            try { return JSON.parse(jsonMatch[0]); } catch { /* empty */ }
        }
    }
    return [];
};

export const analyzeFeedback = async (feedbackList) => {
    if (feedbackList.length === 0) return null;

    const feedbackText = feedbackList.map(f => `- [${f.type}] ${f.category}: ${f.message}`).join('\n');

    const ANALYSIS_PROMPT = `
    Analyze the following user feedback for Sharma Store:
    ${feedbackText}

    Task:
    1. Identify the top 3 critical issues or themes.
    2. Suggest 3 actionable improvements.
    3. Determine overall sentiment (Positive/Neutral/Negative).

    Format output as JSON:
    {
        "topIssues": ["Issue 1", "Issue 2", "Issue 3"],
        "improvements": ["Fix 1", "Fix 2", "Fix 3"],
        "sentiment": "Neutral"
    }
    `;

    const response = await callAI([{ role: "user", content: ANALYSIS_PROMPT }], 0.5, 300);

    if (response) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try { return JSON.parse(jsonMatch[0]); } catch { /* empty */ }
        }
    }
    return null;
};

export const generateRoadmap = async (feedbackList) => {
    if (feedbackList.length === 0) return [];

    const feedbackText = feedbackList.map(f => `- [${f.type}] ${f.message} (${f.page})`).join('\n');

    const ROADMAP_PROMPT = `
    You are a Senior Product Manager.
    Analyze the following user feedback and generate a prioritized product roadmap.

    User Feedback:
    ${feedbackText}

    Task:
    1. Group similar feedback into actionable features/fixes.
    2. Score each item (1-10) based on Frequency, Sentiment (-5 to +5), and Business Impact.
    3. Assign Priority: "High", "Medium", "Low".

    Return ONLY a JSON array of roadmap items:
    [
        {
            "title": "Fix Mobile Checkout",
            "priority": "High",
            "status": "Planned", 
            "reason": "High frequency of complaints regarding checkout lag.",
            "impact": "Increase conversion rate"
        }
    ]
    `;

    const response = await callAI([{ role: "user", content: ROADMAP_PROMPT }], 0.4, 600);

    if (response) {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try { return JSON.parse(jsonMatch[0]); } catch { /* empty */ }
        }
    }
    return [];
};

export const analyzeSentimentBatch = async (feedbackList) => {
    if (feedbackList.length === 0) return {};

    const feedbackText = feedbackList.map(f => `ID: ${f.id} | Type: ${f.type} | Message: ${f.message}`).join('\n');

    const SENTIMENT_PROMPT = `
    Analyze the sentiment of the following feedback items.

    Items:
    ${feedbackText}

    Task:
    For EACH item, correctly classify:
    1. Sentiment: "Positive", "Neutral", "Negative"
    2. Urgency: "Low", "Medium", "High"
    3. Reason: Short explanation (max 5 words)

    Return ONLY a JSON object mapping IDs to their analysis:
    {
        "id1": { "sentiment": "Negative", "urgency": "High", "reason": "Checkout failed" },
        "id2": { "sentiment": "Positive", "urgency": "Low", "reason": "Loved the UI" }
    }
    `;

    const response = await callAI([{ role: "user", content: SENTIMENT_PROMPT }], 0.3, 1000);

    if (response) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try { return JSON.parse(jsonMatch[0]); } catch { /* empty */ }
        }
    }
    return {};
};

export const generateBusinessInsights = async (feedbackList, stats) => {
    if (feedbackList.length === 0) return [];

    const feedbackSummary = feedbackList.map(f => `[${f.sentiment}] ${f.type}: ${f.message}`).join('\n').slice(0, 2000);
    const analyticsContext = `
    Total Revenue: ${stats.totalRevenue}
    Total Orders: ${stats.totalOrders}
    Pending Orders: ${stats.pendingOrders}
    `;

    const INSIGHTS_PROMPT = `
    Analyze the following Store Data for Sharma Store.
    
    Analytics:
    ${analyticsContext}

    Recent Feedback:
    ${feedbackSummary}

    Task:
    Identify 3 critical correlations or patterns between the feedback and the analytics.
    Focus on WHY certain metrics might be the way they are (e.g., "Revenue is impact by X complaint").

    Return JSON Array:
    [
        {
            "title": "Checkout abandonments linked to UI bug",
            "severity": "Critical", 
            "recommendation": "Fix the 'Place Order' button lag immediately."
        }
    ]
    `;

    const response = await callAI([{ role: "user", content: INSIGHTS_PROMPT }], 0.5, 500);

    if (response) {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try { return JSON.parse(jsonMatch[0]); } catch { /* empty */ }
        }
    }
    return [];
};

export const generateNotificationCopy = async (rawMessage, tone) => {
    const TONE_PROMPTS = {
        'Professional': "Make this notification concise, helpful, and professional.",
        'Friendly': "Make this notification warm, inviting, and use an emoji.",
        'Comedy': "Make this notification funny, witty, and perhaps a bit dramatic.",
        'Flirty': "Make this notification playful, charming, and use a heart emoji.",
        'Neutral': "Keep it as is."
    };

    const prompt = `
    Task: Rewrite the following notification message.
    Tone: ${TONE_PROMPTS[tone] || "Friendly"}
    Original Message: "${rawMessage}"
    Constraint: Keep it under 20 words. No quotes.
    `;

    const response = await callAI([{ role: "user", content: prompt }], 0.7, 50);
    return response?.replace(/^"|"$/g, '') || rawMessage;
};

export const generateEngagementInsights = async (metrics) => {
    const safeMetrics = {
        notificationsValue: metrics?.notifications?.clicked || 0,
        aiSessions: metrics?.ai?.sessions || 0,
        conversions: metrics?.conversions?.ai || 0
    };

    const PROMPT = `
    Analyze these engagement metrics for Sharma Store:
    - Notification Clicks: ${safeMetrics.notificationsValue}
    - AI Chat Sessions: ${safeMetrics.aiSessions}
    - AI-Driven Sales: ${safeMetrics.conversions}

    Task:
    Generate 3 short, actionable insights about user engagement.
    Classify each as "Action" (Green) or "Alert" (Yellow).

    Return JSON Array:
    [
        { "type": "Action", "title": "Scaling Opportunity", "description": "High AI conversion suggests..." },
        { "type": "Alert", "title": "Low CTR", "description": "Notifications need better copy..." }
    ]
    `;

    const response = await callAI([{ role: "user", content: PROMPT }], 0.6, 300);

    if (response) {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try { return JSON.parse(jsonMatch[0]); } catch (e) { }
        }
    }
    return [];
};
