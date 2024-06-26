import axios from 'axios';
import { GithubRepository, GithubUser, PackageData, w3schoolsData } from '../@types/searchData';
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

  static async githubUserAutoComplete(name: string): Promise<string[]> {
    const data = await axios
      .get(`https://api.github.com/search/users?q=${name}&per_page=25`)
      .then(res => res.data)
      .catch(() => null);

    if (!data) return [];
    const names = data.items.map((d: { login: string }) => d.login) as string[];
    return names.sort();
  }

  static async githubRepositoryGlobalAutoComplete(name: string): Promise<string[]> {
    const data = await axios
      .get(`https://api.github.com/search/repositories?q=${name}&per_page=25`)
      .then(res => res.data)
      .catch(() => null);

    if (!data) return [];
    const names = data.items.map((d: { full_name: string }) => d.full_name) as string[];
    return names.sort();
  }

  static async githubRepositoryByUserAutoComplete(username: string, name: string): Promise<string[]> {
    const data = await axios
      .get(`https://api.github.com/users/${username}/repos`)
      .then(res => res.data)
      .catch(() => null);

    if (!data) return [];
    console.log(name);
    const names = data.map((d: { full_name: string }) => d.full_name) as string[];
    return names.filter(n => n.toLowerCase().includes(name.toLowerCase())).sort();
  }

  static async githubUser(name: string): Promise<GithubUser | null> {
    const data = await axios
      .get(`https://api.github.com/users/${name}`)
      .then(res => res.data)
      .catch(() => null);

    if (!data || data.message) return null;

    const starredRepos = await axios
      .get(`https://api.github.com/users/${name}/starred`)
      .then(res => res.data)
      .catch(() => null);

    const repos = await axios
      .get(`https://api.github.com/users/${name}/repos`)
      .then(res => res.data)
      .catch(() => null);

    const stars = repos.reduce((acc: number, repo: { stargazers_count: number }) => acc + repo.stargazers_count, 0);

    const user: GithubUser = {
      username: data.login,
      name: data.name,
      bio: data.bio,
      url: data.html_url,
      avatar: data.avatar_url,
      followers: data.followers,
      following: data.following,
      repositories: data.public_repos,
      creationDate: new Date(data.created_at),
      starred: starredRepos?.length,
      stars
    };

    return user;
  }

  static async githubRepository(fullName: string): Promise<GithubRepository | null> {
    const data = await axios
      .get(`https://api.github.com/repos/${fullName}`)
      .then(res => res.data)
      .catch(() => null);

    if (!data || data.message) return null;

    const languages = await axios
      .get(data.languages_url)
      .then(res => res.data)
      .catch(() => null);

    const total = Object.values<number>(languages).reduce((acc: number, value: number) => acc + value, 0);

    const formattedLanguages = Object.entries<number>(languages).map(([name, value]) => ({
      name,
      percentage: (value / total) * 100
    }));

    const repository: GithubRepository = {
      name: data.full_name,
      description: data.description,
      url: data.html_url,
      stars: data.stargazers_count,
      forks: data.forks,
      issues: data.open_issues,
      username: data.owner.login,
      creationDate: new Date(data.created_at),
      firstPush: new Date(data.pushed_at),
      lastUpdate: new Date(data.updated_at),
      license: data.license?.name || null,
      languages: formattedLanguages
    };
    return repository;
  }
}

export { Search };
