# Creando Mini Apps con Next.js y Sherry SDK

Esta guía te enseñará paso a paso cómo crear una mini app utilizando Next.js y el SDK de Sherry Links. Las mini apps son aplicaciones dinámicas que pueden ser integradas en diferentes plataformas y permiten a los usuarios interactuar con contratos inteligentes de manera sencilla.

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Creando el Endpoint GET - Metadata](#creando-el-endpoint-get---metadata)
4. [Creando el Endpoint POST - Ejecución](#creando-el-endpoint-post---ejecución)
5. [Manejo de CORS](#manejo-de-cors)
6. [Probando tu Mini App](#probando-tu-mini-app)
7. [Resolución de Problemas](#resolución-de-problemas)

## Requisitos Previos

- Node.js (versión 18.x o superior)
- npm, yarn o pnpm
- Conocimientos básicos de Next.js y TypeScript
- Cuenta en una plataforma blockchain (para pruebas)

## Configuración Inicial

### 1. Crear el Proyecto Next.js

```bash
npx create-next-app@latest mi-sherry-app --typescript --eslint --tailwind --src-dir --app --import-alias "@/*"
cd mi-sherry-app
```

### 2. Instalar Dependencias

```bash
npm install @sherrylinks/sdk viem wagmi
```

### 3. Configurar Next.js (Opcional)

Para evitar errores de build con ESLint, puedes deshabilitarlo en `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
```

## Creando el Endpoint GET - Metadata

El endpoint GET es el corazón de tu mini app. Aquí defines toda la información y estructura que las plataformas necesitan para renderizar tu aplicación.

### 1. Crear el Archivo de Ruta

Crea el archivo `app/api/mi-app/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createMetadata, Metadata, ValidatedMetadata } from '@sherrylinks/sdk';
```

### 2. Configurar la Información General

Comencemos definiendo la información básica de tu mini app:

```typescript
export async function GET(req: NextRequest) {
    try {
        // Obtener la URL base del servidor
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const serverUrl = `${protocol}://${host}`;

        const metadata: Metadata = {
            url: "https://tu-sitio-web.com", // URL de tu sitio web principal
            icon: "https://tu-sitio-web.com/icon.png", // URL del ícono de tu app
            title: "Mi Mini App", // Título que aparecerá en las plataformas
            baseUrl: serverUrl, // URL base donde está hospedada tu app
            description: "Descripción detallada de lo que hace tu mini app",
            // Las acciones las definiremos en el siguiente paso
        };
    } catch (error) {
      
    }
}
```

#### Explicación de Campos Generales:

- **url**: URL de tu sitio web o documentación principal
- **icon**: Imagen que representará tu mini app (debe ser accesible públicamente)
- **title**: Nombre corto y descriptivo de tu aplicación
- **baseUrl**: URL donde está corriendo tu aplicación (se construye automáticamente)
- **description**: Explicación clara de qué hace tu mini app

### 3. Definir las Acciones

Ahora vamos a agregar las acciones que los usuarios pueden realizar:

```typescript
const metadata: Metadata = {
  // ... información general anterior ...
  actions: [
    {
      type: 'dynamic', // Tipo de acción
      label: 'Ejecutar Acción', // Texto que aparecerá en el botón
      description: 'Descripción de lo que hace esta acción específica',
      chains: {
        source: 'fuji', // Blockchain donde se ejecutará (fuji = Avalanche Fuji Testnet)
      },
      path: `/api/mi-app`, // Ruta del endpoint POST que manejará la ejecución
      // Los parámetros los definiremos en el siguiente paso
    },
  ],
};
```

#### Explicación de Campos de Acción:

- **type**: Siempre debe ser "dynamic" para mini apps más complejas
- **label**: Texto del botón que verán los usuarios
- **description**: Explicación de qué hace esta acción
- **chains.source**: Nombre de la blockchain (ej: "avalanche", "fuji")
- **path**: Ruta de tu endpoint POST que ejecutará la acción

### 4. Configurar Parámetros

Los parámetros son los datos que el usuario debe proporcionar. Si no tienen un valor predeterminado, se renderizará un input:

```typescript
const metadata: Metadata = {
  // ... información anterior ...
  actions: [
    {
      // ... configuración anterior ...
      params: [
        {
          name: 'mensaje', // Nombre del parámetro (se usará como query param)
          label: 'Tu Mensaje', // Etiqueta que verá el usuario
          type: 'text', // Tipo de input (text, number, email, etc.)
          required: true, // Si es obligatorio o no
          description: 'Ingresa el mensaje que quieres guardar en la blockchain',
        },
      ],
    },
  ],
};
```

#### Tipos de Parámetros Disponibles:

- **text**: Campo de texto libre
- **number**: Solo números
- **email**: Validación de email
- **url**: Validación de URL
- **password**: Campo de contraseña
- **textarea**: Texto largo

### 5. Validar y Retornar la Metadata

```typescript
export async function GET(req: NextRequest) {
  try {
    // ... construcción de metadata anterior ...

    // Validar la metadata usando el SDK
    const validated: ValidatedMetadata = createMetadata(metadata);

    // Retornar con headers CORS
    return NextResponse.json(validated, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    });
  } catch (error) {
    console.error('Error creando metadata:', error);
    return NextResponse.json({ error: 'Error al crear metadata' }, { status: 500 });
  }
}
```

## Creando el Endpoint POST - Ejecución

El endpoint POST maneja la ejecución real de tu mini app. Recibe los parámetros del usuario y devuelve una transacción serializada.

### 1. Configurar el Handler POST

```typescript
import { avalancheFuji } from "viem/chains";
import { ExecutionResponse } from "@sherrylinks/sdk";
import { serialize } from 'wagmi';

export async function POST(req: NextRequest) {
    try {
        // Obtener parámetros de la URL
        const { searchParams } = new URL(req.url);
        const mensaje = searchParams.get("mensaje");

        // Validar parámetros requeridos
        if (!mensaje) {
            return NextResponse.json(
                { error: "El parámetro 'mensaje' es requerido" },
                {
                    status: 400,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization",
                    },
                }
            );
        }
```

### 2. Procesar los Datos y Crear la Transacción

```typescript
// Procesar los datos (aquí puedes agregar tu lógica de negocio)
console.log('Mensaje recibido:', mensaje);

// Crear la transacción
const tx = {
  to: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52', // Dirección destino
  value: 1 * 1e18 : 1000000), // Valor en wei
  chainId: avalancheFuji.id, // ID de la blockchain
  // data: "0x..." // Puedes agregar datos de contrato aquí
};
```

### 3. Serializar y Retornar la Transacción

```typescript
        // Serializar la transacción
        const serializedTx = serialize(tx);

        // Crear la respuesta
        const response: ExecutionResponse = {
            serializedTransaction: serializedTx,
            chainId: avalancheFuji.name, // Nombre de la chain
        };

        return NextResponse.json(response, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });

    } catch (error) {
        console.error("Error en POST:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
```

## Manejo de CORS

Para permitir que tu mini app sea utilizada desde diferentes dominios, necesitas manejar las peticiones OPTIONS:

```typescript
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept',
    },
  });
}
```

## Probando tu Mini App

Una vez que hayas creado tu endpoint GET, tienes varias opciones para probar tu mini app:

### Opción 1: Sherry Social App

1. Ve a [https://app.sherry.social/home](https://app.sherry.social/home)
2. En el campo de dirección, ingresa la URL de tu endpoint GET
3. Ejemplo: `http://localhost:3000/api/mi-app` (para desarrollo local)
4. La plataforma renderizará automáticamente tu mini app

