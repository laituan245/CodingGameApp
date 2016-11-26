var keystone = require('keystone');
var User = keystone.list("User");

function readAllUsers(mapID, callback) {
  User.model.find({}, function(err, users){
    var tmpUsers = [];
    for (var i = 0; i < users.length; i++) {
      if (users[i].timeToFinish && JSON.parse(users[i].timeToFinish)[mapID]) {
        tmpUsers.push({
            email: users[i].email,
            time: parseInt(JSON.parse(users[i].timeToFinish)[mapID])
          });
      }
    }

    for (var i = 0; i < tmpUsers.length; i++) {
      for (var j = i + 1; j < tmpUsers.length; j++) {
        if (tmpUsers[j].time < tmpUsers[i].time) {
          var tg = tmpUsers[i];
          tmpUsers[i] = tmpUsers[j];
          tmpUsers[j] = tg;
        }
      }
    }
    callback(tmpUsers);
  });
}

exports = module.exports = function (req, res) {
  var locals = res.locals;
  var userID = locals.userID;
  var mapID = req.body.mapID;
  var userTimeToFinish = parseInt(req.body.timeToFinish);
  User.model.findById(userID, function(err, user){
    var tmpObj = JSON.parse(user.timeToFinish || '{}')
    if (tmpObj[mapID]) {
      tmpObj[mapID] = Math.min(userTimeToFinish, tmpObj[mapID]);
    } else {
      tmpObj[mapID] = userTimeToFinish;
    }
    user.timeToFinish = JSON.stringify(tmpObj);
    user.save(function (err, updatedUser) {
      if (err) return handleError(err);
      readAllUsers(mapID, function(users){res.send(users);});
    });
  })
};
