import './style.css';
import { clearToken, isAuthenticated, setToken } from './auth';
import { login } from './api';
import { connectNotifications, startCamera } from './camera';
import type { Socket } from 'socket.io-client';

const app = document.getElementById('app')!;
let socket: Socket | null = null;
let mediaStream: MediaStream | null = null;

function renderLogin(error?: string) {
  app.innerHTML = `
    <div class="screen">
      <div class="card">
        <h1>Camera Monitor</h1>
        <p class="subtitle">Faça login para monitorar e capturar detecções.</p>
        ${error ? `<p class="error">${error}</p>` : ''}
        <form class="form" id="login-form">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required autocomplete="username">
          <label for="password">Senha</label>
          <input type="password" id="password" name="password" required minlength="6" autocomplete="current-password">
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('login-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const result = await login(email, password);
      setToken(result.accessToken);
      renderCamera();
    } catch {
      renderLogin('Credenciais inválidas');
    }
  });
}

function renderCamera() {
  app.innerHTML = `
    <div id="status-bar" class="status-bar">Iniciando câmera...</div>
    <div class="video-wrap">
      <video id="camera-video" playsinline autoplay muted></video>
      <canvas id="capture-canvas" class="hidden"></canvas>
    </div>
    <div class="toolbar">
      <button type="button" id="logout-btn" class="secondary">Sair</button>
    </div>
    <div class="captures">
      <h2>Capturas enviadas</h2>
      <ul id="captures-list"></ul>
    </div>
  `;

  const statusBar = document.getElementById('status-bar')!;
  const video = document.getElementById('camera-video') as HTMLVideoElement;
  const canvas = document.getElementById('capture-canvas') as HTMLCanvasElement;
  const capturesList = document.getElementById('captures-list')!;

  document.getElementById('logout-btn')!.addEventListener('click', () => {
    teardown();
    clearToken();
    renderLogin();
  });

  startCamera(video)
    .then((stream) => {
      mediaStream = stream;
      socket = connectNotifications(
        video,
        canvas,
        (message) => {
          statusBar.textContent = message;
        },
        (filename) => {
          const li = document.createElement('li');
          li.textContent = `${new Date().toLocaleString('pt-BR')} — ${filename}`;
          capturesList.prepend(li);
        },
      );
    })
    .catch(() => {
      statusBar.textContent = 'Permita o acesso à câmera para continuar';
    });
}

function teardown() {
  socket?.disconnect();
  socket = null;
  mediaStream?.getTracks().forEach((track) => track.stop());
  mediaStream = null;
}

if (isAuthenticated()) {
  renderCamera();
} else {
  renderLogin();
}
