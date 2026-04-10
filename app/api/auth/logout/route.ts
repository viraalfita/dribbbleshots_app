import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  const clear = { path: '/', maxAge: 0 };
  response.cookies.set('sb-access-token', '', clear);
  response.cookies.set('sb-refresh-token', '', clear);
  response.cookies.set('dribble-role', '', clear);
  return response;
}
