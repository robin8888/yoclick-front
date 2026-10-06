import { Tabs } from 'expo-router';

// La barra de navegación vive en el layout del grupo para que salga también fuera de las pestañas.
function renderNoTabBar(): null {
  return null;
}

export default function ClientTabsLayout(): React.JSX.Element {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={renderNoTabBar}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="book" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="practice" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
