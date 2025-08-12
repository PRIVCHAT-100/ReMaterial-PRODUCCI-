# ReMaterial - Marketplace de Materiales Excedentes

<div align="center">
  <img src="https://i.imgur.com/placeholder.png" alt="ReMaterial Logo" width="200"/>
  
  ![React](https://img.shields.io/badge/React-18.x-blue?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
  ![Vite](https://img.shields.io/badge/Vite-Latest-yellow?logo=vite)
  ![Supabase](https://img.shields.io/badge/Supabase-Latest-green?logo=supabase)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-blue?logo=tailwindcss)
</div>

## 🌟 Descripción

ReMaterial es una plataforma marketplace B2B que conecta empresas para la compra y venta de materiales excedentes y sobrantes industriales. Promovemos la economía circular ayudando a reducir el desperdicio y dando nueva vida a materiales que de otra forma serían desechados.

## ✨ Características Principales

### 🔐 Autenticación y Usuarios
- ✅ Sistema completo de login/registro
- ✅ Perfiles diferenciados (compradores y vendedores)
- ✅ Gestión de perfiles de empresa
- ✅ Protección de rutas privadas

### 🛍️ Marketplace
- ✅ Catálogo de productos con filtros avanzados
- ✅ Vista detallada de productos con galería de imágenes
- ✅ Sistema de favoritos
- ✅ Búsqueda inteligente por categorías y ubicación

### 💼 Panel de Vendedor
- ✅ Dashboard con estadísticas de ventas
- ✅ Gestión completa de inventario
- ✅ Subida múltiple de imágenes
- ✅ Configuración de productos (precios, cantidades, ubicación)

### 💬 Sistema de Comunicación
- ✅ Chat en tiempo real entre compradores y vendedores
- ✅ Historial de conversaciones
- ✅ Notificaciones de mensajes nuevos

### 💳 Pagos y Transacciones
- ✅ Integración con Stripe para pagos seguros
- ✅ Soporte para compra directa
- ✅ Gestión de transacciones

### 🏢 Perfiles de Empresa
- ✅ Páginas dedicadas para empresas
- ✅ Información de contacto y ubicación
- ✅ Catálogo de productos por empresa
- ✅ Sistema de valoraciones

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de UI moderna
- **TypeScript** - Tipado estático para mayor robustez
- **Vite** - Herramienta de build ultrarrápida
- **Tailwind CSS** - Framework de CSS utility-first
- **shadcn/ui** - Componentes de UI elegantes y accesibles
- **React Hook Form + Zod** - Gestión y validación de formularios
- **Lucide React** - Biblioteca de iconos moderna

### Backend
- **Supabase** - Backend as a Service completo
  - Autenticación integrada
  - Base de datos PostgreSQL
  - Storage para imágenes
  - Row Level Security (RLS)
  - APIs REST automáticas
  - Realtime subscriptions

### Herramientas Adicionales
- **React Query** - Gestión de estado del servidor
- **React Router** - Enrutamiento del lado del cliente
- **Date-fns** - Manipulación de fechas
- **Recharts** - Gráficos y visualizaciones

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/rematerial.git
cd rematerial
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase
1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ejecuta las migraciones SQL incluidas en `/supabase/migrations/`
3. Configura las políticas RLS siguiendo la documentación

### 4. Variables de entorno
Las credenciales de Supabase están integradas en el código para desarrollo. Para producción, configúralas según tu proyecto.

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

## 🗄️ Estructura de la Base de Datos

### Tablas Principales
- **profiles** - Información de usuarios y empresas
- **products** - Catálogo de productos
- **conversations** - Conversaciones entre usuarios  
- **messages** - Mensajes del chat
- **favorites** - Productos guardados por usuarios

### Características de Seguridad
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas granulares por tabla
- ✅ Autenticación JWT integrada
- ✅ Validación de datos a nivel de base de datos

## 🎨 Diseño y UX

### Sistema de Diseño
- **Colores semánticos** - Tema coherente y accesible
- **Componentes reutilizables** - Basados en shadcn/ui
- **Responsive design** - Optimizado para móvil y desktop
- **Modo oscuro** - Soporte completo

### Características de Accesibilidad
- ✅ Navegación por teclado
- ✅ Lectores de pantalla compatibles
- ✅ Contraste de colores apropiado
- ✅ Etiquetas ARIA

## 📱 Funcionalidades Móviles

- ✅ Diseño completamente responsive
- ✅ Menús de navegación optimizados para móvil
- ✅ Formularios adaptados a pantallas pequeñas
- ✅ Subida de imágenes desde galería o cámara

## 🔒 Seguridad

### Medidas Implementadas
- **Autenticación JWT** - Tokens seguros para sesiones
- **Row Level Security** - Acceso granular a datos
- **Validación de entrada** - Sanitización de datos
- **HTTPS obligatorio** - Comunicaciones encriptadas
- **Políticas CORS** - Prevención de ataques cross-origin

## 🚀 Despliegue

### Plataformas Recomendadas
- **Vercel** - Óptimo para aplicaciones React
- **Netlify** - Alternativa robusta con CI/CD
- **Supabase Hosting** - Integración nativa

### Configuración de Producción
1. Configurar variables de entorno
2. Optimizar bundle de producción
3. Configurar dominio personalizado
4. Habilitar analytics

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] Sistema de notificaciones push
- [ ] Aplicación móvil nativa
- [ ] API pública para integraciones
- [ ] Dashboard de analytics avanzado
- [ ] Sistema de suscripciones premium
- [ ] Marketplace de servicios
- [ ] Integración con ERP empresariales

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

- **Email**: info@rematerial.es
- **Teléfono**: +34 900 123 456
- **Web**: [www.rematerial.es](https://www.rematerial.es)

---

<div align="center">
  <p>Construido con ❤️ para un futuro más sostenible</p>
  <p>© 2024 ReMaterial. Todos los derechos reservados.</p>
</div>

## Configuración Original de Lovable

**URL del Proyecto**: https://lovable.dev/projects/2e7bb400-06aa-478f-856b-29eb6df9644d

### Cómo editar este código

Puedes editar la aplicación de varias maneras:

**Usar Lovable**: Visita el [Proyecto Lovable](https://lovable.dev/projects/2e7bb400-06aa-478f-856b-29eb6df9644d) y comienza a hacer prompts.

**Usar tu IDE preferido**: Clona este repo y haz push de los cambios.

**Despliegue**: Abre [Lovable](https://lovable.dev/projects/2e7bb400-06aa-478f-856b-29eb6df9644d) y haz clic en Share -> Publish.