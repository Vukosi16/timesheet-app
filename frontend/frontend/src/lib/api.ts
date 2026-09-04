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

export async function createTimesheet(periodMonth: string) {
  return apiRequest('/timesheet/create', {
    method: 'POST',
    body: JSON.stringify({ periodMonth }),
  })
}

export async function submitTimesheet(timesheetId : number) {
  return apiRequest(`/timesheet/submit/${timesheetId}`, {
    method: 'PATCH',
  })
}

export async function createEntry(timesheetId : number, date: string, activityType: 'TRAINING' | 'MATCH' | 'REF_KIDS' | 'REF_ADULT' | 'MISC', description: string, amount?: number ) {
  return apiRequest(`/entry/${timesheetId}/create`, {
    method: 'POST',
    body: JSON.stringify({ date, activityType, description, amount })
  })
}

export async function editEntry(timesheetId: number, entryId: number, date: string, description: string) {
  return apiRequest(`/entry/${timesheetId}/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify({ date, description })
  })
}

export async function deleteEntry(timesheetId: number, entryId: number) {
  return apiRequest(`/entry/${timesheetId}/${entryId}`, {
    method: 'DELETE',
  })
}



