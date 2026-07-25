export interface PhotoSubmission {
  id: string;
  photographer: string;
  challenge: string;
  timestamp: number;
  fileUrl: string;
  serverStored: boolean;
  appsScriptSent: boolean;
  aiFeedback?: string;
}

export interface GameState {
  currentScreen: 'welcome' | 'playing' | 'preview' | 'success' | 'gallery';
  photographerName: string;
  activeChallenge: string | null;
  timeLeft: number;
  timerActive: boolean;
  capturedPhoto: string | null;
  isSubmitting: boolean;
  submissions: PhotoSubmission[];
}

export const DESAFIOS_BASE = [
  "👶 Tire uma foto da Zoe dando um lindo sorriso.",
  "👩 Faça uma selfie com a mamãe Erica.",
  "👨 Faça uma selfie com o papai Thiago.",
  "👵 Fotografe a vovó babando na Zoe.",
  "👴 Tire uma foto do vovô coruja.",
  "🐑 Registre um detalhe da ovelhinha na decoração.",
  "🍬 Fotografe o doce mais lindo da mesa.",
  "🎂 Tire uma foto do bolo inteiro iluminado.",
  "🤫 Flagre alguém comendo um docinho escondido.",
  "🎁 Tire uma foto criativa das lembrancinhas.",
  "🤝 Faça uma selfie com alguém que você conheceu hoje.",
  "🫂 Registre um abraço bem apertado e afetuoso.",
  "✨ Fotografe o look mais estiloso da festa.",
  "👟 Tire uma foto dos sapatinhos da Zoe.",
  "🥂 Registre o momento de um brinde entre os convidados.",
  "🤪 Ache a expressão mais engraçada de um convidado e tire foto.",
  "👨👩👧 Faça uma foto de 3 gerações juntas.",
  "💐 Fotografe um detalhe dos arranjos de flores.",
  "🍰 Tire uma foto bem de pertinho do topo do bolo.",
  "😚 Faça uma selfie fazendo bico (duck face).",
  "🎉 Fotografe a mesa de convidados mais animada.",
  "💕 Tire uma foto da Zoe no colo de alguém especial.",
  "📸 Faça um clique estilo 'paparazzi' de alguém distraído.",
  "📐 Fotografe a decoração de um ângulo diferente.",
  "🤳 Faça uma selfie com 5 pessoas ou mais na foto.",
  "😄 Registre o momento exato de uma gargalhada solta.",
  "🎈 Tire uma foto da Zoe olhando para um balão.",
  "💋 Registre um beijo na testa da Zoe.",
  "👣 Fotografe os pezinhos da Zoe.",
  "🤍 Faça uma foto das mãozinhas da Zoe segurando o dedo de alguém.",
  "🧸 Fotografe a Zoe brincando com um brinquedo da festa.",
  "👀 Registre um olhar de admiração da Zoe para alguém.",
  "🥹 Tire uma foto da mamãe ou do papai olhando para a Zoe sem ela perceber.",
  "💞 Faça uma foto de um casal dançando ou brincando com a Zoe.",
  "🎊 Registre o momento em que todos cantam 'Parabéns'.",
  "👏 Fotografe o momento das palmas durante o parabéns.",
  "🍰 Tire uma foto da reação da Zoe ao experimentar um doce ou bolo.",
  "🎁 Registre a reação de alguém ao entregar um presente para a Zoe.",
  "❤️ Faça uma foto de um beijo em família (mamãe, papai e Zoe).",
  "🌅 Tire a foto que, na sua opinião, melhor resume esse dia especial.",
  // 🌟 Desafios Raros (Bônus - Valem Mais Pontos!)
  "🌟 😴 [DESAFIO RARO] Flagre uma criança dormindo no colo de alguém.",
  "🌟 🫶 [DESAFIO RARO] Registre duas crianças de mãos dadas.",
  "🌟 👀 [DESAFIO RARO] Fotografe alguém olhando a Zoe com um sorriso sincero.",
  "🌟 🎀 [DESAFIO RARO] Faça uma foto apenas de detalhes (laço, vestido, sapatinho e mãozinha).",
  "🌟 😂 [DESAFIO RARO] Encontre a gargalhada mais contagiante da festa.",
  "🌟 🤍 [DESAFIO RARO] Registre um abraço entre duas pessoas que não se viam há muito tempo.",
  "🌟 📷 [DESAFIO RARO] Recrie uma foto antiga da família (se possível).",
  "🌟 ⭐ [DESAFIO RARO] Encontre o convidado mais animado da festa."
];

export function getChallengePoints(challengeTitle: string | null | undefined): number {
  if (!challengeTitle) return 10;
  if (challengeTitle.includes("DESAFIO RARO")) return 25;
  return 10;
}
