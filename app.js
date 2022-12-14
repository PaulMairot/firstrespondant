import express from "express";
import logger from "morgan";
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import interventionsRouter from "./routes/interventions.js";
import respondantsRouter from "./routes/respondants.js";

import * as config from "./config.js";

import mongoose from 'mongoose';
mongoose.Promise = Promise;
mongoose.connect(config.databaseUrl);

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/respondants", respondantsRouter);
app.use("/interventions", interventionsRouter);

// Serve the apiDoc documentation.
app.use('/apidoc', express.static('docs'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
});

export default app;
