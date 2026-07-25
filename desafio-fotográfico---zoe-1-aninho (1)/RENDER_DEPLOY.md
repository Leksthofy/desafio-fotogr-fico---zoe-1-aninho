# Guia de Hospedagem Gratuita no Render.com 🚀

Este projeto está totalmente configurado para ser hospedado **gratuitamente** no [Render.com](https://render.com).

---

## Opção 1: Conectando via GitHub (Recomendado)

1. **Exporte o código para o GitHub**:
   - No menu superior do AI Studio (ou nas configurações do aplicativo), clique em **Export** / **GitHub**.
   - Conecte sua conta do GitHub e crie/envie para um novo repositório.

2. **Crie a conta no Render**:
   - Acesse [dashboard.render.com](https://dashboard.render.com/) e faça login (pode usar sua conta do GitHub).

3. **Crie um novo Web Service**:
   - Clique no botão **New +** no canto superior direito e selecione **Web Service**.
   - Escolha **Build and deploy from a Git repository** e conecte seu repositório do GitHub.

4. **Configurações no Render**:
   - **Name**: `zoe-desafio-fotografico` (ou o nome que preferir)
   - **Language / Environment**: `Node`
   - **Branch**: `main` (ou `master`)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Escolha **Free** ($0/mo)

5. **Variáveis de Ambiente (Opcional)**:
   - Se você utiliza chamadas de IA do Gemini, em **Environment Variables** adicione:
     - Key: `GEMINI_API_KEY` | Value: `Sua_Chave_Gemini`
   - Clique em **Create Web Service**.

---

## Opção 2: Usando o Blueprint (Automático)

Se preferir, o projeto já inclui o arquivo `render.yaml`:
1. No painel do Render, clique em **New +** e escolha **Blueprint**.
2. Selecione o repositório do GitHub.
3. O Render lerá o arquivo `render.yaml` e configurará os comandos de Build (`npm install && npm run build`) e Start (`npm start`) na modalidade **Free** automaticamente!

---

## 💡 Informações Importantes sobre o Plano Gratuito do Render

- **Links da Galeria & Uploads**: O Render criará um link HTTPS do tipo `https://seu-app.onrender.com`.
- **Modo de Repouso (Spin down)**: No plano gratuito, se a aplicação ficar sem acessos por 15 minutos, ela entra em repouso. O primeiro acesso depois disso leva cerca de 30 segundos para ligar novamente.
- **Persistência de Fotos**: Como o servidor no Render armazena os arquivos no disco local `/uploads`, no plano gratuito do Render os arquivos locais podem ser limpos quando o serviço reinicia. As fotos enviadas para a planilha do Google Apps Script permanecerão sempre salvas no Google Drive e na sua Planilha.
