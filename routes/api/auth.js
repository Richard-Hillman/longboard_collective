const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
// @route GET api/auth
// @desc Test route
// @access Public
router.get('/', auth, async(req, res) => {
  try { 
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
    
});

// @route GET api/post
// @description Register user 
// @access Public
router.post(
  '/',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check(
      'password',
      'Please Required'
    ).exists()
  ], 

  // -----------------------------------------------------------------

  async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
      
    const { email, password } = req.body;
  
    try {
      // see if user exists-----------------------------------------
      const user = await User.findOne({ email });
  
      if(!user) {
        res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }
  
      // see if password is matching-------------------------------------

      const isMatch = await bcrypt.compare(password, user.password);

      if(!isMatch)
        res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
    
      // return jsonwebtoken ----------------------------------------
      const payload = {
        user: {
          id: user.id
        }
      };
  
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 36000 },
        (err, token) => {
          if(err) throw err;
          res.json({ token });
        }
      );
    } catch(err) {
      console.error(err.message);
      res.status(500).send('Server error');
    } 
  }
);

module.exports = router;
