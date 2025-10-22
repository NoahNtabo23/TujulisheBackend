const openAI = require("openai");//Importing OpenAI package
require("dotenv").config();//Loading environment variables from .env file   
const express = require("express");
const cors = require("cors");
const {User,Disaster,Partner} = require("./config");//Importing collections from config.js
const app=express();
app.use(express.json());
app.use(cors());
     
    <!-- USER ENDPOINTS -->

//GET ALL USERS ENDPOINT..
app.get("/users",async (req,res)=>{
    const snapshot=await User.get();
    const list=snapshot.docs.map((doc)=>({id:doc.id,...doc.data()}));
      res.send(list);
});

//CREATE USER ENDPOINT..    
app.post("/users/create",async (req,res)=>{
    const data=req.body;
    await User.add(data)
    res.send("User Added");
}
);

//UPDATE USER ENDPOINT..
app.post("/users/update",async (req,res)=>{
   const id=req.body.id;
   delete req.body.id;
   const data=req.body;
   await User.doc(id).update(data);
   res.send("User Updated");    
}
);

//DELETE USER ENDPOINT..    
app.delete("/users/delete",async (req,res)=>{
   const id=req.body.id;
   await User.doc(id).delete();
   res.send("User Deleted!!");    
}
);

    <!-- DISASTER ENDPOINTS -->

//CREATE DISASTER ENDPOINT..
app.post("/disasters/report",async (req,res)=>{
    try{
        const {disasterType,outageTime,description,location}=req.body; 
        
        //Validation of the required fields
        if(!disasterType || !outageTime || !description || !location){
            return res.status(400).send("All fields are required.");
        }

        const data={
            disasterType,
            outageTime,
            description,
            location,
            reportedAt:new Date().toISOString()
        }
        await Disaster.add(data);
        res.send("Disaster Reported Successfully");
    }catch(error){
        console.error("Error reporting disaster:",error);
        res.status(500).send("Error submitting disaster report.");  

}});


//FETCH ALL DISASTER REPORTS
app.get("/disasters/reports", async (req,res)=>{
    const snapshot=await Disaster.get();
    const list=snapshot.docs.map((doc)=>({id:doc.id,...doc.data()}));
    res.send(list);
})

//DELETE DISASTER REPORT
app.delete("/disasters/reports/:id",async (req,res)=>{
    const id=req.params.id;
    await Disaster.doc(id).delete();
    res.send("Disaster Report Deleted");
})

    <!-- PARTNER ENDPOINTS -->

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






app.listen(4000,()=>console.log("Up and running on port 4000"));