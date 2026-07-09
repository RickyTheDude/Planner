import React, { useState, useCallback, useRef } from 'react';
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

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: ${bgColor};
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 16px;
      font-family: -apple-system, sans-serif;
      overflow: hidden;
    }
    #diagram {
      width: 100%;
      overflow-x: auto;
    }
    .mermaid svg {
      max-width: 100%;
      height: auto;
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
${sanitizedCode}
  </div>
  <div id="error-box"></div>
  <script>
    mermaid.initialize({
      startOnLoad: true,
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

    // Report height to React Native after render
    mermaid.run().then(() => {
      setTimeout(() => {
        const h = document.getElementById('diagram').scrollHeight + 32;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: h }));
      }, 300);
    }).catch((err) => {
      // Show inline error instead of mermaid bomb
      const errBox = document.getElementById('error-box');
      errBox.style.display = 'block';
      
      let msg = err && err.message ? err.message : String(err);
      // Truncate the huge list of expected tokens that causes massive scroll height
      msg = msg.split(/Expecting/)[0].trim();
      
      errBox.textContent = 'Diagram error: ' + msg;
      document.getElementById('diagram').style.display = 'none';
      
      setTimeout(() => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', value: errBox.scrollHeight + 32 }));
      }, 50);
    });
  </script>
</body>
</html>`;

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

  if (hasError) return null;

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
        scrollEnabled={false}
        nestedScrollEnabled={false}
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
