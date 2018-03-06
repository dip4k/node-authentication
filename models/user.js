const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let Schema = mongoose.Schema;

let userSchema = new Schema({
  name: String,
  username: {
    type: String,
    index: true
  },
  email: String,
  password: String
});

/* eslint func-names:0 */
userSchema.statics.createUser = (newUser, callback) => {
  /* eslint prefer-arrow-callback:0 */

  bcrypt.genSalt(10, (error, salt) => {
    if (error) {
      throw error;
    }
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        throw err;
      }
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

/* eslint no-multi-assign:0 */
let User = (module.exports = mongoose.model('User', userSchema));

module.exports.getUserByUsername = (username, callback) => {
  User.findOne({ username }, callback);
};

module.exports.comparePassword = (userPassword, hashPassword, callback) => {
  bcrypt.compare(userPassword, hashPassword, (error, isMatch) => {
    if (error) {
      throw error;
    }
    callback(null, isMatch);
  });
};

module.exports.getUserById = (id, callback) => {
  User.findById(id, callback);
};

// module.exports.createUser = function(newUser, callback) {
//   bcrypt.genSalt(10, function(error, salt) {
//     if (error) {
//       throw error;
//     }
//     bcrypt.hash(newUser.password, salt, function(err, hash) {
//       if (err) {
//         throw err;
//       }
//       newUser.password = hash;
//       newUser.save(callback);
//     });
//   });
// };
