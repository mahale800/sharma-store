import Groq from "groq-sdk";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage
});

const SYSTEM_PROMPT = `
You are Sharma Store’s intelligent assistant.
You help customers, analyze feedback, recommend improvements,
and assist admins with product and business insights.
Be concise, helpful, and honest.
Do not hallucinate data.
Do not promise actions or delivery timelines.
`;

export const getChatResponse = async (history) => {
    if (!GROQ_API_KEY) {
        throw new Error("Missing Groq API Key");
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...history
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 200,
        });

        return chatCompletion.choices[0]?.message?.content || "I'm having trouble thinking right now. Please try again.";
    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
};

export const getRecommendations = async (context, products) => {
    if (!GROQ_API_KEY) return [];

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

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: RECO_PROMPT }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 100,
        });

        const content = chatCompletion.choices[0]?.message?.content;
        const jsonMatch = content.match(/\[.*\]/s);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error("AI Recommendation Error:", error);
        return [];
    }
};

export const analyzeFeedback = async (feedbackList) => {
    if (!GROQ_API_KEY || feedbackList.length === 0) return null;

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

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: ANALYSIS_PROMPT }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 300,
        });

        const content = chatCompletion.choices[0]?.message?.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/); // Find JSON object

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (error) {
        console.error("AI Analysis Error:", error);
        return null;
    }
};

export const generateRoadmap = async (feedbackList) => {
    if (!GROQ_API_KEY || feedbackList.length === 0) return [];

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

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: ROADMAP_PROMPT }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.4,
            max_tokens: 600,
        });

        const content = chatCompletion.choices[0]?.message?.content;
        const jsonMatch = content.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error("AI Roadmap Generation Error:", error);
        return [];
    }
};

export const analyzeSentimentBatch = async (feedbackList) => {
    if (!GROQ_API_KEY || feedbackList.length === 0) return {};

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

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: SENTIMENT_PROMPT }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 1000,
        });

        const content = chatCompletion.choices[0]?.message?.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return {};
    } catch (error) {
        console.error("AI Sentiment Analysis Error:", error);
        return {};
    }
};

export const generateBusinessInsights = async (feedbackList, stats) => {
    if (!GROQ_API_KEY || feedbackList.length === 0) return [];

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

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: INSIGHTS_PROMPT }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 500,
        });

        const content = chatCompletion.choices[0]?.message?.content;
        const jsonMatch = content.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error("AI Business Insights Error:", error);
        return [];
    }
};

export const generateNotificationCopy = async (rawMessage, tone) => {
    if (!GROQ_API_KEY) return rawMessage; // Fallback

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

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 50,
        });

        return chatCompletion.choices[0]?.message?.content?.replace(/^"|"$/g, '') || rawMessage;
    } catch (error) {
        console.error("AI Notification Gen Error:", error);
        return rawMessage;
    }
};

export const generateEngagementInsights = async (metrics) => {
    if (!GROQ_API_KEY) return [];

    // Safe fallback for metrics structure
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

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: PROMPT }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
            max_tokens: 300,
        });

        const content = chatCompletion.choices[0]?.message?.content;
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error) {
        console.error("AI Engagement Insights Error:", error);
        return [];
    }
};
