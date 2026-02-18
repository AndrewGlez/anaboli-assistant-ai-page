<div align="center">

# Anaboli Assistant AI

![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.3.5-blue?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.8-%2306B6D4?logo=tailwindcss)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)
![Axios](https://img.shields.io/badge/Axios-1.9.0-blue?logo=axios)
![Dompurify](https://img.shields.io/badge/Dompurify-3.2.6-blue?logo=dompurify)
![Marked](https://img.shields.io/badge/Marked-15.0.12-blue?logo=marked)
![React--Error--Boundary](https://img.shields.io/badge/React--Error--Boundary-6.1.1-blue?logo=react)
![Lucide](https://img.shields.io/badge/Lucide-0.513.0-blue?logo=lucide)
![Husky](https://img.shields.io/badge/Husky-9.1.7-blue?logo=husky)
![Vitest](https://img.shields.io/badge/Vitest-1.6.0-blue?logo=vitest)

</div>

Anaboli Assistant es una aplicación de chat impulsada por IA construida con React, TypeScript y Vite. Proporciona una interfaz intuitiva para que los usuarios interactúen con un asistente de IA sobre productos y servicios.

## Características

- Interfaz de chat en tiempo real con indicadores de escritura
- Seguimiento del límite de mensajes con indicadores visuales
- Redimensionamiento automático del área de texto
- Límites de error para un manejo robusto de errores
- Diseño responsive con Tailwind CSS
- SSE (Eventos enviados por el servidor) para respuestas en streaming

## Capturas de pantalla

### Interfaz principal de chat

![Interfaz principal de chat](docs/screenshots/chat-interface.png)

## Inicio rápido

### Requisitos previos

- Node.js 20.x o superior
- npm o yarn

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

### Construcción para producción

```bash
npm run build
```

### Ejecutar pruebas

```bash
npm run test
```

## Estructura del proyecto

```
src/
├── components/          # Componentes React
│   ├── ChatArea.tsx     # Interfaz principal de chat
│   ├── ChatInput.tsx    # Componente de entrada de mensaje
│   ├── MessageBubble.tsx # Visualización individual de mensaje
│   └── ErrorFallback/   # Componentes de límite de error
├── context/             # Proveedores de contexto React
│   ├── ChatContext.tsx  # Contexto principal de chat
│   ├── chatReducer.ts   # Reductor de estado de chat
│   └── ChatDispatchContext.tsx # Contexto de despacho de chat
├── services/            # Servicios API
│   └── api.ts           # Cliente API para conexiones SSE
├── utils/               # Funciones de utilidad
│   ├── formatters.ts    # Utilidades de formato de mensaje
│   └── errorMessages.ts # Constantes de mensajes de error
├── assets/              # Activos estáticos
│   ├── AnaboliLogo.jpg  # Logotipo de Anaboli
│   └── Milkshake.png    # Activos adicionales
└── App.tsx              # Componente principal de la aplicación
```

## Licencia

MIT
