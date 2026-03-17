import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const MOCK_SAVED_DESIGNS = [
  'Glow by Jane',
  'Pure Collective',
  'Botanica Noir',
  'Serenity Studio',
];

function loadUsers() {
  try { return JSON.parse(localStorage.getItem('newbrand_users')) || []; }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem('newbrand_users', JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('newbrand_user')) || null; }
    catch { return null; }
  });

  // Keep current session in sync if admin approves/rejects while logged in
  const [users, setUsers] = useState(loadUsers);

  useEffect(() => {
    if (user) localStorage.setItem('newbrand_user', JSON.stringify(user));
    else localStorage.removeItem('newbrand_user');
  }, [user]);

  useEffect(() => {
    saveUsers(users);
    // Sync confirmed status into the active session
    if (user) {
      const record = users.find(u => u.email === user.email);
      if (record && record.confirmed !== user.confirmed) {
        setUser(u => ({ ...u, confirmed: record.confirmed }));
      }
    }
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Public auth ────────────────────────────────────────────────

  function register(data) {
    const existing = loadUsers().find(u => u.email === data.email);
    if (existing) {
      return { error: 'An account with this email already exists.' };
    }
    const newUser = {
      id: Date.now().toString(),
      company: data.company,
      name: data.name,
      email: data.email,
      password: data.password,
      confirmed: false,
      rejected: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...loadUsers(), newUser];
    setUsers(updated);
    setUser({ company: newUser.company, name: newUser.name, email: newUser.email, confirmed: false });
    return { error: null };
  }

  function login(email, password) {
    const record = loadUsers().find(u => u.email === email);
    if (!record) return { error: 'No account found with this email.' };
    if (record.password !== password) return { error: 'Incorrect password.' };
    if (record.rejected) return { error: 'Your account application was not approved. Please contact us.' };
    setUser({ company: record.company, name: record.name, email: record.email, confirmed: record.confirmed });
    return { error: null };
  }

  function logout() {
    setUser(null);
  }

  // ── Admin ──────────────────────────────────────────────────────

  function approveUser(email) {
    setUsers(prev => prev.map(u => u.email === email ? { ...u, confirmed: true, rejected: false } : u));
  }

  function rejectUser(email) {
    setUsers(prev => prev.map(u => u.email === email ? { ...u, confirmed: false, rejected: true } : u));
  }

  function getAllUsers() {
    return loadUsers();
  }

  return (
    <AuthContext.Provider value={{
      user,
      loggedIn: !!user,
      confirmed: !!user?.confirmed,
      login,
      logout,
      register,
      approveUser,
      rejectUser,
      getAllUsers,
      savedDesigns: MOCK_SAVED_DESIGNS,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
