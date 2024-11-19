import fs from"fs";import path from"path";import inquirer from"inquirer";import{success,error}from"../common/utils/logger.js";async function generateCommand(){const e=fs.existsSync(path.join(process.cwd(),"src")),r=process.cwd().endsWith("src");e||(r?(error('You are in the "src/" directory. You should be in the root of your Discraft project.'),process.exit(1)):(error('The "src/" directory does not exist. Please run "discraft init" to initialize a project, or ensure you are in the root of your Discraft project.'),process.exit(1)));let n={};try{n=await inquirer.prompt([{type:"input",name:"name",message:"Command name:",validate:e=>!!/^[a-z]+(-[a-z]+)*$/.test(e)||"Must be lowercase with single dashes only."},{type:"input",name:"description",message:"Command description:",validate:e=>e.length>0}])}catch(e){return"ExitPromptError"===e.name?(error("Cancelled by user."),process.exit(0)):(error("Error:",e),process.exit(1))}let t={};try{t=await inquirer.prompt([{type:"checkbox",name:"features",message:"Select command features:",choices:[{name:"Enable response caching (improves performance for expensive operations)",value:"cacheable",checked:!1},{name:"Use deferred response (for commands that take longer than 3 seconds)",value:"deferred",checked:!1},{name:"Make responses ephemeral (only visible to the command user)",value:"ephemeral",checked:!1},{name:"Add permission requirements",value:"permissions",checked:!1}]}])}catch(e){return"ExitPromptError"===e.name?(error("Cancelled by user."),process.exit(0)):(error("Error:",e),process.exit(1))}n.features=t.features;let a={};try{a=await inquirer.prompt([{type:"confirm",name:"hasOptions",message:"Would you like to add command options/arguments? (e.g., /command <user> <reason>)",default:!1}])}catch(e){return"ExitPromptError"===e.name?(error("Cancelled by user."),process.exit(0)):(error("Error:",e),process.exit(1))}const s=[];if(a.hasOptions){console.log("\nLet's add some options to your command. For each option, you'll need to specify:"),console.log("1. The type of data it accepts (string, number, user, etc.)"),console.log('2. The name of the option (e.g., "user" in /ban <user>)'),console.log("3. A description of what the option does\n");let e=!0;for(;e;){let r;try{r=await inquirer.prompt([{type:"list",name:"type",message:"What type of data should this option accept?",choices:[{name:"String (text)",value:"String"},{name:"Integer (whole number)",value:"Integer"},{name:"Number (decimal number)",value:"Number"},{name:"Boolean (true/false)",value:"Boolean"},{name:"User (Discord user)",value:"User"},{name:"Channel (Discord channel)",value:"Channel"},{name:"Role (Discord role)",value:"Role"},{name:"Mentionable (user or role)",value:"Mentionable"},{name:"Attachment (file)",value:"Attachment"}]},{type:"input",name:"name",message:'Option name (e.g., "user", "reason", "amount"):',validate:e=>!!/^[a-z0-9-]+$/.test(e)||"Option name must be lowercase and may only contain letters, numbers, and dashes"},{type:"input",name:"description",message:'Option description (e.g., "The user to ban", "Reason for the action"):',validate:e=>e.length>0},{type:"confirm",name:"required",message:"Is this option required?",default:!1}])}catch(e){return"ExitPromptError"===e.name?(error("Cancelled by user."),process.exit(0)):(error("Error:",e),process.exit(1))}s.push({type:r.type.toLowerCase(),name:r.name,description:r.description,required:r.required});const{addAnother:n}=await inquirer.prompt([{type:"confirm",name:"addAnother",message:"Would you like to add another option?",default:!1}]).catch((e=>"ExitPromptError"===e.name?(error("Cancelled by user."),process.exit(0)):(error("Error:",e),process.exit(1))));n||(e=!1)}}let o=[];if(n.features.includes("permissions")){console.log("\nSelect the permissions required to use this command:"),console.log("(Use space to select/deselect, arrow keys to move, enter to confirm)\n");o=(await inquirer.prompt([{type:"checkbox",name:"permissions",message:"Required permissions:",choices:[{name:"Administrator - Full access to all commands",value:"Administrator"},{name:"Manage Server - Edit server settings",value:"ManageGuild"},{name:"Manage Messages - Delete/pin messages",value:"ManageMessages"},{name:"Manage Channels - Edit channel settings",value:"ManageChannels"},{name:"Kick Members - Remove members from server",value:"KickMembers"},{name:"Ban Members - Permanently remove members",value:"BanMembers"},{name:"Send Messages - Write in text channels",value:"SendMessages"},{name:"Embed Links - Send embedded content",value:"EmbedLinks"},{name:"Attach Files - Upload files",value:"AttachFiles"},{name:"Read Message History - View old messages",value:"ReadMessageHistory"},{name:"Mention Everyone - Use @everyone/@here",value:"MentionEveryone"}]}]).catch((e=>"ExitPromptError"===e.name?(error("Cancelled by user."),process.exit(0)):(error("Error:",e),process.exit(1))))).permissions}let i="import { SlashCommandBuilder";o.length>0&&(i+=", PermissionFlagsBits"),i+=" } from 'discord.js';\n",n.features.includes("cacheable")&&(i+="import { commandCache } from '../utils/commandCache.js';\n\n",i+=`// Set command-specific cache settings\ncommandCache.setCommandSettings('${n.name}', {\n  ttl: 60000, // Cache results for 1 minute\n});\n\n`),i+="export default {\n",i+="  data: new SlashCommandBuilder()\n",i+=`    .setName('${n.name}')\n`,i+=`    .setDescription('${n.description}')\n`,s.length>0&&s.forEach((e=>{i+=`    .add${e.type.charAt(0).toUpperCase()+e.type.slice(1)}Option(option =>\n`,i+="      option\n",i+=`        .setName('${e.name}')\n`,i+=`        .setDescription('${e.description}')\n`,i+=`        .setRequired(${e.required})\n`,i+="    )\n"})),o.length>0&&o.forEach((e=>{i+=`    .setDefaultMemberPermissions(PermissionFlagsBits.${e})\n`})),i+="  ,\n\n",n.features.includes("cacheable")&&(i+="  cacheable: true,\n\n"),i+="  async execute(interaction) {\n",n.features.includes("deferred")&&(i+=`    await interaction.deferReply(${n.features.includes("ephemeral")?"{ ephemeral: true }":""});\n\n`),s.length>0&&(i+="    // Get command options\n",s.forEach((e=>{i+=`    const ${e.name} = interaction.options.get${e.type.charAt(0).toUpperCase()+e.type.slice(1)}('${e.name}');\n`})),i+="\n"),i+="    // TODO: Add your command logic here\n\n",n.features.includes("deferred")?i+=`    await interaction.editReply({ content: 'Command executed!' ${n.features.includes("ephemeral")?", ephemeral: true":""} });\n`:i+=`    await interaction.reply({ content: 'Command executed!' ${n.features.includes("ephemeral")?", ephemeral: true":""} });\n`,i+="  },\n",i+="};\n";const c=process.cwd(),m=path.join(c,"src","commands");fs.existsSync(m)||fs.mkdirSync(m,{recursive:!0});const l=path.join(m,`${n.name}.js`);return fs.writeFileSync(l,i),success(`Command ${n.name} created successfully at ${l}`),{name:n.name,path:l,features:n.features,options:s}}generateCommand().catch((e=>{error("Error creating command:",e),process.exit(1)}));