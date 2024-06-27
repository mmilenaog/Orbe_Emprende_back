const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // 
  password: '', // 
  database: 'orbe2_db' //
});

// Conexión a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    throw err;
  }
  console.log('Conexión a la base de datos MySQL establecida');
});


app.get('/', (req, res) => {
  res.send('Bienvenidos a Orbe_Emprende');
});

app.post('/api/login', (req, res) => {
  const { correoElectronico, contrasena } = req.body;

  const sql = 'SELECT * FROM usuario2 WHERE correoElectronico = ? AND contrasena = ?';
  db.query(sql, [correoElectronico, contrasena], (err, results) => {
    if (err) {
      console.error('Error al buscar usuario en la base de datos:', err);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = results[0];
    
    // Envía la respuesta de éxito
    res.status(200).json({
      id: user.id,
      nombreCompleto: user.nombreCompleto,
      correoElectronico: user.correoElectronico
    });
  });
});

app.get('/api/users/me', (req, res) => {
  const { correoElectronico } = req.query; 

  if (!correoElectronico) {
    return res.status(400).json({ message: 'Correo electrónico es requerido' });
  }

  const sql = 'SELECT id, nombreCompleto, correoElectronico FROM usuario2 WHERE correoElectronico = ?';
  db.query(sql, [correoElectronico], (err, results) => {
    if (err) {
      console.error('Error al buscar usuario en la base de datos:', err);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = results[0];
    res.status(200).json(user);
  });
});

// Ruta para obtener todos los usuarios (READ)
app.get('/api/users', (req, res) => {
  const sql = 'SELECT * FROM usuario2';
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error interno del servidor al obtener usuarios' });
    } else {
      res.status(200).json(result);
    }
  });
});

// Ruta para crear un nuevo usuario (CREATE)
app.post('/api/users', (req, res) => {
  const {
    nombreCompleto,
    localidad,
    nacionalidad,
    direccion,
    tipoDocumento,
    numeroDocumento,
    telefono,
    correoElectronico,
    contrasena
  } = req.body;

  if (!nombreCompleto || !localidad || !nacionalidad || !direccion || !tipoDocumento || !numeroDocumento || !telefono || !correoElectronico || !contrasena) {
    console.error('Datos faltantes:', req.body);
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const sql = 'INSERT INTO usuario2 (nombreCompleto, localidad, nacionalidad, direccion, tipoDocumento, numeroDocumento, telefono, correoElectronico, contrasena) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [nombreCompleto, localidad, nacionalidad, direccion, tipoDocumento, numeroDocumento, telefono, correoElectronico, contrasena], (err, result) => {
    if (err) {
      console.error('Error al crear usuario:', err);
      return res.status(500).json({ message: 'Error al crear usuario' });
    }
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  });
});

// Ruta para actualizar un usuario por su ID (UPDATE)
app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const {
    nombreCompleto,
    localidad,
    nacionalidad,
    direccion,
    tipoDocumento,
    numeroDocumento,
    telefono,
    correoElectronico,
    contrasena
  } = req.body;

  const updateUser = {
    nombreCompleto,
    localidad,
    nacionalidad,
    direccion,
    tipoDocumento,
    numeroDocumento,
    telefono,
    correoElectronico,
    contrasena
  };

  const sql = 'UPDATE usuario2 SET ? WHERE id = ?';
  db.query(sql, [updateUser, userId], (err, result) => {
    if (err) {
      console.error('Error al actualizar usuario:', err);
      res.status(500).json({ message: 'Error interno del servidor al actualizar usuario' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
    } else {
      console.log('Resultado de la actualización:', result);
      res.status(200).json({ message: 'Usuario actualizado exitosamente', datosActualizados: updateUser });
    }
  });
});

// Ruta para eliminar un usuario por su ID (DELETE)
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM usuario2 WHERE id = ?';
  
  db.query(sql, userId, (err, result) => {
    if (err) {
      console.error('Error al eliminar usuario:', err);
      return res.status(500).json({ message: 'Error interno del servidor al eliminar usuario' });
    }
    if (result.affectedRows === 0) {
      console.log('Usuario no encontrado con ID:', userId);
      return res.status(404).json({ message: `No se encontró usuario con ID ${userId}` });
    }
    console.log('Resultado de la eliminación:', result);
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  });
});

// Puerto donde escucha el servidor
const PORT = 3050;
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en puerto ${PORT}`);
});