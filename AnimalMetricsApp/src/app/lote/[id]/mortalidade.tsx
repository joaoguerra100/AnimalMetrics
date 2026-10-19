import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Calendar, LocaleConfig } from "react-native-calendars";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthNamesShort: [
    "Jan.",
    "Fev.",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul.",
    "Ago",
    "Set.",
    "Out.",
    "Nov.",
    "Dez.",
  ],
  dayNames: [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

export default function MortalidadeLote() {
  const { id, name } = useLocalSearchParams();
  const loteId = Array.isArray(id) ? Number(id[0]) : Number(id);
  const router = useRouter();

  const [registros, setRegistros] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [totalPerdas, setTotalPerdas] = useState(0);

  // Estados para ver informaçoes do mes especifico
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);

  // Campos do Formulário
  const [selectedDate, setSelectedDate] = useState("");
  const [quantidadeAves, setQuantidadeAves] = useState("");
  const [causa, setCausa] = useState("Calor");

  const causasDisponiveis = [
    "Calor",
    "Doença",
    "Predador",
    "Manejo",
    "Desconhecida",
  ];

  const loadMortalidade = async () => {
    try {
      const response = await api.get(`/mortalidade/lote/${loteId}`);
      const data = response.data || [];

      // Ordena do mais recente para o mais antigo
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.datRegistro).getTime() - new Date(a.datRegistro).getTime(),
      );
      setRegistros(sorted);

      let mortesTotal = 0;
      const newMarks: any = {};

      data.forEach((record: any) => {
        mortesTotal += record.quantidadeAves;

        if (record.datRegistro) {
          // Usando datRegistro conforme seu C#
          const dateKey = record.datRegistro.split("T")[0];
          // Ponto vermelho para indicar baixa/morte
          newMarks[dateKey] = { marked: true, dotColor: "#F44336" };
        }
      });

      setTotalPerdas(mortesTotal);
      setMarkedDates(newMarks);
    } catch (error) {
      console.error("Erro ao carregar mortalidade:", error);
    }
  };

  useEffect(() => {
    if (loteId) loadMortalidade();
  }, [loteId]);

  const openNewRecord = (dateString: string) => {
    setSelectedDate(dateString);
    setQuantidadeAves("");
    setCausa("Calor");
    setRecordId(null);
    setIsEditing(false);
    setModalVisible(true);
  };

  const openEditRecord = (record: any) => {
    setSelectedDate(record.datRegistro.split("T")[0]);
    setQuantidadeAves(String(record.quantidadeAves));
    setCausa(record.causa);
    setRecordId(record.id);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const qtdeNum = parseInt(quantidadeAves);

    if (isNaN(qtdeNum) || qtdeNum <= 0) {
      Alert.alert("Aviso", "Insira uma quantidade válida maior que zero.");
      return;
    }

    try {
      const payload: any = {
        loteId: loteId,
        datRegistro: new Date(selectedDate).toISOString(), // Usando datRegistro conforme seu C#
        quantidadeAves: qtdeNum,
        causa: causa,
      };

      if (isEditing && recordId) {
        payload.id = recordId;
        await api.put(`/mortalidade/${recordId}`, payload);
        Alert.alert("Sucesso", "Registro atualizado!");
      } else {
        await api.post("/mortalidade", payload);
        Alert.alert("Sucesso", "Baixa registrada!");
      }

      setModalVisible(false);
      await loadMortalidade();
    } catch (error: any) {
      console.error(
        "Erro ao salvar mortalidade:",
        error.response?.data || error.message,
      );
      Alert.alert("Erro", "Não foi possível registrar a baixa.");
    }
  };

  const registrosFiltrados = useMemo(() => {
    return registros.filter((item) => {
      // Se for Mortalidade, use item.datRegistro. Se for Sanidade, use item.dataRegistro
      const dataCampo = item.dataRegistro || item.datRegistro;
      if (!dataCampo) return false;

      const [anoStr, mesStr] = dataCampo.split("T")[0].split("-");
      return parseInt(mesStr) === viewMonth && parseInt(anoStr) === viewYear;
    });
  }, [registros, viewMonth, viewYear]);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `Mortalidade - ${name || "Lote"}`, 
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#fff',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity 
              style={{ marginRight: 20 }}
              onPress={() => {
                if (router.canGoBack()) {
                  // Se tiver histórico (navegação normal), volta de onde veio
                  router.back();
                } else {
                  // Se o histórico sumiu (deu F5), força a volta para a tela inicial
                  router.replace("/"); 
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sumário de Perdas */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total de Perdas Acumuladas</Text>
          <Text style={styles.summaryValue}>{totalPerdas} aves</Text>
        </View>

        <Text style={styles.sectionTitle}>Calendário de Mortalidade</Text>
        <View style={{ marginBottom: 20 }}>
          <Calendar
            markedDates={markedDates}
            theme={{
              backgroundColor: "#1e1e1e",
              calendarBackground: "#1e1e1e",
              textSectionTitleColor: "#F44336",
              selectedDayBackgroundColor: "#F44336",
              dayTextColor: "#fff",
              monthTextColor: "#fff",
            }}
            onMonthChange={(month: any) => {
              setViewMonth(month.month);
              setViewYear(month.year);
            }}
            onDayPress={(day: any) => openNewRecord(day.dateString)}
          />
          <Text style={styles.hintText}>
            Toque num dia para registrar perdas
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Histórico de Baixas</Text>
        {registros.length > 0 ? (
          registrosFiltrados.map((item, index) => (
            <TouchableOpacity
              key={item.id || index}
              style={styles.recordCard}
              onPress={() => openEditRecord(item)}
            >
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>
                  {item.datRegistro
                    ?.split("T")[0]
                    .split("-")
                    .reverse()
                    .join("/")}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.causa}</Text>
                </View>
              </View>
              <Text style={styles.quantityText}>
                -{item.quantidadeAves} aves
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Excelente! Nenhuma perda registrada.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Cadastro/Edição */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Editar Baixa" : "Registrar Baixa"} -{" "}
              {selectedDate.split("-").reverse().join("/")}
            </Text>

            <Text style={styles.label}>Quantidade de aves mortas</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={quantidadeAves}
              onChangeText={setQuantidadeAves}
              placeholder="Ex: 5"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Causa Provável</Text>
            <View style={styles.chipContainer}>
              {causasDisponiveis.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, causa === c && styles.chipSelected]}
                  onPress={() => setCausa(c)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      causa === c && styles.chipTextSelected,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  scrollContent: { padding: 10, paddingBottom: 40 },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  hintText: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
    fontStyle: "italic",
  },

  // Sumário
  summaryCard: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: "#F44336",
  },
  summaryLabel: { color: "#aaa", fontSize: 14, marginBottom: 5 },
  summaryValue: { color: "#F44336", fontSize: 28, fontWeight: "bold" },

  // Cards da Lista
  recordCard: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recordDate: { color: "#aaa", fontSize: 14, fontWeight: "bold" },
  quantityText: {
    color: "#F44336",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },

  emptyCard: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  emptyText: { color: "#4CAF50", fontWeight: "bold" }, // Verde se não tiver mortes

  // Badges (Etiquetas da causa na lista)
  badge: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.3)",
  },
  badgeText: { color: "#ff8a80", fontSize: 12, fontWeight: "bold" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "#1e1e1e", padding: 20, borderRadius: 12 },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: { color: "#aaa", marginBottom: 8, fontSize: 14 },
  input: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },

  // Chips de Seleção no Modal
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#2a2a2a",
    borderRadius: 20,
  },
  chipSelected: { backgroundColor: "#F44336" },
  chipText: { color: "#aaa", fontWeight: "bold" },
  chipTextSelected: { color: "#fff" },

  modalActions: { flexDirection: "row", justifyContent: "flex-end" },
  cancelBtn: { padding: 12, marginRight: 10 },
  cancelBtnText: { color: "#aaa", fontWeight: "bold", fontSize: 16 },
  saveBtn: {
    backgroundColor: "#F44336",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
