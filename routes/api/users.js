const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

// @route GET api/users
// @description Register user 
// @access Public
router.post(
    '/',
    [
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check(
        'password',
        'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
], 
async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, password } = req.body;

    try {
        // see if user exists
        let user = await User.findOne({ email });

        if(user) {
            res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        // bring in user avatar if already in existence 
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        }) 

        user = new User({
            name,
            email,
            avatar,
            password
        });

        // encrypt password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // return jsonwebtoken 

        res.send('Users route')
   
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }
        
});

 module.exports = router;
