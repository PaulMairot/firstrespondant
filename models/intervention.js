import { Timestamp } from 'mongodb';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const geolocatedSchema = new Schema({
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
  }
});

// Create a geospatial index on the location property.
geolocatedSchema.index({ location: '2dsphere' });

// Define the schema for interventions
const interventionSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  location: {
    type: geolocatedSchema,
    required: true
  },
  picture: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Respondant'
  },
  creation_date: {
    type: Date
  }

});

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