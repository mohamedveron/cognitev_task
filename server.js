const express = require("express");
const mysql = require('mysql');
const bodyParser =  require("body-parser");
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config');

const app = express();
//  Serve static files
app.use(express.static(__dirname + '/frontend'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
const db = mysql.createConnection ({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});


 var getUserByPhone = (params, callback)=>{
    
    query = "select * from users where phone = ?";

    db.query(query, params, (err, result)=>{

        if(err){

          return callback(err);
        }else{

          callback(null, result);
            
        }     
    })
    
}

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

app.get("/", (req, res) => {
    res.sendFile('index.html');
});

// task one
app.post("/addUser", (req, res) => {

    var reqData = req.body;
    let response = {};
    let params = [reqData.phone];
    let query1 = "select * from users where phone = ?";

     // check if user with same phone number exists
    db.query(query1, params, (err, result)=>{

        if(err){

            response =  err;
        }else{

            // if new user
            if(result.length == 0){

                let query = "insert into users values(0, ?, ?, ?, ?, ?, ?)";

                let params = [reqData.fName, reqData.lName, reqData.code, reqData.phone, reqData.code, reqData.gender];

                db.query(query, params, (err, result)=>{

                    if(err){

                        response = { "errors": {"first_name": [{"error": reqData.fName}], "last_name": [{"error": reqData.lName}],
                                        "country_code":[{"error":  reqData.code}], "phone_number": [{"error": reqData.phone}], "gender":[{"error":  reqData.gender}],
                                            "email":[{"error":  reqData.email}]} };
                    }else{

                        response = { "id": result.insertId, "first_name": reqData.fName, "last_name": reqData.lName,
                                        "country_code": reqData.code, "phone_number": reqData.phone, "gender": reqData.gender,
                                            "email": reqData.email};

                        res.statusCode = 201;
                    }

                    res.send(response);
                })

            }else{
                return res.json({ success: false, message: 'user with same phone number exists.' }); 
            }
        }
    });
    
});

// Task 2 generate JWT auth-token
app.post("/generateToken", (req, res) => {

    var reqData = req.body;
    let params = [reqData.phone];
    let response = {};

    query = "select * from users where phone = ?";

    const payload = {
        phone: reqData.phone
    };
        // search user by phone
        getUserByPhone([reqData.phone_number], function (err, result){
                if (err){
                    return res.json({ success: false, message: 'wrong phone number provided.' });
                }else{

                // generate jwt token
                var token = jwt.sign(payload, config.secret, {
                    expiresIn:  "12h" // expires in 12 hours 
                });

                    return res.json({
                            "success": true,
                            "message": 'your token!',
                            "token": token
                        });
                }                       
            });  
});

// Task 3 check token with phone
app.post("/getUser", (req, res) => {
    var reqData = req.body;

    var token = reqData.auth_token || reqData.auth_token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, config.secret, function(err, decoded) {       
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });  
             } else {
                // if everything is good, save to request for use in other routes
                if(decoded.phone !== reqData.phone_number){
                   return res.json({ success: false, message: 'Authenticate token verified but wrong phone number provided.' });   
                }else{

                    // search user by phone
                   getUserByPhone([reqData.phone_number], function (err, result){
                       if (err){
                            return res.json({ success: false, message: 'wrong phone number provided.' });
                       }else{
                            return res.json({ status: reqData.status, user: result });
                        } 
                       
                   });
                   
                      
                }
             }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({ 
            success: false, 
            message: 'No token provided.' 
        });

    }
});

app.listen(3000,  function() {
  console.log('listening on 3000')
});

module.exports = app;