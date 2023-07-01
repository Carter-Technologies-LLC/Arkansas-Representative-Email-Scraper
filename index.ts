import fs from 'fs';
import fetch from 'isomorphic-fetch';
import cheerio from 'cheerio';

async function scrapeEmails(url: string): Promise<string[]> {
  const response = await fetch(url);
  const html = await response.text();

  const $ = cheerio.load(html);
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const foundEmails: string[] = [];

  $('body').find('a[href^="mailto:"]').each((_, element) => {
    const email = $(element).attr('href');
    if (email) {
      const emailAddress = email.replace(/^mailto:/i, '');
      foundEmails.push(emailAddress);
    }
  });

  $('body').text().match(emailRegex)?.forEach((email) => {
    foundEmails.push(email);
  });

  return foundEmails;
}

const targetURL = 'https://www.arkleg.state.ar.us/Legislators/List';
scrapeEmails(targetURL)
  .then((emails) => {
    const filePath = './emails.txt';
    const emailString = emails.join('\n');
    fs.writeFile(filePath, emailString, (err) => {
      if (err) {
        console.error('Error saving emails to file:', err);
      } else {
        console.log(`Emails saved to ${filePath}`);
      }
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
