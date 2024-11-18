import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { IndexRoute } from './routers/index.route';
import { TelegramBotService } from './service/TelegramBot.service';

dotenv.config();

async function main() {
	const app: Express = express();
	const port = process.env.SERVER_PORT || 5000;
	const cookieSecret = process.env.COOKIE_SECRET || 'cookie-secret';
	const corsConfig = cors({
		origin: [
			process.env.CLIENT_URL_1 as string,
			process.env.CLIENT_URL_2 as string,
		],
	});

	// global middleware
	app.use(corsConfig);

	app.use(cookieParser(cookieSecret));

	app.use(express.urlencoded({ extended: true }));

	app.use(express.json());

	// run telegram bot
	new TelegramBotService()

	app.use('/api', IndexRoute);

	app.get('/', (req: Request, res: Response) => {
		res.send('Express + TypeScript Server');
	});

	app.listen(port, () => {
		console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
	});
}

main().catch(console.error);
