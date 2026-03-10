import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";
import { Icon, NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isIOS = Platform.OS === "ios";
  const versionRaw = Platform.Version;
  const majorVersion =
    typeof versionRaw === "string" ? parseInt(versionRaw.split(".")[0], 10) : versionRaw;
  const isVersion26 = isIOS && majorVersion >= 26;

  const tabs = [
    {
      name: "songs" as const,
      title: "Songs",
      sfIcon: { default: "music.note", selected: "music.note.list" },
      iconSymbol: "music.note.list" as const,
    },
    // {
    //   name: "index" as const,
    //   title: "Search",
    //   sfIcon: { default: "magnifyingglass", selected: "magnifyingglass" },
    //   iconSymbol: "magnifyingglass" as const,
    // },
    {
      name: "favorites" as const,
      title: "Favorites",
      sfIcon: { default: "heart", selected: "heart.fill" },
      iconSymbol: "heart.fill" as const,
    },
    {
      name: "add" as const,
      title: "Add",
      sfIcon: { default: "square.and.pencil", selected: "square.and.pencil" },
      iconSymbol: "square.and.pencil" as const,
    },
    {
      name: "setting" as const,
      title: "Settings",
      sfIcon: { default: "gear", selected: "gear" },
      iconSymbol: "gear" as const,
    },
  ] as const;
  if (isVersion26) {
    return (
      <NativeTabs disableTransparentOnScrollEdge={!isVersion26}>
        {tabs.map(t => (
          <NativeTabs.Trigger key={t.name} name={t.name}>
            <Icon sf={t.sfIcon} />
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    );
  }
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {tabs.map(t => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name={t.iconSymbol} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
