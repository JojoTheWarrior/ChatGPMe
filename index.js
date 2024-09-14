import express from 'express';
// import defang from 'defang';
import axios from 'axios';
import cohere, { CohereClient } from 'cohere-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// parsing json
app.use(express.json());

// prompt for telling cohere about the project
const preamble =   "I'm making a game where the user is trying to impersonate an AI. Please judge all responses by seeing how similar they are to what an AI would say. \
                        There are four categories of prompts - Grammar, Tone, Word Choice, Length - each scored out of 25 for a total score of 100. A response that's extremely similar to an AI should score 100, while one \
                        that is too 'human' should receive 0 points. For the output, you should output the integer out of 25 for that category, followed by a space, then exactly one short, concise sentence justifying the mark. \
                        As an example, for Grammar, a proper response would be in the format '18 Response contained a comma splice and two mispelled words'. Make sure to start the message with the score.";

const cohereClient = new CohereClient({
    token: `${process.env.COHERE_API_KEY}`
});

// function for when user sends their typed response
app.post('/compare', async(req, res) => {
    console.log(req.body);

    const { respondedPrompt, userResponse } = req.body;

    if (!respondedPrompt)
        return res.status(400).json({ error: "responded prompt is missing!" });

    if (!userResponse)
        return res.status(400).json({ error: "user response is missing!" });

    // uses defang to sanitize input
    const defangedResponse = userResponse;

    try {
        // Make sure `cohereClient.chat` is the correct method for your use case
        const cohereGrammar = await cohereClient.chat({
            message: `${preamble} For this category, only mark the GRAMMAR of this response out of 25. Start at 25 points, and with each significant grammar mistake, deduct some points. 
                    Here is the prompt the user answered: ${respondedPrompt}
                    Here is the user's response: ${defangedResponse}`,
        });

        const cohereGrammarResponse = cohereGrammar.text;

        console.log(cohereGrammarResponse);

        let numIndex = 0;
        while ('0' <= cohereGrammarResponse[numIndex] && cohereGrammarResponse[numIndex] <= '9') numIndex++;

        res.json({
            score: parseInt(cohereGrammarResponse.substring(0, numIndex)),
            feedback: cohereGrammarResponse.substring(numIndex+1),
        });
    } catch (error) {
        res.status(500).json({ error: "error processing the grammar request"});
    }
});

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});