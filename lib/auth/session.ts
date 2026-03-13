import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export type SessionData = {
    userId?: number;
    username?: string;
    role?: 'designer' | 'admin';
    isLoggedIn: boolean;
};

export const defaultSession: SessionData = {
    isLoggedIn: false,
};

export const sessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD as string || 'complex_password_at_least_32_characters_long_for_iron_session_here_we_go',
    cookieName: 'dribbble-shot-plan-session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
    },
};

export async function getSession() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn) {
        session.isLoggedIn = defaultSession.isLoggedIn;
    }

    return session;
}
