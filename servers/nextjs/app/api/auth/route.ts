import { NextRequest, NextResponse } from 'next/server';
import { settingsStore } from '@/app/(presentation-generator)/services/setting-store';
import crypto from 'crypto';

const USERS_KEY = 'users';

function loadUsers() {
  return settingsStore.get(USERS_KEY, []);
}

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const users = loadUsers();
  const hashed = hashPassword(password);
  const user = users.find((u: any) => u.username === username && u.password === hashed);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  return NextResponse.json({ username: user.username, pages: user.pages || [] });
}
