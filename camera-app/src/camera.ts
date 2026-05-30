import { io, Socket } from 'socket.io-client';
import { getToken } from './auth';
import { uploadScreenshot } from './api';

export interface MotionEventPayload {
  id: string;
  payload: string;
  createdAt: string;
}

export function connectNotifications(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  onStatus: (message: string) => void,
  onCapture: (filename: string) => void,
): Socket {
  const token = getToken();
  const socket = io('/notifications', {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    onStatus('Conectado — aguardando detecções');
  });

  socket.on('disconnect', () => {
    onStatus('Desconectado do servidor');
  });

  socket.on('connect_error', () => {
    onStatus('Erro na conexão WebSocket');
  });

  socket.on('motion_detection', async (event: MotionEventPayload) => {
    onStatus(`Detecção recebida: ${event.payload}`);

    try {
      const screenshot = captureFrame(video, canvas);
      const filename = `capture-${event.id}.jpg`;
      await uploadScreenshot(screenshot, event.id, filename);
      onCapture(filename);
      onStatus('Captura enviada com sucesso');
    } catch {
      onStatus('Erro ao capturar ou enviar imagem');
    }
  });

  return socket;
}

function captureFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): string {
  const context = canvas.getContext('2d');
  if (!context || video.videoWidth === 0) {
    throw new Error('Vídeo indisponível');
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  return dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
}

export async function startCamera(video: HTMLVideoElement): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  });

  video.srcObject = stream;
  await video.play();
  return stream;
}
