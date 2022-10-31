import express from "express";
import User from "../models/user.js";
import { authenticate } from "./auth.js";

const router = express.Router();

export default router;

router.get("/", function (req, res, next) {
    User.find().sort('name').exec(function(err, users) {
      if (err) {
        return next(err);
      }
      res.send(users);
    });
});

/**
 * @api {get} /users/:id Request a user's information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Unique identifier of the user
 *
 * @apiSuccess {String} firstName First name of the user
 * @apiSuccess {String} lastName  Last name of the user
 */
router.get("/:id", authenticate, function (req, res, next) {
  User.findById(req.params.id).exec(function(err, user) {
    if (err) {
      return next(err);
    }
    res.send(user);
  });
});

router.post('/', function(req, res, next) {

  const newUser = new User(req.body);

  let date = new Date();
  newUser.registration_date = date.toISOString();

  newUser.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }

    res.send(savedUser);
  });
});


router.delete('/', function(req, res, next) {

  User.findByIdAndRemove(req.query.id).exec(function(err, removedUser) {
    if (err) {
      return next(err);
    }
    res.send(removedUser);
  });

  
});