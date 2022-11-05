import express from "express";
import Respondant from "../models/respondant.js";
import { authenticate } from "./auth.js";

const router = express.Router();

export default router;

router.get("/", function (req, res, next) {
    Respondant.find().exec(function(err, respondants) {
    if (err) {
      return next(err);
    }
    res.send(respondants);
  });
});

router.get("/:id", authenticate, function (req, res, next) {
  Respondant.findById(req.params.id).exec(function(err, respondant) {
    if (err) {
      return next(err);
    }
    res.send(respondant);
  });
});

router.post('/', function(req, res, next) {

  const newRespondant = new Respondant(req.body);

  newRespondant.save(function(err, savedRespondant) {
    if (err) {
      return next(err);
    }

    res.send(savedRespondant);
  });
});

router.put('/:id', function(req, res, next) {
  Respondant.findByIdAndUpdate(req.params.id, {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    area: req.body.area,
    radius: req.body.radius,
    certifcate_validity: req.body.certificate_validity
  }).exec(function(err, updatedRespondant) {
    if (err) {
      return next(err);
    }
  res.send(updatedRespondant);
  });
})

router.delete('/', function(req, res, next) {

  Respondant.findByIdAndRemove(req.query.id).exec(function(err, respondantRemoved) {
    if (err) {
      return next(err);
    }
    res.send(respondantRemoved);
  });

  
});