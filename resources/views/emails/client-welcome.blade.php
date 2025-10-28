<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao Portal LogisticaPro</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #358c9c 0%, #246a77 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .message {
            color: #555;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .info-box {
            background-color: #f0f9fb;
            border-left: 4px solid #358c9c;
            padding: 20px;
            margin: 25px 0;
            border-radius: 6px;
        }
        .info-box h3 {
            margin-top: 0;
            color: #358c9c;
            font-size: 16px;
        }
        .info-box p {
            margin: 8px 0;
            font-size: 14px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #358c9c 0%, #246a77 100%);
            color: white !important;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 30px 0;
            text-align: center;
            box-shadow: 0 4px 12px rgba(53, 140, 156, 0.3);
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .features {
            margin: 30px 0;
        }
        .feature-item {
            display: flex;
            align-items: start;
            margin-bottom: 20px;
        }
        .feature-icon {
            background-color: #f0f9fb;
            color: #358c9c;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            flex-shrink: 0;
            font-size: 20px;
        }
        .feature-text {
            flex: 1;
        }
        .feature-text strong {
            color: #1a1a1a;
            display: block;
            margin-bottom: 4px;
        }
        .feature-text span {
            color: #666;
            font-size: 14px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .footer-logo {
            font-size: 20px;
            font-weight: 700;
            color: #358c9c;
            margin-bottom: 10px;
        }
        .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 25px 0;
        }
        .note {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 25px 0;
            border-radius: 6px;
            font-size: 14px;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🚢 LogisticaPro</h1>
            <p style="margin: 10px 0 0; opacity: 0.95; font-size: 16px;">Portal do Cliente</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Olá, {{ $client->display_name }}!
            </div>

            <p class="message">
                Bem-vindo ao <strong>Portal do Cliente LogisticaPro</strong>! Estamos muito felizes em tê-lo como nosso cliente.
            </p>

            <p class="message">
                Criamos uma conta exclusiva para você no nosso portal, onde poderá acompanhar todos os seus processos logísticos em tempo real, visualizar documentos, faturas e muito mais.
            </p>

            <!-- Info Box -->
            <div class="info-box">
                <h3>📧 Suas Credenciais de Acesso</h3>
                <p><strong>Email:</strong> {{ $client->email }}</p>
                <p style="margin-bottom: 0;">Para ativar sua conta, clique no botão abaixo e crie sua senha de acesso.</p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center;">
                <a href="{{ $setupUrl }}" class="cta-button">
                    Ativar Minha Conta
                </a>
            </div>

            <div class="note">
                <strong>⏰ Importante:</strong> Este link é válido por 7 dias. Após esse período, será necessário solicitar um novo link de acesso.
            </div>

            <div class="divider"></div>

            <!-- Features -->
            <h3 style="color: #1a1a1a; margin-bottom: 20px;">O que você pode fazer no portal:</h3>

            <div class="features">
                <div class="feature-item">
                    <div class="feature-icon">📦</div>
                    <div class="feature-text">
                        <strong>Acompanhar Processos</strong>
                        <span>Visualize o status e progresso de todos os seus shipments em tempo real</span>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">📄</div>
                    <div class="feature-text">
                        <strong>Documentos</strong>
                        <span>Acesse e faça download de todos os documentos dos seus processos</span>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">💰</div>
                    <div class="feature-text">
                        <strong>Faturas</strong>
                        <span>Consulte e baixe suas faturas a qualquer momento</span>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div class="feature-text">
                        <strong>Cotações</strong>
                        <span>Receba e gerencie cotações de serviços logísticos</span>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">📱</div>
                    <div class="feature-text">
                        <strong>Acesso Mobile</strong>
                        <span>Portal 100% responsivo, acesse de qualquer dispositivo</span>
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Se você tiver alguma dúvida ou precisar de ajuda, nossa equipe está à disposição.
                Basta responder este email ou entrar em contato conosco.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-logo">LogisticaPro</div>
            <p style="margin: 5px 0;">
                Soluções logísticas de excelência<br>
                © {{ date('Y') }} LogisticaPro. Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>
</html>
