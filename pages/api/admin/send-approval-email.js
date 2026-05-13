import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAILERSEND_SMTP_HOST || 'smtp.mailersend.net',
    port: parseInt(process.env.MAILERSEND_SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.MAILERSEND_SMTP_USER,
        pass: process.env.MAILERSEND_SMTP_PASS,
    },
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { userName, userEmail } = req.body;

        if (!userName || !userEmail) {
            return res.status(400).json({ error: 'Faltan datos del usuario' });
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #dc2626; padding-bottom: 20px; }
                    .logo { max-width: 200px; margin: 20px 0; }
                    .content { background-color: #f9fafb; padding: 30px; border-radius: 8px; }
                    .welcome-text { font-size: 18px; color: #dc2626; font-weight: bold; margin-bottom: 20px; }
                    .message { margin-bottom: 20px; line-height: 1.8; }
                    .highlight { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
                    .cta-button { display: inline-block; background: #dc2626; color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3); }
                    .cta-button:hover { background: #b91c1c; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://res.cloudinary.com/djuk4a84p/image/upload/v1778687241/soledadlogoaccs_cpclqs.png" alt="Soledad Accesorios Logo" class="logo"/>
                        <h1 style="color: #dc2626; margin: 10px 0 0 0;">¡Bienvenido a Soledad | Accesorios!</h1>
                    </div>
                    
                    <div class="content">
                        <div class="welcome-text">
                            ¡Hola ${userName}! 👋
                        </div>
                        
                        <div class="message">
                            <p>¡Excelentes noticias! Tu cuenta ha sido aprobada exitosamente.</p>
                            
                            <p>Ahora tienes acceso completo a nuestra plataforma de ventas mayoristas, incluyendo:</p>
                            
                            <div class="highlight">
                                ✓ Visualización de precios mayoristas<br>
                                ✓ Catálogo completo de productos<br>
                                ✓ Compras en línea<br>
                                ✓ Historial de compras y seguimiento de pedidos
                            </div>
                            
                            <p>Estamos comprometidos a brindarte el mejor servicio y los mejores productos para tu negocio.</p>
                            
                            <center>
                                <a href="${process.env.NEXTAUTH_URL || 'https://www.soledadaccesorios.com.ar'}" class="cta-button" style="color: #ffffff !important;">
                                    Comenzar a Comprar
                                </a>
                            </center>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>Soledad - Accesorios para el pelo</strong></p>
                        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                        <p>Email: contacto@soledadaccesorios.com.ar</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `"${process.env.MAILERSEND_FROM_APPROVAL_NAME || 'Soledad | Accesorios'}" <${process.env.MAILERSEND_FROM_EMAIL_APPROVAL}>`,
            to: userEmail,
            subject: '🎉 ¡Tu cuenta ha sido aprobada! - Soledad | Accesorios',
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ success: true, message: 'Email de aprobación enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar email de aprobación:', error);
        res.status(500).json({ error: 'Error al enviar el email de aprobación' });
    }
}
