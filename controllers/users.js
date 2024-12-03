const jwt = require('jsonwebtoken');
const User = require("../models/user");
const { sendVerificationEmail } = require('../utils/Email');

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signupUser = async (req, res, next) => {
  let host = req.headers.host;
  try {
    let { email, username, password } = req.body;    

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
       req.flash("error", "Email is already registered");
       res.redirect("/signup");    
       return;   
    }

    req.session.tempUserData = { email, username, password };

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationLink = `http://${host}/verify-email?token=${token}`;

    try{
      await sendVerificationEmail(email, verificationLink); 
      req.flash("success", "Check your mail-box & Verifiy your email");
      res.redirect("/listings");
    } catch(err){ 
      delete req.session.tempUserData;
      req.flash("error", "Fail to send verification mail");
      res.redirect("/signup");
      return;      
    }
  } catch (err) {
    delete req.session.tempUserData;
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.verifyUserEmail = async (req, res, next) => {
  const {token} = req.query;
  const tempUser = req.session.tempUserData;

  if (!token) {
    req.flash("error", "Token is missing.");
    return res.redirect("/signup");
  }  

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the user is already verified
    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser && existingUser.isVerified) {
        req.flash("success", "--Email is Verified-- Welcome to the WanderLust");
        res.redirect("/listings");
        return;
    }

    // Check for tempUser in session
    if (!tempUser || tempUser.email !== decoded.email) {
      req.flash("error", "Invalid or expired token.");
      res.redirect("/signup"); 
      return;          
    }
    
    const password = tempUser.password;

    const newUser = new User({
      username: tempUser.username,
      email: tempUser.email,
      isVerified: true
    });
    
    delete req.session.tempUser;  // Ensure cleanup

    let registerUser = await User.register(newUser, password);

    await req.login(registerUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "--Email is Verified-- Welcome to the WanderLust");
        res.redirect("/listings");
    });
  }catch(err){
    delete req.session.tempUser;
    req.flash("error", err.message);
    res.redirect("/signup");
  }
}

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.loginUser = async (req, res) => {
  req.flash("success", "Welcome back to the wanderLust!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged Out!");
    res.redirect("/listings");
  });
};
