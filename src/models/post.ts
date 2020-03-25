import mongoose from "mongoose";

export interface IPost extends mongoose.Document {
    title: string,
    content: string,
    imageUrl: string,
    creatorUser: mongoose.Schema.Types.ObjectId
};

export const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    imageUrl: String,
    creatorUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users'}
});

const Post = mongoose.model<IPost>('post', PostSchema);
export default Post;