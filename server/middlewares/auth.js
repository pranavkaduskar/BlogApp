const {User} = require('../models/user_model');
const jwt = require('jsonwebtoken');

require('dotenv').config();

exports.checkToken = async(req,res,next)=>{
    try {
        if(req.headers["x-access-token"]){
            //verify token
            const accessToken = req.headers["x-access-token"];
         
            const {_id, email, exp} = jwt.verify(accessToken, process.env.DB_SECRET);


            res.locals.userData = await User.findById(_id);
            next();
        }else{
            
            next();
        }
        
    } catch (error) {
        return res.status(401).json({error:"Bad Token", errors:error});
        
    }
}


exports.checkLoggedIn = (req, res, next)=>{
    const user = res.locals.userData;
    if(!user) return res.status(401).json({error:"user Not found, please Login.."});
    req.user = user;
    next();
}



//////////////////chatgpt

// const { User } = require('../models/user_model');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// exports.checkToken = async (req, res, next) => {
//     try {
//         const accessToken = req.headers["x-access-token"];
//         console.log(accessToken);
        
//         if (accessToken) {
//             console.log("Checking if your token is correct or not");

//             jwt.verify(accessToken, process.env.DB_SECRET, (err, decoded) => {
//                 if (err) {
//                     console.log("Token verification failed:", err.message);
//                     return res.status(401).json({ error: "Bad Token", message: err.message });
//                 }

//                 console.log("Token is correct");
//                 console.log("Decoded token:", decoded);

//                 // Add decoded token data to request object
//                 req.user = decoded;

//                 next();
//             });
//         } else {
//             console.log("No token provided");
//             return res.status(401).json({ error: "No token provided" });
//         }
//     } catch (error) {
//         console.error("An error occurred during token verification:", error);
//         return res.status(401).json({ error: "Bad Token", message: error.message });
//     }
// };
