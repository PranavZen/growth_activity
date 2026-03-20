export interface AuthUser {
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}

const users: Record<string, AuthUser> = {
  'pt-0001': {
    userId: 'pt-0001',
    fullName: 'Placeholder User',
    email: 'pt0001@example.com',
    mobile: '1234567890',
    password: '123123',
  },
};

export function registerUser(
  user: AuthUser,
): { success: true } | { success: false; error: string } {
  const existing = users[user.userId];
  if (existing) {
    return { success: false, error: 'User ID already exists' };
  }

  users[user.userId] = user;
  return { success: true };
}

export function signInUser(
  userId: string,
  password: string,
): { success: true; user: AuthUser } | { success: false; error: string } {
  const user = users[userId];
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  if (user.password !== password) {
    return { success: false, error: 'Invalid password' };
  }

  return { success: true, user };
}
