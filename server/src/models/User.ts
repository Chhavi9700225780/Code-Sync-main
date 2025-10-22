import mongoose, { Schema, Document } from 'mongoose';

// Interface for the document structure, including new fields
export interface IUser extends Document {
    appUserId: string;
    username: string;
    email: string; // New field
    password?: string; // New field, optional because we won't send it back to the client
    githubId?: string;
    githubAccessToken?: string;
}

const UserSchema: Schema = new Schema({
    appUserId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    // Make email required, unique, and lowercase
    email: { type: String, required: true, unique: true, lowercase: true },
    // Password will be stored as a hash
    password: { type: String, required: true, select: false }, // 'select: false' prevents password from being sent in queries by default
    githubId: { type: String, unique: true, sparse: true },
    githubAccessToken: { type: String },
}, { timestamps: true });



export default mongoose.model('User', UserSchema);