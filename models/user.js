const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true // Ensure emails are unique
    },
    isVerified: {
        type: Boolean,
        default: false // Default to false until email is verified
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", userSchema);