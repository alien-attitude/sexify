import express from 'express'
import classify from './classify.js'
import {errorResponse} from './classify.js'
const app = express();
const PORT = process.env.PORT || 3000;


// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {res.sendStatus(204)}
    next();
})

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    endpoints: ['/api/classify?name={name}'],
  });
});

// GET api/classify
app.get('/api/classify', classify)

// 404- catch all
app.use((req, res) => errorResponse(res, 404, "Not Found"))

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));