import bcrypt from 'bcrypt';
import { Timestamp } from 'mongodb';
import mongoose from 'mongoose';
import * as config from '../config.js';
const Schema = mongoose.Schema;

// Define the schema for users
const userSchema = new Schema({
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
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String
  },
  registration_date: {
    type: Date
  }
});

userSchema.virtual('password');

userSchema.pre('save', async function() {
  if (this.password) {
    const passwordHash = await bcrypt.hash(this.password, config.bcryptCostFactor);
    this.passwordHash = passwordHash;
  }
});

userSchema.set("toJSON", {
  transform: transformJsonUser
});

function transformJsonUser(doc, json, options) {
  // Remove the hashed password from the generated JSON.
  delete json.passwordHash;
  delete json.__v;
  json.id = json._id;
  delete json._id;
  return json;
}

// Create the model from the schema and export it
export default mongoose.model('User', userSchema);