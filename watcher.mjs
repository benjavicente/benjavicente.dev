import { WebSocketServer } from "ws";
import chokidar from "chokidar";

const wss = new WebSocketServer({ port: 3001 });
const watchCallbacks = [];

chokidar.watch("./public/blog").on("all", (event) => {
  if (event === "change") {
    console.info("Refreshing page...");
    watchCallbacks.forEach((cb) => cb());
  }
});

wss.on("connection", function connection(ws) {
  const onChange = () => ws.send("refresh");
  ws.on("error", console.error);

  watchCallbacks.push(onChange);
  ws.on("close", function close() {
    const index = watchCallbacks.findIndex(onChange);
    watchCallbacks.splice(index, 1);
  });
});
