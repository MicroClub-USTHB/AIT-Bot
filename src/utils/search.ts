import axios from 'axios';
import { PackageData, w3schoolsData } from '../@types/searchData';
import { load } from 'cheerio';

class Search {
  static async npmAutoComplete(name: string): Promise<string[]> {
    const data = await axios
      .get(`https://www.npmjs.com/search/suggestions?q=${name}`)
      .then(res => res.data)
      .catch(() => null);

    if (!data) return [];
    const names = data.map((d: { name: string }) => d.name) as string[];
    return names;
  }

  static async npm(name: string): Promise<PackageData | null> {
    const data = await axios
      .get(`https://registry.npmjs.org/${name}`)
      .then(res => res.data)
      .catch(() => null);

    if (!data || data.error) return null;

    const packageData: PackageData = {
      name: data.name,
      description: data.description,
      url: `https://npmjs.com/package/${data.name}`,
      version: data['dist-tags'].latest,
      keywords: data.keywords,
      icon: `https://static-production.npmjs.com/1996fcfdf7ca81ea795f67f093d7f449.png` //npmjs logo
    };
    return packageData;
  }
  static async pypiAutoComplete(name: string): Promise<string[]> {
    const html = await axios
      .get(`https://pypi.org/search/?q=${name}`)
      .then(res => res.data)
      .catch(() => null);

    if (!html) return [];

    const $ = load(html);
    const names = $('span[class=package-snippet__name]')
      .map((_i, a) => $(a).text())
      .toArray() as string[];
    return names;
  }
  static async pypi(name: string): Promise<PackageData | null> {
    const data = await axios
      .get(`https://pypi.org/pypi/${name}/json`)
      .then(res => res.data)
      .catch(() => null);

    if (!data || data.message) return null;

    const packageData: PackageData = {
      name: data.info.name,
      description: data.info.summary,
      url: `https://pypi.org/project/${data.info.name}`,
      version: data.info.version,
      keywords: data.info.keywords.split(','),
      icon: `https://i.pinimg.com/564x/91/9d/4f/919d4f7908c29e21cfeebfd3cbd043b1.jpg` //pypi logo
    };
    return packageData;
  }
  static async cargoAutoComplete(name: string): Promise<string[]> {
    const data = await axios
      .get(`https://crates.io/api/v1/crates?page=1&per_page=25&q=${name}`)
      .then(res => res.data)
      .catch(() => null);

    if (!data) return [];
    const names = data.crates.map((d: { name: string }) => d.name) as string[];
    return names;
  }
  static async cargo(name: string): Promise<PackageData | null> {
    const data = await axios
      .get(`https://crates.io/api/v1/crates/${name}`)
      .then(res => res.data)
      .catch(() => null);

    if (!data || data.errors) return null;

    const packageData: PackageData = {
      name: data.crate.name,
      description: data.crate.description,
      url: `https://crates.io/crates/${data.crate.name}`,
      version: data.crate.max_version,
      keywords: data.crate.keywords,
      icon: `https://crates.io/assets/cargo.png`
    };
    return packageData;
  }

  static async w3schools(name: string): Promise<w3schoolsData | null> {
    const results = await this.w3schoolsAutoComplete(name);
    if (!results) return null;
    const result = results[0];
    const { data: html } = await axios
      .get(result.url)
      .then(res => res.data)
      .catch(() => null);

    if (!html) return null;
    const $ = load(html);
    const code = $('.w3-code').html() ? $('.w3-code') : $('pre');
    if (!code) return null;
    const snippet = code.first().text() || undefined;

    let highlight = result.url.split('/').at(-2)?.toLocaleLowerCase() || null;
    if (highlight === 'tag') highlight = 'html';
    /*
      $(code)
        .attr("class")
        ?.split(" ")
        ?.filter((c) => /(language|high)/gi.test(c))?.[0]
        ?.replace(/(language|high|-)/gi, "") || null;*/

    result.snippet = snippet;
    result.highlight = highlight;
    return result;
  }

  static async w3schoolsAutoComplete(name: string): Promise<w3schoolsData[] | null> {
    const data = await axios
      .get(`https://google.com/search?q=${name}+w3schools`)
      .then(res => res.data)
      .catch(() => null);
    if (!data) return null;

    const $ = load(data);

    const results = $('div[id=main] > div')
      .filter((i, e) => $(e).text().includes('w3schools.com') && $(e).text().includes('›'))
      .map((i, e) => {
        return {
          title:
            $(e).find('div > div:nth-child(1) > a > div > div:nth-child(1) > h3 > div').text() ||
            $(e).find('a').find('span').eq(0).text() ||
            '',
          url: $(e)
            .find('a')
            .attr('href')
            ?.replace('/url?q=', '')
            .replace(/&sa=.*/, ''),
          description:
            $(e).find('div > div:nth-child(2) > div > div > div > div > div').text().replaceAll('�', '') ||
            $(e).find('div > div:nth-child(1) > div > div > div > div').text().replaceAll('�', '') ||
            'no description found',
          highlight: null
        };
      })
      .toArray() as w3schoolsData[];

    return results;
  }
}

export { Search };
