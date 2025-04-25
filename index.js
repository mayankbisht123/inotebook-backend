const connectToMongoose = require('./db');
const express=require('express');
var cors = require('cors');
const { ValidationError } = require('express-validation');


connectToMongoose();
const port=4000;
const app=express();

app.use(express.json());
app.use(cors())

app.use('/api/auth',require('./routes/auth'));
app.use('/api/notes',require('./routes/notes'));

app.listen(port,()=>{
    console.log("Connected to port");
})

app.get('/',(req,res)=>{
    res.send("Hello world!");
})


// Handles the validation error of JOI.
app.use((err, req, res, next) => {
    if (err instanceof ValidationError) {
        console.error("Validation Error:", err.details); // Log the error
        let customErrorMessages = [];

        // Iterate through the errors in err.details.body
        err.details.body.forEach((detail) => {
            customErrorMessages.push({
                message: detail.message,  // The error message
                field: detail.path[0],    // The field name
            });
        });

        // Return the array of error messages in the response
        return res.status(err.statusCode).json({
            errors: customErrorMessages,  // This will now be an array of error objects
        }); // Return the error to the client
    }
    console.error("Internal Server Error:", err); // Log other errors
    res.status(500).json({ message: 'Internal Server Error' });
});
