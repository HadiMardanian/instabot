import { IgApiClient } from 'instagram-private-api';
import * as fs from "fs";
import dotenv from "dotenv";
import * as path from "path";
import puppeteer, { Browser, BrowserEvent, Page, Permission } from "puppeteer";
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
    public page: Page;
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
    public wait(seconds: number) {
        new Promise((resolve) => {
            setInterval(resolve, seconds * 1000);
        });
    }
    public async login() {
        this.page = await this.instance.newPage();

        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36');
        await this.page.goto(this.website, { waitUntil: 'networkidle2' });

        // await this.wait(4);
        const pdf = await this.page.pdf();
        fs.writeFileSync("./page.pdf", pdf);
        fs.writeFileSync("./page.html", await this.page.content())

        // await page.type('[name="username"]', process.env.IG_USERNAME);
        // await page.type('[name="password"]', process.env.IG_PASSWORD);
        // await page.click('button[type="submit"]');

        // await this.wait(4);

        // const pdf2 = await page.pdf();
        // fs.writeFileSync("./page2.pdf", pdf2);
        console.log("================= END LOIGIN ==================");
    }

    remove_elem_by_class(class_name: string, count: number = 1) {
        try {
            let xpathExpression = `//div[@class = '${class_name}']`;
            let result = document.evaluate(xpathExpression, document, null, XPathResult.ANY_TYPE, null);

            for (let i = 1; i <= count; i++)
                result.iterateNext()["remove"]();

        } catch (error) {
            console.error(error);
        }
    }

    public async check_notif_req() {
        const bodyHandle = await this.page.$('window');
        const self = this;
        const html = await this.page.evaluate(body => {


            function remove_elem_by_class(class_name, count = 1) {
                try {
                    let xpathExpression = `//div[@class = '${class_name}']`;
                    let result = document.evaluate(xpathExpression, document, null, XPathResult.ANY_TYPE, null);

                    for (let i = 1; i <= count; i++)
                        result.iterateNext()["remove"]();

                } catch (error) {
                    console.error(error);
                }
            }
            try {
                let notif = "x1cy8zhl x9f619 x78zum5 xl56j7k x2lwn1j xeuugli x47corl"
                remove_elem_by_class(notif, 2);
            } catch (error) {
                console.error(error);
            }
            try {
                let cover = "x1n2onr6 xzkaem6";
                remove_elem_by_class(cover, 2);
            } catch (error) {
                console.error(error);
            }
        }, bodyHandle);

        const pdf = await this.page.pdf();
        fs.writeFileSync("./page.pdf", pdf);
        fs.writeFileSync("./page.html", await this.page.content())
        console.log("====================== END CHECK NOTIF ======================");
    }

}

async function start() {
    if (!fs.existsSync("./user_data")) {
        fs.mkdirSync("./user_data");
    }

    const b = new Bro("https://instagram.com/");
    await b.launch({ user_dir: path.resolve("./user_data"), headless: true });
    await b.give_permissions(["notifications"]);
    await b.login();
    await b.wait(3);
    await b.check_notif_req();
}

setup_env("production");
start();