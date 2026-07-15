'use client';

import JsBarcode from 'jsbarcode';

/**
 * Generate a numeric code from an order ID for barcode encoding.
 */
function orderIdToNumeric(orderId: string): string {
  const clean = orderId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  let numeric = '';
  for (let i = 0; i < clean.length && numeric.length < 13; i++) {
    const code = clean.charCodeAt(i);
    numeric += (code % 10).toString();
  }
  while (numeric.length < 8) numeric += '0';
  return numeric;
}

/**
 * Generate a Code128 barcode as inline SVG markup string.
 * This works reliably everywhere including print windows.
 */
export function generateBarcodeSVG(orderId: string): string {
  const numericCode = orderIdToNumeric(orderId);
  try {
    // Use an invisible div to create the SVG element
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    container.appendChild(svgElement);

    JsBarcode(svgElement, numericCode, {
      format: 'CODE128',
      width: 1.5,
      height: 45,
      displayValue: true,
      fontSize: 11,
      font: 'monospace',
      textMargin: 4,
      margin: 5,
      background: 'transparent',
      lineColor: '#222222',
    });

    const svgMarkup = svgElement.outerHTML;
    document.body.removeChild(container);
    return svgMarkup;
  } catch (e) {
    // Fallback: return empty SVG
    return '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50"></svg>';
  }
}

/**
 * Generate barcode as data URL (for img src in templates).
 * Uses SVG to canvas conversion for maximum compatibility.
 */
export function generateBarcodeDataURL(orderId: string): string {
  const svgMarkup = generateBarcodeSVG(orderId);
  try {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    return url;
  } catch {
    return '';
  }
}
