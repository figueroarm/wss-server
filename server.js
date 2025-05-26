const http = require("http");
const WebSocket = require("ws");

// Crear un servidor HTTP (Render se encarga del HTTPS externo)
const server = http.createServer();

// WebSocket server usando noServer (Render gestiona TLS)
const wss = new WebSocket.Server({ noServer: true });

// Mapa para registrar dispositivos conectados por ID
const dispositivos = new Map();

// Lógica de conexión WebSocket
wss.on("connection", (ws, req) => {
  console.log("🔌 Nueva conexión WebSocket");

  // Esperamos un primer mensaje con identificación del dispositivo
  ws.once("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      const deviceId = data.device_id || "sin_id";
      dispositivos.set(deviceId, ws);

      console.log(`✅ Dispositivo registrado: ${deviceId}`);

      // Escuchar mensajes normales
      ws.on("message", (mensaje) => {
        console.log(`📨 [${deviceId}]: ${mensaje}`);
      });

      // Desconexión
      ws.on("close", () => {
        dispositivos.delete(deviceId);
        console.log(`❌ Dispositivo desconectado: ${deviceId}`);
      });

    } catch (e) {
      console.error("⚠️ Error al interpretar mensaje de identificación:", e.message);
      ws.close();
    }
  });
});

// Manejar upgrade HTTP → WebSocket
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

// 🔐 Usar puerto que Render provee dinámicamente
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket activo en puerto ${PORT}`);
});

