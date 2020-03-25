import mongoose from 'mongoose';
import User, { UserSchema, IUser } from '../models/user';
import Result from '../models/result';

export class UserController {
    async userExists(email: string) {
        return new Promise(resolve => {
            const users = mongoose.model("users", UserSchema);

            users.findOne({ 'email': email }, (err, user) => {
                if (user === null) {
                    resolve(false);
                }

                resolve(true);
            });
        });
    }
}