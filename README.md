# Valora – Calculadora de CTS

Una herramienta web moderna, intuitiva y responsive diseñada para calcular la **Compensación por Tiempo de Servicios (CTS)** de las trabajadoras del hogar en el Perú. Permite tanto a empleadores como a trabajadoras conocer el monto estimado correspondiente de forma rápida y transparente.

---

## 🚀 Características Principales

- **Flujo Guiado en 3 Pasos:**
  1. **Selección de Rol:** Indica si eres Trabajadora o Empleador.
  2. **Ingreso de Datos:** Completa la información del periodo (Año, fecha de inicio, sueldo mensual, horas extra acumuladas en el semestre e hijos menores o en estudios superiores).
  3. **Resultados Detallados:** Visualiza el monto total y un desglose completo del cálculo.
- **Bottom Sheet Interactivo:** En dispositivos móviles, el detalle del cálculo se muestra mediante una hoja deslizante (bottom sheet) fluida desde la parte inferior, optimizando el espacio y la lectura.
- **Footer Sticky Inteligente:** La barra de botones inferior se mantiene flotante (`fixed`) para facilitar el avance del usuario, pero se convierte en estática (`static`) al llegar al final del formulario para no superponerse ni bloquear ningún campo de entrada.
- **Diseño Premium y Moderno:** Interfaz estilizada con la tipografía **Poppins**, colores institucionales limpios, microanimaciones de transición y compatibilidad móvil de primer nivel.
- **Descarga de Reportes:** Permite exportar los resultados directamente a un documento PDF.

---

## 🛠️ Tecnologías Utilizadas

- **React** (Biblioteca principal de UI)
- **Vite** (Herramienta de compilación y servidor de desarrollo rápido)
- **Tailwind CSS** (Estilos y diseño responsivo)
- **React Hook Form** (Gestión ágil de formularios y validaciones)
- **Intersection Observer API** (Control de comportamiento sticky dinámico para el footer)
- **jspdf / html2canvas** (Generación de reportes PDF)

---

## 💻 Desarrollo Local

Sigue estos pasos para ejecutar la aplicación en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd valora-cts
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
El servidor se iniciará en `http://localhost:5173` (o el puerto disponible).

### 4. Compilar para producción
Para generar la versión optimizada de producción lista para desplegar:
```bash
npm run build
```
Los archivos compilados se guardarán en la carpeta `/dist`.

---

## 📁 Estructura del Proyecto

```text
valora-cts/
├── dist/                # Archivos de distribución para producción (generados con build)
├── node_modules/        # Dependencias de npm
├── src/
│   ├── App.jsx          # Componente contenedor principal
│   ├── main.jsx         # Punto de entrada de React
│   ├── screens.jsx      # Controladores de pantallas y layouts del formulario
│   ├── Step1.jsx        # Pantalla: Selección de rol
│   ├── Step2.jsx        # Pantalla: Formulario de datos de cálculo
│   ├── Step3.jsx        # Pantalla: Resultados y Bottom Sheet de detalles
│   ├── UI.jsx           # Componentes comunes del sistema de diseño (Header, Stepper, etc.)
│   ├── Icons.jsx        # Biblioteca interna de iconos SVG
│   ├── calc.js          # Lógica pura del cálculo matemático de la CTS
│   └── index.css        # Estilos globales y personalizaciones Tailwind/CSS
├── index.html           # Plantilla HTML principal
├── package.json         # Configuración del proyecto y dependencias
├── tailwind.config.js   # Configuración de Tailwind CSS
└── vite.config.js       # Configuración del bundler Vite
```

---

## 📄 Licencia

Este proyecto es propiedad de **Valora**. Todos los derechos reservados.
