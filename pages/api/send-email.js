import nodemailer from 'nodemailer';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { to, subject, body, bcc } = req.body;
    if (!to || !subject || !body) return res.status(400).json({ error: 'Faltan campos.' });

    const transporter = nodemailer.createTransport({
        host: process.env.MAILERSEND_SMTP_HOST,
        port: Number(process.env.MAILERSEND_SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.MAILERSEND_SMTP_USER,
            pass: process.env.MAILERSEND_SMTP_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: `"${process.env.MAILERSEND_FROM_APPROVAL_NAME}" <${process.env.MAILERSEND_FROM_EMAIL_APPROVAL}>`,
            to,
            ...(bcc && { bcc }),
            subject,
            html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
        });
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al enviar el email.' });
    }
}
