import { GameEngine } from "./app/engine/GameEngine";
import { io } from "socket.io-client";
import "./style.css";
import { Config } from "./config";
import Swal from "sweetalert2";
import { Storage } from "./app/engine/Storage";
import "./assets/css/style.css";
import info from "./../../info.json";

let gameEngine: GameEngine;
let room: any = {};
let w: any = window;

function gameStart(data: any) {
  console.log("✈️ Game start log ➡️", data);
  room = data;
  if (room.players.filter((player: any) => player.id == uuid).length < 1) {
    return;
  }
  if (gameEngine) {
    gameEngine.exit();
  }
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

let uuid = "";
if (Storage.getInstanceId() == "") {
  uuid = Math.random().toString(36).substring(7);
  Storage.setInstanceId(uuid);
} else {
  uuid = Storage.getInstanceId();
}

let socket = io(Config.API_BASE_URL);
socket.on("connect", () => {
  console.log("🔗 Socket Connected");
  runOnElements("connected", (element) => {
    (element as HTMLElement).style.display = "block";
  });
  runOnElements("notconnected", (element) => {
    (element as HTMLElement).style.display = "none";
  });
  runOnElements("start-section", (element) => {
    (element as HTMLElement).style.display = "block";
  });

  socket.on("game.room.game.start", (data) => {
    console.log("game.room.game.start");
    if (data.players.filter((player: any) => player.id == uuid).length < 1) {
      socket.emit(
        "game.request.room.leave",
        { id: uuid, room: room },
        (data: any) => {}
      );
      Swal.fire({
        title: "You have been kicked.",
        confirmButtonText: "Go back",
        allowOutsideClick: false,
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
      });
      kickAction();
      return;
    }
    runOnElements("game", (element) => {
      (element as HTMLElement).style.display = "block";
    });
    runOnElements("game-admin-cntrl", (element) => {
      (element as HTMLElement).style.display = "none";
    });
    runOnElements("start-section", (element) => {
      (element as HTMLElement).setAttribute("style", "display:none !important");
    });
    gameStart(data);
  });

  socket.on("game.room.player.join", (data) => {
    console.log("👤 Player joined", data);
    if (data.players.filter((player: any) => player.id == uuid).length < 1) {
      socket.emit(
        "game.request.room.leave",
        { id: uuid, room: room },
        (data: any) => {}
      );
      Swal.fire({
        title: "You have been kicked.",
        confirmButtonText: "Go back",
        allowOutsideClick: false,
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
      });
      kickAction();
      console.log("👤 User not part of the room", data);
      return;
    }
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
    gameEngine.endGame(data);
  });

  socket.on("game.room.player.kick", (data: any) => {
    console.log("✅ Got kicked", data.players);
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
        allowOutsideClick: false,
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
          kickAction();
        }
      });
    }
  });

  socket.on("game.room.player.left", (data) => {
    console.log("✅ Player left room");
    room = data;
    generatePlayerList(data.players);
  });

  socket.on("disconnect", () => {
    kickAction();
    runOnElements("connected", (element) => {
      (element as HTMLElement).style.display = "none";
    });
    runOnElements("notconnected", (element) => {
      (element as HTMLElement).style.display = "block";
    });

    runOnElements("start-section", (element) => {
      (element as HTMLElement).setAttribute("style", "display:none !important");
    });
    Swal.fire({
      title: "Disconnected",
      confirmButtonText: "Go back",
      allowOutsideClick: false,
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
    });
    // .then((result) => {
    //   if (result.isConfirmed) {
    //     kickAction();
    //   }
    // });
  });
});

w["startGame"] = () => {
  console.log("✈️ Game start requested");
  socket.emit(
    "game.request.game.start",
    { room: { id: uuid } },
    (data: any) => {
      runOnElements("game", (element) => {
        (element as HTMLElement).style.display = "block";
      });
      runOnElements("start-section", (element) => {
        (element as HTMLElement).setAttribute(
          "style",
          "display:none !important"
        );
      });
      runOnElements("go-back", (element) => {
        (element as HTMLElement).style.display = "block";
      });
      gameStart(data);
      console.log("⚡ Game start request successfull");
    }
  );
};

