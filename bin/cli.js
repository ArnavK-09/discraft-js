#!/usr/bin/env node
import{checkbox,input,select}from"@inquirer/prompts";import{spawn}from"child_process";import{Command,Option}from"commander";import figlet from"figlet";import fs from"fs";import path from"path";import{fileURLToPath}from"url";
// Functions for colorizing text (dim grey)
const tColor=(e,n)=>e.replace("%s",n);const __dirname=path.dirname(fileURLToPath(import.meta.url));let currentPackage={};const tFmt={cyan:"[36m%s[0m",green:"[32m%s[0m",grey:"[2m%s[0m",bold:`[1m`,blue:"[34m%s[0m",red:"[31m%s[0m",yellow:"[33m%s[0m"};const availableLicenses=["MIT","ISC","Apache-2.0","GPL-3.0","None"];
// Ensure the package.json exists
try{const e=path.resolve(__dirname,"..","package.json");currentPackage=JSON.parse(fs.readFileSync(e,"utf-8"))}catch{
// No need, since user could run discraft init directly from npx, so this err log would be baseless
}const showBranding=(e=tFmt.cyan,n="Discraft")=>{try{console.log(e,figlet.textSync(n,{font:"Small",horizontalLayout:"default",verticalLayout:"default",width:80,whitespaceBreak:true},"\n"))}catch{console.error("Failed to show branding")}};const program=new Command;program.version(currentPackage?.version||"1.0.0").name("discraft").description("Discraft CLI - Best framework for Discord bots");program.command("init").argument("[project name]","project name").argument("[project directory]","project directory").addOption(new Option("-li, --license <license>","project license").choices(availableLicenses)).addOption(new Option("-i, --install","install dependencies")).addOption(new Option("-af, --all-features","allow all features")).description("Initialize a new Discraft project").action((async(e,n,t)=>{showBranding();try{
// Get project details
const o={name:e,directory:n,additionalFeatures:["exampleCommands","envSetup","readme"],license:t.license};if(!o["name"]||!/^[a-zA-Z0-9-_]+$/.test(o.name)){o["name"]=await input({message:`Project name:`,default:path.basename(process.cwd()),validate:e=>{if(/^[a-zA-Z0-9-_]+$/.test(e))return true;return"Project name may only include letters, numbers, dashes and underscores"}})}if(!o.directory){const e=await input({message:`Project directory:`,default:o.name});o["directory"]=path.join(process.cwd(),e)}if(!availableLicenses.includes(o.license)){o["license"]=await select({message:"Project License:",choices:availableLicenses})}
// Set up project directory
const s=path.resolve(process.cwd(),o.directory);if(!fs.existsSync(s)){fs.mkdirSync(s,{recursive:true})}
// Create src directory
const r=path.join(s,"src");if(!fs.existsSync(r)){fs.mkdirSync(r,{recursive:true})}
// Create project structure
const i=["discraft","discraft/commands","discraft/events","commands","events","config","services","utils"];i.forEach((e=>{const n=path.join(r,e);if(!fs.existsSync(n)){fs.mkdirSync(n,{recursive:true})}}));
// Copy template files
const a={"config/bot.config.js":path.join(__dirname,"..","src","config","bot.config.js"),"discraft/commands/handler.js":path.join(__dirname,"..","src","discraft","commands","handler.js"),"discraft/events/handler.js":path.join(__dirname,"..","src","discraft","events","handler.js"),"services/discord.js":path.join(__dirname,"..","src","services","discord.js"),"utils/logger.js":path.join(__dirname,"..","src","utils","logger.js"),"utils/commandCache.js":path.join(__dirname,"..","src","utils","commandCache.js"),"events/ready.js":path.join(__dirname,"..","src","events","ready.js"),"events/error.js":path.join(__dirname,"..","src","events","error.js"),"index.js":path.join(__dirname,"..","src","index.js")};
// Asking for featurers
if(!t.allFeatures){o["additionalFeatures"]=await checkbox({message:"Select additional features:",choices:[{name:"Example commands",value:"exampleCommands",checked:true},{name:"Environment setup (.env.example)",value:"envSetup",checked:true},{name:"README.md with setup instructions",value:"readme",checked:true}]})}
// Add example commands if selected
if(o["additionalFeatures"].includes("exampleCommands")){a["commands/ping.js"]=path.join(__dirname,"..","src","commands","ping.js");a["commands/random.js"]=path.join(__dirname,"..","src","commands","random.js");a["commands/status.js"]=path.join(__dirname,"..","src","commands","status.js")}Object.entries(a).forEach((([e,n])=>{if(fs.existsSync(n)){const t=path.join(r,e);fs.copyFileSync(n,t)}}));
// Create package.json
const c={name:o.name,version:"1.0.0",scripts:{dev:"discraft dev",build:"discraft build",start:"discraft start"},description:"Bot made with Discraft",type:"module",license:o.license==="None"?"UNLICENSED":o.license};fs.writeFileSync(path.join(s,"package.json"),JSON.stringify(c,null,2));
// Create .env and .env.example if selected
if(o["additionalFeatures"].includes("envSetup")){const e="# Environment Variables for your Discraft bot\nTOKEN=<your_bot_token_here>\nCLIENT_ID=<your_client_id_here>\n";fs.writeFileSync(path.join(s,".env.example"),e);if(!fs.existsSync(path.join(s,".env"))){fs.writeFileSync(path.join(s,".env"),e)}}
// Create README.md if selected
if(o["additionalFeatures"].includes("readme")){const e=`# ${o.name}\nBot made with Discraft\n\n## Setup\n\n1. Install dependencies:\n   \`\`\`bash\n   npm install\n   \`\`\`\n\n2. Create a \`.env\` file with your bot token:\n   \`\`\`\n   TOKEN=your_bot_token_here\n   CLIENT_ID=your_client_id_here\n   \`\`\`\n\n3. Start development:\n   \`\`\`bash\n   npm run dev\n   \`\`\`\n\n## Commands\n\n### Development:\n- \`discraft dev\`: Start development server\n- \`discraft build\`: Build for production\n- \`discraft start\`: Start production server\n\n${o.additionalFeatures.includes("exampleCommands")?"\n### Bot Commands:\n- `/ping`: Check bot latency\n\n- `/random [pick, number]`: Pick something random out of a list; or pick a random number between the min and max\n\n- `/status`: Check bot and server status":""}\n\n## License\n\n${o.license==="None"?"This project is not licensed.":`This project is licensed under the ${o.license} License.`}\n`;fs.writeFileSync(path.join(s,"README.md"),e)}
// Create .gitignore
const d=`.env\nnode_modules/\ndist/\n`;fs.writeFileSync(path.join(s,".gitignore"),d);
// Welcome
const l=()=>{console.log(tFmt.green,tFmt.bold+"\n✨ Discraft project initialized successfully!");console.log(tFmt.grey,"\nNext steps:");if(o.directory!==process.cwd()){console.log(`\tRun ${tColor(tFmt.cyan,`cd ${o.directory.replace(process.cwd()+"/","")}`)} to enter your project directory.`)}console.log(`\tAdd your bot token and client ID to ${tColor(tFmt.cyan,".env")} file`);if(t.install!==true){console.log(`\tRun ${tColor(tFmt.cyan,"npm install discord.js@latest dotenv@latest")} to install dependencies`)}console.log(`\tRun ${tColor(tFmt.cyan,"npm run dev")} to start development\n`)};
// Install latest dependencies
if(t.install===true){console.log(tColor(tFmt.blue,"\n📦  Installing dependencies..."));const e=spawn("npm",["install","discord.js@latest","dotenv@latest"],{stdio:"inherit",cwd:s});e.on("close",(e=>{if(e===0){l()}else{console.error(tFmt.red,'\n❌ Failed to install dependencies. Please run "npm install" manually.')}}))}else{l()}}catch(e){if(e.isTtyError){console.error(tFmt.red,"Prompt couldn't be rendered in the current environment")}else if(e.message==="Aborted"){console.log(tFmt.red,"\nProject initialization cancelled.")}else{console.error(tFmt.red,"Error during initialization:\n",e)}process.exit(1)}}));let activeProcess=null;process.on("SIGINT",(()=>{console.log("\nGracefully shutting down...");if(activeProcess){activeProcess.kill("SIGINT")}process.exit(0)}));program.command("dev").description("Start development server").action((()=>{showBranding(tFmt.blue);const e=path.join(__dirname,"..","scripts","dev.js");activeProcess=spawn("node",[e],{stdio:"inherit",cwd:process.cwd(),env:{...process.env,DISCRAFT_ROOT:__dirname}});activeProcess.on("close",(e=>{activeProcess=null;if(e!==0&&e!==null){console.error(`Dev process exited with code ${e}`)}}))}));program.command("build").description("Build for production").option("-y, --yes","Skip prompts and use defaults").option("-o, --output <dir>","Output directory","dist").option("--max-optimize","Enable maximum optimization (slower build, faster runtime)",true).action((()=>{showBranding(tFmt.blue,"Building  Discraft");console.log("\n");const e=path.join(__dirname,"..","scripts","build.js");activeProcess=spawn("node",[e,...process.argv.slice(3)],{stdio:"inherit",cwd:process.cwd(),env:{...process.env,DISCRAFT_ROOT:__dirname,BABEL_PRESET_ENV_PATH:path.join(__dirname,"..","node_modules","@babel/preset-env")}});activeProcess.on("close",(e=>{activeProcess=null;if(e!==0&&e!==null){console.error(`Build process exited with code ${e}`)}}))}));program.command("start").description("Start production server").option("-d, --dir <dir>","Build directory","dist").action((({dir:e})=>{showBranding(tFmt.blue,"Starting  Discraft");console.log("\n");const n=path.join(__dirname,"..","scripts","start.js");activeProcess=spawn("node",[n,e],{stdio:"inherit",cwd:process.cwd(),env:{...process.env,DISCRAFT_ROOT:__dirname}});activeProcess.on("close",(e=>{activeProcess=null;if(e!==0&&e!==null){console.error(`Start process exited with code ${e}`)}}))}));program.command("test").description("Test your bot's configuration").addCommand(new Command("token").description("Check if the bot token is valid").action((()=>{const e=path.join(__dirname,"..","scripts","test-token.js");activeProcess=spawn("node",[e],{stdio:"inherit",cwd:process.cwd(),env:{...process.env,DISCRAFT_ROOT:__dirname}});activeProcess.on("close",(e=>{activeProcess=null;if(e!==0&&e!==null){console.error(`Token check process exited with code ${e}`)}}))})));program.command("add").on("command:*",invalidCmdHandler).description("Add new components to your bot").addCommand(new Command("command").description("Create a new Discord bot command").action((async()=>{showBranding(tFmt.blue);const e=path.join(__dirname,"..","scripts","add-command.js");try{const n=spawn("node",[e],{stdio:"inherit",shell:true});n.on("error",(e=>{console.error("Failed to start command generator:",e);process.exit(1)}));n.on("exit",(e=>{if(e!==0){console.error(`Command generator exited with code ${e}`);process.exit(e)}}))}catch(e){console.error("Error executing command generator:",e);process.exit(1)}}))).addCommand(new Command("event").description("Create a new Discord event handler").action((async()=>{showBranding(tFmt.blue);const e=path.join(__dirname,"..","scripts","add-event.js");try{const n=spawn("node",[e],{stdio:"inherit",shell:true});n.on("error",(e=>{console.error("Failed to start event generator:",e);process.exit(1)}));n.on("exit",(e=>{if(e!==0){console.error(`Event generator exited with code ${e}`);process.exit(e)}}))}catch(e){console.error("Error executing event generator:",e);process.exit(1)}})));program.on("command:*",invalidCmdHandler);program.addHelpText("beforeAll",tColor(tFmt.blue,figlet.textSync("Discraft",{font:"Standard",horizontalLayout:"default",verticalLayout:"default",width:80,whitespaceBreak:true},"\n")));program.addHelpText("before",tFmt.blue.split("%s")[1]);program.addHelpText("afterAll",`${tColor(tFmt.yellow,"\n⭐ Support Us by Starring Our Repo: https://github.com/The-Best-Codes/discraft-js")}`);program.parse(process.argv);function invalidCmdHandler(...e){showBranding(tFmt.red);console.log(tFmt.red,tFmt.bold+` Sorry, the command \`${e.join(" ").trim()}\` is not recognized. Please use a valid command.`);
// Collect all commands including subcommands, formatted with parent-child hierarchy
const n=[];program.commands.forEach((e=>{let t=e._name||"";let o=e.commands||[];
// Add the parent command itself
n.push(t);
// Add subcommands under the parent command
o.forEach((e=>{n.push(`${t} ${e._name}`)}))}));
// Add the help command
n.push("help");
// Print available commands (parent commands and their subcommands)
console.log(tFmt.red,` Available commands: ${n.join(", ")}`);process.exit(1)}