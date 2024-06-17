import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
/*import { config } from 'dotenv';

config({
  path: '../../.env'
});*/

console.log(process.env.PICOCTF_USERNAME);
class PicoCTF {
  private static async getLoginCookie(): Promise<string | null> {
    const headers = await axios
      .post(
        'https://play.picoctf.org/api/user/login/',
        {
          username: process.env.PICOCTF_USERNAME,
          password: process.env.PICOCTF_PASSWORD
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/',
            'Cache-Control': 'no-cache'
          }
        }
      )
      .then(res => res.headers)
      .catch(() => null);

    if (!headers) return null;

    const cookie = headers['set-cookie']?.map((cookie: string) => cookie.split(';')[0]).join('; ');
    return cookie || null;
  }

  private static async getMembers(Cookie: string, isLeader: boolean): Promise<CTFPlayer[] | null> {
    const classId = '7798';
    const event = 'gym';

    const data = await axios
      .get(
        `https://play.picoctf.org/api/classroom_members/?classroom=${classId}&page=1&pending=false&leader=${isLeader}&page_size=50&event=${event}`,
        {
          headers: {
            Cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/',
            'Cache-Control': 'no-cache'
          }
        }
      )
      .then(res => res.data)
      .catch(() => null);
    if (!data) return null;

    return data.results;
  }

  static async getLeaderboard(): Promise<CTFPlayer[] | null> {
    const authCookies = await this.getLoginCookie();
    if (!authCookies) return null;

    const members = await this.getMembers(authCookies, false);
    if (!members) return null;

    const leaders = await this.getMembers(authCookies, true);
    if (!leaders) return null;

    const leaderboard = [...leaders, ...members].sort((a, b) => b.score - a.score);

    return leaderboard;
  }

  static async getLeaderboardWithCache(): Promise<CTFPlayer[] | null> {
    const leaderboard = await this.getLeaderboard();
    const filePath = path.resolve(__dirname, '../../data/picoctf.json');

    if (!leaderboard) {
      const data = await fs.readFile(filePath).catch(() => null);
      if (!data) return null;
      return JSON.parse(data.toString());
    }
    const data = JSON.stringify(leaderboard);
    await fs.writeFile(filePath, data).catch(err => console.error(err));
    return leaderboard;
  }
}
//PicoCTF.getLeaderboard().then(console.log).catch(console.error);
export { PicoCTF };
