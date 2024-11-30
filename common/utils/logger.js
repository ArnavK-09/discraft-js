import{logLevel}from"../../src/config/bot.config.js";const colors={reset:"[0m",bright:"[1m",dim:"[2m",underscore:"[4m",blink:"[5m",reverse:"[7m",hidden:"[8m",fg:{black:"[30m",red:"[31m",green:"[32m",yellow:"[33m",blue:"[34m",magenta:"[35m",cyan:"[36m",white:"[37m",crimson:"[38m"},bg:{black:"[40m",red:"[41m",green:"[42m",yellow:"[43m",blue:"[44m",magenta:"[45m",cyan:"[46m",white:"[47m",crimson:"[48m"}};export const log=(message,...args)=>{console.log(`${colors.bg.white}[LOG]${colors.reset} ${message}`,...args)};export const info=(message,...args)=>{console.info(`${colors.fg.blue}[INFO]${colors.reset} ${message}`,...args)};export const warn=(message,...args)=>{console.warn(`${colors.bg.yellow}[WARN]${colors.reset} ${message}`,...args)};export const error=(message,...args)=>{console.error(`${colors.bg.red}[ERROR]${colors.reset} ${message}`,...args)};export const trace=(message,...args)=>{console.trace(`${colors.fg.crimson}[TRACE]${colors.reset} ${message}`,...args)};export const success=(message,...args)=>{console.log(`${colors.bg.green}[SUCCESS]${colors.reset} ${message}`,...args)};export const debug=(message,...args)=>{"debug"===logLevel&&console.debug(`${colors.fg.cyan}[DEBUG]${colors.reset} ${message}`,...args)};