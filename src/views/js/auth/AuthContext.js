export class AuthContext {
  static tokenKey = 'auth_token';

  static getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  static async login(email, password) {
    const response = await fetch('/login', {  
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Login failed');

    const { token } = await response.json();
    localStorage.setItem(this.tokenKey, token);
    return token;
  }

  static logout() {
    localStorage.removeItem(this.tokenKey);
  }
}

