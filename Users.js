var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

const connectOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    user: process.env.DBuser,
    pass: process.env.DBpass,
    dbName: 'apidb'
}

try {
    mongoose.Promise = global.Promise;
}
catch (err) {
    console.error(err);
};



mongoose.connect(process.env.DB, connectOptions, function (error) {
    if (error) return next(error);
});

mongoose.set('useCreateIndex', true);

// user schema
var UserSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true, select: true }
});

// hash the password before the user is saved
UserSchema.pre('save', function (next) {
    var user = this;
    // hash the password only if the password has been changed or user is new
    if (!user.isModified('password')) return next();

    // generate the hash
    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) return next(err);

        // change the password to the hashed version
        user.password = hash;
        next();
    });
});



UserSchema.methods.comparePassword = function (password, callback) {
    var user = this;

    bcrypt.compare(password, user.password, function (err, isMatch) {
        callback(isMatch);
    });
};

// return the model
module.exports = mongoose.model('User', UserSchema);