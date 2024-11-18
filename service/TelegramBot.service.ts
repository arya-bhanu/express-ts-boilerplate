import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { QRScannerService } from './QRScanner.service';

enum StatusStep {
	AWAIT_MESSAGE_ENCRYPT,
	AWAIT_PASSWORD_ENCRYPT,
}
export class TelegramBotService {
	bot;
	constructor() {
		this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

		this.runAsyncFunc();

		// Enable graceful stop
		process.once('SIGINT', () => this.bot.stop('SIGINT'));
		process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
	}

	runAsyncFunc() {
		let userData: {
			[key: number]: { message?: string; step: StatusStep; password?: string };
		} = {};
		this.bot.start(
			async (ctx) => await ctx.reply(`Welcome ${ctx.message.from.username}`)
		);
		this.bot.command('encrypt', (ctx) => {
			ctx.reply('Enter your message that you wanted to encrypt');
			userData[ctx.from.id] = { step: StatusStep.AWAIT_MESSAGE_ENCRYPT };
		});
		this.bot.on(message('text'), async (ctx) => {
			const userId = ctx.from.id;
			const userExisted = userData[userId];
			if (
				userExisted &&
				userExisted.step === StatusStep.AWAIT_MESSAGE_ENCRYPT
			) {
				userExisted.step = StatusStep.AWAIT_PASSWORD_ENCRYPT;
				userExisted.message = ctx.message.text;
				await ctx.reply('Please enter your password for encryption');
				return;
			}
			if (
				userExisted &&
				userExisted.step === StatusStep.AWAIT_PASSWORD_ENCRYPT
			) {
				userExisted.password = ctx.message.text;
				console.log(userData[userId]);
				await ctx.reply('Encrypting your message ...');

				try {
					const res = await QRScannerService.encryptMessage({
						value: userExisted.message,
						password: userExisted.password,
					});
					await ctx.replyWithPhoto({ source: res });
				} catch (err) {
					console.error(err);
					await ctx.reply('Error on encrypting message...');
				}
				delete userData[userId];
				return;
			}
			await ctx.reply('Please use our commands');
		});
		this.bot.launch();
	}
}
