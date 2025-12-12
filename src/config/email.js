import nodemailer from 'nodemailer';

// Configuração do email
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'senaibibliotec@gmail.com',  
        pass: 'lbyi aqqd hrfa dfsx'       
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Gera código de 5 dígitos
export function gerarCodigoVerificacao() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

// Envia email com código
export async function enviarEmailVerificacao(email, codigo, nome) {
    const mailOptions = {
        from: 'seu-email@gmail.com',  // ⚠️ TROQUE
        to: email,
        subject: 'Código de Verificação - Livraria',
        html: `
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
        console.log('📧 Preparando para enviar email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado com sucesso!');
        console.log('   → ID da mensagem:', info.messageId);
        console.log('   → Para:', email);
        return true;
        
    } catch (error) {
        console.error('❌ ERRO AO ENVIAR EMAIL:');
        console.error('   → Código do erro:', error.code);
        console.error('   → Mensagem:', error.message);
        
        // Log detalhado dos erros mais comuns
        if (error.code === 'ENOTFOUND') {
            console.error('   → Não foi possível encontrar o servidor de email');
        } else if (error.responseCode === 535) {
            console.error('   → Falha na autenticação (email/senha incorretos)');
        } else if (error.responseCode === 550) {
            console.error('   → Email destinatário não existe ou foi rejeitado');
        } else if (error.responseCode === 553) {
            console.error('   → Email inválido ou não aceito pelo servidor');
        } else if (error.code === 'ECONNECTION') {
            console.error('   → Erro de conexão com o servidor');
        }
        
        // Retorna FALSE para indicar falha
        return false;
    }
}