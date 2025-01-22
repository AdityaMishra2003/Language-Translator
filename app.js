const express = require('express');
const bodyParser = require('body-parser');
const { Translate } = require('@google-cloud/translate').v2;
require("dotenv").config();
const { insertTranslation, getTranslationHistory } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Google Cloud Translate
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const translate = new Translate({
    credentials: CREDENTIALS,
    projectId: CREDENTIALS.project_id
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index', { translatedText: '' });
});

app.post('/translate', async (req, res) => {
    try {
        const { inputLanguage, outputLanguage, inputText } = req.body;
        
        // Detect input language
        const detectedLanguage = await detectLanguage(inputText);
        if (detectedLanguage === 0) {
            console.error('Error detecting language');
            return res.status(500).send('Error detecting language');
        }
        
        // Translate text
        const translatedText = await translateText(inputText, outputLanguage);
        if (translatedText === 0) {
            console.error('Error translating text');
            return res.status(500).send('Error translating text');
        }

        // Insert translation into the database
        insertTranslation(inputText, translatedText);

        res.render('index', { translatedText });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});

// Endpoint to fetch translation history
app.get('/history', (req, res) => {
    getTranslationHistory((error, history) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching history' });
        }
        res.json(history);
    });
});

// Helper function to detect language
async function detectLanguage(text) {
    try {
        const [result] = await translate.detect(text);
        return result.language;
    } catch (error) {
        console.error('Error detecting language:', error);
        return 0;
    }
}

// Helper function to translate text
async function translateText(text, targetLanguage) {
    try {
        const [translation] = await translate.translate(text, targetLanguage);
        return translation;
    } catch (error) {
        console.error('Error translating text:', error);
        return 0;
    }
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
