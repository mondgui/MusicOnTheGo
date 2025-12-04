import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ViewStyle,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

type DialogTriggerProps = {
  asChild?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
};

type DialogContentProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

type DialogHeaderProps = {
  children: React.ReactNode;
};

type DialogTitleProps = {
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [isOpen, setIsOpen] = React.useState(open);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    onOpenChange(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    onOpenChange(true);
  };

  // Find DialogTrigger and DialogContent in children
  const childrenArray = React.Children.toArray(children) as React.ReactElement[];
  const trigger = childrenArray.find((child) => child.type === DialogTrigger);
  const content = childrenArray.find((child) => child.type === DialogContent);

  return (
    <>
      {trigger &&
        React.cloneElement(trigger as React.ReactElement<DialogTriggerProps>, {
          onPress: () => {
            handleOpen();
            if (trigger.props.onPress) {
              trigger.props.onPress();
            }
          },
        })}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                {content && (
                  <View style={styles.closeButtonContainer}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleClose}
                    >
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                )}
                {content}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

export function DialogTrigger({ asChild, children, onPress }: DialogTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onPress });
  }
  return <>{children}</>;
}

export function DialogContent({ children, style }: DialogContentProps) {
  return (
    <ScrollView
      style={[styles.dialogContent, style]}
      contentContainerStyle={styles.dialogContentInner}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <View style={styles.dialogHeader}>{children}</View>;
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <Text style={styles.dialogTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButtonContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  closeButton: {
    padding: 4,
  },
  dialogContent: {
    maxHeight: "100%",
  },
  dialogContentInner: {
    padding: 24,
  },
  dialogHeader: {
    marginBottom: 20,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
});

