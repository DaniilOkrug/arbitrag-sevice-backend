require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require('cors');

const router = require("./router/index");
const BinanceP2PService = require("./worker/index");

const PORT = process.env.PORT || 5000;
const app = express();

app.use("/api", router);
app.use(cors({
  credentials: true,
  origin: process.env.ORIGIN,
  optionSuccessStatus: 200
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
  },
});

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
