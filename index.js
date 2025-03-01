const express = require("express")
const path = require("path")
const cors = require("cors")

const app = express()
app.set("view engine","ejs")
app.use(express.static("public"))

app.get("/",(req,res)=>{
    res.render("index")
})

app.listen(3000,()=>{
    console.log('http://localhost:3000')
})