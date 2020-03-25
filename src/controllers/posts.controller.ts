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
            });
        });
    }

    async getPostById(postId: string, ownerEmail: string) {
        return new Promise(resolve => {
            const posts = mongoose.model("posts", PostSchema);

            posts.findOne({ '_id': mongoose.Types.ObjectId(postId) }, (error, post) => {
                const result = new Result();

                if (post === null) {
                    result.message = 'post not found';
                    result.data = {};
                    result.status = 404;
                    result.success = false;
                    resolve(result);
                }
                else {
                    // Post found, check if the user is the owner
                    const users = mongoose.model("users", UserSchema);

                    users.findOne({ 'posts': mongoose.Types.ObjectId(postId) }, (err, user: IUser) => {
                        // If the owner of the post is the same making the request, send it as response
                        if (user.email === ownerEmail) {
                            result.data = post;
                            result.message = 'OK';
                            result.status = 200;
                            result.success = true;
                        }
                        else {
                            result.data = {};
                            result.message = 'Unauthorized';
                            result.status = 401;
                            result.success = true;
                        }
                        resolve(result);
                    });
                }
            });
        });
    }

    async updatePost(updatedInfo: any, postId: string, ownerEmail: string) {
        return new Promise(resolve => {
            const posts = mongoose.model("posts", PostSchema);

            posts.findOne({ '_id': mongoose.Types.ObjectId(postId) }, (error, post: IPost) => {
                const result = new Result();

                if (error) {
                    result.message = error;
                    result.status = 500;
                    result.success = false;
                    resolve(result);
                }

                const users = mongoose.model("users", UserSchema);

                users.findOne({ 'posts': mongoose.Types.ObjectId(postId) }, (err, user: IUser) => {
                    // If the owner of the post is the same making the request, update the data
                    if (user.email === ownerEmail) {
                        post.update({
                            'content': updatedInfo.content ? updatedInfo.content : post.content,
                            'imageUrl': updatedInfo.imageUrl ? updatedInfo.imageUrl : post.imageUrl,
                            'title': updatedInfo.title ? updatedInfo.title : post.title,
                        }, (updateErr) => {
                            if (updateErr) {
                                result.message = updateErr;
                                result.status = 500;
                                result.success = false;
                                resolve(result);
                            }

                            result.message = 'Post updated';
                            result.status = 200;
                            result.success = true;
                            resolve(result);
                        });
                    }
                    else {
                        result.data = {};
                        result.message = 'Unauthorized';
                        result.status = 401;
                        result.success = true;
                        resolve(result);
                    }
                });


            });
        });
    }

    async deletePost(postId: string, ownerEmail: string) {
        return new Promise(resolve => {
            const posts = mongoose.model("posts", PostSchema);
            const users = mongoose.model("users", UserSchema);

            posts.findOne({ '_id': mongoose.Types.ObjectId(postId) }, (error, post: IPost) => {
                const result = new Result();
                if (post === null) {
                    result.message = 'Post not found';
                    result.status = 500;
                    result.success = false;
                    resolve(result);
                }

                // First, remove the id from the post array for the user
                users.findOne({ 'posts': mongoose.Types.ObjectId(postId) }, (postErr, user: IUser) => {
                    // If the owner of the post is the same making the request, delete the data
                    if (user.email === ownerEmail) {
                        users.findOneAndUpdate({ 'email': ownerEmail },
                            { $pull: { posts: post._id } },
                            (userErr: any) => {
                                if (userErr) {
                                    result.message = 'Error saving Post - Updating user: ' + userErr;
                                    result.status = 500;
                                    result.success = false;
                                    resolve(result);
                                }

                                // Users collection updated, proceed to delete the post
                                posts.findOneAndRemove({ '_id': mongoose.Types.ObjectId(postId) }, (err) => {
                                    if (err) {
                                        result.message = 'error deleting post ' + err;
                                        result.status = 500;
                                        result.success = false;
                                        resolve(result);
                                    }

                                    result.message = 'Post deleted';
                                    result.status = 201;
                                    result.success = true;

                                    resolve(result);
                                });
                            }
                        )
                    }
                    else {
                        result.data = {};
                        result.message = 'Unauthorized';
                        result.status = 401;
                        result.success = true;
                        resolve(result);
                    }
                });
            });
        });
    }


}