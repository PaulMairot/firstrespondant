import express from "express";
import User from "../models/user.js";
import { authenticate } from "./auth.js";
import Intervention from "../models/intervention.js";

const router = express.Router();

export default router;

/**
 * @api {get} /users Request a list of the users
 * @apiName GetUsers
 * @apiGroup User
 *
 * @apiSuccess {Object[]} users List of users
 */
router.get("/", authenticate, function (req, res, next) {

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
 * @apiSuccess {String} name Name of the user
 * @apiSuccess {String} email Email of the user
 * @apiSuccess {Date} registration_date Date of registration
 * @apiSuccess {String} id ID of the user
 */
router.get("/:id", authenticate, function (req, res, next) {
  
  User.findById(req.params.id).exec(function(err, user) {
    
    if (!user) {
      res.status(404).send("User with ID " + req.params.id + " not found.");
    }

    if (err) {
      return next(err);
    }

    res.send(user);
  });
});

/**
 * @api {get} /users/:id/interventions Request a list of the interventions of a user
 * @apiName GetUserIntervention
 * @apiGroup User
 *
 * @apiParam {Number} id Unique identifier of the user
 *
 * @apiSuccess {Object[]} userInterventions List of the interventions of a user
 * 
 */
router.get("/:id/interventions", authenticate, function (req, res, next) {

  Intervention.find({ user: req.params.id}).exec(function(err, interventions) {
    if (!interventions) {
      res.status(404).send("No intervention found.");
    }

    if (err) {
      return next(err);
    }

    res.send(interventions);
  });
});


/**
 * @api {post} /users Create a new user
 * @apiName PostUser
 * @apiGroup User
 *
 * @apiBody {String} name Name of the new user.
 * @apiBody {String} email Email of the new user.
 * @apiBody {String} password Password of the new user.
 *
 * @apiSuccess {String} name Name of the new user
 * @apiSuccess {String} email Email of the new user
 * @apiSuccess {Date} registration_date Date of registration
 * @apiSuccess {String} id ID of the new user
 */
router.post('/', authenticate, function(req, res, next) {

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


/**
 * @api {put} /users/:id Modify User's informations
 * @apiName UpdateUser
 * @apiGroup User
 * 
 * @apiParam {Number} id Unique identifier of the user
 *
 * @apiParam {String} [firstname] Firstname of the User.
 * @apiParam {String} [lastname]  Lastname of the User.
 * @apiParam {String} [email]  Email of the User.
 *
 */
router.put('/:id', authenticate, function(req, res, next) {
  User.findByIdAndUpdate(req.params.id, {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email
  }).exec(function(err, updatedUser) {
    if (err) {
      return next(err);
    }
  res.send(updatedUser);
  });
})

/**
 * @api {delete} /users/:id Delete a user
 * @apiName DeleteUser
 * @apiGroup User
 * 
 * @apiParam {Number} id Unique identifier of the user
 *
 * @apiSuccess {Object[]} user deleted user
 */
router.delete('/:id', authenticate, function(req, res, next) {

  User.findByIdAndRemove(req.params.id).exec(function(err, removedUser) {
    if (err) {
      return next(err);
    }
    res.send(removedUser);
  });
});