const express = require('express');
const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it');

const app = express();
const folderPath = './content'; // Update with the path to your folder containing the Markdown files

app.use(express.static('public')); // Serve static files from the 'public' directory

// Create a new instance of markdown-it
const md = new markdownIt();

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
        const links = markdownFiles.map(file => {
          const title = file.replace('.md', '').replace(/-/g, ' '); // Remove the '.md' extension from the filename
          return `<li><a href="/${title}">${title}</a></li>`;
        });

    // Generate the HTML page
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Markdown Pages</title>
        <style>
        body {
        	background: #151515 ;
        	color: navajowhite ;
        	max-width: 850px ;
        	margin: auto ;
        	padding: 0 16px ;
        	margin-bottom: 5px ;
        	scrollbar-color: gray #151515;
        	font-family: sans-serif ;
        }

        ::-webkit-scrollbar {
        	width: .66vw;
        	background-color: #151515;
        }
        ::-webkit-scrollbar-thumb {
        	background-color: gray;
        	border-radius: 5px;
        }

        a {
        	color: gold ;
        	text-decoration: none ;
        	padding-top: 10px;
        	font-size: 24;
        }

        #tagcloud {
        	list-style: none ;
        	text-align: center ;
        	padding: 0 ;
        }

        #tagcloud li {
        	display: inline-block ;
        }

        #tagcloud a {
        	margin: .1em .25em ;
        }

        a:visited {
        	color: darkgoldenrod ;
        }

        a:hover {
        	color: beige ;
        	text-decoration: underline;
        }

        h1 {
        	border-style: solid ;
        	border-width: 0px 0px 2px 0px ;
        	text-align: center ;
        }

        h2 {
        	color: tomato ;
        	text-align: center ;
        }


        img {
        	max-width: 90% ;
        	max-height: 400px ;
        	margin: auto ;
        	display: block ;
        }

        code {
        	overflow-wrap: break-word ;
        	color: lime ;
        }

        .taglist {
        	text-align: center ;
        	margin-bottom: 2em ;
        	margin-top: 2em ;
        }

        img[alt="BTC Logo"],
        img[alt="ETH Logo"],
        img[alt="XMR Logo"] {
        	max-width: 1em ;
        	max-height: 1em ;
        	display: inline ;
        }

        @media (pointer: coarse) {
        	li > a {
        	    display: inline-block;
        		padding: 0.2em 0;
        	}
        }

        @media print {
        	a[href] {
        		text-decoration: none ;
        		color: black ;
        	}

        	footer,.taglist { display: none ; }

        	body {
        		margin: 0;
        	}


        }

        .older-article {
        	display: none ;
        }

        .hidden {
        	display: none !important ;
        }

        #artlist {
        	font-size: large ;
        }

        #artlist li {
        	padding: .25em ;
        }

        @media (min-width: 55em) {
        	#artlist { column-count: 2 ;}
        }

        @media (min-width: 100em) {
        	#artlist { column-count: 3 ;}
        }


        input#search {
          all: unset;
          background: #222;
          color: #fff;
          padding: 0.7rem 1rem;
          border-radius: 5px;
          width: 100%;
        }

        .search {
          width: 400px;
          max-width: 85vw;
          position: relative;
          margin: 0.5rem auto 1.2rem;
          display: flex;
        }

        button#clear-search {
          all: unset;
          position: absolute;
          right: 4px;
          top: 5px;
          height: 30px;
          width: 30px;
          color: #888;
          cursor: pointer;
          transition: color 180ms ease-in-out;
        }
        button#clear-search:hover {
          color: #eee;
        }


        .matched-recipe {
        	font-size: x-large ;
        	display: list-item !important ;
        }

        .list-searched {
        	column-count: 1 !important ;
        	list-style: decimal ;
        	max-width: 600px ;
        	margin: auto ;
        }

        .qr {
            max-height: 150px; ;
        	padding-top: 10px;
        	padding-bottom: 10px;
        }

        .js-only { display: none ; }

        /* Two-column layout */
        ul {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-gap: 20px;
          list-style-type: none;
        }

        </style>
      </head>
      <body>
      <center>  <h1>🍲 Recipe Book🍳</h1></center>
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
  const tempfilename = `${filename}.md`
  const actualfilename = tempfilename.replace(/ /g, '-');
  fs.readFile(path.join(folderPath, `${actualfilename}`), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading Markdown file');
    }

    // Find the index of the line that contains '---' indicating the end of the ignored section
    const endMarker = '---';
    const endIndex = data.indexOf(endMarker, 4); // Start searching from index 4 to skip the initial '---'

    if (endIndex === -1) {
      // If the end marker is not found, show the entire content
      return res.send(generateHtml(filename, data));
    }

    const content = data.slice(endIndex + endMarker.length).trim();

    // Convert Markdown to HTML using markdown-it
    const convertedHtml = md.render(content);

    // Generate the HTML page
    const html = generateHtml(filename, convertedHtml);

    res.send(html);
  });
});

