import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    name: string,
    password: string,
    email: string,
    post: []
};

export const UserSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: String,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'posts'}]
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;