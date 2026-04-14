export async function GET() {
  // Auth disabled for development
  return Response.json({ authenticated: true, email: 'dev@local' });
}
