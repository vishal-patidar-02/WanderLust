const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");
const { sendVerificationEmail } = require("../utils/verifyEmail");
const { sendOtpEmail } = require("../utils/otpEmail");

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
      res.redirect("/users/signup");
      return;
    }

    req.session.tempUserData = { email, username, password };

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const verificationLink = `http://${host}/verify-email?token=${token}`;

    try {
      await sendVerificationEmail(email, verificationLink);
      req.flash("success", "Check your mail-box & Verifiy your email");
      res.redirect("/listings");
    } catch (err) {
      delete req.session.tempUserData;
      req.flash("error", "Fail to send verification mail");
      res.redirect("/users/signup");
      return;
    }
  } catch (err) {
    delete req.session.tempUserData;
    req.flash("error", err.message);
    res.redirect("/users/signup");
  }
};

module.exports.verifyUserEmail = async (req, res, next) => {
  const { token } = req.query;
  const tempUser = req.session.tempUserData;

  if (!token) {
    req.flash("error", "Token is missing.");
    return res.redirect("/users/signup");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user is already verified
    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser && existingUser.isVerified) {
      await req.login(existingUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "--Email is Verified-- Welcome to the WanderLust");
        res.redirect("/listings");
      });
      return;
    }

    // Check for tempUser in session
    if (!tempUser || tempUser.email !== decoded.email) {
      delete req.session.tempUser;
      req.flash("error", "Invalid or expired token.");
      res.redirect("/users/signup");
      return;
    }

    const password = tempUser.password;

    const newUser = new User({
      username: tempUser.username,
      email: tempUser.email,
      isVerified: true,
    });

    delete req.session.tempUser; // Ensure cleanup

    let registerUser = await User.register(newUser, password);

    await req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "--Email is Verified-- Welcome to the WanderLust");
      res.redirect("/listings");
    });
  } catch (err) {
    delete req.session.tempUser;
    req.flash("error", err.message);
    res.redirect("/users/signup");
  }
};

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

module.exports.renderForgotPasswordForm = (req, res) => {
  res.render("users/forgotPassword.ejs");
};

module,
  (exports.forgotPassword = async (req, res, next) => {
    const email = req.body.email;
    if (!email) {
      req.flash("error", "Email is missing");
      res.redirect("/users/forgot-password");
    }
    try {
      let user = await User.findOne({ email });
      if (!user) {
        req.flash("error", "No user found with this email");
        res.redirect("/users/forgot-password");
        return;
      }
      let username = user.username;
      let otp = Math.floor(Math.random() * 100000);
      let hashOtp = crypto
        .createHash("sha256")
        .update(otp.toString())
        .digest("hex");
      req.session.passwordReset = { email, hashOtp };
      try {
        await sendOtpEmail(email, username, otp);
        req.flash("success", "OTP sent to your email");
        res.redirect("/users/forgot-password");
      } catch (err) {
        req.flash("error", "Fail to send OTP on email");
        res.redirect("/users/forgot-password");
        delete req.session.passwordReset;
        return;
      }
    } catch (err) {
      delete req.session.passwordReset;
      req.flash("error", err.message);
      res.redirect("/users/forgot-password");
    }
  });

module.exports.checkOtp = async (req, res, next) => {
  const otp = req.body.otp;
  if (!otp) {
    req.flash("error", "OTP is missing");
    res.redirect("/users/forgot-password");
  }

  try {
    const info = req.session.passwordReset;
    let hashOtp = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");
    if (!info) {
      req.flash("error", "Wrong Request");
      res.redirect("/users/forgot-password");
      return;
    }

    if (hashOtp == info.hashOtp) {
      req.flash("success", "Welcome Back!");
      res.render("users/resetPassword.ejs");
    } else {
      req.flash("error", "Wrong OTP, Try Again");
      res.redirect("/users/forgot-password");
    }
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/users/forgot-password");
    delete req.session.passwordReset;
  }
};

module.exports.resetPassword = async (req, res, next) => {
  const { newPassword, Confirm_password } = req.body;
  const info = req.session.passwordReset;

  if(!newPassword || newPassword !== Confirm_password) {
    req.flash("error", "Passwords do not match");
    res.redirect("/users/forgot-password");
    return;
  }
  try {
    const user = await User.findOne({ email: info.email });
    await user.setPassword(newPassword);
    await user.save();
    req.flash("success", "Password Updated!");
    res.redirect("/users/login");
    delete req.session.passwordReset;
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/users/forgot-password");
    delete req.session.passwordReset;
  }
};
