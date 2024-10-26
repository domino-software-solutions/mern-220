import {  NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear the token cookie
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    response.cookies.set('token', '', { 
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'strict',
      path: '/'
    });
    
    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
