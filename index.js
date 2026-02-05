const express = require("express");
const axios = require("axios");
const app = express();
const port = 3030;
const path = require("path");
const methodOverride = require("method-override");
const Instruction = require("./models/chat.js");
const mongoose = require("mongoose");

app.listen(port, () => {
    console.log("listening to port : 3030");
});

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/ai_assistant");
    console.log("connection success");
}

main().catch((err) => console.log(err));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "assets")));


let que = "";
let jsonString = "";
let answer={};

// Save function using the schema
async function saveInstructions(data) {
    try {
        const instruction = new Instruction({ instructions: data });
        await instruction.save();
        console.log("Data saved successfully.");
    } catch (error) {
        console.error("Error saving data:", error);
    }
}



// Page routes
app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/results", async (req, res) => {
    // console.log(answer[0].instructions[0].key);
    console.log(answer);
    res.render("result.ejs",{answer,que});
});

// app.post("/results", async (req, res) => {
//         // JSON data
//     const jsonString = "{\n    'login.jpg': 'Enter your PIN in the provided field and click Login.',\n    'homepage.jpg': 'Search for the icon for the service or task, look for the icon or scroll down to see the particular service icon, and click on the icon.',\n    'transfer_to_beneficiary.jpg': 'Select the beneficiary, enter the amount to transfer, and click on Transfer.'\n}";

//     // Convert JSON string with single quotes to a valid format and parse
//     const validJsonString = jsonString.replace(/'/g, '"');
//     const dataObject = JSON.parse(validJsonString);

//     // Convert dataObject to an array of key-value pairs
//     const modifiedDataArray = Object.entries(dataObject).map(([key, value]) => ({
//         key,
//         value
//     }));
//     // Uncomment this line to call saveInstructions and save data when needed

//     await Instruction.deleteMany({});
//     saveInstructions(modifiedDataArray);
//     let { query } = req.body;
//     que = query;
//     res.redirect("/results");
// });
app.post("/results", async (req, res) => {
    const { query } = req.body;
    que = query;

    // Send the query to the Flask API
    try {
        const response = await axios.post("http://127.0.0.1:5000/process_query", { query: que });
        if (response.data) {
            jsonString = await JSON.stringify(response.data, null, 2);  // Pretty-print the JSON
        } else {
            jsonString = '{"error": "Response format is invalid"}';
        }   
        console.log(typeof jsonString)
        const dataObject = JSON.parse(jsonString);
        console.log(typeof dataObject.response)
        console.log(dataObject.response); // Set jsonString based on API response
        answer=dataObject.response
    } catch (error) {
        console.error("Error processing query:", error);
        jsonString = "{'error': 'Failed to process the query'}";
    }
   // res.render("result.ejs",{dataObject,que});

    res.redirect("/results");
});