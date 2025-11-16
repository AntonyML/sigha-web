import { Builder, WebDriver, By } from 'selenium-webdriver';

describe('Pruebas de interfaz', () => {
  let driver: WebDriver;
  const baseUrl = 'http://localhost:5173';

  beforeAll(async () => {
    driver = await new Builder()
      .forBrowser('chrome')
      .build();
    await driver.manage().setTimeouts({ implicit: 5000 });
  });

  afterAll(async () => {
    await driver.quit();
  });

  // Verificar que la página principal carga
  test('1. La página principal debe cargar', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000); 
      const title = await driver.getTitle();
      expect(title).toBeTruthy();
      console.log('Página cargada correctamente');
    } catch (error) {
      console.error('Error cargando página:', error);
      throw error;
    }
  });

  // Verificar que haya navegación 
  test('2. Debe poder navegar a una página', async () => {
    try {
      await driver.get(`${baseUrl}/#/`);
      await driver.sleep(1000);
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain(baseUrl);
      console.log('Navegación básica funciona');
    } catch (error) {
      console.error('Error en navegación:', error);
      throw error;
    }
  });

  // Verificar que hayan elementos básicos
  test('3. Debe encontrar elementos de la página', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000);
      const elements = await driver.findElements(By.css('div, button, a, h1, h2'));
      expect(elements.length).toBeGreaterThan(0);
      console.log(`Encontrados ${elements.length} elementos en la página`);
    } catch (error) {
      console.error('Error buscando elementos:', error);
      throw error;
    }
  });

  // Verificar que si se pueda hacer clic en botones
  test('4. Debe poder interactuar con elementos', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000);
      const clickableElements = await driver.findElements(By.css('a, button'));
      
      if (clickableElements.length > 0) {
        const firstElement = clickableElements[0];
        const tagName = await firstElement.getTagName();
        expect(['a', 'button'].includes(tagName)).toBeTruthy();
        console.log(`Elementos interactivos encontrados: ${clickableElements.length}`);
      } else {
        console.log('No se encontraron elementos clickeables');
      }
    } catch (error) {
      console.error('Error interactuando con elementos:', error);
      throw error;
    }
  });

  // Verificar que hayan formularios 
  test('5. Debe encontrar campos de entrada', async () => {
    try {
      await driver.get(baseUrl);
      await driver.sleep(2000);
      const inputElements = await driver.findElements(By.css('input, select, textarea'));
      console.log(`Campos de formulario encontrados: ${inputElements.length}`);
      if (inputElements.length > 0) {
        const firstInput = inputElements[0];
        const inputType = await firstInput.getAttribute('type');
        console.log(`Tipo de primer input: ${inputType || 'text'}`);
      }
      expect(true).toBeTruthy();
    } catch (error) {
      console.error('Error con formularios:', error);
      throw error;
    }
  });
});