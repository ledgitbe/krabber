import test from 'ava';
import Scrape, { ScrapeConfig, SelectArguments } from './scrape';

test.cb('scrape can correctly scrape example.com', t => {
  t.plan(3);

  const scrapeConfig: ScrapeConfig = {
    url: 'http://www.example.com',
    select: {
      pageH1: ({ dom }: SelectArguments) => {
        return dom.querySelector('h1').innerHTML;
      },
      pageTitle: ({ dom }: SelectArguments) => {
        return dom.title;
      },
      linkUrl: ({ dom }: SelectArguments) => {
        return dom.querySelector('a').href;
      }
    }
  };

  Scrape(scrapeConfig).then((res: any) => {
    t.is(res.pageH1, 'Example Domain');
    t.is(res.pageTitle, 'Example Domain');
    t.is(res.linkUrl, 'http://www.iana.org/domains/example');
    t.end();
  });
});

// TODO: test pagination
