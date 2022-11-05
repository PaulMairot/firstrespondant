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
  certificate_validity: {
    type: Boolean,
    required: true
  }

});


// Create the model from the schema and export it
export default mongoose.model('Respondant', respondantSchema);