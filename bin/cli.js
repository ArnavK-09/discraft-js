#!/usr/bin/env node
import{Command}from"commander";import path from"path";import fs from"fs";import{fileURLToPath}from"url";import{spawn}from"child_process";import inquirer from"inquirer";
// Functions for colorizing text (dim grey)
const tColorGray=e=>`[38;2;170;170;170m${e}[0m`;const __dirname=path.dirname(fileURLToPath(import.meta.url));let currentPackage={};
// Ensure the package.json exists
try{const e=path.resolve(__dirname,"..","package.json");currentPackage=JSON.parse(fs.readFileSync(e,"utf-8"))}catch(e){console.error("Could not access package.json",e)}const program=new Command;program.version(currentPackage?.version||"1.0.0").name("discraft").description("Discraft CLI - Best framework for Discord bots");program.command("init").description("Initialize a new Discraft project").action((async()=>{try{
// Get project details
const e=await inquirer.prompt([{type:"input",name:"name",message:"Project name:",default:path.basename(process.cwd()),validate:e=>{if(/^[a-zA-Z0-9-_]+$/.test(e))return true;return"Project name may only include letters, numbers, dashes and underscores"}},{type:"input",name:"directory",message:"Project directory:",default:"",filter:e=>e.trim()==="(current)"?"":e.trim(),transformer:e=>{if(e.trim()===""||e.trim()==="(current)"){return tColorGray("(current)")}return e}},{type:"list",name:"license",message:"License:",choices:["MIT","ISC","Apache-2.0","GPL-3.0","None"],default:"MIT"},{type:"checkbox",name:"features",message:"Select additional features:",choices:[{name:"Example commands",value:"exampleCommands",checked:true},{name:"Environment setup (.env.example)",value:"envSetup",checked:true},{name:"README.md with setup instructions",value:"readme",checked:true}]}]);
// Set up project directory
const n=path.resolve(process.cwd(),e.directory);if(!fs.existsSync(n)){fs.mkdirSync(n,{recursive:true})}
// Create src directory
const s=path.join(n,"src");if(!fs.existsSync(s)){fs.mkdirSync(s,{recursive:true})}
// Create project structure
const r=["discraft","discraft/commands","discraft/events","commands","events","config","services","utils"];r.forEach((e=>{const n=path.join(s,e);if(!fs.existsSync(n)){fs.mkdirSync(n,{recursive:true})}}));
// Copy template files
const t={"config/bot.config.js":path.join(__dirname,"..","src","config","bot.config.js"),"discraft/commands/handler.js":path.join(__dirname,"..","src","discraft","commands","handler.js"),"discraft/events/handler.js":path.join(__dirname,"..","src","discraft","events","handler.js"),"services/discord.js":path.join(__dirname,"..","src","services","discord.js"),"utils/logger.js":path.join(__dirname,"..","src","utils","logger.js"),"events/ready.js":path.join(__dirname,"..","src","events","ready.js"),"events/error.js":path.join(__dirname,"..","src","events","error.js"),"index.js":path.join(__dirname,"..","src","index.js")};
// Add example commands if selected
if(e.features.includes("exampleCommands")){t["commands/ping.js"]=path.join(__dirname,"..","src","commands","ping.js");t["commands/random.js"]=path.join(__dirname,"..","src","commands","random.js");t["commands/status.js"]=path.join(__dirname,"..","src","commands","status.js")}Object.entries(t).forEach((([e,n])=>{if(fs.existsSync(n)){const r=path.join(s,e);fs.copyFileSync(n,r)}}));
// Create package.json
const o={name:e.name,version:"1.0.0",scripts:{dev:"discraft dev",build:"discraft build",start:"discraft start"},description:"Bot made with Discraft",type:"module",license:e.license==="None"?"UNLICENSED":e.license};fs.writeFileSync(path.join(n,"package.json"),JSON.stringify(o,null,2));
// Create .env and .env.example if selected
if(e.features.includes("envSetup")){const e="TOKEN=your_bot_token_here\nCLIENT_ID=your_client_id_here\n";fs.writeFileSync(path.join(n,".env.example"),e);if(!fs.existsSync(path.join(n,".env"))){fs.writeFileSync(path.join(n,".env"),e)}}
// Create README.md if selected
if(e.features.includes("readme")){const s=`# ${e.name}\nBot made with Discraft\n\n## Setup\n\n1. Install dependencies:\n   \`\`\`bash\n   npm install\n   \`\`\`\n\n2. Create a \`.env\` file with your bot token:\n   \`\`\`\n   TOKEN=your_bot_token_here\n   CLIENT_ID=your_client_id_here\n   \`\`\`\n\n3. Start development:\n   \`\`\`bash\n   discraft dev\n   \`\`\`\n\n## Commands\n\nDevelopment:\n- \`discraft dev\`: Start development server\n- \`discraft build\`: Build for production\n- \`discraft start\`: Start production server\n\n${e.features.includes("exampleCommands")?"\nBot Commands:\n- `/ping`: Check bot latency\n\n- `/random [pick, number]`: Pick something random out of a list; or pick a random number between the min and max\n\n- `/status`: Check bot and server status":""}\n\n## License\n\n${e.license==="None"?"This project is not licensed.":`This project is licensed under the ${e.license} License.`}\n`;fs.writeFileSync(path.join(n,"README.md"),s)}
// Create .gitignore
const i=`.env\nnode_modules/\ndist/\n`;fs.writeFileSync(path.join(n,".gitignore"),i);
// Install latest dependencies
console.log("\n📦 Installing dependencies...");const c=spawn("npm",["install","discord.js@latest","dotenv@latest"],{stdio:"inherit",cwd:n});c.on("close",(n=>{if(n===0){console.log("\n✨ Discraft project initialized successfully!");console.log("\nNext steps:");if(e.directory!==process.cwd()){console.log(`Run \`cd ${e.directory}\` to enter your project directory.`)}console.log("Add your bot token and client ID to .env file");console.log('Run "discraft dev" to start development')}else{console.error('\n❌ Failed to install dependencies. Please run "npm install" manually.')}}))}catch(e){if(e.isTtyError){console.error("Prompt couldn't be rendered in the current environment")}else if(e.message==="Aborted"){console.log("\nProject initialization cancelled.")}else{console.error("Error during initialization:",e)}process.exit(1)}}));let activeProcess=null;process.on("SIGINT",(()=>{console.log("\nGracefully shutting down...");if(activeProcess){activeProcess.kill("SIGINT")}process.exit(0)}));program.command("dev").description("Start development server").action((()=>{const e=path.join(__dirname,"..","scripts","dev.js");activeProcess=spawn("node",[e],{stdio:"inherit",cwd:process.cwd(),env:{...process.env,DISCRAFT_ROOT:__dirname}});activeProcess.on("close",(e=>{activeProcess=null;if(e!==0&&e!==null){console.error(`Dev process exited with code ${e}`)}}))}));program.command("build").description("Build for production").option("-y, --yes","Skip prompts and use defaults").option("-o, --output <dir>","Output directory","dist").option("--max-optimize","Enable maximum optimization (slower build, faster runtime)",true).action((()=>{const e=path.join(__dirname,"..","scripts","build.js");activeProcess=spawn("node",[e,...process.argv.slice(3)],{stdio:"inherit",cwd:process.cwd(),env:{...process.env,DISCRAFT_ROOT:__dirname,BABEL_PRESET_ENV_PATH:path.join(__dirname,"..","node_modules","@babel/preset-env")}});activeProcess.on("close",(e=>{activeProcess=null;if(e!==0&&e!==null){console.error(`Build process exited with code ${e}`)}}))}));program.command("start").description("Start production server").action((()=>{const e=path.join(__dirname,"..","scripts","start.js");activeProcess=spawn("node",[e],{stdio:"inherit",cwd:process.cwd(),env:{...process.env,DISCRAFT_ROOT:__dirname}});activeProcess.on("close",(e=>{activeProcess=null;if(e!==0&&e!==null){console.error(`Start process exited with code ${e}`)}}))}));program.command("check-token").description("Check if the bot token is valid").action((()=>{const e=path.join(__dirname,"..","scripts","tokenTest.js");activeProcess=spawn("node",[e],{stdio:"inherit",cwd:process.cwd(),env:{...process.env,DISCRAFT_ROOT:__dirname}});activeProcess.on("close",(e=>{activeProcess=null;if(e!==0&&e!==null){console.error(`Token check process exited with code ${e}`)}}))}));program.command("new-command").description("Create a new Discord bot command").action((async()=>{const e=path.join(__dirname,"..","scripts","new-command.js");try{const n=spawn("node",[e],{stdio:"inherit",shell:true});n.on("error",(e=>{console.error("Failed to start command generator:",e);process.exit(1)}));n.on("exit",(e=>{if(e!==0){console.error(`Command generator exited with code ${e}`);process.exit(e)}}))}catch(e){console.error("Error executing command generator:",e);process.exit(1)}}));program.parse(process.argv);