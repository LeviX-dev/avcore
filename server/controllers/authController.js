import bcrypt from 'bcrypt';
import { getUserByUsername  } from '../models/signinModel.js';
import { sendOtpMail } from '../utils/sendOtpMail.js';
import db from '../database/db.js';



// export const signIn = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ message: 'Please provide both username and password' });
//     }

//     // Fetch user from the database
//     const user = await getUserByUsername(username);
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid username' });
//     }

//     // Check if the password is valid
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: 'Invalid password' });
//     }

//     // Set session data
//     req.session.user = {
//       id: user.user_id,
//       username: user.username,
//       role: user.role,
//     };

//     console.log('session:', req.session.user);

//     // Return username and role along with success message
//     res.status(200).json({
//       message: 'Sign-in successful',
//       user: {
//         username: user.username,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };



export const signIn = async (req, res) => {
  try {

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid username' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // generate otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      "UPDATE users SET otp=?, otp_expiry=? WHERE user_id=?",
      [otp, expiry, user.user_id]
    );

    await sendOtpMail(user, otp);

    return res.status(200).json({
      message: "OTP sent to your email",
      otpRequired: true,
      username: user.username
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const verifyOtp = async (req, res) => {

  const { username, otp } = req.body;

  const [rows] = await db.query(
    "SELECT * FROM users WHERE username=?",
    [username]
  );

  const user = rows[0];

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  if (user.otp !== otp) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  if (new Date() > new Date(user.otp_expiry)) {
    return res.status(401).json({ message: "OTP expired" });
  }

req.session.user = {
  id: user.user_id,
  username: user.username,
  role: user.role,
  name: user.name,
  loginTime: new Date()
};

  res.status(200).json({
    message: "Login successful",
    user: {
      username: user.username,
      role: user.role
    }
  });
};



export const checkSession = (req, res) => {
  if (req.session.user) {
    res.status(200).json({ isAuthenticated: true, role: req.session.user.role });
  } else {
    res.status(200).json({ isAuthenticated: false });
  }
};


export const logout = (req, res )=>{
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/signin');
  });

}

export const getUserRole = (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ role: req.session.user.role });
  } else {
    return res.status(401).json({ message: 'Not authenticated' });
  }
};


export const getUserName = (req, res) => {
  if (req.session.user) {
    console.log('req.session:', req.session.user);
    return res.status(200).json({ 
      name: req.session.user.name,
      username: req.session.user.username,
      role: req.session.user.role,
    });
  } else {
    return res.status(401).json({ message: 'Not authenticated' });
  }
};









// export const getUserName = (req) => {
//   if (req.session.user) {
//     console.log('req.session:', req.session.user);
//     return {
//       name: req.session.user.name,
//       username: req.session.user.username,
//       role: req.session.user.role,
//     };
//   }
//   throw new Error('Not authenticated');
// };