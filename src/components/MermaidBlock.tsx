import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useColorScheme } from 'nativewind';

interface MermaidBlockProps {
  code: string;
  title?: string;
}

/**
 * Sanitizes a raw Mermaid code string to prevent common Mermaid v11 syntax errors.
 * Handles: node labels with special chars, unquoted multi-word labels, style statements.
 */
function sanitizeMermaidCode(raw: string): string {
  const lines = raw.split('\n');
  const sanitized = lines.map((line) => {
    // Strip LaTeX artifacts that occasionally leak into mermaid labels
    let l = line
      .replace(/\$\$/g, '')
      .replace(/\\\\/g, '\\')
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
      .replace(/\\text\{([^}]*)\}/g, '$1')
      .replace(/\\cdot/g, '·')
      .replace(/\\times/g, '×')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\\approx/g, '≈')
      .replace(/\\infty/g, '∞')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\theta/g, 'θ')
      .replace(/\\pi/g, 'π')
      .replace(/\\mu/g, 'μ')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\lambda/g, 'λ');

    // Skip directive lines (e.g. "%%{init: ...}%%") — leave them as-is
    if (l.trim().startsWith('%%')) return l;

    // Fix nested quotes inside explicit mermaid string labels
    // e.g., ["f("x")"] -> ["f('x')"]
    const openers = ['["', '("', '{"', '>"'];
    const closers = ['"]', '")', '"}', '">'];
    for (let i = 0; i < openers.length; i++) {
      const op = openers[i];
      const cl = closers[i];
      let startIdx = 0;
      while ((startIdx = l.indexOf(op, startIdx)) !== -1) {
        let endIdx = l.indexOf(cl, startIdx + op.length);
        if (endIdx !== -1) {
          const inner = l.substring(startIdx + op.length, endIdx);
          const fixedInner = inner.replace(/"/g, "'");
          l = l.substring(0, startIdx + op.length) + fixedInner + l.substring(endIdx);
          startIdx = startIdx + op.length + fixedInner.length + cl.length;
        } else {
          break;
        }
      }
    }

    return l;
  });
  return sanitized.join('\n');
}

/**
 * Renders a Mermaid.js diagram inside a WebView.
 * Auto-resizes height via postMessage from the injected HTML.
 */