### Opción 2: Debugger de Sherry (Recomendado para Desarrollo)

El debugger te permite probar tu mini app de múltiples maneras:

1. Ve a [https://app.sherry.social/debugger](https://app.sherry.social/debugger)

2. **Opción A - URL**: Pega la URL de tu endpoint GET
3. **Opción B - JSON**: Copia y pega la respuesta JSON de tu endpoint
4. **Opción C - TypeScript**: Pega directamente tu código TypeScript

**Nota**: El debugger está en desarrollo y puede tener bugs. Puedes reportar problemas directamente desde la interfaz del debugger.

### Pasos para Probar:

1. **Inicia tu servidor de desarrollo**:

   ```bash
   npm run dev
   ```

2. **Verifica tu endpoint GET**:

   - Ve a `http://localhost:3000/api/mi-app`
   - Deberías ver la metadata JSON

3. **Prueba en el debugger**:

   - Usa la URL: `http://localhost:3000/api/mi-app`
   - Verifica que se rendericen correctamente los campos de entrada
   - Prueba completar el formulario y enviar

4. **Verifica la ejecución**:
   - Completa los campos requeridos
   - Haz clic en el botón de acción
   - Deberías recibir una transacción serializada

## Resolución de Problemas

### Error: "CORS policy"

- Asegúrate de que todos tus endpoints incluyan los headers CORS correctos
- Verifica que el método OPTIONS esté implementado

### Error: "Metadata validation failed"

- Revisa que todos los campos requeridos estén presentes
- Verifica que los tipos de datos sean correctos
- Usa `createMetadata()` para validar tu metadata

### Error: "Parameter required"

- Asegúrate de que los parámetros requeridos estén marcados como `required: true`
- Verifica que los nombres de los parámetros coincidan entre la metadata y el POST

### La mini app no se renderiza correctamente

- Verifica que la URL de tu endpoint GET sea accesible públicamente
- Revisa la consola del navegador para errores de JavaScript
- Asegúrate de que el JSON de respuesta sea válido

### Errores de serialización de transacciones

- Verifica que los valores estén en el formato correcto (BigInt para valores de wei)
- Asegúrate de que el chainId sea válido
- Revisa que la dirección 'to' sea una dirección Ethereum válida

## Código de Ejemplo

### Español

Puedes encontrar un ejemplo completo de este tutorial en el siguiente repositorio:
[https://github.com/SherryLabs/sherry-example](https://github.com/SherryLabs/sherry-example)

Este repositorio contiene todo el código necesario para implementar una mini app funcional usando Next.js y Sherry SDK.

---

¡Felicidades! Ya tienes tu primera mini app funcionando con Sherry SDK. Puedes expandir la funcionalidad agregando más parámetros, validaciones personalizadas, o integrando con contratos inteligentes más complejos.
