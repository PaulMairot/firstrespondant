import { Timestamp } from 'mongodb';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Define the schema for respondants
const respondantSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20
  },
  phone: {
    type: String,
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
  radius: {
    type: Number,
    required: true
  },
  certificate_validity: {
    type: Boolean,
    required: true
  }

});

// Create a geospatial index on the location property.
respondantSchema.index({ location: '2dsphere' });

respondantSchema.set("toJSON", {
  transform: transformJsonRespondant
});

function transformJsonRespondant(doc, json, options) {
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
export default mongoose.model('Respondant', respondantSchema);