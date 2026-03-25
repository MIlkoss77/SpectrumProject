import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.CRYPTOPANIC_KEY;
console.log(`Testing API Key: ${API_KEY ? 'FOUND' : 'MISSING'}`);

if (!API_KEY) process.exit(1);

const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${API_KEY}&public=true&kind=news`;

axios.get(url)
    .then(res => {
        console.log('SUCCESS!');
        console.log('Count:', res.data.count);
        console.log('First Title:', res.data.results[0]?.title);
    })
    .catch(err => {
        console.error('FAILED!');
        console.error('Status:', err.response?.status);
        console.error('Data:', err.response?.data);
        console.error('Message:', err.message);
    });
