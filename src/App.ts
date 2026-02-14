import { MARITIME_LAYERS, MARITIME_LAYER_ORDER, getEnabledMaritimeLayers, LAYER_COLORS } from './config/maritime-layers';
import { MaritimeLayer, AppState, MapConfig } from './types/maritime';

/**
 * Initialize the Maritime Monitor application
 */
export async function initializeApp(container: HTMLElement): Promise<void> {
  // Create application state
  const appState: AppState = {
    map: {
      center: { latitude: 0, longitude: 20 },
      zoom: 2,
      style: 'dark',
      layers: getEnabledMaritimeLayers(),
    },
    activeLayers: getEnabledMaritimeLayers(),
    timeRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      end: new Date(),
    },
    filters: {},
    lastSync: new Date(),
  };

  // Create main UI structure
  const mainElement = document.createElement('div');
  mainElement.id = 'maritime-monitor';
  mainElement.style.cssText = `
    width: 100%;
    height: 100%;
    display: flex;
    background: #0a0f0a;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  // Create left sidebar for layer controls
  const sidebar = createLayerPanel(appState);
  
  // Create main map container
  const mapContainer = createMapContainer();
  
  // Create top bar with controls
  const topBar = createTopBar();
  
  // Create right info panel
  const infoPanel = createInfoPanel();

  // Assemble layout
  const layoutContainer = document.createElement('div');
  layoutContainer.style.cssText = `
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
  `;

  layoutContainer.appendChild(topBar);

  const contentContainer = document.createElement('div');
  contentContainer.style.cssText = `
    display: flex;
    flex: 1;
    overflow: hidden;
  `;

  contentContainer.appendChild(sidebar);
  contentContainer.appendChild(mapContainer);
  contentContainer.appendChild(infoPanel);

  layoutContainer.appendChild(contentContainer);
  mainElement.appendChild(layoutContainer);
  container.appendChild(mainElement);

  // Start data fetching
  startDataFetching(appState);

  // Setup event listeners
  setupEventListeners(appState);
}

/**
 * Create layer control panel
 */
function createLayerPanel(appState: AppState): HTMLElement {
  const panel = document.createElement('div');
  panel.id = 'layer-panel';
  panel.style.cssText = `
    width: 250px;
    background: #1a1a1a;
    border-right: 1px solid #333;
    padding: 16px;
    overflow-y: auto;
    font-size: 13px;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #00ff00;
  `;
  header.textContent = '🗑️ GLOBAL SITUATION';
  panel.appendChild(header);

  // Dropdown for monitoring type (with Maritime option)
  const dropdownContainer = document.createElement('div');
  dropdownContainer.style.cssText = `
    margin-bottom: 16px;
  `;

  const dropdownLabel = document.createElement('label');
  dropdownLabel.style.cssText = `
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
    color: #888;
  `;
  dropdownLabel.textContent = 'MONITORING TYPE';
  dropdownContainer.appendChild(dropdownLabel);

  const dropdown = document.createElement('select');
  dropdown.style.cssText = `
    width: 100%;
    padding: 8px;
    background: #0a0f0a;
    color: #00ff00;
    border: 1px solid #333;
    border-radius: 4px;
    font-family: monospace;
    cursor: pointer;
  `;

  const options = [
    { value: 'global', text: '🌍 Global' },
    { value: 'maritime', text: '🚢 Maritime' },
  ];

  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.text;
    dropdown.appendChild(option);
  });

  dropdown.value = 'maritime';
  dropdown.addEventListener('change', (e) => {
    console.log(`[Maritime Monitor] Switched to: ${(e.target as HTMLSelectElement).value}`);
  });

  dropdownContainer.appendChild(dropdown);
  panel.appendChild(dropdownContainer);

  // Layers section
  const layersHeader = document.createElement('div');
  layersHeader.style.cssText = `
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #888;
    text-transform: uppercase;
  `;
  layersHeader.textContent = 'LAYERS';
  panel.appendChild(layersHeader);

  // Layer checkboxes
  MARITIME_LAYER_ORDER.forEach(layerKey => {
    const layer = MARITIME_LAYERS[layerKey];
    if (!layer) return;

    const checkboxContainer = document.createElement('div');
    checkboxContainer.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background 0.2s;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `layer-${layer.id}`;
    checkbox.checked = layer.enabled;
    checkbox.style.cssText = `
      margin-right: 8px;
      cursor: pointer;
      accent-color: #00ff00;
    `;

    const label = document.createElement('label');
    label.htmlFor = `layer-${layer.id}`;
    label.style.cssText = `
      cursor: pointer;
      flex: 1;
      color: ${layer.enabled ? LAYER_COLORS[layer.type] : '#666'};
    `;
    label.textContent = layer.name;

    checkbox.addEventListener('change', () => {
      layer.enabled = checkbox.checked;
      appState.activeLayers = getEnabledMaritimeLayers();
      label.style.color = layer.enabled ? LAYER_COLORS[layer.type] : '#666';
      console.log(`[Maritime Monitor] Layer ${layer.name} ${layer.enabled ? 'enabled' : 'disabled'}`);
    });

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
    panel.appendChild(checkboxContainer);
  });

  return panel;
}

/**
 * Create map container
 */
function createMapContainer(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'map-container';
  container.style.cssText = `
    flex: 1;
    background: #0a0f0a url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="%23111" width="40" height="40"/><circle cx="20" cy="20" r="1" fill="%23333"/></svg>');
    position: relative;
    overflow: hidden;
  `;
  
  // Placeholder for map visualization
  const placeholder = document.createElement('div');
  placeholder.style.cssText = `
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #444;
    font-size: 16px;
    flex-direction: column;
  `;
  placeholder.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
      <div>Maritime Monitor Dashboard</div>
      <div style="font-size: 12px; color: #333; margin-top: 8px;">Real-time shipping intelligence map</div>
      <div style="font-size: 12px; color: #333; margin-top: 8px;">Toggle layers in the left panel</div>
    </div>
  `;
  container.appendChild(placeholder);

  return container;
}