w["createRoom"] = () => {
  console.log("📨 Create room request sent");
  let name = (document.getElementsByName("name")[0] as HTMLInputElement).value;
  if (name == "") return;
  socket.emit(
    "game.request.room.create",
    { id: uuid, target: 10, name: name },
    (data: any) => {
      console.log("📊 Created room log ➡️ ", data);
      runOnElements("room-id-holder", (element) => {
        element.innerHTML = data.id;
      });
      document.getElementById("players-list-main").style.display =
        "inline-table";

      runOnElements("create-room", (element) => {
        (element as HTMLElement).style.display = "none";
      });
      runOnElements("join-room", (element) => {
        (element as HTMLElement).style.display = "none";
      });
      runOnElements("start-game", (element) => {
        (element as HTMLElement).style.display = "block";
      });
      runOnElements("go-back", (element) => {
        (element as HTMLElement).style.display = "block";
      });
      room = data;
      generatePlayerList(data.players);
      console.log("✅ Room created successfully");
    }
  );
};

w["joinRoom"] = () => {
  runOnElements("create-room", (element) => {
    (element as HTMLElement).style.display = "none";
  });
  runOnElements("join-room", (element) => {
    (element as HTMLElement).style.display = "none";
  });
  runOnElements("join-room-section", (element) => {
    (element as HTMLElement).style.display = "block";
  });
  runOnElements("go-back", (element) => {
    (element as HTMLElement).style.display = "block";
  });
};

w["submit"] = () => {
  let id = (document.getElementsByName("id")[0] as HTMLInputElement).value;
  let name = (document.getElementsByName("name")[1] as HTMLInputElement).value;

  if (name == "" || id == "") return;
  socket.emit(
    "game.request.room.join",
    { id: uuid, room: { id }, name: name },
    (data: any) => {
      console.log("join room", data);

      runOnElements("room-id-holder", (element) => {
        element.innerHTML = data.id;
      });
      document.getElementById("players-list-main").style.display =
        "inline-table";

      runOnElements("create-room", (element) => {
        (element as HTMLElement).style.display = "none";
      });
      runOnElements("join-room", (element) => {
        (element as HTMLElement).style.display = "none";
      });
      runOnElements("join-room-section", (element) => {
        (element as HTMLElement).style.display = "none";
      });

      room = {
        id: data.id,
      };
      generatePlayerList(data.players);
    }
  );
};

w["kick"] = (id: number) => {
  socket.emit("game.request.room.kick", { room, id: id }, (data: any) => {
    generatePlayerList(data.players);
  });
};

w["showStart"] = () => {
  kickAction();
};

function generateScoreCard(name: String, color: String, score: number): String {
  return `
    <tr>
      <td>
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
      </td>
      <td>
        <span> ${name} </span>
      </td>
      <td>
        <span> ${score} </span>
      </td>
    </tr>
  `;
}

function generatePlayerList(players: any[]) {
  let plyersTable = "";

  players.map((player) => {
    plyersTable += `
      <tr>
        <td>
           ${player.name}
        </td>
        <td>
           ${
             player.id != uuid && uuid == room.id
               ? `<button 
                    type="button"
                    class="btn btn-danger"
                    onclick="kick('${player.id}')">Kick</button>`
               : ""
           }
        </td>
      </tr>
    `;
  });
  runOnElements("players-list", (element) => {
    element.innerHTML = plyersTable;
  });
  document.getElementById("players").innerHTML = plyersTable;
}

function runOnElements(
  className: string,
  callback: (element: Element) => void
) {
  for (
    let index = 0;
    index < document.getElementsByClassName(className).length;
    index++
  ) {
    const element = document.getElementsByClassName(className).item(index);
    callback(element);
  }
}

function kickAction() {
  socket.emit(
    "game.request.room.leave",
    { id: uuid, room: room },
    (data: any) => {}
  );
  runOnElements("game", (element) => {
    (element as HTMLElement).style.display = "none";
  });
  runOnElements("start-section", (element) => {
    (element as HTMLElement).style.display = "block";
  });
  runOnElements("create-room", (element) => {
    (element as HTMLElement).style.display = "block";
  });
  runOnElements("join-room", (element) => {
    (element as HTMLElement).style.display = "block";
  });
  runOnElements("start-game", (element) => {
    (element as HTMLElement).style.display = "none";
  });
  runOnElements("go-back", (element) => {
    (element as HTMLElement).style.display = "none";
  });
  runOnElements("join-room-section", (element) => {
    (element as HTMLElement).style.display = "none";
  });
  document.getElementById("players-list-main").style.display = "none";
}

runOnElements("version", (element) => {
  (element as HTMLElement).innerHTML = `v${info.version}`;
});
