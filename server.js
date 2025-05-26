const http = require("http");
const WebSocket = require("ws");

const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  console.log("🔌 Conexión WebSocket recibida");

  ws.once("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      const id = data.device_id || "sin_id";
      console.log(`✅ Dispositivo conectado: ${id}`);

      ws.on("message", (m) => console.log(`[${id}] ${m}`));
    } catch (e) {
      console.error("⚠️ Error al identificar");
    }
  });
});

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket escuchando en puerto ${PORT}`);
});
