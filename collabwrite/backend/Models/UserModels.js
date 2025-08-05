const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model(
    "register", //file name
    userSchema //function name
);


//Creates a model named "UserModel" using userSchema, and exports it for use in other files.
//This allows you to interact with the "users" collection in MongoDB, performing CRUD operations in user documents.
//The model is named "UserModel" and it uses the userSchema defined above.
