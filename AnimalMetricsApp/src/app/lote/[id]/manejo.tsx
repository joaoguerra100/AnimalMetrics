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
  Switch,
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

export default function ManejoLote() {
  const { id, name } = useLocalSearchParams();
  const loteId = Array.isArray(id) ? Number(id[0]) : Number(id);
  const router = useRouter();

  const [registros, setRegistros] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});

  // Estados de Controle do Calendário e Ordenação
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // 'desc' = Mais Recente

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);

  // Campos do Checklist
  const [limpeza, setLimpeza] = useState(false);
  const [equipamentos, setEquipamentos] = useState(false);
  const [estrutura, setEstrutura] = useState(false);
  const [clima, setClima] = useState(false);
  const [observacoes, setObservacoes] = useState("");

  const loadManejo = async () => {
    try {
      const response = await api.get(`/manejo/lote/${loteId}`);
      const data = response.data || [];

      setRegistros(data);

      const newMarks: any = {};
      data.forEach((record: any) => {
        if (record.dataRegistro) {
          const dateKey = record.dataRegistro.split("T")[0];
          newMarks[dateKey] = { marked: true, dotColor: "#FF9800" };
        }
      });
      setMarkedDates(newMarks);
    } catch (error) {
      console.error("Erro ao carregar manejo:", error);
    }
  };

  useEffect(() => {
    if (loteId) loadManejo();
  }, [loteId]);

  // Lógica inteligente: Filtra por mês e aplica a ordenação sem chamar a API de novo
  const registrosFiltrados = useMemo(() => {
    // 1. Filtra apenas os registros do mês e ano que estão aparecendo no calendário
    let filtered = registros.filter((item) => {
      if (!item.dataRegistro) return false;
      const [anoStr, mesStr] = item.dataRegistro.split("T")[0].split("-");
      return parseInt(mesStr) === viewMonth && parseInt(anoStr) === viewYear;
    });

    // 2. Aplica a ordenação (Mais recente ou Mais antigo)
    filtered.sort((a, b) => {
      const timeA = new Date(a.dataRegistro).getTime();
      const timeB = new Date(b.dataRegistro).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

    return filtered;
  }, [registros, viewMonth, viewYear, sortOrder]);

  const openModal = (dateString: string) => {
    setSelectedDate(dateString);
    const existingRecord = registros.find(
      (r: any) => r.dataRegistro && r.dataRegistro.split("T")[0] === dateString,
    );

    if (existingRecord) {
      setLimpeza(existingRecord.limpezaRealizada);
      setEquipamentos(existingRecord.equipamentosInspecionados);
      setEstrutura(existingRecord.estruturaOk);
      setClima(existingRecord.condicoesClimaticasOk);
      setObservacoes(existingRecord.observacoes || "");
      setRecordId(existingRecord.id);
      setIsEditing(true);
    } else {
      setLimpeza(false);
      setEquipamentos(false);
      setEstrutura(false);
      setClima(false);
      setObservacoes("");
      setRecordId(null);
      setIsEditing(false);
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        loteId: loteId,
        dataRegistro: new Date(selectedDate).toISOString(),
        limpezaRealizada: limpeza,
        equipamentosInspecionados: equipamentos,
        estruturaOk: estrutura,
        condicoesClimaticasOk: clima,
        observacoes: observacoes,
      };

      if (isEditing && recordId) {
        payload.id = recordId;
        await api.put(`/manejo/${recordId}`, payload);
      } else {
        await api.post("/manejo", payload);
      }
      setModalVisible(false);
      await loadManejo();
    } catch (error: any) {
      console.error(
        "Erro ao salvar manejo:",
        error.response?.data || error.message,
      );
      Alert.alert("Erro", "Não foi possível registrar o manejo.");
    }
  };

  const getPontuacao = (item: any) => {
    let score = 0;
    if (item.limpezaRealizada) score++;
    if (item.equipamentosInspecionados) score++;
    if (item.estruturaOk) score++;
    if (item.condicoesClimaticasOk) score++;
    return score;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Manejo - ${name || "Lote"}`,
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
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Calendário de Atividades</Text>
        <View style={{ marginBottom: 20 }}>
          <Calendar
            markedDates={markedDates}
            theme={{
              backgroundColor: "#1e1e1e",
              calendarBackground: "#1e1e1e",
              textSectionTitleColor: "#FF9800",
              selectedDayBackgroundColor: "#FF9800",
              dayTextColor: "#fff",
              monthTextColor: "#fff",
            }}
            onDayPress={(day: any) => openModal(day.dateString)}
            // Captura quando o usuário muda de mês no calendário
            onMonthChange={(month: any) => {
              setViewMonth(month.month);
              setViewYear(month.year);
            }}
          />
          <Text style={styles.hintText}>
            Toque em um dia para preencher o checklist
          </Text>
        </View>

        {/* Header da Lista com o Botão de Ordenação */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Histórico do Mês</Text>
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          >
            <Text style={styles.sortButton}>
              {sortOrder === "desc" ? "↓ Mais Recente" : "↑ Mais Antigo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Agora mapeamos o registrosFiltrados, e não a lista inteira */}
        {registrosFiltrados.length > 0 ? (
          registrosFiltrados.map((item, index) => {
            const pontuacao = getPontuacao(item);
            const isPerfeito = pontuacao === 4;

            return (
              <TouchableOpacity
                key={item.id || index}
                style={styles.recordCard}
                onPress={() => openModal(item.dataRegistro.split("T")[0])}
              >
                <View style={styles.recordHeader}>
                  <Text style={styles.recordDate}>
                    {item.dataRegistro
                      ?.split("T")[0]
                      .split("-")
                      .reverse()
                      .join("/")}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      isPerfeito ? styles.badgeSuccess : styles.badgeWarning,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        isPerfeito
                          ? styles.badgeTextSuccess
                          : styles.badgeTextWarning,
                      ]}
                    >
                      {pontuacao}/4 OK
                    </Text>
                  </View>
                </View>

                {item.observacoes ? (
                  <Text style={styles.observacaoText}>
                    Obs: {item.observacoes}
                  </Text>
                ) : (
                  <Text style={styles.observacaoEmpty}>
                    Nenhuma observação extra.
                  </Text>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Nenhum manejo registrado neste mês.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal Checklist Blindado (Sem fechar ao clicar no fundo) */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.scrollCenter}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Editar Inspeção" : "Checklist Diário"} -{" "}
                {selectedDate.split("-").reverse().join("/")}
              </Text>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Limpeza do Galpão</Text>
                <Switch
                  value={limpeza}
                  onValueChange={setLimpeza}
                  trackColor={{ false: "#444", true: "#FF9800" }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  Equipamentos (Bebedouros)
                </Text>
                <Switch
                  value={equipamentos}
                  onValueChange={setEquipamentos}
                  trackColor={{ false: "#444", true: "#FF9800" }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  Estrutura (Telas e Telhado)
                </Text>
                <Switch
                  value={estrutura}
                  onValueChange={setEstrutura}
                  trackColor={{ false: "#444", true: "#FF9800" }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Clima (Temperatura)</Text>
                <Switch
                  value={clima}
                  onValueChange={setClima}
                  trackColor={{ false: "#444", true: "#FF9800" }}
                  thumbColor="#fff"
                />
              </View>

              <Text style={styles.label}>Observações (Opcional)</Text>
              <TextInput
                style={styles.inputArea}
                multiline
                numberOfLines={3}
                value={observacoes}
                onChangeText={setObservacoes}
                placeholder="Anotar manutenções, defeitos..."
                placeholderTextColor="#666"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPressIn={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPressIn={handleSave}>
                  <Text style={styles.saveBtnText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  scrollContent: { padding: 10, paddingBottom: 40 },

  // Header da lista e ordenação
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  sortBtn: {
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  sortButton: { color: "#2196F3", fontSize: 14, fontWeight: "bold" },

  hintText: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
    fontStyle: "italic",
  },

  // Cards de Histórico
  recordCard: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recordDate: { color: "#aaa", fontSize: 16, fontWeight: "bold" },
  observacaoText: { color: "#ddd", fontSize: 14, fontStyle: "italic" },
  observacaoEmpty: { color: "#555", fontSize: 12 },

  emptyCard: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  emptyText: { color: "#666" },

  // Badges
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  badgeWarning: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    borderColor: "rgba(255, 152, 0, 0.3)",
  },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  badgeTextSuccess: { color: "#4CAF50" },
  badgeTextWarning: { color: "#FF9800" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)" },
  scrollCenter: { flexGrow: 1, justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#1e1e1e", padding: 20, borderRadius: 12 },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  switchLabel: { color: "#fff", fontSize: 14, flex: 1, paddingRight: 10 },

  label: { color: "#aaa", marginTop: 10, marginBottom: 8, fontSize: 14 },
  inputArea: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: "top",
  },

  modalActions: { flexDirection: "row", justifyContent: "flex-end" },
  cancelBtn: { padding: 12, marginRight: 10 },
  cancelBtnText: { color: "#aaa", fontWeight: "bold", fontSize: 16 },
  saveBtn: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
