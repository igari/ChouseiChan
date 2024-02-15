import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

// Enable CORS
app.use(
  cors({
    origin: 'http://example.com',
  })
);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
