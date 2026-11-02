export function createCrosshair() {
  const crosshair = document.createElement('div');
  crosshair.id = 'crosshair';
  
  Object.assign(crosshair.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    width: '12px',
    height: '12px',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: '1000'
  });

  const horizontal = document.createElement('div');
  Object.assign(horizontal.style, {
    position: 'absolute',
    top: '5px',
    left: '0',
    width: '12px',
    height: '2px',
    backgroundColor: '#ff0000'
  });

  const vertical = document.createElement('div');
  Object.assign(vertical.style, {
    position: 'absolute',
    top: '0',
    left: '5px',
    width: '2px',
    height: '12px',
    backgroundColor: '#ff0000'
  });

  crosshair.appendChild(horizontal);
  crosshair.appendChild(vertical);
  document.body.appendChild(crosshair);

  return crosshair;
}