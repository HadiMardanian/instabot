import { IgApiClient } from 'instagram-private-api';
import * as fs from "fs";
import dotenv from "dotenv";
import * as path from "path";
import puppeteer, { Browser, BrowserEvent, Permission } from "puppeteer";
enum NodeEnvValues { dev = "dev", local = "local", production = "production" };

function setup_env(mode?: string) {
    const envPath = path.join(__dirname, `.env.${NodeEnvValues[process.env.NODE_ENV || mode]}`);
    const isPathExists = fs.existsSync(envPath);
    if (isPathExists) {
        dotenv.config({ path: envPath });
        return true;
    }
    return false;
}

class Bro {
    public instance: Browser;

    constructor(public website: string) {

    }

    public async launch(opts: {
        headless?: boolean,
        user_dir: string
    }) {
        this.instance = await puppeteer.launch({ 
            headless: Boolean(opts?.headless),
            userDataDir: opts.user_dir
        });
    }

    public async give_permissions(permissions: Permission[]) {
        const context = await this.instance.defaultBrowserContext();
        await context.overridePermissions(this.website, permissions);
    }

    public async login() {
        const page = await this.instance.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36');
        await page.goto(this.website);
        await page.setViewport({width: 1080, height: 1024});

        await page.type('[name="username"]', process.env.IG_USERNAME);
        await page.type('[name="password"]', process.env.IG_PASSWORD);
        await page.click('button[type="submit"]');
    }

}

async function start() {
    if(!fs.existsSync("./user_data")) {
        fs.mkdirSync("./user_data");
    }

    const b = new Bro("https://instagram.com/");
    await b.launch({ user_dir: path.resolve("./user_data") });
    await b.give_permissions(["notifications"]);
    await b.login();
}

setup_env("production");
start();