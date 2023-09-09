//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date=require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _ =require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


main().catch(err => console.log(err));
async function main() {
  // Use connect method to connect to the server
  await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

  const itemSchema = new mongoose.Schema({
    name:String
  });
  const listSchema=new mongoose.Schema({
    name:String,
    items:[itemSchema]
  });

  const Item = mongoose.model('Item',itemSchema);
  const List=mongoose.model("List",listSchema);

  const item1= new Item({
    name:"Welcome"
  });
  const item2= new Item({
    name:"Hit + button to add a new item"
  });
  const item3= new Item({
    name:"Hit this to delete an item"
  });

  const defItems=[item1,item2,item3];
  /**/
  

  

app.get("/", function(req, res){


  Item.find()
  .then(function(results){
    if(results.length === 0){

     Item.insertMany(defItems)
      .then(()=>{
        console.log("inserted")
      })
      .catch(function(err){
        console.log(err);
      });
      res.redirect("/");
    }
    else{
      res.render("list", { listTitle:"Today", newListItem: results })
    }
   
  })
  .catch(function(err){
    console.log(err);
  });

  // let day = date.getDate();
 
});


app.post("/", function(req,res){

  let itemName =req.body.newItem;
  let listName=req.body.list;

  const item= new Item({
    name:itemName
  });
  if(listName==="Today"){
  
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name : listName})
    .then(function(result){
      result.items.push(item);
      result.save();
      res.redirect("/"+listName);
    })
  }

});


app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listCheck=req.body.listname;

  if(listCheck==="Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(()=>{
      res.redirect("/")
    })
    .catch(function(err){
      console.log(err);
    });
  }
  else {
    List.findOneAndUpdate({name: listCheck}, {$pull: {items: {_id: checkedItemId}}})
    .then(function (foundList)
      {
        res.redirect("/" + listCheck);
      });
  }

 
})


app.get("/:customListname",function(req,res){
  const customListname= _.capitalize(req.params.customListname);
 
  

  List.findOne({name: customListname})
  .then(function(result){
    if(!result){
      const list =new List({
        name:customListname,
        items:defItems
      });
      list.save();//Create New list
      res.redirect("/"+customListname);
    }
    else{
      //Existing List
      res.render("list",{listTitle:result.name, newListItem:result.items})
    }
    
  })
  .catch(function(err){
    console.log(err);
  });

  
})


app.get("/about",function(req,res){
  res.render("about");
})

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
}