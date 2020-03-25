import environment from "dotenv";
import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User, { UserSchema, IUser } from "./models/user";
import bodyParser from "body-parser";
import jsonwebtoken from "jsonwebtoken";
import { Validation } from "./util/validation";

import { PostsController } from "./controllers/posts.controller";
import { UserController } from "./controllers/user.controller";
import { Result } from "./models/result";

const app = express();
const port = 3000; // default port to listen

const postController = new PostsController();
const userController = new UserController();
const validation = new Validation();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
environment.config();


mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(
        () => { console.log('connected') },
        err => { console.log(err) }
    );

app.get("/", (req, res) => {
    res.json({ message: 'API working' });
});

app.post("/api/signup", (req, res) => {
    try {
        if (validation.validateUser(req.body)) {
            userController.userExists(req.body.email).then(exists => {
                if (!exists) {
                    bcrypt.hash(req.body.password, 10).then((hashedPassword) => {
                        const newUser = new User();
                        newUser.name = req.body.name;
                        newUser.email = req.body.email;
                        newUser.password = hashedPassword;

                        newUser.save((error: any) => {
                            if (error) {
                                res.send(error);
                            }

                            res.status(201).send({ message: 'User created!' });
                        });
                    });
                }
                else {
                    res.status(400).send({ message: 'Email already in use' });
                }
            });
        }
        else {
            res.status(400).send({ message: 'Please add all the required data on your json' });
        }
    } catch (error) {
        res.json({ message: 'error' });
        res.status(500).send(error);
    }
})

app.post('/api/login', async (req, res) => {
    const users = mongoose.model("users", UserSchema);

    users.findOne({ 'email': req.body.email }, async (error, user: IUser) => {
        if (error) {
            res.status(500).send(error);
        }

        if (user == null) {
            return res.status(400).send({ message: 'Cannot find user' })
        }
        try {
            if (await bcrypt.compare(req.body.password, user.password)) {
                const jwtObject = { email: req.body.email }

                const accessToken = jsonwebtoken.sign(jwtObject, process.env.ACCESS_TOKEN);

                res.send({ message: 'Success', token: accessToken })
            } else {
                res.status(400).send({ message: 'Not allowed' })
            }
        } catch {
            res.status(500).send()
        }
    });
})

app.post('/api/post', authenticateToken, async (req: any, res) => {
    try {
        if (validation.validatePost(req.body)) {
            await postController.createPost(req.body, req.jwtObject.email).then((result: Result) => {
                if (result.success) {
                    res.status(result.status).send(result.message);
                }
                else {
                    res.sendStatus(result.status).send(result.message);
                }
            });
        }
        else {
            res.status(400).send({ message: 'Create an object with at least title and content' });
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/api/posts', authenticateToken, async (req: any, res) => {
    try {
        await postController.getPost(req.jwtObject.email).then((result) => {
            res.send(result);
        });
    }
    catch (error) {
        res.status(500).send(error);
    }
});

app.get('/api/posts/:id', authenticateToken, async (req: any, res) => {
    try {
        if (req.params.id) {
            await postController.getPostById(req.params.id, req.jwtObject.email).then((result: Result) => {
                if (result.success) {
                    res.status(200).send(result.data);
                }
                else {
                    res.status(result.status).send(result.message);
                }
            });
        }
        else {
            res.status(400).send({ message: 'not id present in query' });
        }

    }
    catch (error) {
        res.status(500).send(error);
    }
});

app.put('/api/posts/:id', authenticateToken, async (req: any, res) => {
    try {
        if (req.params.id) {
            await postController.updatePost(req.body, req.params.id, req.jwtObject.email).then((result: Result) => {
                if (result.success) {
                    res.status(200).send(result.message);
                }
                else {
                    res.status(result.status).send(result.message);
                }
            });
        }
        else {
            res.status(400).send({ message: 'not id present in query' });
        }
    }
    catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/api/posts/:id', authenticateToken, async (req: any, res) => {
    try {
        if (req.params.id) {
            await postController.deletePost(req.params.id, req.jwtObject.email).then((result: Result) => {
                if (result.success) {
                    res.status(200).send(result.message);
                }
                else {
                    res.status(result.status).send(result.message);
                }
            });
        }
        else {
            res.status(400).send({ message: 'not id present in query' });
        }
    }
    catch (error) {
        res.status(500).send(error);
    }
});

// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});

// Middleware for auth
function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jsonwebtoken.verify(token, process.env.ACCESS_TOKEN, (err: any, jwtObject: any) => {
        if (err) return res.sendStatus(403);
        req.jwtObject = jwtObject
        next();
    })
}