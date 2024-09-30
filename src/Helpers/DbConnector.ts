import mongoose from "mongoose";

/**
 * connect to the db with connection string as param
 */
const connect = (database: string) => {
    mongoose.connect(database)
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((error) => {
            console.error('Failed to connect to MongoDB:', error);
        });
};

export default connect;
