const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app= express();
const path = require("path");
const { count } = require('console');
const methodOverride= require("method-override");
const {v4:uuidv4} = require(`uuid`);


app.use(express.static('public'));
app.use(methodOverride("_method")); 
app.use(express.urlencoded({extended: true}));
app.use(express.json()); 

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"))



const connection = mysql.createConnection({
  host:"localhost",
  user:"root",
  database:"sigma",
  password:"1234"
});

let  getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password() 
  ];
}
  
  // let p = "INSERT INTO user(id,username,email,password) VALUES ?";
  // let users=[];
  // for(let i=1;i<100;i++){
  //   users.push(getRandomUser());
  // }
  // try{
  //   connection.query(p,[users],(err,result)=>{
  //     if (err) throw err;
  //     console.log(result);
  //   });
  // }catch (err){
  //   console.log(err);
  // }
  // connection.end();





  app.listen("4090",(req,res)=>{
    console.log("listening to port 4090...");
  })

  app.get("/",(req,res)=>{
    let q="SELECT COUNT(*) FROM user";
    try{
       connection.query(q , (err,result)=>{
        if (err) throw err;
        console.log(result[0][`COUNT(*)`]);
        let count=result[0][`COUNT(*)`];
        res.render("home.ejs",{count});
      })
    }catch(err){
      res.send(`error:${err}`);
    }
  })

  app.get("/users",(req,res)=>{
    let q="SELECT * FROM user"
    try{
      connection.query(q,(err,users)=>{
        if(err) throw err;
        res.render("show.ejs",{users});
      })
    }catch(err){
      console.log(`error in Database!`);
    }
  })

  app.get("/user/:id/edit",(req,res)=>{
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;

    try{
      connection.query(q,(err,result)=>{
        if(err) throw err;
        let user = result[0];
        console.log(user.password);
        res.render("edit.ejs",{user});
      })
    }catch(err){
      console.log("error",err);
    }
  });


//update
  app.patch("/user/:id",(req,res)=>{
    // res.send(`change successfull`);
    let {id}= req.params;
    console.log(req.body)
    let {username, password} =req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;

    try{
      connection.query(q,(err,result)=>{
        if(err) throw err;
        let user = result[0];
        if(password !== user.password){
          res.send(`wrong Password`);        
        }else{
          let q2=`UPDATE user SET username='${username}' WHERE id='${id}'`;
          connection.query(q2,(err,result)=>{
            if(err) throw err;
            res.redirect("/users");
          });
        }
      });
    }catch(err){
      res.send(`error in DB`);
    }


  });

  app.get("/user/new",(req,res)=>{
    res.render("addUser.ejs");
  })

  app.post("/user/new",(req,res)=>{
    let { username,email,password}=req.body;
    let id = uuidv4();
    let q = `INSERT INTO user (id,username,email,password) VALUES ('${id}','${username}','${email}','${password}')`;
    try{
      connection.query(q,(err,result)=>{
        if(err) throw err;
        console.log(`new user added`);
        res.redirect("/users");
      }

    )}catch(err){
      res.send("error occured"+err);
    }
  });

  app.get("/user/:id/delete",(req,res)=>{
    let {id}= req.params;
    let p = `SELECT * FROM user WHERE id='${id}'`;
    try{
      connection.query(p,(err,result)=>{
        if (err) throw err;
        console.log(result);
        let user=result[0];
        res.render("delete.ejs",{user});

     });
    }catch (err){
      res.send(`error occured`+err);
    }
  })

  app.delete("/user/:id/",(req,res)=>{
    let { id }= req.params;
    let {password} = req.body;
    let q= `SELECT * FROM user WHERE id='${id}'`;
    try{
      connection.query(q,(err,result)=>{
        if(err) throw err;
        let user= result[0];

        if(user.password != password){
          res.send(`Wrong password Plese try Again!`);
        }else{
          let q2= `DELETE FROM user WHERE id='${id}'`;
          
          connection.query(q2,(err,result)=>{
          if(err) throw err;
            else{
              console.log(result);
              console.log(user.username);
              console.log(user.email);
              console.log("user Deleted");
              res.redirect("/users");
            }
          });
          
        }       
      });
    }catch(err){
      res.send("error occured"+ err);
    }
  })
  