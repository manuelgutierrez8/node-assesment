import mongoose from 'mongoose';
import User, { UserSchema, IUser } from '../models/user';
import Post, { PostSchema, IPost } from '../models/post';
import Result from '../models/result';

export class PostsController {
    async createPost(postInformation: any, creatorUser: string) {
        return new Promise(resolve => {
            const users = mongoose.model("users", UserSchema);

            users.findOne({ 'email': creatorUser }, (error, user: IUser) => {
                const result = new Result();

                try {
                    const newPost = new Post();
                    newPost.title = postInformation.title;
                    newPost.imageUrl = postInformation.imageUrl;
                    newPost.content = postInformation.content;
                    newPost.creatorUser = user._id;

                    newPost.save((err: any, post) => {
                        if (err) {
                            result.message = 'Error saving Post: ' + err;
                            result.status = 500;
                            result.success = false;
                            resolve(result);
                        }

                        // Add the post id to the users collection
                        users.findOneAndUpdate({ 'email': creatorUser },
                            { $push: { posts: post._id } },
                            (userErr: any) => {
                                if (userErr) {
                                    result.message = 'Error saving Post - Updating user: ' + userErr;
                                    result.status = 500;
                                    result.success = false;
                                    resolve(result);
                                }

                                result.message = 'Post saved';
                                result.status = 201;
                                result.success = true;

                                resolve(result);
                            }
                        )
                    });
                } catch (error) {
                    result.message = error;
                    result.status = 500;
                    result.success = false;

                    resolve(result);
                }
            });
        });
    }

    async getPost(ownerEmail: string) {
        return new Promise(resolve => {
            const users = mongoose.model("users", UserSchema);

            users.findOne({ 'email': ownerEmail }, (error, user: IUser) => {
                const posts = mongoose.model("posts", PostSchema);

                posts.find({ '_id': { $in: user.posts } }, (err, postsData) => {
                    resolve(postsData);
                })

                // {person1: mongoose.Types.ObjectId(Person._id)}
            });
        });
    }
}