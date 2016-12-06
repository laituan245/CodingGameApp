var keystone = require('keystone');
var User = keystone.list("User");
var GameResult = keystone.list("GameResult");

function getRankingTable(mapID,callback){
  GameResult.model.find({isCompleted: true, mapID: mapID}, function(err, gameResults){
    console.log(gameResults.length);
    var rankTable = [];
    for (var i = 0; i < gameResults.length; i++){
      rankTable.push({
        nickname: gameResults[i].userNickname,
        time: gameResults[i].timeToFinish
      })
    }

    for (var i = 0; i < rankTable.length; i++) {
      for (var j = i + 1; j < rankTable.length; j++) {
        if (rankTable[j].time < rankTable[i].time) {
          var tg = rankTable[i];
          rankTable[i] = rankTable[j];
          rankTable[j] = tg;
        }
      }
    }
    callback(null,rankTable);
  })
}

exports = module.exports = function (req, res) {
  var locals = res.locals;
  var userID = locals.userID;
  var mapID = req.body.mapID;
  var userTimeToFinish = parseInt(req.body.timeToFinish);

  if (userTimeToFinish >= 0){
    GameResult.model.findOne({userID: userID, mapID, mapID}, function(err, gameResult){
      if (err){
        return res.json({Error: err});
      }
      if (!gameResult){
        return res.json({Error: "cannot find this game under your accounts in database"});
      }
      gameResult.timeToFinish = userTimeToFinish;
      gameResult.isCompleted = true;
      gameResult.save(function(err){
        if (err){
          return res.json({Error:err});
        }
        console.log("update gameResult");
        getRankingTable(mapID, function(err, rankTable){
          res.send(rankTable);
        })
      })

    })
  } else {
    getRankingTable(mapID, function(err, rankTable){
      res.send(rankTable);
    })
  }
  
}


