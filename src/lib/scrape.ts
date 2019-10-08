import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import cleanDeep from 'clean-deep';
import { JSDOM } from 'jsdom';

export interface ScrapeConfig {
  url: URL;
  select: {
    [key: string]: any | ((arg: SelectArguments) => any);
  };
  options?: AxiosRequestConfig;
  axiosInstance?: AxiosInstance;
  paginate?: {
    next: (arg: SelectArguments) => URL | false;
    map?: (
      arg: SelectArguments
    ) => (pageResult: any, currentIndex?: number) => any;
    reduce?: (
      arg: SelectArguments
    ) => (
      accumulator: any,
      currentValue: any,
      currentIndex?: number,
      array?: any[]
    ) => any;
  };
}

export interface SelectArguments {
  dom: any;
  res: any;
  prev: any;
  url: string;
}

export type URL = string;

export function Scrape(config: ScrapeConfig) {
  let ax: AxiosInstance;
  const pageResults: any[] = [];
  let finalResult: any;

  if (!config.url) {
    throw new Error('url is required');
  }

  if (config.axiosInstance) {
    ax = config.axiosInstance;
  } else {
    ax = axios.create({
      transformResponse: data => new JSDOM(data)
    });
  }

  const { select, paginate, options } = config;
  const originalUrl = config.url;

  async function _scrape(url: string, prev: any): Promise<any> {
    const response = await ax(url, options);
    const dom = response.data.window.document;
    let res: any = {};

    for (const key in select) {
      // tslint:disable-next-line: prefer-conditional-expression
      if (typeof select[key] === 'function') {
        res[key] = await select[key]({ dom, res, prev, url });
      } else {
        res[key] = select[key];
      }
    }

    res = cleanDeep(res);

    if (paginate) {
      pageResults.push(res);

      const args = { dom, res, prev, url };

      const next = await paginate.next(args);
      if (next) {
        return _scrape(next, res);
      }

      const { map, reduce } = paginate;
      if (map) {
        finalResult = pageResults.map(map(args));
      }
      if (reduce && map) {
        finalResult = finalResult.reduce(reduce(args), null);
      }
      if (reduce && !map) {
        finalResult = pageResults.reduce(reduce(args), null);
      }

      if (finalResult) {
        return finalResult;
      }

      return pageResults;
    }

    return res;
  }

  return _scrape(originalUrl, {});
}
