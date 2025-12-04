import React, { useState, createContext, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

type TabsProps = {
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
};

type TabsListProps = {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
};

type TabsTriggerProps = {
  value: string;
  children: React.ReactNode;
};

type TabsContentProps = {
  value: string;
  children: React.ReactNode;
};

export function Tabs({ defaultValue = "", children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  // Find the first TabsTrigger value if no defaultValue
  React.useEffect(() => {
    if (!defaultValue) {
      const childrenArray = React.Children.toArray(children) as React.ReactElement[];
      const tabsList = childrenArray.find((child) => child.type === TabsList);
      if (tabsList) {
        const triggers = React.Children.toArray(tabsList.props.children);
        const firstTrigger = triggers[0] as React.ReactElement;
        if (firstTrigger?.props?.value) {
          setActiveTab(firstTrigger.props.value);
        }
      }
    }
  }, []);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <View>{children}</View>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, style }: TabsListProps) {
  const context = useContext(TabsContext);
  if (!context) return null;

  return (
    <View style={[styles.tabsList, style]}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TabsTrigger) {
          return child;
        }
        return child;
      })}
    </View>
  );
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) return null;

  const { activeTab, setActiveTab } = context;
  const active = activeTab === value;

  return (
    <TouchableOpacity
      style={[styles.tabTrigger, active && styles.tabTriggerActive]}
      onPress={() => setActiveTab(value)}
    >
      <Text style={[styles.tabTriggerText, active && styles.tabTriggerTextActive]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export function TabsContent({ value, children }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) return null;

  const { activeTab } = context;
  if (activeTab !== value) return null;

  return <View style={styles.tabsContent}>{children}</View>;
}

const styles = StyleSheet.create({
  tabsList: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  tabTrigger: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  tabTriggerActive: {
    backgroundColor: "#FF6A5C",
  },
  tabTriggerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabTriggerTextActive: {
    color: "white",
  },
  tabsContent: {
    marginTop: 16,
  },
});

