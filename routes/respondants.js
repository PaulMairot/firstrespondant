import express from "express";
import Respondant from "../models/respondant.js";
import { authenticate } from "./auth.js";

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
 */
router.get("/:id", authenticate, function (req, res, next) {
  Respondant.findById(req.params.id).exec(function(err, respondant) {
    if (err) {
      return next(err);
    }
    res.send(respondant);
  });
});

/**
 * @api {post} /respondants Create a new respondant
 * @apiName PostRespondant
 * @apiGroup Respondant
 *
 * @apiBody {String} firstName Firstname of the respondant
 * @apiBody {String} lastName Lastname of the respondant
 * @apiBody {String} phone Phone of the respondant
 * @apiBody {Point} location Location of the respondant
 * @apiBody {Number} radius range of action of the respondant
 * @apiBody {Boolean} certificate_validity Validity of the respondant's certificate
 *
 * @apiSuccess {String} firstName Firstname of the respondant
 * @apiSuccess {String} lastName Lastname of the respondant
 * @apiSuccess {String} phone Phone of the respondant
 * @apiSuccess {Point} location Location of the respondant
 * @apiSuccess {Number} radius range of action of the respondant
 * @apiSuccess {Boolean} certificate_validity Validity of the respondant's certificate
 * @apiSuccess {String} id ID of the respondant
 */
router.post('/', authenticate, function(req, res, next) {

  const newRespondant = new Respondant(req.body);

  newRespondant.save(function(err, savedRespondant) {
    if (err) {
      return next(err);
    }

    res.send(savedRespondant);
  });
});

router.put('/:id', authenticate, function(req, res, next) {
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

router.delete('/all', authenticate, function(req, res, next) {

  Respondant.collection.drop(function (err) {
    if (err) {
      return next(err);
    }
    res.sendStatus(204);
  })
});

router.delete('/', authenticate, function(req, res, next) {

  Respondant.findByIdAndRemove(req.query.id).exec(function(err, respondantRemoved) {
    if (err) {
      return next(err);
    }
    res.send(respondantRemoved);
  });
});
