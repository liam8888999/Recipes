const express = require('express');
const fs = require('fs');
const path = require('path');
const marked = require('marked');

const app = express();
const folderPath = './content'; // Update with the path to your folder containing the Markdown files

app.use(express.static('public')); // Serve static files from the 'public' directory

// Route to handle the list of Markdown files
app.get('/', (req, res) => {
  // Read the contents of the folder
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading folder contents');
    }

    // Filter only the Markdown files
    const markdownFiles = files.filter(file => path.extname(file) === '.md');

    // Create a list of HTML links
    const links = markdownFiles.map(file => `<li><a href="/${file}">${file}</a></li>`);

    // Generate the HTML page
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Markdown Pages</title>
      </head>
      <body>
        <h1>List of Markdown Pages</h1>
        <ul>${links.join('')}</ul>
      </body>
      </html>
    `;

    res.send(html);
  });
});

// Route to serve individual Markdown files as HTML
app.get('/:filename', (req, res) => {
  const { filename } = req.params;

  // Read the content of the Markdown file
  fs.readFile(path.join(folderPath, filename), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading Markdown file');
    }

    // Convert Markdown to HTML
    const convertedHtml = marked(data);

    // Generate the HTML page
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${filename}</title>
      </head>
      <body>
        <h1>${filename}</h1>
        ${convertedHtml}
      </body>
      </html>
    `;

    res.send(html);
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
