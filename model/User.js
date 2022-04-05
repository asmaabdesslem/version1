//import mongoose 
const mongoose = require('mongoose')
const { isEmail } = require('validator');
const { ObjectId } = mongoose.Schema.Types



//generate schema
const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please enter your first name'],
    },
    lastName: {
        type: String,
        required: [true, 'Please enter your last name'],
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    resetToken: String,
    expireToken: Date,
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters'],
    },
    dateOfBirth: {
        type: Date,
    },
    tel: {
        type: String,
        required: [true, 'Please enter your phone number'],
    },
    role: {
        type: String
    },
    pic: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    },
    followers: [
        { type: ObjectId, ref: "user" }
    ],
    following: [
        { type: ObjectId, ref: "user" }
    ]

},{timestamps:true}
)

//generate model
const User = mongoose.model('user', userSchema)



//export model
module.exports = User;