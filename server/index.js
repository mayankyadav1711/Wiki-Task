// Import required modules
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require("cors");

// Create an Express application
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "https://wikiloop.vercel.app",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Enable JSON parsing for incoming requests
app.use(express.json());

app.get("/", (req, res) => {
  res.json("Welcome to Wiki Loop");
});

// Cache to store visited URLs and their corresponding first links
const cache = new Map();

// Axios instance with common configurations
const axiosInstance = axios.create({
  // Add your common configurations here, like headers
});

// Function to get the first valid link from a given URL
const getFirstValidLink = async (url) => {
  try {
    // Fetch HTML content from the URL
    const response = await axiosInstance.get(url);

    const $ = cheerio.load(response.data);
    const mainContent = $('#mw-content-text');

    // Find the first non-parenthesized, non-italicized link in the main content (normal ones only)
    const firstLink = mainContent
      .find('p > a:not(:has(span[style="font-style:italic"]), span[style="font-style:italic"])')
      .first();

    // If no valid link found, return null
    if (firstLink.length === 0) {
      return null;
    }

    // Extract the href attribute of the link
    const href = firstLink.attr('href');
    
    // Cache the result for future use
    cache.set(url, href);

    return href;
  } catch (error) {
    // Handle errors, e.g., if the link is not valid or the page structure changes
    if (error.code === 'ENOTFOUND') {
      throw new Error('Invalid URL. Please enter a valid Wikipedia URL.');
    } else {
      throw error;
    }
  }
};




// Function to follow Wikipedia loop starting from a given URL
const followWikipediaLoop = async (startUrl) => {
  const startTime = performance.now(); // Measure start time
  const visitedPages = [];
  let currentUrl = startUrl;

  // Loop until a break condition is met
  while (true) {
    try {
      // Get the first valid link from the current URL
      const firstLink = await getFirstValidLink(`https://en.wikipedia.org${currentUrl}`);

      // If no valid link found, break the loop
      if (!firstLink) {
        break;
      }

      // Check for infinite loop by comparing with visited pages(resolving dead end cases which will never lead to philosophy page)
      if (visitedPages.includes(currentUrl)) {
        return { infiniteLoop: true, timeTaken: performance.now() - startTime }; // Measure end time
      }

      // Add the current URL to the visited pages
      visitedPages.push(currentUrl);

      // Fetch content of the next page
      const nextPage = await axiosInstance.get(`https://en.wikipedia.org${firstLink}`);
      currentUrl = firstLink;

      // Check if we reached the "Philosophy" page
      if (nextPage.data.includes('<title>Philosophy')) {
        visitedPages.push('/wiki/Philosophy');
        break;
      }
    } catch (error) {
      // Handle errors, e.g., if the link is not valid or the page structure changes
      if (error.response && error.response.status === 404) {
        throw new Error('Page not found. Please enter a valid Wikipedia URL.');
      } else {
        throw error;
      }
    }
  }

  // Return the result including visited pages, steps, and infinite loop flag
  return { visitedPages, steps: visitedPages.length - 1, infiniteLoop: false, timeTaken: performance.now() - startTime }; // Measure end time
};



// API endpoint to start the Wikipedia loop
app.post('/api/wikipedia', async (req, res) => {
  try {
    const { url } = req.body;
    const result = await followWikipediaLoop(url);

    // Send the result, including the infiniteLoop flag, to the frontend
    res.json(result);
  } catch (error) {
    // Log and handle errors
    console.error(error);

    // Customize the error response based on the error message
    res.status(400).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