function generateHtml(filename, content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
      body {
      	background: #151515 ;
      	color: navajowhite ;
      	max-width: 850px ;
      	margin: auto ;
      	padding: 0 16px ;
      	margin-bottom: 5px ;
      	scrollbar-color: gray #151515;
      	font-family: sans-serif ;
      }

      ::-webkit-scrollbar {
      	width: .66vw;
      	background-color: #151515;
      }
      ::-webkit-scrollbar-thumb {
      	background-color: gray;
      	border-radius: 5px;
      }

      a {
      	color: gold ;
      	text-decoration: none ;
      	padding-top: 10px;
      	font-size: 24;
      }

      #tagcloud {
      	list-style: none ;
      	text-align: center ;
      	padding: 0 ;
      }

      #tagcloud li {
      	display: inline-block ;
      }

      #tagcloud a {
      	margin: .1em .25em ;
      }

      a:visited {
      	color: darkgoldenrod ;
      }

      a:hover {
      	color: beige ;
      	text-decoration: underline;
      }

      h1 {
      	border-style: solid ;
      	border-width: 0px 0px 2px 0px ;
      	text-align: center ;
      }

      h2 {
      	color: tomato ;
      	text-align: center ;
      }


      img {
      	max-width: 90% ;
      	max-height: 400px ;
      	margin: auto ;
      	display: block ;
      }

      code {
      	overflow-wrap: break-word ;
      	color: lime ;
      }

      .taglist {
      	text-align: center ;
      	margin-bottom: 2em ;
      	margin-top: 2em ;
      }

      img[alt="BTC Logo"],
      img[alt="ETH Logo"],
      img[alt="XMR Logo"] {
      	max-width: 1em ;
      	max-height: 1em ;
      	display: inline ;
      }

      @media (pointer: coarse) {
      	li > a {
      	    display: inline-block;
      		padding: 0.2em 0;
      	}
      }

      @media print {
      	a[href] {
      		text-decoration: none ;
      		color: black ;
      	}

      	footer,.taglist { display: none ; }

      	body {
      		margin: 0;
      	}


      }

      .older-article {
      	display: none ;
      }

      .hidden {
      	display: none !important ;
      }

      #artlist {
      	font-size: large ;
      }

      #artlist li {
      	padding: .25em ;
      }

      @media (min-width: 55em) {
      	#artlist { column-count: 2 ;}
      }

      @media (min-width: 100em) {
      	#artlist { column-count: 3 ;}
      }


      input#search {
        all: unset;
        background: #222;
        color: #fff;
        padding: 0.7rem 1rem;
        border-radius: 5px;
        width: 100%;
      }

      .search {
        width: 400px;
        max-width: 85vw;
        position: relative;
        margin: 0.5rem auto 1.2rem;
        display: flex;
      }

      button#clear-search {
        all: unset;
        position: absolute;
        right: 4px;
        top: 5px;
        height: 30px;
        width: 30px;
        color: #888;
        cursor: pointer;
        transition: color 180ms ease-in-out;
      }
      button#clear-search:hover {
        color: #eee;
      }


      .matched-recipe {
      	font-size: x-large ;
      	display: list-item !important ;
      }

      .list-searched {
      	column-count: 1 !important ;
      	list-style: decimal ;
      	max-width: 600px ;
      	margin: auto ;
      }

      .qr {
          max-height: 150px; ;
      	padding-top: 10px;
      	padding-bottom: 10px;
      }

      .js-only { display: none ; }

      </style>
    </head>
    <body>
      <h1>${filename}</h1>
      ${content}
    </body>
    </html>
  `;
}

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
