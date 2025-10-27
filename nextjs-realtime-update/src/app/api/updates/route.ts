import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderID = searchParams.get('orderID'); // Extract orderID from query parameter

  // Validate orderID
  if (!orderID || isNaN(parseInt(orderID))) {
    return new NextResponse('Invalid or missing orderID', { status: 400 });
  }

  // Set SSE headers
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      // Simulate periodic updates (every 5 seconds)
      const interval = setInterval(() => {
        const newFreight = (Math.random() * 100).toFixed(2); // Random freight value
        const data = `event: freight-updated\ndata: $${newFreight}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      }, 2000);

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, { headers });
}

// Disable body parsing for SSE
export const config = {
  api: {
    bodyParser: false,
  },
};