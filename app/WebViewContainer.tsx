import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewProps } from 'react-native-webview';

type Props = {
  uri: string;
  visible?: boolean;
};

const WebViewContainerComponent: React.FC<Props> = ({ uri, visible }) => {
  return (
    <View
      style={[
        styles.webWrapper,
        visible ? styles.webVisible : styles.webHidden,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <WebView
        source={{ uri }}
        cacheEnabled
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsInlineMediaPlayback
        setSupportMultipleWindows={false}
        allowsFullscreenVideo
        originWhitelist={['*']}
        overScrollMode="never"
        javaScriptEnabled
        renderToHardwareTextureAndroid
        androidLayerType="hardware"
        startInLoadingState={false}
        style={styles.webview}
      />
    </View>
  );
};

export const WebViewContainer = React.memo(WebViewContainerComponent);

const styles = StyleSheet.create({
  webWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webVisible: {
    display: 'flex',
  },
  webHidden: {
    display: 'none',
  },
  webview: {
    flex: 1,
  },
});
