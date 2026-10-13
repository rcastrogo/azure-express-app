import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import azureHandler from './src/api/azure.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Azure App Service inyecta el puerto en process.env.PORT.
// En local usamos 3000 como valor por defecto.
const PORT = process.env.PORT || 3000;

// Azure pone un proxy inverso delante de la app (HTTPS termina allí).
// Con esto req.protocol, req.ip, etc. reflejan al cliente real.
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (req, res) => { // Endpoint de salud (útil para el "Health check" de Azure)
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hola desde Express en Azure 👋',
    env: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});


app.all('/api/azure', azureHandler);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});


const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});


process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => process.exit(0));
});
