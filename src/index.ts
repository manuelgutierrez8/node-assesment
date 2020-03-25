import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User, { UserSchema, IUser } from "./models/user";
import bodyParser from "body-parser";
import { Validation } from "./util/validation";

const app = express();
const port = 3000; // default port to listen

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://dbUser:okiL7P802ftjPse6@cluster0-jvig8.azure.mongodb.net/assesment?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true',
{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(
        () => { console.log('connected') },
        err => { console.log(err) }
    );

// define a route handler for the default home page
app.get("/", (req, res) => {
    // render the index template
    res.json({ message: 'hooray! welcome to our api!' });
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
                res.send({ message: 'Success' })
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