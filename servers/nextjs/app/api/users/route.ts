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
    });
    settingsStore.set(USERS_KEY, users);
  }
  return users;
}
function saveUsers(users: any[]) {
  settingsStore.set(USERS_KEY, users);
}

export async function GET() {
  const users = loadUsers().map((u: any) => ({ username: u.username, pages: u.pages || [] }));
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const { username, password, pages } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
  const users = loadUsers();
  if (users.some((u: any) => u.username === username)) {
    return NextResponse.json({ error: 'User exists' }, { status: 400 });
  }
  users.push({ username, password: hashPassword(password), pages: pages || [] });
  saveUsers(users);
  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const { username, password, pages } = await request.json();
  if (!username) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
  const users = loadUsers();
  const user = users.find((u: any) => u.username === username);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (password) {
    user.password = hashPassword(password);
  }
  if (pages) {
    user.pages = pages;
  }
  saveUsers(users);
  return NextResponse.json({ success: true });
}
