import express from "express";
import Intervention from "../models/intervention.js";
import { authenticate } from "./auth.js";
import Respondant from "../models/respondant.js";

const router = express.Router();

export default router;

router.get("/", function (req, res, next) {

  Intervention.find().populate("user").populate("respondant").exec(function(err, interventions) {
    if (err) {
      return next(err);
    }
    res.send(interventions);
  });
});


router.post('/', authenticate, async function(req, res, next) {

  req.body.user = req.body.userId;

  Respondant.find({
    location: {
     $near: {
      $geometry: {
       type: "Point",
       coordinates: req.body.location.coordinates
      }
     }
    }
   }).limit(1).find((error, results) => {
    if (error) console.log(error);

    // TODO Check radius of respondant
    req.body.respondant = results[0].id;

    const newIntervention = new Intervention(req.body);

    let date = new Date();
    newIntervention.creation_date = date.toISOString();
  
    // Make all new intervention active
    newIntervention.active = true;
  
    newIntervention.save(function(err, savedIntervention) {
      if (err) {
        return next(err);
      }
  
      res.send(savedIntervention);
    });

   });
  
});


router.delete('/all', authenticate, function (req,res,next) {

  Intervention.collection.drop(function (err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(204);
  })
});

router.delete('/', authenticate, function(req, res, next) {

  Intervention.findByIdAndRemove(req.query.id).exec(function(err, interventionRemoved) {
    if (err) {
      return next(err);
    }
    res.send(interventionRemoved);
  });
});

router.get('/nearest', authenticate, function(req, res, next) {

  Respondant.find({
    location: {
     $near: {
      $maxDistance: 10000,
      $geometry: {
       type: "Point",
       coordinates: [ 46.829256929675694, 6.659177352666201 ]
      }
     }
    }
   }).find((error, results) => {
    if (error) console.log(error);
    // Check radius of respondant
    let idClosestRespondant = "";
    let valueClosestRespondant = 5000;
    results.forEach(respondant => {
      if (respondant.radius < valueClosestRespondant) {
        idClosestRespondant = respondant.id;
        valueClosestRespondant = respondant.radius
      }
    })
    res.send(idClosestRespondant);
   });
});

async function getNearestRespondant(long, lat) {
  Respondant.find({
    location: {
     $near: {
      $maxDistance: 10000,
      $geometry: {
       type: "Point",
       coordinates: [ long, lat ]
      }
     }
    }
   }).find((error, results) => {
    if (error) console.log(error);
    // Check radius of respondant
    let idClosestRespondant = "";
    let valueClosestRespondant = 5000;
    results.forEach(respondant => {
      if (respondant.radius < valueClosestRespondant) {
        idClosestRespondant = respondant.id;
        valueClosestRespondant = respondant.radius
      }
    })
    return idClosestRespondant;
   });
}