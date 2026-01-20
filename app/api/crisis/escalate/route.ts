import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

interface CrisisEscalation {
  userId: string;
  type: 'self_harm' | 'suicide_ideation' | 'safety_report' | 'emergency' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  context?: {
    matchId?: string;
    messageId?: string;
    reportId?: string;
    sessionId?: string;
  };
  location?: {
    country?: string;
    timezone?: string;
    emergencyNumber?: string;
  };
}

// Crisis hotlines by region
const CRISIS_HOTLINES = {
  US: {
    name: 'National Suicide Prevention Lifeline',
    number: '988',
    text: 'Text HOME to 741741'
  },
  UK: {
    name: 'Samaritans',
    number: '116 123',
    text: 'Text SHOUT to 85258'
  },
  CA: {
    name: 'Talk Suicide Canada',
    number: '1-833-456-4566',
    text: 'Text 45645'
  },
  AU: {
    name: 'Lifeline Australia',
    number: '13 11 14',
    text: 'Text 0477 13 11 14'
  },
  GLOBAL: {
    name: 'International Association for Suicide Prevention',
    number: 'Visit iasp.info/resources/Crisis_Centres',
    text: 'Find local crisis centers'
  }
};

function assessCrisisSeverity(details: string): { severity: string; type: string; urgency: string } {
  const text = details.toLowerCase();
  
  // Critical - immediate danger
  if (text.includes('going to kill myself') || text.includes('ending it tonight') || 
      text.includes('have a plan') || text.includes('goodbye forever')) {
    return { severity: 'critical', type: 'suicide_ideation', urgency: 'immediate' };
  }
  
  // High - serious ideation
  if (text.includes('want to die') || text.includes('kill myself') || 
      text.includes('end it all') || text.includes('not worth living')) {
    return { severity: 'high', type: 'suicide_ideation', urgency: 'urgent' };
  }
  
  // High - self-harm
  if (text.includes('hurt myself') || text.includes('cutting') || 
      text.includes('self-harm') || text.includes('punish myself')) {
    return { severity: 'high', type: 'self_harm', urgency: 'urgent' };
  }
  
  // Medium - distress
  if (text.includes('can\'t cope') || text.includes('overwhelming') || 
      text.includes('hopeless') || text.includes('desperate')) {
    return { severity: 'medium', type: 'emergency', urgency: 'priority' };
  }
  
  return { severity: 'low', type: 'other', urgency: 'standard' };
}

export async function POST(req: NextRequest) {
  try {
    const { userId, details, context, userLocation } = await req.json();
    
    if (!userId || !details) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or details' },
        { status: 400 }
      );
    }

    // Assess crisis severity
    const assessment = assessCrisisSeverity(details);
    
    const escalation: CrisisEscalation = {
      userId,
      type: assessment.type as any,
      severity: assessment.severity as any,
      details,
      context,
      location: userLocation
    };

    const authHeader = req.headers.get('authorization');
    
    // Submit to backend crisis system
    const response = await fetch(`${BACKEND_API_URL}/crisis/escalate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({
        ...escalation,
        timestamp: new Date().toISOString(),
        urgency: assessment.urgency,
        autoAssessment: assessment
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Get appropriate crisis resources
      const region = userLocation?.country || 'GLOBAL';
      const hotline = CRISIS_HOTLINES[region as keyof typeof CRISIS_HOTLINES] || CRISIS_HOTLINES.GLOBAL;
      
      let responseMessage = 'Crisis support has been notified and will reach out to you.';
      let immediateActions = [];
      
      if (assessment.severity === 'critical') {
        responseMessage = 'Emergency crisis support has been immediately notified. Please stay safe.';
        immediateActions = [
          'If you are in immediate danger, call emergency services (911, 999, etc.)',
          `Contact crisis hotline: ${hotline.name} - ${hotline.number}`,
          'Stay with someone you trust or go to a safe place',
          'Remove any means of self-harm from your immediate area'
        ];
      } else if (assessment.severity === 'high') {
        responseMessage = 'Crisis support team has been notified and will contact you within 30 minutes.';
        immediateActions = [
          `Crisis hotline available 24/7: ${hotline.name} - ${hotline.number}`,
          'Consider reaching out to a trusted friend or family member',
          'Use coping strategies you\'ve learned (breathing, grounding techniques)'
        ];
      } else {
        immediateActions = [
          `Support available: ${hotline.name} - ${hotline.number}`,
          'Consider talking to a mental health professional',
          'Reach out to your support network'
        ];
      }

      // Log for safety team review
      console.log(`Crisis escalation ${data.escalationId}:`, {
        userId,
        severity: assessment.severity,
        type: assessment.type,
        urgency: assessment.urgency,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        data: {
          escalationId: data.escalationId,
          severity: assessment.severity,
          urgency: assessment.urgency,
          crisisResources: {
            hotline,
            immediateActions,
            followUpExpected: assessment.severity === 'critical' ? '5 minutes' : 
                             assessment.severity === 'high' ? '30 minutes' : '2 hours'
          }
        },
        message: responseMessage
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to escalate to crisis support'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error escalating to crisis support:', error);
    
    // Even if backend fails, provide crisis resources
    const hotline = CRISIS_HOTLINES.GLOBAL;
    
    return NextResponse.json({
      success: false,
      error: 'System error, but crisis resources are available',
      crisisResources: {
        hotline,
        immediateActions: [
          'If in immediate danger, call emergency services',
          'Contact a crisis hotline in your area',
          'Reach out to a trusted person',
          'Go to your nearest emergency room if needed'
        ]
      }
    }, { status: 500 });
  }
} 