# Guía Español - para crear Mini-Apps con Sherry SDK y Next.js

Esta guía detalla el proceso paso a paso para crear mini-aplicaciones (mini-apps) utilizando el SDK de Sherry Links dentro de una aplicación Next.js, permitiéndote exponer metadatos de acción y gestionar su ejecución.

## Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Configuración del Proyecto](#configuración-del-proyecto)
- [Implementación del Endpoint GET](#implementación-del-endpoint-get)
- [Implementación del Endpoint POST](#implementación-del-endpoint-post)
- [Manejo de CORS](#manejo-de-cors)
- [Prueba de la Mini-App](#prueba-de-la-mini-app)
- [Despliegue en Producción](#despliegue-en-producción)
- [Tipos de Parámetros Admitidos](#tipos-de-parámetros-admitidos)

## Requisitos Previos

- Node.js (versión 18.x o superior recomendada)
- npm, yarn o pnpm
- Conocimientos básicos de Next.js y TypeScript
- Conocimientos básicos de blockchain (cadenas, transacciones)

## Configuración del Proyecto

### 1. Crea un nuevo proyecto Next.js

```bash
npx create-next-app@latest sherry-miniapp --typescript --eslint --tailwind --src-dir --app --import-alias "@/*"
cd sherry-miniapp
```

### 2. Instala las dependencias necesarias

```bash
npm install @sherrylinks/sdk viem wagmi
```

### 3. Configura las variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Implementación del Endpoint GET

El endpoint GET se encarga de exponer los metadatos de la mini-app, que serán utilizados por las plataformas de Sherry Links para mostrar información sobre la acción.

### 1. Crea la estructura de directorios

```
mkdir -p app/api/example
```

### 2. Crea el archivo de ruta

Crea el archivo `app/api/example/route.ts` con el siguiente contenido:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { avalancheFuji } from "viem/chains";
import { createMetadata, Metadata, ValidatedMetadata } from "@sherrylinks/sdk";

export async function GET(_req: NextRequest, _res: NextResponse) {
    // Dirección del contrato - debe coincidir con la dirección en el endpoint POST
    const CONTRACT_ADDRESS = "0xYourContractAddressHere";

    try {
        // Creamos el objeto de metadatos paso a paso
        const metadata: Metadata = {
            // ----- Propiedades generales de la mini-app -----
            
            // URL completa a la que se debe acceder para obtener los metadatos
            url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/dynamic-action`,
            
            // URL del ícono que se mostrará para la mini-app
            icon: "https://avatars.githubusercontent.com/u/117962315",
            
            // Título de la mini-app que aparecerá en la interfaz
            title: "Mensaje con Timestamp",
            
            // URL base para las llamadas a la API
            baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
            
            // Descripción detallada de lo que hace la mini-app
            description: "Almacena un mensaje con un timestamp optimizado calculado por nuestro algoritmo",
            
            // ----- Definición de las acciones disponibles -----
            actions: [
                {
                    // Tipo de acción: 'dynamic' indica que se ejecutará con una llamada a un endpoint
                    type: "dynamic",
                    
                    // Texto que se mostrará en el botón de acción
                    label: "Almacenar Mensaje",
                    
                    // Descripción detallada de lo que hace esta acción específica
                    description: "Almacena tu mensaje con un timestamp personalizado calculado para un almacenamiento óptimo",
                    
                    // Cadenas blockchain compatibles
                    chains: { 
                        source: "fuji" // Cadena de origen (Avalanche Fuji)
                    },
                    
                    // Ruta del endpoint POST que procesará esta acción
                    path: `/api/example`,
                    
                    // ----- Parámetros que necesita la acción -----
                    // Cada parámetro sin valor predefinido generará un campo de entrada en la UI
                    params: [
                        {
                            // Nombre del parámetro (se usará como nombre de queryParam en la petición POST)
                            name: "message",
                            
                            // Etiqueta que verá el usuario junto al campo de entrada
                            label: "Tu Mensaje",
                            
                            // Tipo de dato del campo (text, number, select, etc.)
                            type: "text",
                            
                            // Si es obligatorio completar este campo
                            required: true,
                            
                            // Descripción o instrucciones para el usuario
                            description: "Ingresa el mensaje que deseas almacenar en la blockchain",
                            
                            // NOTA: Si quisiéramos un valor predefinido, podríamos usar:
                            // value: "Valor predeterminado",
                            // Cuando se incluye 'value', no se renderiza un input para este parámetro
                        },
                        // Podríamos añadir más parámetros según sea necesario
                    ],
                    
                    // Podrían definirse más acciones según sea necesario
                },
            ],
        };

        // Validamos los metadatos utilizando la función del SDK
        const validated: ValidatedMetadata = createMetadata(metadata);

        // Retornamos los metadatos validados con cabeceras CORS
        return NextResponse.json(validated, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Error al crear metadatos" },
            { status: 500 }
        );
    }
}
```

### Claves del Endpoint GET

#### Estructura de los Metadatos

Los metadatos son la base de la mini-app y se construyen de manera jerárquica:

1. **Propiedades generales de la mini-app**:
   - `url`: URL completa del endpoint de la mini-app.
   - `icon`: URL del ícono que se mostrará.
   - `title`: Nombre de la mini-app.
   - `baseUrl`: URL base para todas las llamadas API.
   - `description`: Descripción general de la mini-app.

2. **Acciones disponibles** (array `actions`):
   - `type`: Tipo de acción (generalmente `"dynamic"` para mini-apps).
   - `label`: Texto del botón que ejecutará la acción.
   - `description`: Descripción detallada de la acción.
   - `chains`: Cadenas blockchain compatibles con la acción.
   - `path`: Ruta del endpoint POST que procesará la acción.

3. **Parámetros de la acción** (array `params` dentro de cada acción):
   - `name`: Identificador del parámetro (se usará como nombre en la queryParam).
   - `label`: Etiqueta que verá el usuario en la interfaz.
   - `type`: Tipo de dato (text, number, select, etc.).
   - `required`: Si el campo es obligatorio.
   - `description`: Instrucciones para el usuario.
   - `value` (opcional): Valor predeterminado. **Importante**: Si se proporciona un valor, no se renderizará un campo de entrada para este parámetro.

#### Comportamiento de los Parámetros

- Cada parámetro **sin** valor predefinido (`value`) generará automáticamente un campo de entrada en la interfaz de usuario.
- Cuando el usuario envía el formulario, cada valor ingresado se enviará como un parámetro de consulta al endpoint POST.
- El nombre del parámetro en la URL será exactamente el mismo que se definió en la propiedad `name`.

#### Otras Consideraciones

- **Validación**: El método `createMetadata` del SDK valida la estructura completa.
- **CORS**: Se configuran las cabeceras para permitir solicitudes desde diferentes orígenes.

## Implementación del Endpoint POST

El endpoint POST se encarga de ejecutar la acción dinámica, recibiendo los parámetros y devolviendo una respuesta de ejecución.

### Añade el código del endpoint POST al archivo `route.ts`:

```typescript
import { serialize } from 'wagmi';
import { ExecutionResponse } from "@sherrylinks/sdk";

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        // Obtenemos los parámetros de la URL
        // Los nombres de los queryParams coinciden con los nombres definidos en 'name' en la configuración de metadatos
        const { searchParams } = new URL(req.url);
        const message = searchParams.get("message");
        
        // Validamos que el parámetro 'message' exista (marcado como required en los metadatos)
        if (!message) {
            return NextResponse.json(
                { error: "El parámetro 'message' es requerido" },
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
        
        // ---- Procesamiento de los datos recibidos ----
        // Aquí puedes realizar cualquier lógica necesaria con los parámetros recibidos
        // Por ejemplo, podrías:
        // - Añadir un timestamp al mensaje
        // - Validar datos adicionales
        // - Interactuar con otros servicios
        
        // ---- Creación de la transacción ----
        // En un caso real, aquí crearías la transacción para interactuar con tu contrato
        const tx = {
            to: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52', // Dirección del contrato
            value: BigInt(1000000), // Valor a enviar (en wei)
            chainId: avalancheFuji.id, // ID de la cadena (Avalanche Fuji)
            // También podrías incluir:
            // - data: para llamadas a funciones de contratos
            // - maxFeePerGas, maxPriorityFeePerGas: para configurar fees
            // - nonce: para control de transacciones
        }

        // ---- Serialización de la transacción ----
        // Convierte la transacción a un formato que puede ser firmado y enviado a la blockchain
        const serialized = serialize(tx);

        // ---- Creación de la respuesta ----
        // Formato específico que espera el SDK de Sherry
        const resp: ExecutionResponse = {
            serializedTransaction: serialized, // Transacción serializada lista para ser firmada
            chainId: avalancheFuji.name, // Nombre de la cadena (importante: debe coincidir con la especificada en los metadatos)
        }

        // Retornamos la respuesta
        return NextResponse.json(resp, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });

    } catch (error) {
        console.error("Error en la solicitud POST:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
```

### Claves del Endpoint POST

#### Flujo de Procesamiento

1. **Recepción de Parámetros**:
   - Los parámetros se reciben como query params en la URL.
   - Los nombres de los parámetros coinciden exactamente con los nombres definidos en la propiedad `name` de cada parámetro en los metadatos.
   - Ejemplo: Si definiste un parámetro con `name: "message"`, se accede con `searchParams.get("message")`.

2. **Validación de Parámetros**:
   - Se verifica que los parámetros marcados como `required: true` en los metadatos estén presentes.
   - Si falta algún parámetro requerido, se devuelve un error 400 (Bad Request).

3. **Procesamiento de Datos**:
   - Aquí puedes implementar cualquier lógica de negocio necesaria.
   - Ejemplos: añadir timestamps, validaciones adicionales, interacciones con APIs externas.

4. **Creación de la Transacción**:
   - Se construye el objeto de transacción con los parámetros necesarios para interactuar con la blockchain.
   - Componentes principales:
     - `to`: Dirección del contrato inteligente.
     - `value`: Cantidad de tokens nativos a enviar (en wei).
     - `chainId`: ID numérico de la cadena blockchain.
     - `data` (opcional): Datos codificados para llamadas a funciones de contratos.

5. **Serialización**:
   - La transacción se serializa usando la función `serialize` de `wagmi`.
   - Esto convierte la transacción a un formato que puede ser firmado por una wallet.

6. **Respuesta**:
   - Se devuelve un objeto `ExecutionResponse` que contiene:
     - `serializedTransaction`: La transacción serializada lista para ser firmada.
     - `chainId`: El nombre de la cadena (debe coincidir con la especificada en los metadatos).

#### Relación con los Metadatos

- Cada parámetro definido en los metadatos que no tiene un `value` predefinido generará un campo de entrada en la interfaz de usuario.
- Los valores introducidos por el usuario se envían automáticamente al endpoint POST cuando se activa la acción.
- Es crucial que los nombres de los parámetros en el código `searchParams.get()` coincidan con los nombres definidos en los metadatos.

## Manejo de CORS

Para permitir solicitudes desde diferentes orígenes, necesitamos manejar correctamente las solicitudes CORS, incluidas las solicitudes preflight.

### Añade el manejador OPTIONS al archivo `route.ts`:

```typescript
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204, // Sin contenido
        headers: {
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version", 
        },
    });
}
```

## Prueba de la Mini-App

Una vez implementados los endpoints, puedes probarlos de dos maneras:

### 1. Inicia el servidor de desarrollo

```bash
npm run dev
```

### 2. Prueba el endpoint GET directamente

Abre un navegador y visita `http://localhost:3000/api/example`. Deberías ver los metadatos de la mini-app en formato JSON.

### 3. Prueba el endpoint POST manualmente

Usa Postman o curl para hacer una solicitud POST a `http://localhost:3000/api/example?message=HolaMundo`. Deberías recibir la transacción serializada en la respuesta.

```bash
curl -X POST "http://localhost:3000/api/example?message=HolaMundo"
```

### 4. Prueba con las herramientas de Sherry

#### A. Usando la aplicación principal de Sherry

1. Inicia tu servidor de desarrollo para que tu endpoint esté accesible.
2. Visita [https://app.sherry.social/home](https://app.sherry.social/home)
3. Busca el campo de entrada para ingresar URLs de mini-apps.
4. Ingresa la URL de tu endpoint GET (por ejemplo, `http://localhost:3000/api/example`).
5. La plataforma Sherry se encargará de renderizar la interfaz basada en tus metadatos.

#### B. Usando el Debugger de Sherry

El debugger de Sherry es una herramienta especializada para validar y probar tus mini-apps. Ofrece más opciones para debug y te permite probar rápidamente tus metadatos.

1. Visita [https://app.sherry.social/debugger](https://app.sherry.social/debugger)
2. Tienes tres opciones para probar tus metadatos:
   - **URL**: Ingresa la URL de tu endpoint GET.
   - **JSON**: Copia y pega el JSON de metadatos directamente en el campo.
   - **TypeScript**: Pega tu código TypeScript que genera los metadatos.
3. El debugger validará tus metadatos y te mostrará una previsualización de cómo se verá tu mini-app.
4. Si hay errores o problemas con tus metadatos, el debugger los señalará.
5. También puedes reportar bugs o problemas directamente desde el debugger.

> **Nota**: El debugger está en desarrollo, por lo que podrías encontrar algunos errores. Si encuentras algún problema, puedes reportarlo directamente desde la herramienta.

## Despliegue en Producción

Para desplegar tu mini-app en un entorno de producción:

### 1. Construye la aplicación Next.js:

```bash
npm run build
```

### 2. Configura variables de entorno para producción:

```
NEXT_PUBLIC_API_URL=https://tu-dominio.com
```

### 3. Inicia el servidor de producción:

```bash
npm start
```

Alternativamente, puedes desplegar en servicios como Vercel, Netlify o cualquier proveedor que soporte aplicaciones Next.js.

## Tipos de Parámetros Admitidos

El SDK de Sherry admite varios tipos de parámetros que puedes utilizar en tus mini-apps:

| Tipo | Descripción | Ejemplo de Uso |
|------|-------------|----------------|
| `text` | Campo de texto simple | Mensajes, nombres, identificadores |
| `number` | Valores numéricos | Cantidades, IDs numéricos |
| `select` | Lista desplegable de opciones | Seleccionar una opción de una lista predefinida |
| `boolean` | Valor verdadero/falso | Opciones de activación/desactivación |
| `date` | Selector de fecha | Fechas de vencimiento, programación |
| `file` | Carga de archivos | Subir imágenes, documentos |

Para utilizar el tipo `select`, necesitas definir las opciones disponibles:

```javascript
{
  name: "priority",
  label: "Prioridad",
  type: "select",
  required: true,
  description: "Selecciona la prioridad del mensaje",
  options: [
    { value: "low", label: "Baja" },
    { value: "medium", label: "Media" },
    { value: "high", label: "Alta" }
  ]
}
```