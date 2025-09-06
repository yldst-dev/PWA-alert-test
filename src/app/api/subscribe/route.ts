import { NextRequest, NextResponse } from 'next/server';
import { saveSubscription } from '@/lib/subscription-store';

export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json();
    
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription data is required' }, { status: 400 });
    }

    const subscriptionId = saveSubscription(subscription);
    
    return NextResponse.json({ 
      success: true, 
      subscriptionId,
      message: 'Subscription saved successfully' 
    });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Push notification subscription endpoint',
    methods: ['POST']
  });
}