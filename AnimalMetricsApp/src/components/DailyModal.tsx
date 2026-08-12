import React from "react";
import { View, Text, StyleSheet, Modal, TextInput, Button } from "react-native";

interface DailyModalProps {
  visible: boolean;
  selectedDate: string;
  isEditing: boolean;
  rationAmount: string;
  onChangeRationAmount: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function DailyModal({
  visible,
  selectedDate,
  isEditing,
  rationAmount,
  onChangeRationAmount,
  onClose,
  onSave,
}: DailyModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isEditing ? "Atualizar Ração" : "Novo Registro"} - {selectedDate}
          </Text>
          <Text style={styles.label}>Quantidade de Ração (g):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={rationAmount}
            onChangeText={onChangeRationAmount}
          />
          <View style={styles.buttonRow}>
            <Button title="Cancelar" color="red" onPress={onClose} />
            <Button
              title={isEditing ? "Atualizar" : "Salvar"}
              onPress={onSave}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center", // Garanta que está justifyContent
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000",
  },
  label: {
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginVertical: 15,
    color: "#000",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around", // Aqui estava 'justify', mude para 'justifyContent'
  },
});
