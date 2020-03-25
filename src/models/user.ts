import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    username: string,
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

// const Schema = mongoose.Schema;

// const userSchema = new Schema({
//     username: String,
//     password: String,
//     posts: []
// });

// const User : mongoose.Model<any> = mongoose.model("users", userSchema);
// export = User;  // EXPORT