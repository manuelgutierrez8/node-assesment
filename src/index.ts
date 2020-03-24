import express from "express";

const app = express();
const port = 3000; // default port to listen

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    // render the index template
    res.json({ message: 'hooray! welcome to our api!' });
} );

// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );