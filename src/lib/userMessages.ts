/** Falha de operação ou funcionalidade ainda incompleta — tom público, sem jargão de API. */
export const UNDER_CONSTRUCTION_MESSAGE =
  'Seja paciente, site ainda em construção, aguarde o desenvolvimento da funcionalidade.';

/**
 * Converte exceção em texto para a tela.
 * Validação e credenciais inválidas continuam específicas; o resto vira o aviso de construção.
 */
export function userFacingError(caught?: unknown): string {
  if (!(caught instanceof Error)) return UNDER_CONSTRUCTION_MESSAGE;
  const message = caught.message.trim();
  if (!message) return UNDER_CONSTRUCTION_MESSAGE;
  if (message === UNDER_CONSTRUCTION_MESSAGE) return message;
  if (isKeptProductMessage(message)) return message;
  return UNDER_CONSTRUCTION_MESSAGE;
}

function isKeptProductMessage(message: string): boolean {
  return (
    /usuário ou senha inválidos/i.test(message) ||
    /administrador e maestro entram/i.test(message) ||
    /senha precisa ter/i.test(message) ||
    /confirmação não confere/i.test(message) ||
    /informe um telefone/i.test(message) ||
    /menores de idade/i.test(message) ||
    /nome de usuário:/i.test(message) ||
    /já existe/i.test(message) ||
    /é obrigatório/i.test(message) ||
    /escolha ao menos/i.test(message) ||
    /somente um administrador/i.test(message) ||
    /senha é longa demais/i.test(message) ||
    /post não encontrado/i.test(message)
  );
}
