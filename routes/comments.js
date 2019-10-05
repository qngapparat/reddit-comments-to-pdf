var express = require('express');
var router = express.Router();
var path = require('path')
const fetch = require('node-fetch')
const json2md = require('json2md')
const { Remarkable } = require('remarkable');
var conversion = require("phantom-html-to-pdf")();
const fs = require('fs')

json2md.converters.head = (input, json2md) => `<div class="head"><h3>${ input }</h3></div>`;
json2md.converters.meta = (input, json2md) => `<div class="meta"><b>${ input }</b></div>`;
json2md.converters.post = (input, json2md) => `<div class="post"><p>${ input }</p></div>`;

function fetchCommentsJSON(author, limit = 1000) {
    var url = `https://api.pushshift.io/reddit/comment/search?author=${ author }&limit=${ limit }`
    return fetch(url,
        { method: 'get',
          headers: { 'Content-Type': 'application/json'}
        }
    )
}

function JSONtoMD(post){
  let dateStr = ""
  try {
    dateStr = new Date(post.created_utc * 1000).toDateString()
  } catch(e) { }

  const formatted = [
      { head: post.permalink },
      { meta: `${post.author} | ${ dateStr }`},
      { post: json2md(post.body
          .replace(/-\n/g, "\n")
          .replace(/[“”]/g,"\"")
          .replace(/’/g, "'")
          )
      }
  ]
  return json2md(formatted)
}

function CommentsJSONtoMD(jsons) {
  const md = jsons
        .map(d => JSONtoMD(d))
        .join('\n---\n')
  return md;
}

function MDtoHTML(md) {
  return new Remarkable({ html: true})
    .render(md)
}

function HTMLtoPDF2(html, fname, resp){
    conversion({ html: html }, (err, pdf) => {
      if(err){
        resp.status(500).send("<h1>Oops!</h1>");
        return;
      }
      resp.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${ fname }`
      })
      pdf.stream.pipe(resp)
    })
}

router.get('/', function(req, resp, next) {
  if(!req.query.author){
    resp.status(400).send("Must specify author")
  }
  const fname = `${ req.query.author }-comments.pdf`;
  const mdStyle = fs.readFileSync(path.join(__dirname, 'markdown-style.css'), 'utf8')

  fetchCommentsJSON(req.query.author)
    .then(res => res.json())
    .then(json => json.data)
    .then(CommentsJSONtoMD)
    .then(MDtoHTML)
    .then(html => `<style>${ mdStyle }</style>` + html)
    .then(html => HTMLtoPDF2(html, fname, resp))
    .catch(e => { 
      resp.status(500).send("<h1>Oops! Something went wrong on our side</h1>");
    })
});

module.exports = router;
