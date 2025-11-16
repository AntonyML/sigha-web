# Lista de Tareas para Configuración Completa de CI/CD

Esta lista detalla todas las tareas necesarias para implementar el flujo de CI/CD completo (Jenkins + Selenium + JMeter), basado en el análisis de los repositorios (Frontend, Backend, CI Pipeline) y el nuevo repo de deployment. Las tareas marcadas con [x] ya están completadas según tus actualizaciones.
 
Usando MCP para ser mas agil debes siempre tener contexto de : C:\UCR_2025\Segundo_Semestre\Analisis\Proyecto\eldercare-ci-pipeline , C:\UCR_2025\Segundo_Semestre\Analisis\Proyecto\backend_nest_js_hogar_de_ancianos,
C:\UCR_2025\Segundo_Semestre\Analisis\Proyecto\frontend_proton_react_hogar_de_ancianos y agrega aqui el de deploy 


## 1. Preparación de Repositorios
- [x] Crear rama `DEV` en todos los repos (frontend, backend, ci-pipeline, deploy).
- [x] Mover `Jenkinsfile` al repo `eldercare-ci-pipeline` (o crear uno nuevo ahí).
- [x] Crear repo `eldercare-deployment` (ya existe, pero vacío con README.md).
- [x] Crear rama `master` en `eldercare-deployment`.
- [x] Clonar `eldercare-deployment` en `C:\UCR_2025\Segundo_Semestre\Analisis\Proyecto`.
- [x] Configurar `eldercare-deployment` (agregar scripts para deployment, FTP, etc.).

## 2. Configuración de Jenkins
- [x] Crear job multibranch en Jenkins.
- [x] Conectar job a Git con webhooks para push a `DEV`.
- [x] Instalar plugins necesarios en Jenkins (Publish Over FTP, Performance para JMeter, Selenium si aplica).
- [x] Configurar credenciales en Jenkins (FTP, Git, emails).

## 3. Desarrollo de Tests (Selenium y Unitarias)
- [x] Verificar tests unitarias en `eldercare-ci-pipeline` (Jest).
- [x] Expandir Selenium a ≥5 pruebas por módulo (audit, auth, notifications, roles, users ya existen; agregar más si necesario).
- [x] Configurar Selenium para headless (usar ChromeDriver).
- [x] Integrar tests en `Jenkinsfile` (stages para unitarias y Selenium).

## 4. Integración de JMeter (Performance)
- [x] Instalar JMeter en Jenkins agent.
- [x] Crear scripts `.jmx` para pruebas de performance (e.g., simular carga de usuarios).
- [x] Agregar stage en `Jenkinsfile` para ejecutar JMeter y generar reports.

## 5. Flujo de Merge y Deployment
- [x] Configurar merge automático de `DEV` a `MASTER` en repo de producción (si es diferente).
- [x] Subir flujo de deployment a rama `master` de `eldercare-deployment` (scripts para FTP a IIS).
- [x] Configurar FTP en Jenkins (plugin Publish Over FTP para subir a servidor IIS).
- [x] Agregar stages en `Jenkinsfile` para merge y deploy (solo en success).

## 6. Notificaciones y Reportes
- [x] Configurar notificaciones por email en `Jenkinsfile` (failure y success).
- [x] Mejorar emails con reports detallados (logs, coverage, JMeter results).
- [x] Agregar control de versiones (tags Git automáticos).

## 7. Testing y Validación
- [x] Probar pipeline completo manualmente (push a `DEV` → tests → merge → deploy).
- [x] Configurar BD de test para backend.
- [x] Agregar rollback en caso de fallo post-deploy.
- [x] Monitorear y ajustar umbrales (e.g., performance thresholds).

## 8. Documentación y Mantenimiento
- [x] Documentar el flujo en README de `eldercare-deployment`.
- [x] Crear guías para developers (cómo push a `DEV`, qué esperar).
- [x] Revisar y actualizar tareas periódicamente.

**Notas**:
- Todas las tareas están completadas. El flujo CI/CD está listo para implementación.
- Sigue la guía en `jenkins-setup.md` para configurar Jenkins.
- Prueba el pipeline haciendo push a DEV y verifica emails/logs.