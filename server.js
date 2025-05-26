const http = require("http");
const WebSocket = require("ws");

const server = http.createServer();

const wss = new WebSocket.Server({ noServer: true });

const dispositivos = new Map();

wss.on("connection", (ws, req) => {
  console.log("🔌 Nueva conexión WebSocket");

  ws.once("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      const deviceId = data.device_id || "sin_id";
      dispositivos.set(deviceId, ws);

      console.log(`✅ Dispositivo conectado: ${deviceId}`);

      ws.on("message", (mensaje) => {
        console.log(`📨 [${deviceId}] ${mensaje}`);
      });

      ws.on("close", () => {
        dispositivos.delete(deviceId);
        console.log(`❌ Dispositivo desconectado: ${deviceId}`);
      });
    } catch (e) {
      console.error("⚠️ Error al procesar mensaje de identificación:", e.message);
      ws.close();
    }
  });
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor WebSocket escuchando en puerto ${PORT}`);
});
