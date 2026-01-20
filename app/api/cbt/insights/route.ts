import { NextRequest, NextResponse } from "next/server";
import { rateLimiters } from "@/lib/utils/rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Rate limit AI insights (10 per minute - expensive operation)
  const rateLimitError = rateLimiters.ai(req);
  if (rateLimitError) return rateLimitError;
  
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log('CBT insights API received:', body);

    const { content, mood, type, automaticThoughts, situation } = body;
    
    // Backend expects 'text' field, not 'content'
    const text = content || automaticThoughts || '';

    // Log environment check
    console.log('GEMINI_API_KEY available:', !!GEMINI_API_KEY);
    console.log('Content length:', text?.length || 0);
    console.log('Type:', type);
    console.log('Mood:', mood);

    // Generate insights directly using Gemini
    if (GEMINI_API_KEY) {
      try {
        console.log('Using Gemini API for insights generation...');
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        let prompt = "";
        
        if (type === 'journal_insights') {
          // Journal entry insights
          prompt = `Analyze this journal entry and provide 3-5 brief, supportive insights as a mental health companion.

Journal: "${text}"
Mood: ${mood}/6

Respond with a JSON array of 3-5 short insights (1-2 sentences each). Focus on:
- Recognizing emotional patterns
- Offering gentle encouragement
- Suggesting helpful coping strategies
- Acknowledging their feelings

Format: ["insight 1", "insight 2", "insight 3"]

Only return the JSON array, nothing else.`;
        } else if (type === 'thought_record') {
          // CBT thought record insights
          prompt = `Analyze this thought record using CBT principles.

Situation: "${situation}"
Automatic Thoughts: "${automaticThoughts}"

Provide 3-4 brief CBT insights that:
- Identify any cognitive distortions
- Suggest alternative perspectives
- Offer balanced thinking
- Encourage evidence-based reasoning

Format: ["insight 1", "insight 2", "insight 3"]

Only return the JSON array, nothing else.`;
        } else {
          prompt = `Analyze this content and provide 3-5 brief, supportive mental health insights.

Content: "${text}"

Focus on encouragement, patterns, and helpful observations.

Format: ["insight 1", "insight 2", "insight 3"]

Only return the JSON array, nothing else.`;
        }

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
          },
        });
        const response = await result.response;
        const text = response.text()?.trim() || '';
        
        console.log('✅ Gemini raw response:', text);
        console.log('Response length:', text.length);
        
        if (!text || text.length === 0) {
          throw new Error('Empty response from Gemini');
        }
        
        // Parse the JSON response
        let insights: string[] = [];
        try {
          // Clean up the response - remove markdown code blocks
          let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          // Extract JSON array
          const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            insights = JSON.parse(jsonMatch[0]);
            console.log('✅ Successfully parsed JSON insights:', insights);
          } else {
            throw new Error('No JSON array found in response');
          }
        } catch (parseError) {
          console.error('❌ Failed to parse insights JSON:', parseError);
          console.log('Attempting fallback parsing...');
          
          // Fallback: split by lines and clean
          insights = text
            .replace(/```json|```/g, '')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && line.length > 10 && !line.startsWith('[') && !line.startsWith(']'))
            .map(line => line.replace(/^["'\-\*\d\.\s]+/, '').replace(/["',]$/g, ''))
            .filter(line => line.length > 15)
            .slice(0, 5);
          
          console.log('Fallback parsed insights:', insights);
        }

        if (insights.length === 0) {
          throw new Error('No valid insights generated');
        }

        console.log('🎯 Final insights count:', insights.length);

        return NextResponse.json({
          success: true,
          insights: insights.slice(0, 5), // Max 5 insights
          source: 'gemini'
        });

      } catch (aiError) {
        console.error('Gemini AI error:', aiError);
        console.error('Full error:', JSON.stringify(aiError, null, 2));
        // Fall through to backend API or fallback
      }
    } else {
      console.warn('GEMINI_API_KEY not configured, skipping Gemini generation');
    }

    // Try backend as fallback
    try {
      // Backend expects 'text' field, not 'content'
      const backendPayload = {
        text: text,
        type: type,
        mood: mood,
        emotions: body.emotions,
        situation: situation
      };
      
      console.log('Sending to backend:', backendPayload);
      
      const response = await fetch(`${BACKEND_API_URL}/cbt/insights/generate`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendPayload)
      });

      console.log('Backend response status:', response.status);
      const data = await response.json();
      console.log('Backend response data:', data);

      if (response.ok) {
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.warn('Backend insights failed:', backendError);
    }

    // Final fallback: Use rule-based insights
    const fallbackInsights = generateFallbackInsights(text, mood, type);
    return NextResponse.json({
      success: true,
      insights: fallbackInsights,
      source: 'fallback'
    });

  } catch (error) {
    console.error('CBT insights error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate CBT insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateFallbackInsights(content: string, mood: number, type?: string): string[] {
  const insights: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // Mood-based insights
  if (mood <= 2) {
    insights.push("💙 Your low mood is noted. Consider reaching out to someone you trust or trying a grounding exercise.");
  } else if (mood >= 5) {
    insights.push("😊 You're experiencing positive emotions - great to see! Try to identify what's contributing to this feeling.");
  } else {
    insights.push("🌟 Your mood is moderate. Reflect on what might shift it in either direction.");
  }
  
  // Content analysis
  if (lowerContent.includes("grateful") || lowerContent.includes("thankful") || lowerContent.includes("appreciate")) {
    insights.push("🙏 Gratitude practice detected - research shows this significantly boosts well-being!");
  }
  
  if (lowerContent.includes("stress") || lowerContent.includes("anxiety") || lowerContent.includes("worried")) {
    insights.push("🧘 Consider trying deep breathing or progressive muscle relaxation to manage these feelings.");
  }
  
  if (lowerContent.includes("goal") || lowerContent.includes("plan") || lowerContent.includes("achieve")) {
    insights.push("🎯 Goal-oriented thinking - breaking goals into smaller steps can make them more achievable.");
  }
  
  if (lowerContent.includes("friend") || lowerContent.includes("family") || lowerContent.includes("relationship")) {
    insights.push("💕 Social connections are vital for mental health. Nurturing relationships is important.");
  }
  
  if (content.length > 300) {
    insights.push("📝 Detailed reflection shows good self-awareness - this depth is valuable for personal growth.");
  }
  
  // CBT-specific for thought records
  if (type === 'thought_record') {
    if (lowerContent.includes("always") || lowerContent.includes("never") || lowerContent.includes("everyone")) {
      insights.push("🔍 Watch for all-or-nothing thinking. Try considering alternative perspectives or exceptions.");
    }
  }
  
  return insights.slice(0, 5);
}

// Also support GET for historical insights
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Get user's historical insights from backend
    const response = await fetch(`${BACKEND_API_URL}/cbt/insights`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to fetch insights' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
