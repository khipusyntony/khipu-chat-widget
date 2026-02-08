# 🎉 Khipu Chat Widget

Widget de chatbot conversacional con IA para el mercado peruano.

## 🚀 Instalación Rápida

### Para Clientes (Instalar en tu sitio web):

```html
<!-- Pegar antes de cerrar </body> -->
<script 
  src="https://khipusyntony.github.io/khipu-chat-widget/dist/widget.min.js"
  data-bot-id="TU_BOT_ID"
  data-color="#6366F1"
  async
></script>
```

Reemplaza `TU_BOT_ID` con el ID que te proporcionemos.

---

## 🛠️ Para Desarrolladores

### Requisitos

- Node.js 18+ 
- npm 9+

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/khipusyntony/khipu-chat-widget.git
cd khipu-chat-widget

# Instalar dependencias
npm install

# Desarrollo (con hot reload)
npm run dev

# Build producción
npm run build
```

### Estructura del Proyecto

```
khipu-chat-widget/
├── src/
│   ├── index.js          # Clase principal del widget
│   ├── api.js            # Comunicación con backend
│   ├── storage.js        # Persistencia LocalStorage
│   ├── utils.js          # Funciones auxiliares
│   └── styles.scss       # Estilos del widget
├── config/
│   └── template.json     # Configuración base
├── dist/                 # Archivos compilados
│   ├── widget.min.js
│   └── widget.min.css
├── package.json
├── webpack.config.js
└── README.md
```

---

## ⚙️ Configuración

### Crear Nueva Configuración de Cliente

1. Copia `config/template.json`
2. Renombra a `config/CLI_XXX.json`
3. Personaliza los valores
4. Haz commit y push

### Ejemplo de Configuración:

```json
{
  "clientId": "CLI_001",
  "clientName": "Restaurante El Sabor",
  "appearance": {
    "primaryColor": "#FF6B00",
    "headerTitle": "Saborcito Bot"
  },
  "messages": {
    "welcome": "¡Hola! ¿En qué puedo ayudarte hoy?"
  },
  "integration": {
    "webhookUrl": "https://n8n.khipusyntony.com/webhook/chatbot-CLI_001"
  }
}
```

---

## 🎨 Personalización

### Colores

El widget usa CSS variables que se pueden personalizar:

```javascript
window.KhipuChatConfig = {
  appearance: {
    primaryColor: '#FF6B00',  // Color principal
    position: 'bottom-right',  // Posición
    offset: { x: 20, y: 20 }   // Márgenes
  }
};
```

### Comportamiento

```javascript
window.KhipuChatConfig = {
  behavior: {
    autoOpen: false,           // Abrir automáticamente
    showOnLoad: true,          // Mostrar botón al cargar
    proactiveMessage: {
      enabled: true,
      delay: 30000,            // 30 segundos
      message: "¿Necesitas ayuda?"
    }
  }
};
```

---

## 🔌 API Pública

El widget expone métodos que puedes llamar desde tu código:

```javascript
// Abrir chat programáticamente
window.KhipuChat.open();

// Cerrar chat
window.KhipuChat.close();

// Enviar mensaje
window.KhipuChat.sendMessage("Hola, quiero hacer una reserva");

// Actualizar datos de usuario
window.KhipuChat.setUser({
  name: "Juan Pérez",
  email: "juan@example.com"
});

// Acceder a la instancia del widget
window.KhipuChat.instance;
```

### Eventos

```javascript
// Escuchar cuando se envía un mensaje
window.addEventListener('khipu:message', (event) => {
  console.log('Mensaje enviado:', event.detail);
});

// Cuando el chat se abre
window.addEventListener('khipu:open', () => {
  console.log('Chat abierto');
});

// Cuando el chat se cierra
window.addEventListener('khipu:close', () => {
  console.log('Chat cerrado');
});
```

---

## 🌐 Deploy

### GitHub Pages (Automático)

El widget se despliega automáticamente en GitHub Pages cuando haces push a `main`:

```bash
git add .
git commit -m "feat: Nueva funcionalidad"
git push
```

URL pública: `https://khipusyntony.github.io/khipu-chat-widget/dist/widget.min.js`

---

## 📊 Analytics

El widget registra automáticamente:

- Conversaciones iniciadas
- Mensajes enviados/recibidos
- Tiempo de respuesta
- Satisfacción del usuario

Los datos se envían a Google Sheets configurado en `integration.googleSheetId`.

---

## 🔐 Seguridad

### Tokens de Cliente

Cada cliente tiene un token único para autenticar las peticiones:

```javascript
{
  "integration": {
    "clientToken": "secret_token_abc123"
  }
}
```

El token se envía en el header `X-Client-Token`.

### Sanitización

- Todo el HTML se sanitiza con DOMPurify
- Markdown renderizado con marked.js
- Protección XSS incorporada

---

## 🐛 Troubleshooting

### El widget no aparece

1. Verifica que el script esté cargado:
   ```javascript
   console.log(window.KhipuChat);
   ```

2. Revisa la consola del navegador (F12)

3. Verifica que el `data-bot-id` sea correcto

### El chat no responde

1. Verifica la URL del webhook en la configuración
2. Revisa los logs de n8n
3. Comprueba que el backend esté activo

### Estilos no se aplican

1. Limpia caché del navegador (Ctrl+Shift+R)
2. Verifica que `widget.min.css` se esté cargando
3. Revisa que no haya conflictos con CSS del sitio

---

## 📝 Changelog

### v1.0.1 (2026-02-08)
- 🐛 Fix: Botón flotante ahora abre chat correctamente
- 🎨 Mejora: Estilos CSS más robustos
- ✨ Nueva: API pública mejorada

### v1.0.0 (2026-02-07)
- 🎉 Lanzamiento inicial
- ✨ Widget multiempresa funcional
- 🔌 Integración con n8n
- 💾 Persistencia LocalStorage
- 🎨 Diseño responsive

---

## 📞 Soporte

- Email: support@khipusyntony.com
- Telegram: @khipusyntony
- Docs: https://docs.khipusyntony.com

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Ronald - Khipu Syntony**
- GitHub: [@khipusyntony](https://github.com/khipusyntony)
- Website: https://khipusyntony.com

---

**¿Listo para automatizar tu atención al cliente? 🚀**
