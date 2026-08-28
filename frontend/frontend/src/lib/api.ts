const BASE_URL = 'http://localhost:3000';

async function apiRequest(path: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
}


export async function login(email: string, password: string) {
    return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function getMe() {
  return apiRequest('/user/me', {
    method: 'GET',
  });
}

export async function logout() {
  return apiRequest('/auth/logout', { method: 'POST' });
}

export async function getCoachTimesheets() {
  return apiRequest('/timesheet/timesheets', {
    method: 'GET',
  })
}

export async function submitTimesheet(timesheetId : number) {
  return apiRequest(`/timesheet/submit/${timesheetId}`, {
    method: 'PATCH',
  })
}