import test from 'ava';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Scrape, ScrapeConfig, SelectArguments } from './scrape';

test('scrape will throw error when url is not provided', async (t) => {
  t.plan(2);

  const scrapeConfig = {
    select: {
      pageH1: ({ dom }: SelectArguments) => {
        return dom.querySelector('h1').innerHTML;
      },
      pageTitle: ({ dom }: SelectArguments) => {
        return dom.title;
      },
      linkUrl: ({ dom }: SelectArguments) => {
        return dom.querySelector('a').href;
      },
    },
  };

  const err = await t.throws(() =>
    Scrape((scrapeConfig as unknown) as ScrapeConfig)
  );
  t.is(err.message, 'url is required');
});

test.cb('scrape can use a custom axios instance without problems', (t) => {
  t.plan(3);

  const customAxiosInstance = axios.create({
    transformResponse: (data) => new JSDOM(data),
  });

  const scrapeConfig: ScrapeConfig = {
    url: 'http://www.example.com',
    axiosInstance: customAxiosInstance,
    select: {
      pageH1: ({ dom }: SelectArguments) => {
        return dom.querySelector('h1').innerHTML;
      },
      pageTitle: ({ dom }: SelectArguments) => {
        return dom.title;
      },
      linkUrl: ({ dom }: SelectArguments) => {
        return dom.querySelector('a').href;
      },
      simpleAttribute: 'Testing',
    },
  };

  Scrape(scrapeConfig).then((res: any) => {
    t.is(res.pageH1, 'Example Domain');
    t.is(res.pageTitle, 'Example Domain');
    t.is(res.linkUrl.includes('iana'), true);
    t.end();
  });
});

test.cb('scrape can correctly scrape example.com', (t) => {
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
      },
    },
  };

  Scrape(scrapeConfig).then((res: any) => {
    t.is(res.pageH1, 'Example Domain');
    t.is(res.pageTitle, 'Example Domain');
    t.is(res.linkUrl.includes('iana'), true);
    t.end();
  });
});

test.cb('can correcly scrape with pagination', (t) => {
  t.plan(5);

  const scrapeConfig: ScrapeConfig = {
    url: 'http://www.example.com',
    select: {
      pageNumber: ({ prev }: SelectArguments) => {
        return prev.pageNumber ? prev.pageNumber + 1 : 1;
      },
      pageH1: ({ dom }: SelectArguments) => {
        return dom.querySelector('h1').innerHTML;
      },
    },
    paginate: {
      next: ({ res }) => {
        if (res.pageNumber > 3) {
          return false;
        }
        return `http://www.example.com/?pageNumber=${res.pageNumber}`;
      },
    },
  };

  Scrape(scrapeConfig)
    .then((res: any) => {
      t.is(Array.isArray(res), true);
      t.is(res.length, 4);
      t.is(res[0].pageNumber, 1);
      t.is(res[3].pageNumber, 4);
      t.is(res[2].pageH1, 'Example Domain');
      t.end();
    })
    .catch(() => {
      t.fail();
    });
});

test.cb('can correcly scrape with pagination and map', (t) => {
  t.plan(3);

  const scrapeConfig: ScrapeConfig = {
    url: 'http://www.example.com',
    select: {
      pageNumber: ({ prev }: SelectArguments) => {
        return prev.pageNumber ? prev.pageNumber + 1 : 1;
      },
      pageH1: ({ dom }: SelectArguments) => {
        return dom.querySelector('h1').innerHTML;
      },
    },
    paginate: {
      next: ({ res }) => {
        if (res.pageNumber > 3) {
          return false;
        }
        return `http://www.example.com/?pageNumber=${res.pageNumber}`;
      },
      map: () => (pageResult: any) =>
        pageResult.pageH1.split('').reverse().join(''),
    },
  };

  Scrape(scrapeConfig)
    .then((res: any) => {
      t.is(Array.isArray(res), true);
      t.is(res.length, 4);
      t.deepEqual(res, [
        'niamoD elpmaxE',
        'niamoD elpmaxE',
        'niamoD elpmaxE',
        'niamoD elpmaxE',
      ]);
      t.end();
    })
    .catch(() => {
      t.fail();
    });
});

test.cb('can correcly scrape with pagination and reduce', (t) => {
  t.plan(1);

  const scrapeConfig: ScrapeConfig = {
    url: 'http://www.example.com',
    select: {
      pageNumber: ({ prev }: SelectArguments) => {
        return prev.pageNumber ? prev.pageNumber + 1 : 1;
      },
      pageH1: ({ dom }: SelectArguments) => {
        return dom.querySelector('h1').innerHTML;
      },
    },
    paginate: {
      next: ({ res }) => {
        if (res.pageNumber > 3) {
          return false;
        }
        return `http://www.example.com/?pageNumber=${res.pageNumber}`;
      },
      // tslint:disable-next-line: variable-name
      reduce: () => (final: any, pageResult: any) => {
        if (final) {
          return { total: final.total + pageResult.pageNumber };
        } else {
          return { total: pageResult.pageNumber };
        }
      },
    },
  };

  Scrape(scrapeConfig)
    .then((res: any) => {
      t.is(1 + 2 + 3 + 4, res.total);
      t.end();
    })
    .catch(() => {
      t.fail();
    });
});

test.cb('can correcly scrape with pagination and map and reduce', (t) => {
  t.plan(1);

  const scrapeConfig: ScrapeConfig = {
    url: 'http://www.example.com',
    select: {
      pageNumber: ({ prev }: any) => {
        return prev.pageNumber ? prev.pageNumber + 1 : 1;
      },
      pageH1: ({ dom }: SelectArguments) => {
        return dom.querySelector('h1').innerHTML;
      },
    },
    paginate: {
      next: ({ res }) => {
        if (res.pageNumber > 3) {
          return false;
        }
        return `http://www.example.com/?pageNumber=${res.pageNumber}`;
      },
      map: () => (pageResult: any) => pageResult.pageH1,
      // tslint:disable-next-line: variable-name
      reduce: () => (final: any, pageResult: any) => {
        if (final) {
          return { concatenatedString: final.concatenatedString + pageResult };
        } else {
          return { concatenatedString: pageResult };
        }
      },
    },
  };

  Scrape(scrapeConfig)
    .then((res: any) => {
      t.is(
        res.concatenatedString,
        'Example DomainExample DomainExample DomainExample Domain'
      );
      t.end();
    })
    .catch(() => {
      t.fail();
    });
});
