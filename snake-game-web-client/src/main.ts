import { GameEngine } from "./engine/GameEngine";
import { io } from "socket.io-client";
import "./style.css";
import { Config } from "./config";

let gameEngine: GameEngine;
let room = {};
let w: any = window;

function gameStart(data: any) {
  console.log("game start", data);
  document.getElementById("game").style.display = "block";
  gameEngine = new GameEngine().initialize(
    "#a5d8ff",
    uuid,
    data,
    (player: any) => {
      socket.emit("game.request.position.update", {
        room,
        id: uuid,
        ...player,
      });
    },
    (body: any) => {
      socket.emit(
        "game.request.food.eat",
        { room, id: uuid, ...body },
        (data: any) => {
          eaten(data);
        }
      );
    }
  );
}

function eaten(data: any) {
  gameEngine.eaten(data);
  gameEngine.setFood(data);
}

let uuid = Math.random().toString(36).substring(7);
let socket = io(Config.API_BASE_URL);
socket.on("connect", () => {
  console.log("Socket Connected");

  socket.on("game.room.game.start", (data) => {
    console.log("game.room.game.start");
    gameStart(data);
  });

  socket.on("game.room.player.join", (data) => {
    console.log("player joined", data);
  });

  socket.on("game.room.game.position.update", (data) => {
    gameEngine.updatePlayer(data);
  });

  socket.on("game.request.food.eat", (data) => {
    gameEngine.updatePlayer(data);
  });

  socket.on("game.room.game.food.eat", (data) => {
    eaten(data);
  });

  socket.on("game.room.game.end", (data) => {
    console.log("game.room.game.end", data);
    gameEngine.endGame();
  });
});

w["startGame"] = () => {
  socket.emit(
    "game.request.game.start",
    { room: { id: uuid } },
    (data: any) => {
      gameStart(data);
    }
  );
};

w["createRoom"] = () => {
  console.log("Create Room");
  socket.emit(
    "game.request.room.create",
    { id: uuid, target: 10 },
    (data: any) => {
      console.log("created room", data);
      document.getElementById("room-id").innerHTML = uuid;
      document.getElementById("room-id").style.display = "block";
      document.getElementById("create-room").style.display = "none";
      document.getElementById("join-room").style.display = "none";
      document.getElementById("start-game").style.display = "block";
      room = {
        id: uuid,
      };
    }
  );
};

w["joinRoom"] = () => {
  document.getElementById("join-room").style.display = "none";
  document.getElementById("create-room").style.display = "none";
  document.getElementById("join-room-section").style.display = "block";
};

w["submit"] = () => {
  let id = (document.getElementsByName("id")[0] as HTMLInputElement).value;
  socket.emit(
    "game.request.room.join",
    { id: uuid, room: { id } },
    (data: any) => {
      console.log("join room", data);
      document.getElementById("room-id").innerHTML = data.room.id;

      document.getElementById("room-id").style.display = "block";
      document.getElementById("join-room-section").style.display = "none";
      room = {
        id,
      };
    }
  );
};
