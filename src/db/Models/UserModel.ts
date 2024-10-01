import mongoose, { Schema } from "mongoose";
import { IUserWithDid } from "../../DataTypes/interfaces/IUser";
const userSchema:Schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true
    },
    // publicKey: {
    //     type: String,
    //     // required: true
    // },
    address: {
        type: String,
        required: true
    },
    // privateKey: {
    //     type: String,
    //     // required: true
    // },
    accountStatus: {
        type: String,
        enum: ['approved', 'rejected', 'pending']
    },
    category: {
        type: String,
        required: true,
        enum: ['verifier', 'holder', 'issuer'],
        lowercase: true
    },
    didCreated:{
        type:Boolean
    },
    did: {
        type: String,
    },
    controllerKeyId: {
        type: String,
    },
    keys: [{
        type: {
            type: String,
        },
        kid: {
            type: String,
        },
        publicKeyHex: {
            type: String,
        },
        meta: {
            algorithms: [String],
        },
        kms: {
            type: String,
        }
    }],
    services: [{
        type: Schema.Types.Mixed,
    }],
    provider: {
        type: String,
    },
},
{ timestamps: true }
);


const User = mongoose.model<IUserWithDid>("User", userSchema);

export default User;