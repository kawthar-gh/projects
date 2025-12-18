const express=require('express');
const mongoose =require("mongoose")
const dotenv =require('dotenv')
const cors = require('cors')
//const middleware = require('./middleware/verify-token')
const app = express();

//config dotenv
dotenv.config();

//static files
app.use(express.static(__dirname + '/'));

//les cors
app.use(cors());

//BodyParser Middleware
app.use(express.json());

//les routes
const categorieRouter= require("./routes/categorie.route.js");
app.use('/api/categories', categorieRouter);

const scategorieRouter =require("./routes/scategorie.route")
app.use('/api/scategories', scategorieRouter);

const articleRouter =require("./routes/article.route")
app.use('/api/articles', articleRouter);

const userRouter =require("./routes/user.route")
app.use('/api/users', userRouter);


//connexion to database
mongoose.connect(process.env.DATABASECLOUD).then(()=>{
    console.log("DB connected")
}).catch((err)=>{
    console.log("DB connection error", err);
    process.exit();
});

app.get('/',(req,res) =>{
    res.send("hello from backend ecommerce");
})


const PORT = process.env.PORT || process.env.Port || 3000;

app.listen(PORT, ()=>{
    console.log(`server is running at port ${PORT}`);    
});
module.exports=app;