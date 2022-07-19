require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const router = require("./router/index");
const BinanceP2PService = require("./worker/index");

const PORT = process.env.PORT || 5000;
const app = express();

app.use("/api", router);

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", async (socket) => {
  console.log("User connected!");
  BinanceP2PService.sendData();
});

const start = async () => {
  try {
    server.listen(PORT, () =>
      console.log(`Server started in development mode on PORT = ${PORT}`)
    );

    await BinanceP2PService.createWorker(io);
  } catch (err) {
    console.log(err);
  }
};

start();