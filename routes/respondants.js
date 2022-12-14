import express from "express";
import Respondant from "../models/respondant.js";
import { authenticate } from "./auth.js";
import Intervention from "../models/intervention.js";
import { broadcastMessage } from '../ws.js'

const router = express.Router();

export default router;

/**
 * @api {get} /respondants Request a list of the respondants
 * @apiName GetRespondants
 * @apiGroup Respondant
 *
 * @apiSuccess {Object[]} respondants List of respondants
 */
router.get("/", authenticate, function (req, res, next) {
    Respondant.find().exec(function(err, respondants) {
    if (err) {
      return next(err);
    }
    res.send(respondants);
  });
});

/**
 * @api {get} /respondants/:id Request a respondant's information
 * @apiName GetRespondant
 * @apiGroup Respondant
 *
 * @apiParam {Number} id Unique identifier of the respondant
 *
 * @apiSuccess {Point} location Location of the respondant
 * @apiSuccess {String} firstName Firstname of the respondant
 * @apiSuccess {String} lastName Lastname of the respondant
 * @apiSuccess {String} phone Phone of the respondant
 * @apiSuccess {Number} radius range of action of the respondant
 * @apiSuccess {Boolean} certificate_validity Validity of the respondant's certificate
 * @apiSuccess {String} id ID of the respondant
 * 
 * @apiError (Error 404) RespondantNotFound The <code>id</code> of the respondant was not found.
 * 
 */
router.get("/:id", authenticate, function (req, res, next) {
  Respondant.findById(req.params.id).exec( async function(err, respondant) {
    
    if (!respondant) {
      res.status(404).send("Respondant with ID " + req.params.id + " not found.");
    }
    
    if (err) {
      return next(err);
    }

    Intervention.aggregate([
      {
        $lookup: {
          from: 'respondants',
          localField: 'id',
          foreignField: 'respondant',
          as: 'interventions'
        }
      },
      {
        $count: "nbrInterventions"
      }
      
    ], function(err, results) {
      respondant.set('nbrInterventions', results[0].nbrInterventions, {strict: false})
      console.log(results[0].nbrInterventions);
    });
    res.send(respondant);
  });
});

/**
 * @api {get} /respondants/:id/interventions Request a list of the interventions of a respondant
 * @apiName GetRespondantIntervention
 * @apiGroup Respondant
 *
 * @apiParam {Number} id Unique identifier of the respondant
 *
 * @apiSuccess {Object[]} respondantInterventions List of the interventions of a respondant
 * 
 * @apiError (Error 404) NoInterventionFound No intervention was found for this user.
 * 
 */
router.get("/:id/interventions", authenticate, function (req, res, next) {

  Intervention.find({ respondant: req.params.id}).exec(function(err, interventions) {
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
 * @api {post} /respondants Create a new respondant
 * @apiName PostRespondant
 * @apiGroup Respondant
 *
 * @apiBody {String} firstName Firstname of the respondant.
 * @apiBody {String} lastName Lastname of the respondant.
 * @apiBody {String} phone Phone of the respondant.
 * @apiBody {Point} location Location of the respondant.
 * @apiBody {Number} radius range of action of the respondant.
 * @apiBody {Boolean} certificate_validity Validity of the respondant's certificate.
 *
 * @apiSuccess {String} firstName Firstname of the respondant.
 * @apiSuccess {String} lastName Lastname of the respondant.
 * @apiSuccess {String} phone Phone of the respondant.
 * @apiSuccess {Point} location Location of the respondant.
 * @apiSuccess {Number} radius Range of action of the respondant.
 * @apiSuccess {Boolean} certificate_validity Validity of the respondant's certificate.
 * @apiSuccess {String} id ID of the respondant.
 */
router.post('/', authenticate, function(req, res, next) {

  const newRespondant = new Respondant(req.body);

  newRespondant.save(function(err, savedRespondant) {
    if (err) {
      return next(err);
    }

    Intervention.aggregate([
      {
        $lookup: {
          from: 'respondants',
          localField: 'id',
          foreignField: 'respondant',
          as: 'interventions'
        }
      },
      {
        $count: "nbrInterventions"
      }
      
    ], function(err, results) {
      if (err) {
        return next(err);
      }
      broadcastMessage({title: 'New respondant !', message: 'There are now ' + results[0].nbrInterventions + ' respondants.'});
    });

    res.send(savedRespondant);
  });
});

/**
 * @api {put} /respondants/:id Modify Respondant's informations
 * @apiName UpdateRespondant
 * @apiGroup Respondant
 * 
 * @apiParam {Number} id Unique identifier of the respondants
 *
 * @apiParam {String} [firstname] Firstname of the respondants.
 * @apiParam {String} [lastname]  Lastname of the respondants.
 * @apiParam {String} [phone]  Phone of the respondants.
 * @apiParam {String} [location]  Location of the respondants.
 * @apiParam {String} [radius] Range of action of the respondant.
 * @apiParam {String} [certificate_validity] Validity of the respondant's certificate
 *
 * @apiSuccess {String} firstName Firstname of the respondant.
 * @apiSuccess {String} lastName Lastname of the respondant.
 * @apiSuccess {String} phone Phone of the respondant.
 * @apiSuccess {Point} location Location of the respondant.
 * @apiSuccess {Number} radius Range of action of the respondant.
 * @apiSuccess {Boolean} certificate_validity Validity of the respondant's certificate.
 * @apiSuccess {String} id ID of the respondant.
 * 
 * @apiError (Error 404) RespondantNotFound The <code>id</code> of the respondant was not found.
 * 
 */
router.put('/:id', authenticate, function(req, res, next) {
  Respondant.findByIdAndUpdate(req.params.id, {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    location: req.body.location,
    radius: req.body.radius,
    certifcate_validity: req.body.certificate_validity
  }, {new: true}).exec(function(err, updatedRespondant) {
    if (err) {
      return next(err);
    }
  res.send(updatedRespondant);
  });
})

/**
 * @api {delete} /respondants/all Delete all respondants
 * @apiName DeleteAllRespondants
 * @apiGroup Respondant
 *
 */
router.delete('/all', authenticate, function(req, res, next) {

  Respondant.collection.drop(function (err) {
    if (err) {
      return next(err);
    }
    res.sendStatus(204);
  })
});

/**
 * @api {delete} /respondant/:id Delete a respondant
 * @apiName DeleteRespondant
 * @apiGroup Respondant
 * 
 * @apiParam {Number} id Unique identifier of the respondant
 *
 * @apiSuccess (Success 204) RespondantDeleted Respondant deleted successfully.
 * 
 * @apiError (Error 404) RespondantNotFound The <code>id</code> of the respondant was not found.
 * 
 */
router.delete('/:id', authenticate, function(req, res, next) {

  Respondant.findById(req.params.id).deleteOne().exec(function(err, removedRespondant) {
    if (!removedRespondant) {
      res.status(404).send("Respondant with ID " + req.params.id + " not found.");
    } else {
      res.sendStatus(204);
    }
    
    if (err) {
      return next(err);
    }
      
  });
});