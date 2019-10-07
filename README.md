# krabber

Easy to use webscraper using Axios and JSOM.

## Example

```javascript
import Scrape from 'krabber';

const scrapeConfig = {
    url: 'https://github.com/axios/axios',
    options: {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:64.0) Gecko/20100101 Firefox/64.0' }
    },
    select: {
        numberOfCommits: ({ dom, res, prev, url }) => {
            return dom.querySelector('.commits span.text-emphasized.num').innerText
        }
    }
}

Scrape()
```
