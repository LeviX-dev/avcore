import bcrypt from 'bcrypt';
import { getUserByUsername  } from '../models/signinModel.js';


export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide both username and password' });
    }

    // Fetch user from the database
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username' });
    }

    // Check if the password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Set session data
    req.session.user = {
      id: user.user_id,
      username: user.username,
      role: user.role,
    };

    console.log('session:', req.session.user);

    // Return username and role along with success message
    res.status(200).json({
      message: 'Sign-in successful',
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
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