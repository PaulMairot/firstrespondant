import express from "express";
import Intervention from "../models/intervention.js";
import { authenticate } from "./auth.js";
import Respondant from "../models/respondant.js";

const router = express.Router();

export default router;

/**
 * @api {get} /interventions Request a list of the interventions
 * @apiName GetInterventions
 * @apiGroup Intervention
 *
 * @apiSuccess {Object[]} interventions List of all interventions
 */
router.get("/", function (req, res, next) {

  Intervention.find().count(function(err, total) {
    if (err) {
      return next(err);
    }
    let query = Intervention.find();

    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    let pageSize = parseInt(req.query.pageSize, 10);
    if (isNaN(pageSize) || pageSize < 0 || pageSize > 10) {
      pageSize = 10;
    }

    query = query.skip((page - 1) * pageSize).limit(pageSize);

    query.exec(function(err, interventions) {
      if (err) { return next(err); }
      res.send({
        page: page,
        pageSize: pageSize,
        total: total,
        data: interventions
      });
    });

  });



  /* Intervention.find().populate("user").populate("respondant").exec(function(err, interventions) {
    if (err) {
      return next(err);
    }
    res.send(interventions);
  }); */
});


/**
 * @api {get} /interventions/:id Request an intervention's informations
 * @apiName GetIntervention
 * @apiGroup Intervention
 *
 * @apiParam {Number} id Unique identifier of the respondant
 *
 * @apiSuccess {Point} location Location of the intervention.
 * @apiSuccess {String} description Description of the intervention.
 * @apiSuccess {Object[]} user User that create the intervention.
 * @apiSuccess {Object[]} respondant Respondant assigned to the intervention.
 * @apiSuccess {Date} creation_date Date of creation of the intervention.
 * @apiSuccess {Boolean} active Status of the intervention (active or inactive).
 * @apiSuccess {String} picture Link to the picture of the intervention.
 * @apiSuccess {String} id ID of the intervention.
 */
router.get("/:id", authenticate, function (req, res, next) {
  Intervention.findById(req.params.id).populate("user").populate("respondant").exec(function(err, intervention) {
    
    if (!intervention) {
      res.status(404).send("Intervention with ID " + req.params.id + " not found.");
    }
    
    if (err) {
      return next(err);
    }
    res.send(intervention);
  });
});


/**
 * @api {post} /interventions Create a new intervention
 * @apiName PostIntervention
 * @apiGroup Intervention
 *
 * @apiBody {String} description Description of the intervention
 * @apiBody {String} userId ID of the user who creates the intervention.
 * @apiBody {Point} location Location of the intervention.
 * @apiBody {String} (picture) Picture of the intervention.
 *
 * @apiSuccess {String} description Description of the intervention.
 * @apiSuccess {Point} location Location of the intervention.
 * @apiSuccess {Date} registration_date Date of registration
 * @apiSuccess {String} picture Picture of the intervention.
 * @apiSuccess {String} user ID of the user who creates the intervention.
 * @apiSuccess {String} respondant ID of the closest respondand, assigned to the intervention.
 */
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

/**
 * @api {delete} /interventions/all Delete all interventions
 * @apiName DeleteAllInterventions
 * @apiGroup Intervention
 *
 */
router.delete('/all', authenticate, function (req,res,next) {

  Intervention.collection.drop(function (err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(204);
  })
});


/**
 * @api {delete} /intervention/:id Delete an intervention.
 * @apiName DeleteIntervention
 * @apiGroup Intervention
 * 
 * @apiParam {Number} id Unique identifier of the intervention.
 *
 * @apiSuccess {Object[]} intervention Deleted intervention.
 */
router.delete('/', authenticate, function(req, res, next) {

  Intervention.findByIdAndRemove(req.query.id).exec(function(err, interventionRemoved) {
    if (err) {
      return next(err);
    }
    res.send(interventionRemoved);
  });
});

/**
 * @api {get} /intervention/nearest Delete an intervention.
 * @apiName DeleteIntervention
 * @apiGroup Intervention
 * 
 * @apiParam {Number} id Unique identifier of the intervention.
 *
 * @apiSuccess {Object[]} intervention Deleted intervention.
 */
router.get('/nearest', authenticate, function(req, res, next) {

  Respondant.find({
    location: {
     $near: {
      $maxDistance: 10000,
      $geometry: {
       type: "Point",
       coordinates: [ req.body.long, req.body.lat ]
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