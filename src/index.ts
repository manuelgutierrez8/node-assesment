import environment from "dotenv";
import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User, { UserSchema, IUser } from "./models/user";
import bodyParser from "body-parser";
import jsonwebtoken from "jsonwebtoken";
import { Validation } from "./util/validation";

const app = express();
const port = 3000; // default port to listen

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
environment.config();

mongoose.connect('mongodb+srv://dbUser:okiL7P802ftjPse6@cluster0-jvig8.azure.mongodb.net/assesment?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true',
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(
        () => { console.log('connected') },
        err => { console.log(err) }
    );

app.get("/", (req, res) => {
    res.json({ message: 'API working' });
});

app.post("/api/signup", (req, res) => {
    const validation = new Validation();

    try {
        if (validation.validateUser(req.body)) {
            bcrypt.hash(req.body.password, 10).then((hashedPassword) => {
                const newUser = new User();
                req.body.name = req.body.name;
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
                const jwtObject = { name: req.body.email }

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

// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});

//Middleware for auth
function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}