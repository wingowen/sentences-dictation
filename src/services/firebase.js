let currentUser = null;
const listeners = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener(currentUser));
}

export function initializeAuth() {
  const token = getAuthToken();
  const userData = localStorage.getItem('user_data');
  
  if (token && userData) {
    try {
      currentUser = JSON.parse(userData);
    } catch (e) {
      currentUser = null;
    }
  }
}

export function getAuthToken() {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

export function getCurrentUser() {
  return currentUser;
}

export function onAuthStateChanged(callback) {
  listeners.add(callback);
  callback(currentUser);
  
  return () => {
    listeners.delete(callback);
  };
}

export function setUser(user) {
  currentUser = user;
  if (user) {
    localStorage.setItem('user_data', JSON.stringify(user));
  } else {
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  }
  notifyListeners();
}

export const auth = {
  currentUser: null,
};

Object.defineProperty(auth, 'currentUser', {
  get() {
    return getCurrentUser();
  }
});

initializeAuth();