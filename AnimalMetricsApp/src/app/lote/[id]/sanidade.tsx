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

export default function SanidadeLote() {
  const { id, name } = useLocalSearchParams();
  const loteId = Array.isArray(id) ? Number(id[0]) : Number(id);
  const router = useRouter();

  const [registros, setRegistros] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});

  // Estados para ver informaçoes do mes especifico
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  // Estados dos Filtros e Pesquisa
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' = Mais recentes, 'asc' = Mais antigos
  const [searchQuery, setSearchQuery] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);

  // Campos do Formulário
  const [selectedDate, setSelectedDate] = useState("");
  const [tipo, setTipo] = useState("Vacina");
  const [nomeProduto, setNomeProduto] = useState("");
  const [dosagem, setDosagem] = useState("");

  const tiposDisponiveis = ["Vacina", "Medicamento", "Vitamina"];
  const filtrosDisponiveis = ["Todos", "Vacina", "Medicamento", "Vitamina"];

  const loadSanidade = async () => {
    try {
      const response = await api.get(`/sanidade/lote/${loteId}`);
      const data = response.data || [];

      setRegistros(data);

      const newMarks: any = {};
      data.forEach((record: any) => {
        if (record.dataAplicacao) {
          const dateKey = record.dataAplicacao.split("T")[0];
          newMarks[dateKey] = { marked: true, dotColor: "#2196F3" };
        }
      });
      setMarkedDates(newMarks);
    } catch (error) {
      console.error("Erro ao carregar sanidade:", error);
    }
  };

  useEffect(() => {
    if (loteId) loadSanidade();
  }, [loteId]);

  // A MÁGICA ACONTECE AQUI: Juntamos todos os filtros em um só lugar de forma otimizada!
  const processados = useMemo(() => {
    return (
      registros
        // 1. Filtra primeiro pelo mês e ano do calendário
        .filter((r) => {
          if (!r.dataAplicacao) return false;
          const [anoStr, mesStr] = r.dataAplicacao.split("T")[0].split("-");
          return (
            parseInt(mesStr) === viewMonth && parseInt(anoStr) === viewYear
          );
        })
        // 2. Filtra pelas abinhas (Todos, Vacina, Medicamento)
        .filter((r) => filterTipo === "Todos" || r.tipo === filterTipo)
        // 3. Filtra pela barra de pesquisa
        .filter((r) =>
          r.nomeProduto.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        // 4. Ordena (Mais Recente ou Mais Antigo)
        .sort((a, b) => {
          const dateA = new Date(a.dataAplicacao).getTime();
          const dateB = new Date(b.dataAplicacao).getTime();
          return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        })
    );
  }, [registros, viewMonth, viewYear, filterTipo, searchQuery, sortOrder]);

  const openNewRecord = (dateString: string) => {
    setSelectedDate(dateString);
    setTipo("Vacina");
    setNomeProduto("");
    setDosagem("");
    setRecordId(null);
    setIsEditing(false);
    setModalVisible(true);
  };

  const openEditRecord = (record: any) => {
    setSelectedDate(record.dataAplicacao.split("T")[0]);
    setTipo(record.tipo);
    setNomeProduto(record.nomeProduto);
    setDosagem(record.dosagem);
    setRecordId(record.id);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!nomeProduto.trim() || !dosagem.trim()) {
      Alert.alert("Aviso", "Preencha o nome do produto e a dosagem.");
      return;
    }

    try {
      const payload: any = {
        loteId: loteId,
        dataAplicacao: new Date(selectedDate).toISOString(),
        tipo: tipo,
        nomeProduto: nomeProduto,
        dosagem: dosagem,
      };

      if (isEditing && recordId) {
        payload.id = recordId;
        await api.put(`/sanidade/${recordId}`, payload);
      } else {
        await api.post("/sanidade", payload);
      }

      setModalVisible(false);
      await loadSanidade();
    } catch (error: any) {
      console.error(
        "Erro ao salvar sanidade:",
        error.response?.data || error.message,
      );
      Alert.alert("Erro", "Não foi possível salvar o registro.");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Sanidade - ${name || "Lote"}`,
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[2]}
      >
        {/* Bloco 0: Calendário */}
        <Text style={styles.sectionTitle}>Calendário Sanitário</Text>
        <View style={{ marginBottom: 20 }}>
          <Calendar
            markedDates={markedDates}
            theme={{
              backgroundColor: "#1e1e1e",
              calendarBackground: "#1e1e1e",
              textSectionTitleColor: "#2196F3",
              selectedDayBackgroundColor: "#2196F3",
              dayTextColor: "#fff",
              monthTextColor: "#fff",
            }}
            onDayPress={(day: any) => openNewRecord(day.dateString)}
            onMonthChange={(month: any) => {
              setViewMonth(month.month);
              setViewYear(month.year);
            }}
          />
          <Text style={styles.hintText}>
            Toque em um dia para adicionar um registro
          </Text>
        </View>

        {/* Bloco 1: Filtros Fixos (Ficarão colados no topo ao rolar a lista) */}
        <View style={styles.filterSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome do produto..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {filtrosDisponiveis.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.filterBadge,
                  filterTipo === t && styles.filterBadgeSelected,
                ]}
                onPress={() => setFilterTipo(t)}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    filterTipo === t && styles.filterBadgeTextSelected,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Histórico do Mês</Text>
            <TouchableOpacity
              onPress={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
            >
              <Text style={styles.sortButton}>
                {sortOrder === "desc" ? "▼ Mais recentes" : "▲ Mais antigos"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bloco 2: Lista Filtrada */}
        {processados.length > 0 ? (
          processados.map((item, index) => (
            <TouchableOpacity
              key={item.id || index}
              style={styles.recordCard}
              onPress={() => openEditRecord(item)}
            >
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>
                  {item.dataAplicacao
                    ?.split("T")[0]
                    .split("-")
                    .reverse()
                    .join("/")}
                </Text>
                <View
                  style={[
                    styles.badge,
                    item.tipo === "Vacina"
                      ? styles.badgeVacina
                      : item.tipo === "Medicamento"
                        ? styles.badgeRemedio
                        : styles.badgeVitamina,
                  ]}
                >
                  <Text style={styles.badgeText}>{item.tipo}</Text>
                </View>
              </View>
              <Text style={styles.productName}>{item.nomeProduto}</Text>
              <Text style={styles.dosageText}>Dosagem: {item.dosagem}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Nenhum registro encontrado para este mês ou filtro.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Cadastro/Edição Atualizado com proteção de clique */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <ScrollView
            contentContainerStyle={styles.scrollCenter}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Editar Registro" : "Novo Registro"} -{" "}
                {selectedDate.split("-").reverse().join("/")}
              </Text>

              <Text style={styles.label}>Tipo</Text>
              <View style={styles.chipContainer}>
                {tiposDisponiveis.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, tipo === t && styles.chipSelected]}
                    onPress={() => setTipo(t)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tipo === t && styles.chipTextSelected,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Nome do Produto (Ex: NewCastle)</Text>
              <TextInput
                style={styles.input}
                value={nomeProduto}
                onChangeText={setNomeProduto}
                placeholder="Digite o nome..."
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>Dosagem (Ex: 10ml/L, 1 gota)</Text>
              <TextInput
                style={styles.input}
                value={dosagem}
                onChangeText={setDosagem}
                placeholder="Digite a dosagem..."
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

  // Filtros e Pesquisa
  filterSection: {
    backgroundColor: "#121212",
    paddingTop: 10,
    paddingBottom: 5,
    zIndex: 10,
  },
  searchInput: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  filterScroll: { marginBottom: 10 },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  filterBadgeSelected: { backgroundColor: "#2196F3", borderColor: "#2196F3" },
  filterBadgeText: { color: "#aaa", fontWeight: "bold", fontSize: 14 },
  filterBadgeTextSelected: { color: "#fff" },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 5,
  },
  sortButton: { color: "#2196F3", fontSize: 14, fontWeight: "bold" },

  // Cards da Lista
  recordCard: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recordDate: { color: "#aaa", fontSize: 14, fontWeight: "bold" },
  productName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dosageText: { color: "#ddd", fontSize: 14 },

  emptyCard: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  emptyText: { color: "#666", textAlign: "center" },

  // Badges (Etiquetas de cor)
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeVacina: { backgroundColor: "rgba(33, 150, 243, 0.2)" }, // Azul
  badgeRemedio: { backgroundColor: "rgba(244, 67, 54, 0.2)" }, // Vermelho
  badgeVitamina: { backgroundColor: "rgba(76, 175, 80, 0.2)" }, // Verde
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },

  // Modal Atualizado
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  scrollCenter: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 12,
    zIndex: 10,
  },
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
    fontSize: 16,
    marginBottom: 20,
  },

  // Chips de Seleção no Modal
  chipContainer: { flexDirection: "row", marginBottom: 20, gap: 10 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    alignItems: "center",
  },
  chipSelected: { backgroundColor: "#2196F3" },
  chipText: { color: "#aaa", fontWeight: "bold" },
  chipTextSelected: { color: "#fff" },

  modalActions: { flexDirection: "row", justifyContent: "flex-end" },
  cancelBtn: { padding: 12, marginRight: 10 },
  cancelBtnText: { color: "#ff5252", fontWeight: "bold", fontSize: 16 },
  saveBtn: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
