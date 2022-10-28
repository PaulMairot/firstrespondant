import { Timestamp } from 'mongodb';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Define the schema for respondants
const respondantSchema = new Schema({
  name: {
    type: String,
    required: true
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