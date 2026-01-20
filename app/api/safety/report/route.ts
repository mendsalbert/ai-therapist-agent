import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

interface SafetyReport {
  reporterId: string;
  reportedUserId: string;
  reason: string;
  details?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'harassment' | 'inappropriate_content' | 'safety_concern' | 'spam' | 'other';
  evidence?: {
    messageIds?: string[];
    screenshots?: string[];
    additionalInfo?: string;
  };
}

function categorizeSafetyReport(reason: string, details?: string): { severity: string; category: string } {
  const text = `${reason} ${details || ''}`.toLowerCase();
  
  // Critical severity
  if (text.includes('threat') || text.includes('violence') || text.includes('harm') || 
      text.includes('suicide') || text.includes('self-harm')) {
    return { severity: 'critical', category: 'safety_concern' };
  }
  
  // High severity
  if (text.includes('harassment') || text.includes('stalking') || text.includes('abuse') ||
      text.includes('inappropriate') || text.includes('sexual')) {
    return { severity: 'high', category: 'harassment' };
  }
  
  // Medium severity
  if (text.includes('spam') || text.includes('scam') || text.includes('fake')) {
    return { severity: 'medium', category: 'spam' };
  }
  
  // Low severity (default)
  return { severity: 'low', category: 'other' };
}

export async function POST(req: NextRequest) {
  try {
    const { reporterId, reportedUserId, reason, details, evidence } = await req.json();
    
    if (!reporterId || !reportedUserId || !reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: reporterId, reportedUserId, reason' },
        { status: 400 }
      );
    }

    // Prevent self-reporting
    if (reporterId === reportedUserId) {
      return NextResponse.json(
        { success: false, error: 'Cannot report yourself' },
        { status: 400 }
      );
    }

    // Categorize the report
    const { severity, category } = categorizeSafetyReport(reason, details);
    
    const report: SafetyReport = {
      reporterId,
      reportedUserId,
      reason,
      details,
      severity: severity as any,
      category: category as any,
      evidence
    };

    const authHeader = req.headers.get('authorization');
    
    // Submit report to backend
    const response = await fetch(`${BACKEND_API_URL}/safety/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({
        ...report,
        timestamp: new Date().toISOString(),
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Handle critical reports immediately
      if (severity === 'critical') {
        try {
          // Temporarily suspend the reported user
          await fetch(`${BACKEND_API_URL}/safety/suspend`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authHeader && { Authorization: authHeader }),
            },
            body: JSON.stringify({
              userId: reportedUserId,
              reason: 'Critical safety report - temporary suspension pending review',
              duration: '24h',
              reportId: data.reportId
            })
          });

          // Escalate to crisis support
          await fetch(`${BACKEND_API_URL}/crisis/escalate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'safety_report',
              reportId: data.reportId,
              severity: 'critical',
              details: `Critical safety report: ${reason}`,
              timestamp: new Date().toISOString()
            })
          });
        } catch (escalationError) {
          console.error('Failed to handle critical report escalation:', escalationError);
        }
      }

      // Send notification to safety team
      try {
        await fetch(`${BACKEND_API_URL}/notifications/safety-team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_safety_report',
            reportId: data.reportId,
            severity,
            category,
            reportedUserId,
            timestamp: new Date().toISOString()
          })
        });
      } catch (notificationError) {
        console.error('Failed to notify safety team:', notificationError);
      }

      let responseMessage = 'Report submitted successfully. Our safety team will review it promptly.';
      
      if (severity === 'critical') {
        responseMessage = 'Critical safety report submitted. The reported user has been temporarily suspended and our crisis support team has been notified.';
      } else if (severity === 'high') {
        responseMessage = 'High priority safety report submitted. Our team will review this within 2 hours.';
      }

      return NextResponse.json({
        success: true,
        data: {
          reportId: data.reportId,
          severity,
          category,
          status: 'submitted'
        },
        message: responseMessage
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to submit report'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error submitting safety report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit safety report' },
      { status: 500 }
    );
  }
} 