const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check')

const Profile = require('../../models/Profile');
const user = require('../../models/User');

// Get current user profile--------------------------------------------------------------------------------------

// @route GET api/profile/me
// @desc Get current user profile
// @access Private

router.get('/me', auth, async (req, res) => {
        
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user',
        ['name', 'avatar']);

        if(!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    });

//  Create or update user profile--------------------------------------------------------------------------------------

    // @route POST api/profile
    // @desc Create or update user profile
    // @access Private

router.post('/', [ auth, [
    check('status', 'Status is required')
        .not()
        .isEmpty(),
    check('skills', 'Skills is required')
        .not()
        .isEmpty(),
    ]
],
async (req, res) => {
    const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company,
            website,
            location,
            status,
            skills,
            bio,
            youtube,
            twitter,
            facebook,
            linkedin,
            instagram
        } = req.body;

// Build Profile Object 
        const profileFields = {};
        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(status) profileFields.status = status;
        if(skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }; 
        if(bio) profileFields.bio = bio;
   
// build social objects 
        profileFields.social = {}
        if(youtube) profileFields.social.youtube = youtube;
        if(twitter) profileFields.social.twitter = twitter;
        if(facebook) profileFields.social.facebook = facebook;
        if(linkedin) profileFields.social.linkedin = linkedin;
        if(instagram) profileFields.social.instagram = instagram;

        // TRY----------------------------         ----------------------------------------------
        try{ 
            let profile = await Profile.findOne({ user: req.user.id });

            if(profile) {
                // update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id},
                    { $set: profileFields },
                    { new: true } 
                );

                return res.json(profile);
            }

            // create
            profile = new Profile(profileFields);

            await profile.save()
            res.json(profile);

        } catch {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
        // CATCH---------------------------        -----------------------------------------------
    }
);

//  Gets ALL profiles--------------------------------------------------------------------------------------

    // @route GET api/profile
    // @desc GET all profiles
    // @access Public

    router.get('/', async (req, res) => {
        try {
            const profiles = await Profile.find().populate('user', ['name', 'avatar']);
            res.json(profiles);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

//  Gets Users profile by ID--------------------------------------------------------------------------------------

    // @route GET api/profile/user/:user_id
    // @desc GET profile by user ID
    // @access Public

    router.get('/user/:user_id', async (req, res) => {
        try {
            const profile = await Profile.findOne({
                user: req.params.user_id
            }).populate('user', ['name', 'avatar']);

            if(!profile)
                return res.status(400).json({ msg: 'Cannot Find Profile' });

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            if(err.kind == 'ObjectId') {
                return res.status(400).json({ msg: 'Profile not Found' });
            }
            res.status(500).send('Server Error');
        }
    }
);

//  Gets Users profile by ID--------------------------------------------------------------------------------------

    // @route DELETE api/profile
    // @desc Delete profile and user and posts 
    // @access Private

    router.delete('/', auth, async (req, res) => {
        try {
            // NEED TO REMOVE POSTS
            // remove profile 
            await Profile.findOneAndRemove({ user: req.user.id });
            // removes user
            await User.findOneAndRemove({ _id: req.user.id });
            res.json({ msg: "profile and user deleted" });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;