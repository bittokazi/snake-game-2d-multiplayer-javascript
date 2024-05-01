import { Server } from "socket.io";
import { generatePlayer } from "./GeneratePlayer";

export class EventHandler {
  constructor(private io: Server, private rooms: any = {}) {}

  init() {
    this.io.on("connection", (socket) => {
      console.log("🗫  a user connected");

      socket.on("game.request", (data) => {
        console.log("id: " + data.id);
        // modes[data.mode].push(data.id);
      });

      socket.on("game.request.room.create", (data, callback) => {
        socket.join(data.id);
        console.log("room.id: " + data.id);
        this.rooms[data.id] = {
          id: data.id,
          target: data.target,
        };
        this.rooms[data.id].players = [];
        this.rooms[data.id].players.push({
          id: data.id,
          name: data.name,
        });
        socket.to(data.id).emit("game.room.player.join", this.rooms[data.id]);
        callback(this.rooms[data.id]);
      });

      socket.on("game.request.room.join", (data, callback) => {
        if (this.rooms[data.room.id]) {
          if (this.rooms[data.room.id].players.length >= 4) {
            return;
          }
          if (!this.rooms[data.room.id].players) {
            this.rooms[data.room.id].players = [];
          }
          this.rooms[data.room.id].players.push({
            id: data.id,
            name: data.name,
          });
          socket.join(data.room.id);
          socket
            .to(data.room.id)
            .emit("game.room.player.join", this.rooms[data.room.id]);
          callback(this.rooms[data.room.id]);
        }
      });

      socket.on("game.request.room.kick", (data, callback) => {
        if (this.rooms[data.room.id]) {
          let index = null;
          this.rooms[data.room.id].players.map((player: any, i: Number) => {
            if (player.id == data.id) {
              index = i;
            }
          });
          this.rooms[data.room.id].players.splice(index, 1);
          socket.nsp
            .to(data.room.id)
            .emit("game.room.player.kick", this.rooms[data.room.id]);
          callback(data);
        }
      });

      socket.on("game.request.room.leave", (data, callback) => {
        if (this.rooms[data.room.id]) {
          socket.leave(data.room.id);
        }
      });

      socket.on("game.request.game.start", (data, callback) => {
        if (this.rooms[data.room.id]) {
          this.rooms[data.room.id].players = this.rooms[
            data.room.id
          ].players.map((player: any, i: Number) => {
            return {
              ...player,
              ...generatePlayer(i),
              score: 0,
            };
          });
          this.rooms[data.room.id].food = {
            x: this.generateFoodPosition(),
            y: this.generateFoodPosition(),
          };
          this.rooms[data.room.id].eatCheck = false;
          socket
            .to(data.room.id)
            .emit("game.room.game.start", this.rooms[data.room.id]);
          callback(this.rooms[data.room.id]);
        }
        // socket.join(data.room.id);
      });

      socket.on("game.request.position.update", (data) => {
        console.log(data);
        socket.to(data.room.id).emit("game.room.game.position.update", data);
      });

      socket.on("game.request.food.eat", (data, callback) => {
        console.log(data);
        if (
          !this.rooms[data.room.id].eatCheck &&
          data.x == this.rooms[data.room.id].food.x &&
          data.y == this.rooms[data.room.id].food.y
        ) {
          this.rooms[data.room.id].eatCheck = true;
          this.rooms[data.room.id].players = this.rooms[
            data.room.id
          ].players.map((player: any, i: Number) => {
            if (data.id == player.id) {
              player.score += 1;
              if (player.score == this.rooms[data.room.id].target) {
                socket.nsp.to(data.room.id).emit("game.room.game.end", {
                  ...this.rooms[data.room.id],
                  winner: data.id,
                });
              }
            }
            return {
              ...player,
            };
          });
          this.rooms[data.room.id].food = {
            x: this.generateFoodPosition(),
            y: this.generateFoodPosition(),
          };
          socket.to(data.room.id).emit("game.room.game.food.eat", {
            ...this.rooms[data.room.id],
            winner: data.id,
          });
          callback({
            ...this.rooms[data.room.id],
            winner: data.id,
          });
          this.rooms[data.room.id].eatCheck = false;
        }
      });

      socket.on("disconnect", () => {
        console.log("🗙 user disconnected");
      });
    });
  }

  generateFoodPosition() {
    return Math.floor(Math.random() * 19 + 0);
  }
}
