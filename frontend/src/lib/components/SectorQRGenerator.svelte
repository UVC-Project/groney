<script lang="ts">
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';
  import { sectorWikiContent } from '$lib/data/sectorWikiContent';

  interface Props {
    baseUrl?: string;
  }

  let { baseUrl = '' }: Props = $props();

  let qrCodes = $state<Record<string, string>>({});
  let isGenerating = $state(true);
  let selectedSector = $state<string | null>(null);

  const sectorTypes = Object.keys(sectorWikiContent);

  onMount(async () => {
    // Use current origin if no baseUrl provided
    const origin = baseUrl || window.location.origin;
    
    // Generate QR codes for all sector types
    const codes: Record<string, string> = {};
    
    for (const type of sectorTypes) {
      const url = `${origin}/wiki/sector/${type.toLowerCase()}`;
      try {
        codes[type] = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
      } catch (err) {
        console.error(`Failed to generate QR for ${type}:`, err);
      }
    }
    
    qrCodes = codes;
    isGenerating = false;
  });

  function downloadQR(type: string) {
    const dataUrl = qrCodes[type];
    if (!dataUrl) return;

    const info = sectorWikiContent[type];
    
    // Create a canvas to draw the styled card
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Card dimensions
    const cardWidth = 300;
    const cardHeight = 400;
    const padding = 20;
    const borderRadius = 16;
    const borderWidth = 3;

    canvas.width = cardWidth;
    canvas.height = cardHeight;

    // Draw white background with rounded corners
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(0, 0, cardWidth, cardHeight, borderRadius);
    ctx.fill();

    // Draw green border
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.roundRect(borderWidth / 2, borderWidth / 2, cardWidth - borderWidth, cardHeight - borderWidth, borderRadius);
    ctx.stroke();

    // Load and draw the QR code image
    const qrImage = new Image();
    qrImage.onload = () => {
      // Draw emoji (as text)
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(info.emoji, cardWidth / 2, 60);

      // Draw QR code
      const qrSize = 180;
      const qrX = (cardWidth - qrSize) / 2;
      const qrY = 80;
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // Draw title
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(info.title, cardWidth / 2, 290);

      // Draw "Scan me!" instruction
      ctx.fillStyle = '#666666';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('Scan me! 📱', cardWidth / 2, 320);

      // Download the canvas as PNG
      const link = document.createElement('a');
      link.download = `groney-qr-${type.toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    qrImage.src = dataUrl;
  }

  function downloadAllQRs() {
    // Download each QR code with a small delay to prevent browser blocking
    sectorTypes.forEach((type, index) => {
      setTimeout(() => downloadQR(type), index * 300);
    });
  }

  async function printQRSheet() {
    // Open print dialog with all QR codes
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = sectorTypes.map(type => {
      const info = sectorWikiContent[type];
      return `
        <div class="qr-card">
          <div class="qr-emoji">${info.emoji}</div>
          <img src="${qrCodes[type]}" alt="QR Code for ${info.title}" />
          <div class="qr-title">${info.title}</div>
          <div class="qr-instruction">Scan me! 📱</div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Groney Sector QR Codes</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 20px;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
              color: #22c55e;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              max-width: 900px;
              margin: 0 auto;
            }
            .qr-card {
              border: 3px solid #22c55e;
              border-radius: 16px;
              padding: 16px;
              text-align: center;
              page-break-inside: avoid;
            }
            .qr-emoji {
              font-size: 48px;
              margin-bottom: 8px;
            }
            .qr-card img {
              width: 150px;
              height: 150px;
            }
            .qr-title {
              font-weight: bold;
              font-size: 16px;
              margin-top: 8px;
              color: #333;
            }
            .qr-instruction {
              font-size: 14px;
              color: #666;
              margin-top: 4px;
            }
            @media print {
              body { padding: 10px; }
              .grid { gap: 15px; }
              .qr-card { border-width: 2px; padding: 12px; }
              .qr-emoji { font-size: 36px; }
              .qr-card img { width: 120px; height: 120px; }
            }
          </style>
        </head>
        <body>
          <h1>🌱 Groney Sector QR Codes</h1>
          <div class="grid">${content}</div>
          <script>window.onload = () => window.print();<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  function openPreview(type: string) {
    selectedSector = type;
  }

  function closePreview() {
    selectedSector = null;
  }
</script>

<div class="bg-white rounded-2xl shadow-lg p-6">
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <span class="text-3xl">📱</span>
      <div>
        <h2 class="text-xl font-bold text-gray-800">Sector QR Codes</h2>
        <p class="text-sm text-gray-500">Print and place at each sector in the schoolyard</p>
      </div>
    </div>
    
    {#if !isGenerating}
      <div class="flex gap-2">
        <button
          onclick={printQRSheet}
          class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <span>🖨️</span>
          <span>Print All</span>
        </button>
        <button
          onclick={downloadAllQRs}
          class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <span>⬇️</span>
          <span>Download All</span>
        </button>
      </div>
    {/if}
  </div>

  {#if isGenerating}
    <div class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin text-4xl mb-4">⚙️</div>
        <p class="text-gray-500">Generating QR codes...</p>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each sectorTypes as type}
        {@const info = sectorWikiContent[type]}
        <div 
          class="border-2 rounded-xl p-4 text-center hover:shadow-lg transition-shadow cursor-pointer group"
          style="border-color: {info.color}30;"
          onclick={() => openPreview(type)}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && openPreview(type)}
        >
          <div class="text-4xl mb-2">{info.emoji}</div>
          {#if qrCodes[type]}
            <img 
              src={qrCodes[type]} 
              alt="QR Code for {info.title}"
              class="w-24 h-24 mx-auto mb-2 group-hover:scale-105 transition-transform"
            />
          {/if}
          <p class="font-semibold text-gray-700 text-sm">{info.title}</p>
          <button
            onclick={(e) => { e.stopPropagation(); downloadQR(type); }}
            class="mt-2 text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
          >
            ⬇️ Download
          </button>
        </div>
      {/each}
    </div>

    <div class="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
      <div class="flex items-start gap-3">
        <span class="text-2xl">💡</span>
        <div class="text-sm text-yellow-800">
          <p class="font-semibold mb-1">Placement Tips:</p>
          <ul class="list-disc list-inside space-y-1 text-yellow-700">
            <li>Print QR codes on weatherproof paper or laminate them</li>
            <li>Place them at children's eye level (~1 meter)</li>
            <li>Make sure there's enough light to scan</li>
            <li>Test the QR codes before hanging them up!</li>
          </ul>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Preview Modal -->
{#if selectedSector}
  {@const info = sectorWikiContent[selectedSector]}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
  <div 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onclick={closePreview}
    onkeydown={(e) => e.key === 'Escape' && closePreview()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div 
      class="bg-white rounded-2xl p-6 max-w-sm w-full"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="text-center">
        <div class="text-6xl mb-4">{info.emoji}</div>
        <h3 class="text-xl font-bold mb-2" style="color: {info.color};">{info.title}</h3>
        
        {#if qrCodes[selectedSector]}
          <img 
            src={qrCodes[selectedSector]} 
            alt="QR Code for {info.title}"
            class="w-48 h-48 mx-auto mb-4"
          />
        {/if}
        
        <p class="text-sm text-gray-500 mb-4">
          Scan this QR code to open the wiki page
        </p>
        
        <div class="flex gap-2 justify-center">
          <button
            onclick={() => downloadQR(selectedSector!)}
            class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <span>⬇️</span>
            <span>Download</span>
          </button>
          <button
            onclick={closePreview}
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
        
        <a 
          href="/wiki/sector/{selectedSector.toLowerCase()}"
          target="_blank"
          class="inline-block mt-4 text-sm text-blue-500 hover:underline"
        >
          🔗 Open wiki page
        </a>
      </div>
    </div>
  </div>
{/if}
