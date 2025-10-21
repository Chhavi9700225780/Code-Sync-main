import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    // Your existing user fields if you have them (e.g., from your app's login)
    appUserId: string; // An ID unique to your application's users
    username: string; // Your app's username
    githubId?: string; // GitHub's unique user ID (optional but recommended)
    githubAccessToken?: string; // Store the encrypted token here
    // Add other fields as needed
}

const UserSchema: Schema = new Schema({
    appUserId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    githubId: { type: String, unique: true, sparse: true }, // Sparse allows null/unique
    githubAccessToken: { type: String }, // Consider encrypting this field
}, { timestamps: true });
// Remove the explicit <IUser> generic
export default mongoose.model('User', UserSchema);