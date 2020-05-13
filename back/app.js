const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
require('dotenv').config();
const database = require('./conf');
const bcrypt = require('bcrypt');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware para no tener problemas con los CORS cuando hagamos peticiones a nuestra API en Heroku
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

//RUTA JSON DE PAJITA
app.get('/', (req, res) => {
  database.query('SELECT * FROM places', (error, results) => {
    if (error) {
      console.log(error);
      res.status(404).send(error);
    } else {
      console.log(results);
      res.status(200).send(results);
    }
  })
})

//Ruta Register darse de alta
app.post('/register', async (req, res)=>{
  let errors = [];

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const profile_image = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"

  //-----Errores----

  //---1.Sin campos vacíos---//
  if(!email || !name || !password || !confirmPassword){
    errors.push({msg: "Faltan campos por rellenar"})
  }

  //---2.Contraseña corta
  if(password.length < 6){
    errors.push({msg: "La contraseña tiene que tener al menos 6 caracteres"})
  }

  //---3.Contraseñas iguales??
  if(password !== confirmPassword){
    errors.push({msg:"Las contraseñas no coinciden"})
  }

  //---4.Comprobar que el email tenga "@"
  if(!email.includes("@")){
    errors.push({msg:"Email incorrecto"})
  }

  if(errors.length > 0){
    res.send(errors)
  }else{
    const hashedPassword = await bcrypt.hash(password ,5)
    const validatedBody = {
      name: name,
      password: hashedPassword,
      email: email,
      profile_image: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
  }

    database.query('INSERT INTO users SET ?', validatedBody, (error, results)=>{
      !error
      ? res.send('Usuario creado con éxito')
      : res.send(error)
    })
  }
})


//ABRIMOS PUERTO
app.listen(PORT, () => {
  console.log(`Conectado servidor en puerto ${PORT}`)
})

