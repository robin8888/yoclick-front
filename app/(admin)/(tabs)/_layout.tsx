import { Tabs } from 'expo-router';

// La barra de navegación vive en el layout del grupo para que salga también fuera de las pestañas.
function renderNoTabBar(): null {
  return null;
}

export default function AdminTabsLayout(): React.JSX.Element {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={renderNoTabBar}>
      <Tabs.Screen name="agenda" />
      <Tabs.Screen name="clients" />
      <Tabs.Screen name="content" />
      <Tabs.Screen name="brand" />
      <Tabs.Screen name="records" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
