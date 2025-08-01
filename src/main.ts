import { dirname, importx } from '@discordx/importer';
import { config } from 'dotenv';
import { bot } from './bot.js';

async function run() {
  // The following syntax should be used in the commonjs environment
  //
  // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");

  // The following syntax should be used in the ECMAScript environment
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Let's start the bot
  if (!process.env.BOT_TOKEN) {
    throw Error('Could not find BOT_TOKEN in your environment');
  }
  if (process.env.dotenv === '1') {
    config();
  }
  // Log in with your bot token
  await bot.login(process.env.BOT_TOKEN);
}

void run();
