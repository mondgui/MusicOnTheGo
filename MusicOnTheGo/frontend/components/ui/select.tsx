import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  style?: ViewStyle;
};

// Helper function to recursively find SelectItem components
function findSelectItems(children: React.ReactNode): React.ReactElement<{ value: string; children: React.ReactNode }>[] {
  const items: React.ReactElement<{ value: string; children: React.ReactNode }>[] = [];
  
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    
    // Check if this is a SelectItem by checking if it has a 'value' prop
    // (SelectItem components have a value prop)
    const props = child.props as { value?: string; children?: React.ReactNode };
    if (props && typeof props === 'object' && 'value' in props && typeof props.value === 'string') {
      items.push(child as React.ReactElement<{ value: string; children: React.ReactNode }>);
    } else if (props && props.children) {
      // Recursively search in children
      items.push(...findSelectItems(props.children));
    }
  });
  
  return items;
}

export function Select({
  value,
  onValueChange,
  children,
  placeholder = "Select...",
  style,
}: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Find all SelectItem components recursively
  const items = findSelectItems(children);

  const selectedItem = items.find(
    (item) => (item.props as { value: string }).value === value
  );
  const displayText = selectedItem
    ? (selectedItem.props as { children: React.ReactNode }).children
    : placeholder;

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, style]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.triggerText}>{displayText}</Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Option</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {items.map((item, index) => {
                const itemProps = item.props as { value: string; children: React.ReactNode };
                const isSelected = value === itemProps.value;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => {
                      onValueChange(itemProps.value);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {itemProps.children}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color="#FF6A5C" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

type SelectTriggerProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function SelectTrigger({ children, style }: SelectTriggerProps) {
  return <View style={style}>{children}</View>;
}

type SelectContentProps = {
  children: React.ReactNode;
};

export function SelectContent({ children }: SelectContentProps) {
  return <>{children}</>;
}

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
};

export function SelectItem({ value, children }: SelectItemProps) {
  return <>{children}</>;
}

type SelectValueProps = {
  placeholder?: string;
};

export function SelectValue({ placeholder }: SelectValueProps) {
  return <Text>{placeholder}</Text>;
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  triggerText: {
    fontSize: 16,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
  },
  optionSelected: {
    backgroundColor: "#FFF5F3",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  optionTextSelected: {
    color: "#FF6A5C",
    fontWeight: "600",
  },
});

