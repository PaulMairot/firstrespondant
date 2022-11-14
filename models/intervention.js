import { Timestamp } from 'mongodb';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Define the schema for interventions
const interventionSchema = new Schema({
  description: {
    type: String,
    maxlength: 300,
    required: true
  },
  location: {
    type: {
      type: String,
      required: true,
      enum: [ 'Point' ]
    },
    coordinates: {
      type: [ Number ],
      required: true,
      validate: {
        validator: validateGeoJsonCoordinates,
        message: '{VALUE} is not a valid longitude/latitude(/altitude) coordinates array'
      }
    }
  },
  picture: {
    type: Buffer
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Respondant'
  },
  active: {
    type: Boolean
  },
  creation_date: {
    type: Date
  }

});

// Create a geospatial index on the location property.
interventionSchema.index({ location: '2dsphere' });

interventionSchema.set("toJSON", {
  transform: transformJsonIntervention
});

function transformJsonIntervention(doc, json, options) {
  delete json.__v;
  json.id = json._id;
  delete json._id;
  return json;
}

// Validate a GeoJSON coordinates array (longitude, latitude and optional altitude).
function validateGeoJsonCoordinates(value) {
  return Array.isArray(value) && value.length >= 2 && value.length <= 3 && isLongitude(value[0]) && isLatitude(value[1]);
}

function isLatitude(value) {
  return value >= -90 && value <= 90;
}

function isLongitude(value) {
  return value >= -180 && value <= 180;
}

// Create the model from the schema and export it
export default mongoose.model('Intervention', interventionSchema);