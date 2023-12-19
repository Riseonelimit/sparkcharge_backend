const express = require('express')
const app = express()

app.use(require('cors')())

app.get('/test',(req,res)=>{

    res.send("Test Success")
})
app.listen(8081,()=>console.log('server started'))