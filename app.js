const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// MongoDB Atlas URI
const uri = process.env.MONGODB_URI || 'mongodb+srv://vicente:vce.neira12@cluster0.ojt4bpw.mongodb.net/juegos?retryWrites=true&w=majority';
const client = new MongoClient(uri);

// Multer para subir archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

let collection;

// Ruta de prueba para obtener todos los datos
app.get('/api/datos2', async (req, res) => {
  if (!collection) return res.status(503).json({ error: 'Base de datos no disponible aún' });

  try {
    const datos = await collection.find({}).toArray();
    res.json(datos);
  } catch (err) {
    console.error('❌ Error en /api/gatos:', err);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Inicio</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        h1 {
          color: #333;
        }
      </style>
    </head>
    <body>
      <h1>✅ Servidor funcionando correctamenteeeee</h1>
    </body>
    </html>
  `);
});


async function startServer() {
  try {
    await client.connect();
    const db = client.db('juegos');
    collection = db.collection('top_normal');

    // Elimina documentos que no tienen rank válido
    await collection.deleteMany({ rank: { $in: [null, undefined] } });

    // Aplica índice único
    await collection.createIndex({ rank: 1 }, { unique: true });

    console.log('✅ Índice único aplicado a "rank"');
    console.log('✅ Conectado a MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error al conectar con MongoDB:', err);
  }
}


startServer();
