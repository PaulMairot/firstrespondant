import express from "express";
import Intervention from "../models/intervention.js";


const router = express.Router();

export default router;

router.get("/", function (req, res, next) {
    Intervention.find().exec(function(err, interventions) {
    if (err) {
      return next(err);
    }
    res.send(interventions);
  });
});


router.post('/', function(req, res, next) {

  const newIntervention = new Intervention(req.body);

  let date = new Date();
  newIntervention.creation_date = date.toISOString();

  newIntervention.save(function(err, savedIntervention) {
    if (err) {
      return next(err);
    }


    res.send(savedIntervention);
  });
});

router.delete('/', function(req, res, next) {

  Intervention.findByIdAndRemove(req.query.id).exec(function(err, interventionRemoved) {
    if (err) {
      return next(err);
    }
    res.send(interventionRemoved);
  });

  
});