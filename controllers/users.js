const jwt = require('jsonwebtoken');
const User = require("../models/user");
const { sendVerificationEmail } = require('../utils/Email');

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signupUser = async (req, res, next) => {
  try {
    let { email, username, password } = req.body;
    req.session.tempUser = { email, username, password };

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
       console.log(existingUser);
       delete req.session.tempUser;
       req.flash("error", "Email is already registered");
       res.redirect("/signup");
       return;
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationLink = `http://${req.headers.host}/verify-email?token=${token}`;

    // const newUser = new User({
    //   email,
    //   username,
    //   isverified: false,
    // });
    try{
      await sendVerificationEmail(email, verificationLink); 
      req.flash("success", "Check your mail-box & Verifiy your email");
      res.redirect("/listings");
    } catch(err){ 
      delete req.session.tempUser;
      req.flash("error", "Fail to send verification mail");
      res.redirect("/signup")
    }

  } catch (err) {
    delete req.session.tempUser;
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.verifyUserEmail = async (req, res) => {
  let {token} = req.query;
  console.log(token)
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tempUser = req.session.tempUser;

    if (!tempUser || tempUser.email !== decoded.email) {
      delete req.session.tempUser; 
      req.flash("error", "Invalid or expired token.");
      res.redirect("/signup");
    }
    
    let password = tempUser.password;

    const newUser = new User({
      username: tempUser.username,
      email: tempUser.email,
      isVerified: true
    });

    delete req.session.tempUser;

    let registerUser = await User.register(newUser, password);
    req.login(registerUser, (err) => {
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
