import express from 'express';
import { QRScannerService } from '../service/QRScanner.service';

const router = express.Router();

router.post('/generate-qr', async (req, res) => {
	try {
		const imageBuffer = await QRScannerService.encryptMessage(req.body);
		res.set({
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000',
		});
		res.send(imageBuffer);
	} catch (error) {
		return res
			.status(500)
			.json({ error: 'Failed to generate QR code', errorObj: error });
	}
});

router.post('/scan', async (req, res) => {
	try {
		const { bytes, text } = await QRScannerService.decryptMessage(req.body);
		return res.status(200).json({ text, bytes });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Wrong password', errObj: err });
	}
});

export { router as IndexRoute };
