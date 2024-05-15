import express from "express";
import * as http from "http";
import * as socketIo from "socket.io";
import { EventHandler } from "./app";
import serveStatic from "serve-static";

console.log("🙭 Starting...");

const app = express();
const httpServer = http.createServer(app);
const host = process.env.HOST || "*";

console.log("🮱  Express and HTTP initiated...");

const io = new socketIo.Server(httpServer, {
  cors: {
    origin: host,
    methods: ["GET", "POST"],
  },
});

console.log("🮱  CORS added...");

let modes = {
  2: [],
  3: [],
  4: [],
};

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, tenant, x-hub-signature"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

console.log("🮱  Header options Configured...");

app.use(serveStatic(__dirname + "/dist"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/*", (req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});

console.log("🙭 Creating Event Handlers...");

new EventHandler(io).init();

console.log("🮱  Boot sequence completed...");

const port = process.env.PORT || 3001;

httpServer.listen(port, () => {
  console.log(`🗲 listening on ${host}:${port}`);
});
