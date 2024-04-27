FROM node:14
WORKDIR /app
COPY ./ ./
WORKDIR /app/snake-game-server
RUN npm install
RUN npm run build
WORKDIR /app/snake-game-web-client
RUN npm install
RUN npm run build
RUN cp -r /app/snake-game-web-client/dist /app/snake-game-server/build
WORKDIR /app/snake-game-server
CMD [ "npm", "run", "start" ]