const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');
const { parse } = require('url');

const connectDB = async () => {
    try {
        await mongoose.connect(db, 
            {useCreateIndex: true,
                useNewUrlParser: true,
                useFindAndModify: false,
                useUnifiedTopology: true
        });

        console.log('mongoDB Connected...');
    } catch(err) {
        console.error(err.message);
        // EXIT PROCESS WITH FAILURE 
        process.exit(1)
    }
}

module.exports = connectDB