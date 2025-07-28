import { NextRequest, NextResponse } from 'next/server';
import { settingsStore } from '@/app/(presentation-generator)/services/setting-store';
import crypto from 'crypto';

const USERS_KEY = 'users';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function loadUsers() {
  const users = settingsStore.get(USERS_KEY, []);
  const hasAdmin = users.some((u: any) => u.username === 'admin@clingroup.net');
  if (!hasAdmin) {
    users.push({
      username: 'admin@clingroup.net',
      password: hashPassword('clingroup#123@'),
      pages: [],
      linkedin_pages: [],
    });
    settingsStore.set(USERS_KEY, users);
  }
  return users;
}

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const users = loadUsers();
  const hashed = hashPassword(password);
  const user = users.find((u: any) => u.username === username && u.password === hashed);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  return NextResponse.json({
    username: user.username,
    pages: user.pages || [],
    linkedin_pages: user.linkedin_pages || [],
  });
}
