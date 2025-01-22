const mysql = require('mysql');
require("dotenv").config();

// MySQL connection configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Insert translation into the database
function insertTranslation(inputText, translatedText) {
    pool.query('INSERT INTO translations (inputText, translatedText) VALUES (?, ?)', [inputText, translatedText], (error, results) => {
        if (error) {
            console.error('Error inserting translation:', error);
        }
    });
}

// Fetch translation history from the database
function getTranslationHistory(callback) {
    pool.query('SELECT inputText, translatedText FROM translations', (error, results) => {
        if (error) {
            console.error('Error fetching history:', error);
            return callback(error, null);
        }
        callback(null, results);
    });
}

module.exports = {
    insertTranslation,
    getTranslationHistory
};
