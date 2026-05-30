import { getToken } from './auth';

const API_BASE = '';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Credenciais inválidas');
  }

  return response.json() as Promise<{
    user: { id: string; email: string; name: string | null };
    accessToken: string;
  }>;
}

export async function uploadScreenshot(
  data: string,
  motionEventId: string,
  filename: string,
) {
  const token = getToken();
  if (!token) {
    throw new Error('Não autenticado');
  }

  const response = await fetch(`${API_BASE}/api/images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data,
      mimeType: 'image/jpeg',
      filename,
      motionEventId,
    }),
  });

  if (!response.ok) {
    throw new Error('Falha ao enviar captura');
  }

  return response.json();
}
