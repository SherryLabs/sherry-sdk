# HTML Action Examples

Este directorio contiene ejemplos para probar la funcionalidad de HTML Actions con context sharing.

## Archivos

- `host-app.html` - Aplicación host que simula Sherry embedando juegos
- `simple-game.html` - Juego simple de Tic-Tac-Toe que recibe contexto de Sherry

## Cómo Probar

### 1. Servidor Local

Para probar correctamente necesitas un servidor local debido a las restricciones de iframe:

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js (si tienes npx)
npx serve .

# Opción 3: PHP
php -S localhost:8000
```

### 2. Abrir la Aplicación Host

Navega a: `http://localhost:8000/examples/host-app.html`

### 3. Probar Funcionalidad

#### Configuración Básica:

1. **Game URL**: Debe apuntar a `./simple-game.html`
2. **Enable Context Sharing**: Activado por defecto
3. **Auto-inject URL Params**: Activado por defecto

#### Simulador de Wallet:

- Modifica los valores de address, chain ID, balance, etc.
- Estos valores se pasarán al juego embedido

#### Acciones Disponibles:

- **Load Game**: Carga el juego en un iframe con contexto
- **Simulate Chain Change**: Simula cambio de blockchain
- **Simulate Address Change**: Simula cambio de wallet
- **Unload Game**: Remueve el juego

## Flujo de Funcionamiento

### 1. Context Sharing Habilitado

```typescript
const action: HTMLAction = {
  type: 'html',
  url: './simple-game.html',
  contextSharing: {
    enabled: true,
    provides: ['userAddress', 'chainId', 'balance', 'networkName'],
    allowedOrigins: ['*'],
    autoInject: true,
  },
};
```

### 2. Auto-injection

Si `autoInject: true`, el executor automáticamente agrega parámetros a la URL:

```
./simple-game.html?userAddress=0x123...&chainId=43114&balance=1.234...
```

### 3. PostMessage API

Si `autoInject: false` o el juego necesita datos dinámicos:

**Desde el Juego:**

```javascript
const address = await SherryContextAPI.requestData('userAddress');
```

**Respuesta de Sherry:**

```javascript
window.parent.postMessage(
  {
    type: 'SHERRY_RESPONSE',
    requestId: 'abc123',
    success: true,
    dataType: 'userAddress',
    value: '0x742d35Cc6636C0532925a3b8D57B65A5d8b8Cd5b',
  },
  '*',
);
```

## Casos de Uso Reales

### 1. Juego Simple (Como el ejemplo)

- No maneja wallets internamente
- Recibe contexto de Sherry para personalización
- Envía eventos de juego de vuelta a Sherry

### 2. Widget de DeFi

```typescript
const defiAction: HTMLAction = {
  type: 'html',
  url: 'https://defi-widget.com/portfolio',
  contextSharing: {
    enabled: true,
    provides: ['userAddress', 'chainId'],
    allowedOrigins: ['https://defi-widget.com'],
    autoInject: false, // Usa postMessage para datos dinámicos
  },
};
```

### 3. Leaderboard Embedable

```typescript
const leaderboardAction: HTMLAction = {
  type: 'html',
  url: 'https://game-leaderboard.com/widget',
  contextSharing: {
    enabled: true,
    provides: ['userAddress'],
    allowedOrigins: ['https://game-leaderboard.com'],
    autoInject: true, // Inyecta address en URL para destacar usuario
  },
};
```

## Consideraciones de Seguridad

### 1. Allowed Origins

En producción, siempre especifica dominios exactos:

```typescript
allowedOrigins: ['https://trusteddomain.com', 'https://anotherdomain.com'];
```

### 2. Sandbox Permissions

El executor configura automáticamente permisos mínimos del iframe:

- `allow-scripts` - Permite JavaScript
- `allow-same-origin` - Permite comunicación postMessage
- `allow-forms` - Solo si context sharing está habilitado

### 3. Data Validation

Siempre valida que el iframe tenga permiso para pedir el tipo de dato solicitado.

## Troubleshooting

### Problema: "Could not load wallet info from parent"

- **Causa**: El juego no puede comunicarse con el host
- **Solución**: Asegúrate de estar usando un servidor local, no abriendo archivos directamente

### Problema: Iframe no se carga

- **Causa**: Restricciones de seguridad del navegador
- **Solución**: Usa HTTPS o servidor local, no `file://`

### Problema: Context sharing no funciona

- **Causa**: Origin no permitido o configuración incorrecta
- **Solución**: Verifica `allowedOrigins` y que ambos archivos estén en el mismo servidor

## Extensiones Futuras

### 1. Game Events

Implementar sistema robusto de eventos del juego:

```javascript
// Desde el juego
window.parent.postMessage(
  {
    type: 'GAME_EVENT',
    event: 'item_purchased',
    itemId: 'sword_001',
    cost: 100,
  },
  '*',
);
```

### 2. Blockchain Integration

Permitir que el juego solicite transacciones via Sherry:

```javascript
// Desde el juego
const txHash = await SherryContextAPI.requestTransaction({
  to: '0x...',
  value: '0.1',
  data: '0x...',
});
```

### 3. Real-time Updates

Sistema de subscripciones para cambios de contexto:

```javascript
// Desde el juego
SherryContextAPI.subscribe('chainId', newChainId => {
  console.log('Chain changed to:', newChainId);
});
```
