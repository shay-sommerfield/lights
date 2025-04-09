import express from "express";
import env from "dotenv";
import bodyParser from "body-parser"
import path from "path"

const app = express();
// Load the root .env file
const envPath = path.resolve(process.cwd(), '../.env');
env.config({ path: envPath });

const port = process.env.VITE_EXPRESS_PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

//get programs sends the light programs available, 
//for defining frontend buttons and endpoints
app.get("/get_programs/", (req, res) => {
    const programs = [
        {"endpoint": "run_color_cycle", 
         "name": "Color Sequence"},

        {"endpoint": "run_binary_counter", 
         "name": "Binary Counter"},
         
        {"endpoint": "turn_off_orbs", 
         "name": "Turn off orbs"}
        ]
    res.send(programs);
});
  
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});