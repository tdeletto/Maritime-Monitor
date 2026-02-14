import './styles/main.css';
import { initializeApp } from './App';

// Initialize the application
async function main() {
  try {
    console.log('[Maritime Monitor] Initializing application...');
    
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container element not found');
    }
    
    // Create the necessary DOM structure
    appContainer.innerHTML = `
      <div id="map" style="width: 100%; height: 100%;"></div>
    `;
    
    // Initialize the main application
    await initializeApp(appContainer);
    
    console.log('[Maritime Monitor] Application initialized successfully');
  } catch (error) {
    console.error('[Maritime Monitor] Initialization error:', error);
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #0a0f0a; color: #ff3333; font-family: monospace;">
          <div style="text-align: center;">
            <h2>⚠️ Application Error</h2>
            <p>${error instanceof Error ? error.message : String(error)}</p>
            <p style="color: #888; margin-top: 20px; font-size: 12px;">Check console for details</p>
          </div>
        </div>
      `;
    }
  }
}

// Start the application
main();
