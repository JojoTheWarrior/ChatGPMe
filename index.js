import express from 'express';
import defang from 'defang';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000

// function for when user sends their typed response
app.get('/compare', async(req, res) => {
    const {userResponse} = req.query;

    if (!userResponse)
        return res.status(400).json({ error: "user response is missing!"});

    // uses defang to sanitize input
    const defangedResponse = defang(userResponse);
})