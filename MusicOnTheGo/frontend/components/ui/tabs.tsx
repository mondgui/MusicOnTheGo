import React, { useState, createContext, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

type TabsProps = {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
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

export function Tabs({ defaultValue = "", value, onValueChange, children }: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue || value || "");
  const activeTab = value !== undefined ? value : internalActiveTab;
  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setInternalActiveTab(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  // Find the first TabsTrigger value if no defaultValue or value
  React.useEffect(() => {
    if (!defaultValue && value === undefined) {
      const childrenArray = React.Children.toArray(children) as React.ReactElement<TabsListProps>[];
      const tabsList = childrenArray.find((child) => child.type === TabsList);
      if (tabsList && tabsList.props) {
        const triggers = React.Children.toArray(tabsList.props.children) as React.ReactElement<TabsTriggerProps>[];
        const firstTrigger = triggers[0];
        if (firstTrigger?.props?.value) {
          setInternalActiveTab(firstTrigger.props.value);
        }
      }
    }
  }, [defaultValue, value, children]);

  // Sync internal state when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalActiveTab(value);
    }
  }, [value]);

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
    flexWrap: "wrap",
  },
  tabTrigger: {
    flexShrink: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 60,
  },
  tabTriggerActive: {
    backgroundColor: "#FF6A5C",
  },
  tabTriggerText: {
    fontSize: 13,
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


