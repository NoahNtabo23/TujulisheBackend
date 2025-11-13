const openAI = require("openai");//Importing OpenAI package
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();//Loading environment variables from .env file
console.log(" GEMINI AI Key Loaded:", !!process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",  
});

const express = require("express");
const app=express(); 

const cors = require("cors");
app.use(cors({ origin: "http://localhost:3000" }));//Connect backend to frontend
const axios = require("axios");
const {Disaster,Partner} = require("./config");//Importing collections from config.js
const fetch = require("node-fetch");

app.use(express.json());
app.use(cors());

 
  

//CREATE DISASTER ENDPOINT..
app.post("/disasters/report", async (req, res) => {
  try {
    const { disasterType, outageTime, description, location, severity } = req.body;

    // Validate required fields
    if (!disasterType || !description || !location || !severity) {
      return res.status(400).send("All fields are required.");
    }

    const validSeverities = ["low", "medium", "high", "critical"];
    if (!validSeverities.includes(severity.toLowerCase())) {
      return res.status(400).send("Invalid severity level provided.");
    }

    // how data will be stored in Firestore
    const data = {
      type: disasterType,  
      description,
      location,
      severity: severity.toLowerCase(),
      outageTime: outageTime || new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };

    // Add report to Firestore
    const docRef = await Disaster.add(data);

    // Create full response object with ID
    const newReport = { id: docRef.id, ...data };

    // Return full report object to frontend
    res.status(201).send(newReport);

  } catch (error) {
    console.error("Error reporting disaster:", error);
    res.status(500).send("Error submitting disaster report.");
  }
});



//FETCH ALL DISASTER REPORTS
app.get("/disasters/reports", async (req, res) => {
  try {
    const snapshot = await Disaster.orderBy("timestamp", "desc").get();
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(list);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).send("Error loading reports.");
  }
});


//DELETE DISASTER REPORT
app.delete("/disasters/reports/:id",async (req,res)=>{
    const id=req.params.id;
    await Disaster.doc(id).delete();
    res.send("Disaster Report Deleted");
})

 
//GET PARTNER INFO FROM FORM DATA
app.post("/partners/register", async (req,res)=>{
    try{
        const {name,organization,contact,email,specialization}=req.body;
        //Validation of the required fields
        if(!name || !organization || !contact || !email || !specialization){
            return res.status(400).send("All fields are required.");
        }
        
        const data={
            name,
            organization,
            contact,
            email, 
            specialization:specialization||"General",
            joinedAt:new Date().toISOString(),
        };
        await Partner.add(data);
        res.send("Partner Registered Successfully");
    }catch(error){
        console.error("Error registering partner:",error);
        res.status(500).send("Error registering partner.");
    }
})

//PARTNER UPDATE DISASTER INFO....
app.patch("/partners/updateDisaster/:id",async (req,res)=>{
    try{
        const disasterId=req.params.id;
        const {status}=req.body;

        const validStatuses=[
            "Job Pending",
            "Team Dispatched",
            "Job In Progress",
            "Job Completed",
        ];

        if(!validStatuses.includes(status)){
            return res.status(400).send("Invalid status.");
        };
        const disasterRef=Disaster.doc(disasterId);
        await disasterRef.update({
            status,
            lastUpdated:new Date().toISOString(),
        });
        res.send("Disaster status updated successfully to " + status);
    } catch(error){
        console.error("Error updating disaster status:",error);
        res.status(500).send("Error updating disaster status.");
        
    }
});


//ADD JOB BRIEF AND ADVICES TO DISASTER REPORT

app.post("/partners/advice/:disasterId",async (req,res)=>{
    try{
        const {disasterId}=req.params;
        const{partnerId,jobBrief,advice}=req.body;

        if(!partnerId || !jobBrief || !advice){
            return res
            .status(400)
            .send("All fields are required.");
        }
        const adviceData={
            partnerId,  
            jobBrief,
            advice,
            timestamp:new Date().toISOString(),
        };
        const disasterRef=Disaster.doc(disasterId);
        await disasterRef.collection("PartnerAdvice").add(adviceData);
        res.send("Job brief and advice added to disaster report successfully.");
    }catch(error){
        console.error("Error adding job brief and advice:",error);
        res.status(500).send("Error adding partner advice.");
    }
})


//GET GEOCODATA FROM GOOGLE MAPS API through AXIOS


app.get("/disasters/geocode/:location", async (req, res) => {
  try {
    const { location } = req.params;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: location,
          key: apiKey,
        },
      }
    );

    const data = response.data;
    if (data.status === "OK") {
      const result = data.results[0];
      res.json({
        formatted_address: result.formatted_address,
        coordinates: result.geometry.location,
      });
    } else {
      res.status(400).json({ message: "Geocoding failed", details: data.status });
    }
  } catch (error) {
    console.error("Error fetching geocode:", error);
    res.status(500).send("Server error during geocoding");
  }
});


//GEMINI AI CHATBOT ENDPOINT
// Streamed api endpoint for smoother UI and lesss latency
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
    });

    res.setHeader("Content-Type", "text/event-stream");

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) res.write(text);
    }

    return res.end();
  } catch (error) {
    console.error("Stream error:", error);
    res.status(500).send("AI unavailable right now");
  }
});


app.listen(4000,()=>console.log("Up and running on port 4000"));