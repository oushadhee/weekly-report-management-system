const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://oushadhee0209_db_user:oushi0209@team-pulse-cluster.cbeb28t.mongodb.net/weekly_reports?retryWrites=true&w=majority&appName=team-pulse-cluster';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Atlas connected successfully!');
        console.log('Database:', mongoose.connection.db.databaseName);
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    });