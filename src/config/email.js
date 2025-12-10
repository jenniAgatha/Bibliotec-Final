import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user:'senaibibliotec@gmail.com',
        pass: 'Senai12345'
    }
});

export function gerarCodigoVerificacao() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function enviarEmailVerificacao(email, codigo, nome) {
    const mailOptions = {
        from: 'senaibibliotec@gmail.com',
        to: email,
        subject: 'Código de Verificação - Bibliotec',
        html:`
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4CAF50;">Bem-vindo(a) ${nome}!</h2>
                <p>Obrigado por se cadastrar em nossa plataforma.</p>
                <p>Seu código de verificação é:</p>
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                    ${codigo}
                </div>
                <p style="color: #666;">Este código expira em 10 minutos.</p>
                <p style="color: #666; font-size: 12px;">Se você não solicitou este código, ignore este email.</p>
            </div>
        `

    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Email de verificação enviado para:', email);
        return true;
    } catch (error) {
        console.error('❌ Erro ao enviar email de verificação:', error);
        return false;
    }
}