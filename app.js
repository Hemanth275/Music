const express=require('express');
const app=express();
const mongoose=require('mongoose');
const dburi="mongodb+srv://hemanth:hemanth27@cluster0.euuy2.mongodb.net/music-data?retryWrites=true&w=majority";
const bodyParser=require('body-parser');
const multer=require('multer');
const SongModel=require('./songschema');
const path=require('path');
const fs=require('fs');
const morgan=require('morgan');
passport              =  require("passport"),
      LocalStrategy         =  require("passport-local"),
      passportLocalMongoose =  require("passport-local-mongoose"),
      User                  =  require("./user");
mongoose.connect(dburi,{useNewUrlParser:true,useUnifiedTopology:true})
.then((result) =>  app.listen(3000))
.catch((err)=>console.log(err));
app.use(require("express-session")({
  secret:"Any normal Word",      
  resave: false,          
  saveUninitialized:false    
}));
passport.serializeUser(User.serializeUser());       
passport.deserializeUser(User.deserializeUser()); 
passport.use(new LocalStrategy(User.authenticate()));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded(
    { extended:true }
))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('css'));
app.use(express.urlencoded({extended :true}));
app.use(morgan('dev'));

app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
  });
  app.get("/login", (req,res) =>{
    res.render("login")
})
app.get("/",isLoggedIn ,(req,res) =>{
    res.redirect('/home')
})
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
app.post("/login",passport.authenticate("local",{
    successRedirect:"/home",
    failureRedirect:"/login"
}),function (req, res){
});
app.get("/register",(req,res)=>{
    res.render("register");
});
app.post("/register",(req,res)=>{
    
    User.register(new User({username: req.body.username,email: req.body.email}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.render("register");
        }
    passport.authenticate("local")(req,res,function(){
        res.redirect("/login");
    })    
    })
})
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/login");
});

  app.get('/',(req,res)=>{
    res.redirect('/home')
})

  app.get('/home', (req, res) => {
    SongModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('home', {title:'Home Page', items: items });
        }
    }).sort({ createdAt: -1 });
  });
  app.get('/songs/:id', (req, res) => {
    const id = req.params.id;
    SongModel.findById(id)
      .then(result => {
        res.render('details', { items:result });
      })
      .catch(err => {
        console.log(err);
      });
  });
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
const upload = multer({ storage: storage });


var cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1}])
app.post('/', cpUpload, (req, res, next) => {
    var obj = {
        title: req.body.title,
        album: req.body.album,
        artist:req.body.artist,
        image: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.files.image[0].filename)),
            contentType: 'image/png'
        },
        audio:{
          data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.files.audio[0].filename)),
          contentType: 'audio/mpeg'
        }
        
    }
    SongModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            
            res.redirect('/');
        }
    });
  });
  
  app.get('/upload',(req,res)=>{
      res.render('upload',{title:'Uploading'});
  });

  app.get('/about',(req,res)=>{
    res.render('about',{title:'About'});
  });

  app.get('/contact',(req,res)=>{
    res.render('contact',{title:'Contact'});
  });
  
  app.use((req,res)=>{
    res.status(404).render('404',{title:'404'});
  });
  
  