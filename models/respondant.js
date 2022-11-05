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
  area: {
    type: String,
    required: true
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

respondantSchema.set("toJSON", {
  transform: transformJsonRespondant
});

function transformJsonRespondant(doc, json, options) {
  delete json.__v;
  json.id = json._id;
  delete json._id;
  return json;
}


// Create the model from the schema and export it
export default mongoose.model('Respondant', respondantSchema);