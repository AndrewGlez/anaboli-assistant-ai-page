import { config } from '../config';

export const ERROR_MESSAGES = {
  MESSAGE_LIMIT_REACHED: `Has alcanzado el limite de ${config.MESSAGE_LIMIT} mensajes. Por favor, reinicia la conversacion para continuar.`,
  RESPONSE_ERROR: 'Error al recibir la respuesta. Por favor, intentalo de nuevo.',
  SEND_ERROR:
    'Lo siento, ha ocurrido un error al enviar tu mensaje. Por favor, intentalo de nuevo.',
  REGENERATE_ERROR: 'Error al regenerar la respuesta. Por favor, intentalo de nuevo.',
  SELECTION_ERROR: 'Error al procesar la seleccion. Por favor, intentalo de nuevo.',
  USER_KEY_ERROR: 'No se pudo obtener la clave de usuario',
  INITIALIZATION_ERROR: 'Usuario o conversacion no inicializados correctamente',
  NETWORK_ERROR: 'Error de conexion. Por favor, verifica tu conexion a internet.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado. Por favor, intentalo de nuevo.',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

export function getErrorMessage(key: ErrorMessageKey): string {
  return ERROR_MESSAGES[key];
}
