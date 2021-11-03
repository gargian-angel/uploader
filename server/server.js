let express = require("express"),
  mongoose = require("mongoose"),
  cors = require("cors"),
  dbConfig = require("./src/database/db");

const api = require("./src/routes/company.routes");

mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.db, {
    useNewUrlParser: true,
  })
  .then(
    () => {
      console.log("Database successfully connected");
    },
    (error) => {
      console.log("Database could not be connected: " + error);
    }
  );

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use("/public", express.static("/public"));

app.use("/api", api);

const port = process.env.REACT_APP_SERVER_PORT || 4000;
const server = app.listen(port, () => {
  console.log("Connected to port: " + port);
});

app.use((req, res, next) => {
  setImmediate(() => {
    next(new Error("Something went wrong!", res));
  });
});

app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});
