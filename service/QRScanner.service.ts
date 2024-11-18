import CryptoJS, { AES } from 'crypto-js';
import QRCode from 'qrcode';

export class QRScannerService {
	static async decryptMessage(
		body: any
	): Promise<{ text: string; bytes: CryptoJS.lib.WordArray }> {
		const { value, password } = body;
		try {
			const bytes = AES.decrypt(value, password);
			const originalText = bytes.toString(CryptoJS.enc.Utf8);
			if (!originalText) throw new Error('Password or QR may not valid');
			return { text: originalText, bytes };
		} catch (err) {
			throw err;
		}
	}
	static async encryptMessage(body: any): Promise<Buffer> {
		const { value, password } = body;
		const cipherText = AES.encrypt(value, password).toString();

		try {
			const qrCodeText = await QRCode.toDataURL(cipherText);
			const base64Image = qrCodeText.split(';base64,').pop();

			if (!base64Image) {
				throw new Error('Invalid base64 data');
			}

			return Buffer.from(base64Image, 'base64');
		} catch (err) {
			throw err;
		}
	}
}