export function MermaidBlock({ code, title }: MermaidBlockProps) {
  const [height, setHeight] = useState(200);
  const [hasError, setHasError] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const webViewRef = useRef<WebView>(null);

  const bgColor = isDark ? '#1e293b' : '#ffffff';
  const fgColor = isDark ? '#f8fafc' : '#0f172a';
  const borderColor = isDark ? '#f8fafc' : '#0f172a';
  const errorBg = isDark ? '#2d1515' : '#fff1f1';
  const errorFg = isDark ? '#fca5a5' : '#b91c1c';

  const sanitizedCode = sanitizeMermaidCode(code);

  const html = useMemo(() => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/hammerjs@2.0.8/hammer.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: ${bgColor};
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 16px;
      font-family: -apple-system, sans-serif;
      overflow: hidden;
      touch-action: none; /* Prevent native scroll */
    }
    #diagram {
      width: 100%;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .mermaid {
      width: 100%;
      height: 100%;
    }
    .mermaid svg {
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
    }
    #error-box {
      display: none;
      background: ${errorBg};
      color: ${errorFg};
      border: 2px solid ${errorFg};
      border-radius: 8px;
      padding: 12px;
      font-family: monospace;
      font-size: 12px;
      width: 100%;
      white-space: pre-wrap;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div id="diagram" class="mermaid">
  </div>
  <div id="error-box"></div>
  <script>
    mermaid.initialize({
      startOnLoad: false,
      theme: '${isDark ? 'dark' : 'default'}',
      securityLevel: 'loose',
      themeVariables: {
        darkMode: ${isDark},
        background: '${bgColor}',
        primaryColor: '${isDark ? '#6366f1' : '#818cf8'}',
        primaryTextColor: '${fgColor}',
        lineColor: '${fgColor}',
      },
    });

    let currentPz = null;

    window.updateDiagram = async function(newCode) {
      const errBox = document.getElementById('error-box');
      const diagramBox = document.getElementById('diagram');
      
      try {
        errBox.style.display = 'none';
        diagramBox.style.display = 'flex';
        
        if (currentPz) {
          currentPz.destroy();
          currentPz = null;
        }

        const { svg } = await mermaid.render('mermaid-svg', newCode);
        diagramBox.innerHTML = svg;
        
        setTimeout(() => {
          const svgEl = document.querySelector('.mermaid svg');
          if (svgEl) {
            svgEl.style.maxWidth = 'none';
            svgEl.style.height = '100%';
            svgEl.style.width = '100%';
            
            currentPz = svgPanZoom(svgEl, {
              zoomEnabled: true,
              controlIconsEnabled: false,
              fit: true,
              center: true,
              minZoom: 0.5,
              maxZoom: 10,
              customEventsHandler: {
                haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
                init: function(options) {
                  var instance = options.instance;
                  var initialScale = 1;
                  var pannedX = 0;
                  var pannedY = 0;

                  this.hammer = new Hammer(options.svgElement, {
                    inputClass: Hammer.TouchInput
                  });

                  this.hammer.get('pinch').set({ enable: true });

                  this.hammer.on('doubletap', function(){
                    instance.resetZoom();
                    instance.center();
                  });

                  this.hammer.on('panstart panmove', function(ev){
                    if (ev.type === 'panstart') {
                      pannedX = 0;
                      pannedY = 0;
                    }
                    instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY });
                    pannedX = ev.deltaX;
                    pannedY = ev.deltaY;
                  });

                  this.hammer.on('pinchstart pinchmove', function(ev){
                    if (ev.type === 'pinchstart') {
                      initialScale = instance.getZoom();
                    }
                    instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y });
                  });

                  options.svgElement.addEventListener('touchmove', function(e){ e.preventDefault(); }, { passive: false });
                },
                destroy: function(){
                  this.hammer.destroy();
                }
              }
            });
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: 450 }));
          }
        }, 100);
      } catch (err) {
        let msg = err && err.message ? err.message : String(err);
        msg = msg.split(/Expecting/)[0].trim();
        
        errBox.textContent = 'Diagram error: ' + msg;
        errBox.style.display = 'block';
        diagramBox.style.display = 'none';
        
        setTimeout(() => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', value: errBox.scrollHeight + 32 }));
        }, 50);
      }
    };
  </script>
</body>
</html>`, [isDark, bgColor, fgColor, errorBg, errorFg]);

  useEffect(() => {
    if (webViewRef.current && sanitizedCode) {
      // Escape backticks, backslashes, and dollar signs for injection
      const escapedCode = sanitizedCode
        .replace(/\\\\/g, '\\\\\\\\') // escape backslashes doubly for JS literal
        .replace(/\`/g, '\\\\`')
        .replace(/\\$/g, '\\\\$');
        
      webViewRef.current.injectJavaScript(`
        if (window.updateDiagram) {
          window.updateDiagram(\`${escapedCode}\`);
        }
        true;
      `);
    }
  }, [sanitizedCode]);

  const onMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'height' && typeof msg.value === 'number') {
        setHeight(Math.max(msg.value, 100));
        setHasError(false);
      } else if (msg.type === 'error' && typeof msg.value === 'number') {
        setHeight(Math.max(msg.value, 80));
        setHasError(true);
      }
    } catch {}
  }, []);

  return (
    <View
      style={{
        marginVertical: 16,
        borderWidth: 3,
        borderColor: hasError ? errorFg : borderColor,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: bgColor,
      }}
    >
      {title && (
        <View
          style={{
            borderBottomWidth: 2,
            borderBottomColor: borderColor,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isDark ? '#6366f1' : '#818cf8',
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: fgColor,
            }}
          >
            {title}
          </Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={{ height, backgroundColor: bgColor }}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        onMessage={onMessage}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        // Prevent WebView from capturing parent scroll
        {...(Platform.OS === 'android' ? { overScrollMode: 'never' as any } : {})}
      />
    </View>
  );
}
