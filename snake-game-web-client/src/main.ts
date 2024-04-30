import { GameEngine } from "./app/engine/GameEngine";
import { io } from "socket.io-client";
import "./style.css";
import { Config } from "./config";
import Swal from "sweetalert2";

let gameEngine: GameEngine;
let room: any = {};
let w: any = window;

function gameStart(data: any) {
  console.log("✈️ Game start log ➡️", data);
  room = data;
  if (room.players.filter((player: any) => player.id == uuid).length < 1) {
    return;
  }
  document.getElementById("game").style.display = "block";
  gameEngine = new GameEngine(
    uuid,
    room,
    "#a5d8ff",
    (body: any) => {
      socket.emit(
        "game.request.food.eat",
        { room, id: uuid, ...body },
        (data: any) => {
          eaten(data);
        }
      );
    },
    (player: any) => {
      socket.emit("game.request.position.update", {
        room,
        id: uuid,
        ...player,
      });
    }
  ).initialize();
  showScoreBoard();
}

function eaten(data: any) {
  gameEngine.eaten(data);
  gameEngine.setFood(data);
  showScoreBoard(data.winner);
}

function showScoreBoard(winner: any = null) {
  let scoreboard = "";
  room.players = room.players.map((player: any) => {
    if (winner && player.id == winner) {
      player.score++;
    }
    scoreboard += generateScoreCard(
      player.name,
      player.fillColor,
      player.score
    );
    return player;
  });
  document.getElementById("scoreboard").innerHTML = scoreboard;
}

let uuid = Math.random().toString(36).substring(7);
let socket = io(Config.API_BASE_URL);
socket.on("connect", () => {
  console.log("🔗 Socket Connected");

  socket.on("game.room.game.start", (data) => {
    console.log("game.room.game.start");
    gameStart(data);
  });

  socket.on("game.room.player.join", (data) => {
    console.log("👤 Player joined", data);
    generatePlayerList(data.players);
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
    console.log("🔚 game.room.game.end", data);
    gameEngine.endGame();
  });

  socket.on("game.room.player.kick", (data) => {
    console.log("✅ Got kicked");
    room = data;
    generatePlayerList(data.players);

    if (room.players.filter((player: any) => player.id == uuid).length < 1) {
      socket.emit(
        "game.request.room.leave",
        { id: uuid, room: room },
        (data: any) => {}
      );
      Swal.fire({
        title: "You have been kicked.",
        confirmButtonText: "Go back",
        showClass: {
          popup: `
            animate__animated
            animate__fadeInUp
            animate__faster
          `,
        },
        hideClass: {
          popup: `
            animate__animated
            animate__fadeOutDown
            animate__faster
          `,
        },
      }).then((result) => {
        if (result.isConfirmed) {
          document.getElementById("game").style.display = "none";
          document.getElementById("room-id").style.display = "none";
          document.getElementById("create-room").style.display = "block";
          document.getElementById("join-room").style.display = "block";
          document.getElementById("start-game").style.display = "none";
        }
      });
    }
  });

  socket.on("disconnect", () => {
    Swal.fire({
      title: "Disconnected",
      confirmButtonText: "Go back",
      showClass: {
        popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `,
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `,
      },
    }).then((result) => {
      if (result.isConfirmed) {
        document.getElementById("game").style.display = "none";
        document.getElementById("room-id").style.display = "none";
        document.getElementById("create-room").style.display = "block";
        document.getElementById("join-room").style.display = "block";
        document.getElementById("start-game").style.display = "none";
      }
    });
  });
});

w["startGame"] = () => {
  console.log("✈️ Game start requested");
  socket.emit(
    "game.request.game.start",
    { room: { id: uuid } },
    (data: any) => {
      gameStart(data);
      console.log("⚡ Game start request successfull");
    }
  );
};

w["createRoom"] = () => {
  console.log("📨 Create room request sent");
  let name = (document.getElementsByName("name")[0] as HTMLInputElement).value;
  socket.emit(
    "game.request.room.create",
    { id: uuid, target: 10, name: name },
    (data: any) => {
      console.log("📊 Created room log ➡️ ", data);
      document.getElementById("room-id").innerHTML = uuid;
      document.getElementById("room-id").style.display = "block";
      document.getElementById("create-room").style.display = "none";
      document.getElementById("join-room").style.display = "none";
      document.getElementById("start-game").style.display = "block";
      room = {
        id: uuid,
      };
      generatePlayerList(data.players);
      console.log("✅ Room created successfully");
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
  let name = (document.getElementsByName("name")[1] as HTMLInputElement).value;
  socket.emit(
    "game.request.room.join",
    { id: uuid, room: { id }, name: name },
    (data: any) => {
      console.log("join room", data);
      document.getElementById("room-id").innerHTML = data.id;

      document.getElementById("room-id").style.display = "block";
      document.getElementById("join-room-section").style.display = "none";
      room = {
        id: data.id,
      };
      generatePlayerList(data.players);
    }
  );
};

w["kick"] = (id: number) => {
  socket.emit("game.request.room.kick", { room, id: id }, (data: any) => {});
};

function generateScoreCard(name: String, color: String, score: number): String {
  return `
    <tr>
      <td style="font-size: 25px">
        <span
          style="
            height: 15px;
            width: 15px;
            background-color: ${color};
            border-radius: 50%;
            display: inline-block;
            border: 1px solid black;
          "
        ></span> 
        <span style="font-size: 22px"> ${name} (${score}) </span>
      </td>
    </tr>
  `;
}

function generatePlayerList(players: any[]) {
  let plyersTable = "";

  players.map((player) => {
    plyersTable += `
      <tr>
        <td style="font-size: 15px">
           ${player.name}
        </td>
        <td style="font-size: 15px">
           ${
             player.id != uuid && uuid == room.id
               ? `<button onclick="kick('${player.id}')">Kick</button>`
               : ""
           }
        </td>
      </tr>
    `;
  });
  document.getElementById("players").innerHTML = plyersTable;
}
