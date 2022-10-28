import express from "express";
import Respondant from "../models/respondant.js";


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

router.delete('/', function(req, res, next) {

  Respondant.findByIdAndRemove(req.query.id).exec(function(err, respondantRemoved) {
    if (err) {
      return next(err);
    }
    res.send(respondantRemoved);
  });

  
});