/**
 * Create top control bar
 */
function createTopBar(): HTMLElement {
  const bar = document.createElement('div');
  bar.style.cssText = `
    height: 60px;
    background: #0a0f0a;
    border-bottom: 1px solid #333;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    font-size: 13px;
  `;

  const title = document.createElement('div');
  title.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    color: #00ff00;
  `;
  title.innerHTML = '<span style="font-size: 20px;">🌊</span><span>MARITIME MONITOR v1.0.0</span>';
  bar.appendChild(title);

  const status = document.createElement('div');
  status.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    color: #888;
  `;
  status.innerHTML = '<span style="color: #00ff00; margin-right: 8px;">●</span>LIVE';
  bar.appendChild(status);

  return bar;
}

/**
 * Create info panel
 */
function createInfoPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.id = 'info-panel';
  panel.style.cssText = `
    width: 300px;
    background: #1a1a1a;
    border-left: 1px solid #333;
    padding: 16px;
    overflow-y: auto;
    font-size: 12px;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    font-weight: 600;
    margin-bottom: 16px;
    color: #00ff00;
  `;
  header.textContent = '📊 LIVE NEWS';
  panel.appendChild(header);

  const content = document.createElement('div');
  content.style.cssText = `
    color: #888;
    font-size: 11px;
  `;
  content.innerHTML = `
    <div style="margin-bottom: 12px;">
      <strong style="color: #fff;">Maritime Monitor Ready</strong>
      <div style="margin-top: 4px;">Select maritime layers to begin monitoring global shipping intelligence</div>
    </div>
    <div style="border-top: 1px solid #333; padding-top: 12px; margin-top: 12px;">
      <div style="color: #666;">Data sources:</div>
      <div style="margin-top: 8px;">• AIS vessel tracking</div>
      <div>• Maritime security feeds</div>
      <div>• Weather services</div>
      <div>• Humanitarian data</div>
      <div>• Policy updates</div>
    </div>
  `;
  panel.appendChild(content);

  return panel;
}

/**
 * Start fetching maritime data
 */
function startDataFetching(appState: AppState): void {
  console.log('[Maritime Monitor] Starting data fetching for maritime layers');
  
  // Set up periodic updates for each enabled layer
  appState.activeLayers.forEach(layer => {
    setInterval(() => {
      console.log(`[Maritime Monitor] Updating ${layer.name}...`);
      // Data fetching would happen here
    }, layer.updateInterval);
  });
}

/**
 * Setup event listeners
 */
function setupEventListeners(appState: AppState): void {
  // Listen for layer changes
  document.addEventListener('layer-changed', (e: any) => {
    console.log('[Maritime Monitor] Layer changed:', e.detail);
  });
}
