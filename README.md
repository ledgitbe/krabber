# krabber

Easy to use webscraper using Axios and JSDOM.

[![Codecov branch](https://img.shields.io/codecov/c/gitlab/ledgit/krabber/master)](https://codecov.io/gl/ledgit/krabber)
[![Gitlab pipeline status (branch)](https://img.shields.io/gitlab/pipeline/ledgit/krabber/master)](https://gitlab.com/ledgit/krabber/pipelines)
[![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/krabber)](https://libraries.io/npm/krabber)
[![npm](https://img.shields.io/npm/v/krabber)](https://www.npmjs.com/package/krabber)

## Example

```javascript
import { Scrape } from 'krabber';

const scrapeConfig = {
    url: 'https://github.com/axios/axios',
    options: {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:64.0) Gecko/20100101 Firefox/64.0' }
    },
    select: {
        numberOfCommits: ({ dom, res, prev, url }) => {
            return dom.querySelector('.commits span.text-emphasized.num').innerHTML.trim();
        }
    }
}

Scrape(scrapeConfig)
    .then((res) => {
        console.log(res.numberOfCommits);
    })
```

## More examples, including pagination handling

Please see the test suite in [src/lib/scrape.spec.ts](src/lib/scrape.spec.ts)
