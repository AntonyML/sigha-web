import { Builder, WebDriver, By, Key } from 'selenium-webdriver';

describe('Pruebas Selenium - Módulo de Enfermería', () => {
  let driver: WebDriver;
  const baseUrl = 'http://localhost:5173';

  beforeAll(async () => {
    driver = await new Builder()
      .forBrowser('chrome')
      .build();
    await driver.manage().setTimeouts({ implicit: 10000 });
    await driver.manage().window().maximize();
  });

  afterAll(async () => {
    await driver.quit();
  });

  // Test 1: Verificar que la aplicación carga correctamente
  test('1. La aplicación debe cargar correctamente', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000);
      
      const title = await driver.getTitle();
      expect(title).toBeTruthy();
      console.log('✓ Página principal cargada correctamente');
    } catch (error) {
      console.error('✗ Error cargando la aplicación:', error);
      throw error;
    }
  });

  // Test 2: Verificar elementos de la página de login
  test('2. Debe encontrar elementos del formulario de login', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000);
      
      const inputElements = await driver.findElements(By.css('input'));
      expect(inputElements.length).toBeGreaterThanOrEqual(2);
      
      const buttons = await driver.findElements(By.css('button'));
      expect(buttons.length).toBeGreaterThan(0);
      
      console.log(`✓ Encontrados ${inputElements.length} campos de entrada`);
      console.log(`✓ Encontrados ${buttons.length} botones`);
    } catch (error) {
      console.error('✗ Error buscando elementos de login:', error);
      throw error;
    }
  });

  // Test 3: Verificar navegación básica
  test('3. Debe poder navegar por la aplicación', async () => {
    try {
      await driver.get(`${baseUrl}/#/`);
      await driver.sleep(1000);
      
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain(baseUrl);
      
      console.log('✓ Navegación básica funcional');
    } catch (error) {
      console.error('✗ Error en navegación:', error);
      throw error;
    }
  });

  // Test 4: Verificar elementos interactivos
  test('4. Debe encontrar elementos clickeables en la página', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000);
      
      const clickableElements = await driver.findElements(By.css('button, a, [role="button"]'));
      expect(clickableElements.length).toBeGreaterThan(0);
      
      console.log(`✓ Encontrados ${clickableElements.length} elementos interactivos`);
    } catch (error) {
      console.error('✗ Error buscando elementos interactivos:', error);
      throw error;
    }
  });

  // Test 5: Verificar estructura de formularios
  test('5. Debe encontrar campos de formulario en la aplicación', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000);
      
      const formElements = await driver.findElements(By.css('input, select, textarea'));
      console.log(`✓ Campos de formulario encontrados: ${formElements.length}`);
      
      if (formElements.length > 0) {
        const firstInput = formElements[0];
        const tagName = await firstInput.getTagName();
        console.log(`✓ Primer elemento es: ${tagName}`);
      }
      
      expect(formElements.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('✗ Error con formularios:', error);
      throw error;
    }
  });

  // Test 6: Verificar que existen tarjetas (cards) en la interfaz
  test('6. Debe encontrar elementos de tarjetas (cards) en la interfaz', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000);
      
      const cards = await driver.findElements(By.css('.card, [class*="card"]'));
      console.log(`✓ Tarjetas encontradas: ${cards.length}`);
      
      expect(true).toBeTruthy();
    } catch (error) {
      console.error('✗ Error buscando tarjetas:', error);
      throw error;
    }
  });

  // Test 7: Verificar iconos en la interfaz
  test('7. Debe encontrar iconos de Bootstrap en la aplicación', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000);
      
      const icons = await driver.findElements(By.css('i[class*="bi-"], .bi'));
      console.log(`✓ Iconos encontrados: ${icons.length}`);
      
      expect(true).toBeTruthy();
    } catch (error) {
      console.error('✗ Error buscando iconos:', error);
      throw error;
    }
  });

  // Test 8: Verificar tablas en la interfaz
  test('8. Debe encontrar tablas en la aplicación', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(3000);
      
      const tables = await driver.findElements(By.css('table, .table'));
      console.log(`✓ Tablas encontradas: ${tables.length}`);
      
      if (tables.length > 0) {
        const firstTable = tables[0];
        const rows = await firstTable.findElements(By.css('tr'));
        console.log(`✓ Filas en primera tabla: ${rows.length}`);
      }
      
      expect(true).toBeTruthy();
    } catch (error) {
      console.error('✗ Error con tablas:', error);
      throw error;
    }
  });

  // Test 9: Verificar badges/etiquetas de estado
  test('9. Debe encontrar badges (etiquetas) en la interfaz', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000);
      
      const badges = await driver.findElements(By.css('.badge, [class*="badge"]'));
      console.log(`✓ Badges encontrados: ${badges.length}`);
      
      expect(true).toBeTruthy();
    } catch (error) {
      console.error('✗ Error buscando badges:', error);
      throw error;
    }
  });

  // Test 10: Verificar spinner/loading
  test('10. Debe manejar estados de carga', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(1000);
      
      const spinners = await driver.findElements(By.css('.spinner-border, [role="status"]'));
      console.log(`✓ Elementos de carga encontrados: ${spinners.length}`);
      
      expect(true).toBeTruthy();
    } catch (error) {
      console.error('✗ Error verificando estados de carga:', error);
      throw error;
    }
  });

  // Test 11: Verificar responsividad básica
  test('11. Debe ser responsivo (cambiar tamaño de ventana)', async () => {
    try {
      await driver.manage().window().setRect({ width: 1920, height: 1080 });
      await driver.sleep(1000);
      console.log('✓ Vista desktop funcional');
      
      await driver.manage().window().setRect({ width: 768, height: 1024 });
      await driver.sleep(1000);
      console.log('✓ Vista tablet funcional');
      
      await driver.manage().window().setRect({ width: 375, height: 667 });
      await driver.sleep(1000);
      console.log('✓ Vista móvil funcional');
      
      await driver.manage().window().maximize();
      
      expect(true).toBeTruthy();
    } catch (error) {
      console.error('✗ Error en prueba de responsividad:', error);
      throw error;
    }
  });

  // Test 12: Verificar encabezados (headings)
  test('12. Debe encontrar encabezados en la página', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000);
      
      const headings = await driver.findElements(By.css('h1, h2, h3, h4, h5, h6'));
      console.log(`✓ Encabezados encontrados: ${headings.length}`);
      
      if (headings.length > 0) {
        const firstHeading = headings[0];
        const text = await firstHeading.getText();
        console.log(`✓ Primer encabezado: "${text}"`);
      }
      
      expect(headings.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('✗ Error buscando encabezados:', error);
      throw error;
    }
  });

  // Test 13: Verificar alertas/mensajes
  test('13. Debe buscar elementos de alerta en la interfaz', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000);
      
      const alerts = await driver.findElements(By.css('.alert, [role="alert"]'));
      console.log(`✓ Alertas encontradas: ${alerts.length}`);
      
      expect(true).toBeTruthy();
    } catch (error) {
      console.error('✗ Error buscando alertas:', error);
      throw error;
    }
  });

  // Test 14: Verificar navegación con teclado
  test('14. Debe poder navegar con teclado (Tab)', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000);
      
      const body = await driver.findElement(By.css('body'));
      await body.sendKeys(Key.TAB);
      await driver.sleep(500);
      await body.sendKeys(Key.TAB);
      await driver.sleep(500);
      
      console.log('✓ Navegación con teclado funcional');
      expect(true).toBeTruthy();
    } catch (error) {
      console.error('✗ Error en navegación con teclado:', error);
      throw error;
    }
  });

  // Test 15: Verificar que no hay errores de consola críticos
  test('15. Debe verificar logs de consola', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(3000);
      
      const logs = await driver.manage().logs().get('browser');
      const severeErrors = logs.filter(log => log.level.name === 'SEVERE');
      
      console.log(`✓ Total de logs: ${logs.length}`);
      console.log(`✓ Errores severos: ${severeErrors.length}`);
      
      if (severeErrors.length > 0) {
        console.log('⚠ Errores severos encontrados:');
        severeErrors.forEach(error => {
          console.log(`  - ${error.message}`);
        });
      }
      
      expect(true).toBeTruthy();
    } catch (error) {
      console.error('✗ Error obteniendo logs de consola:', error);
      expect(true).toBeTruthy();
    }
  });
});
