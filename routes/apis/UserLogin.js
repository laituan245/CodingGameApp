var keystone = require('keystone');
var User = keystone.list("User");
var UserSession = require('../../services/UserSession');

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


module.exports = {
	login: function(req, res){
		var body = req.body;
		var password = body.passwd;
		var username = body.username;
		console.log("User login with " + username + " " + password);
		// Get user information
		var params = {
			email: username
		}

		User.model.findOne(params, function(err, account){
			if (!err){
				if (!account) {
					var result = {
						status : "001",
						data : "Email not found"
					}
					return res.json(result);
				}

				account._.password.compare(password, function(err, isMatch) {
                    if (!err && isMatch) {
                        console.log("Login sucessfully !")
						//ip,ua,userID, expire
						
						UserSession.create(req, res, account, function(result){
							//result {status, sessionID}
							if (result.status=="000"){
								res.cookie('dsid',result.sessionID+"@"+account._id, { maxAge: 60*60*1000});
								res.redirect("/");
								return;
							} else {
								res.redirect("back")
							}
							
						})
                    }
                    else {
                        console.log("Dang nhap khong thanh cong, sai password")
                        console.log (err);
                        console.log(isMatch);
						console.log(JSON.stringify(account));
						console.log(password);
						res.redirect("back")
                    }
                });

				
			}
			res.end()
		})

	},

	logout: function(req, res){
		console.log("log out");
		UserSession.delete(req, res, function(result){
			res.redirect('/');
		});
		
	},

	signup: function(req, res){
		var body = req.body;
		var password = body.passwd;
		var username = body.username;
		
		var newUser = new User.model({
			email: username,
			password: password
		})

		newUser.save(function(err){
			console.log("New user created " + username + " " + password);
			res.redirect('/login');
		});
	}
}

