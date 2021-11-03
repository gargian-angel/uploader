const webSocketsServerPort = process.env.REACT_APP_WORKER_PORT;
const webSocketServer = require("websocket").server;
const http = require("http");
const exec = require("child_process").exec;
const fs = require("fs");
const path = require("path");
const INotifyWait = require("inotifywait-spawn");
const { IN_MODIFY } = INotifyWait;
let { v4: uuidv4 } = require("uuid");

const server = http.createServer();
server.listen(webSocketsServerPort);
console.log("Listening on port: ", webSocketsServerPort);

const wsServer = new webSocketServer({
  httpServer: server,
});

let imagesInterval;
let imagesMap = new Map();

wsServer.on("request", function (request) {
  console.log(
    `${new Date()} - Received a new connection from origin: ${request.origin}.`
  );

  const connection = request.accept(null, request.origin);

  connection.on("message", function (message) {
    const dirName = uuidv4();
    const fileName = JSON.parse(message.utf8Data).msg;
    imagesMap.set(dirName, new Set());
    fileToPNGConverter(connection, dirName, fileName);
    imagesInterval = setInterval(sendImages, 2000, connection, dirName, false);
  });

  fileToPNGConverter = (connection, dirName, fileName) => {
    const dirPath = `/public/${dirName}`;
    console.log("dirPath: ", dirPath);

    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
        console.log(`${dirPath} created`);
      }
      exec(
        `/usr/app/to_png ${fileName} ${dirName} ${dirPath}`,
        function (error, stdout, stderr) {
          if (error) {
            handleError(connection, error + ":\n" + stderr);
          } else {
            console.log(`Conversion succeeded: ${fileName}`);
            sendImages(connection, dirName, true);
          }
        }
      );

      const inw = new INotifyWait(dirPath, {
        recursive: true,
        events: IN_MODIFY,
      });
      inw.on("error", console.error);
      inw.on(IN_MODIFY, ({ type, path, entry }) => {
        type === IN_MODIFY;
        imagesMap.set(imagesMap.get(dirName).add(`${path}/${entry}`));
      });
    } catch (exception) {
      handleError(connection, exception, dirName);
    }
  };

  //send the images to the client who has uploaded the file
  sendImages = (connection, dirName, isLastCall) => {
    try {
      let imageSet = imagesMap.get(dirName);
      if (imageSet != null) {
        let imagesArray = Array.from(imageSet);
        imagesArray.sort();

        if (!isLastCall) {
          // the last file we were notified about is still being written
          imagesArray.splice(-1);
        }
        connection.send(JSON.stringify(imagesArray));

        if (isLastCall) {
          clearInterval(imagesInterval);
          imagesMap.delete(dirName);
          connection.send(JSON.stringify("Done"));
          connection.close();
        }
      }
    } catch (exception) {
      handleError(connection, exception, dirName);
    }
  };

  handleError = (connection, error, dirName) => {
    let errorId = uuidv4().substring(0, 8);
    console.log(`ERROR: ${errorId} - Details: \n ${error}`);
    connection.send(JSON.stringify(`Internal Server Error - ${errorId}`));
    connection.close();
    clearInterval(imagesInterval?.imagesInterval);

    imagesMap.delete(dirName);
  };
});
