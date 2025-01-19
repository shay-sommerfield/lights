import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
//Add your own API root link here
const API_URL = `http://192.168.1.123:8000`;

//set header config
const config = {
    headers: {
        'Content-Type': 'application/json',
    },
};

//set the styles location
app.use(express.static("public"));

//allow body parser to read input text
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    // Fetch the programs from the backend in order to generate buttons
    const response = await axios.get('http://127.0.0.1:8000/get_programs/');
    /*response.data is of the form: 
    [{"func": "run_color_cycle", "name": "Color Sequence"},...]*/
    const events = JSON.parse(response.data);
    res.render("index.ejs", { events: events});
  } catch (error) {
    res.render("index.ejs", {events: ["No Functions Available"]});
    console.error('Error fetching items:', error);
  }
});

app.post("/exec", async (req, res) => {
  //determine program endpoint given button value
  const program = req.body.button;
  console.log(program);
  try {
    const result = await axios.get(API_URL + `/${program}/`, config);
    console.log(result.data);
    res.render("index.ejs", { events: events, res: JSON.stringify(result.data) });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error) });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});