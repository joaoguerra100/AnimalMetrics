import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons"; // Para o ícone de calendário
import api from "@/services/api";

// Configuração do Calendário
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
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
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

export default function DashboardInicio() {
  const { id, name } = useLocalSearchParams();
  const loteId = Array.isArray(id) ? Number(id[0]) : Number(id);
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  // Dados Brutos (Baixados apenas uma vez)
  const [allPesos, setAllPesos] = useState<any[]>([]);
  const [allMortes, setAllMortes] = useState<any[]>([]);
  const [allRacoes, setAllRacoes] = useState<any[]>([]);
  const [precoRacao, setPrecoRacao] = useState(0);

  // Estados do Filtro
  const [modalVisible, setModalVisible] = useState(false);
  const [filterMode, setFilterMode] = useState("geral"); // 'geral', 'dia', 'mes', 'ano'
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const carregarTudo = async () => {
      if (!loteId) return;
      try {
        setLoading(true);
        // Busca todos os dados de uma vez só
        const [pesosRes, mortesRes, racaoRes, loteRes] = await Promise.all([
          api.get(`/pesagens/lote/${loteId}`).catch(() => ({ data: [] })),
          api.get(`/mortalidade/lote/${loteId}`).catch(() => ({ data: [] })),
          api.get(`/dailyrecords/lote/${loteId}`).catch(() => ({ data: [] })),
          api
            .get(`/lotes/${loteId}`)
            .catch(() => ({ data: { rationPrice: 0 } })),
        ]);

        setAllPesos(pesosRes.data || []);
        setAllMortes(mortesRes.data || []);
        setAllRacoes(racaoRes.data || []);
        setPrecoRacao(loteRes.data?.rationPrice || 0);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarTudo();
  }, [loteId]);

  // Função que calcula os totais baseados no filtro selecionado (Atualiza Instantaneamente)
  const resumo = useMemo(() => {
    const match = (dateStr: string) => {
      if (!dateStr) return false;
      const data = dateStr.split("T")[0]; // YYYY-MM-DD

      if (filterMode === "geral") return true;
      if (filterMode === "dia") return data === selectedDate;
      if (filterMode === "mes") {
        const m = selectedMonth.toString().padStart(2, "0");
        return data.startsWith(`${selectedYear}-${m}`);
      }
      if (filterMode === "ano") return data.startsWith(`${selectedYear}`);
      return false;
    };

    // Filtra os arrays
    const pesosFiltrados = allPesos.filter((p) => match(p.dataRegistro));
    const mortesFiltradas = allMortes.filter((m) => match(m.datRegistro)); // No seu C# está datRegistro sem 'a'
    const racoesFiltradas = allRacoes.filter((r) => match(r.recordDate));

    // 1. Último Peso do Período
    let ultimoPeso = 0;
    if (pesosFiltrados.length > 0) {
      const ordenados = [...pesosFiltrados].sort(
        (a, b) =>
          new Date(b.dataRegistro).getTime() -
          new Date(a.dataRegistro).getTime(),
      );
      ultimoPeso = ordenados[0].pesoMedioGramas;
    }

    // 2. Total de Mortes no Período
    const totalMortes = mortesFiltradas.reduce(
      (acc, curr) => acc + curr.quantidadeAves,
      0,
    );

    // 3. Consumo e Gasto no Período
    const consumoGramas = racoesFiltradas.reduce(
      (acc, curr) => acc + curr.foodGiven,
      0,
    );
    const consumoKg = consumoGramas / 1000;
    const gasto = consumoKg * precoRacao;
    const consumoAgua = racoesFiltradas.reduce((acc, curr) => acc + (curr.waterConsumed || 0), 0);

    return { ultimoPeso, totalMortes, consumoKg, gasto, consumoAgua };
  }, [
    allPesos,
    allMortes,
    allRacoes,
    precoRacao,
    filterMode,
    selectedDate,
    selectedMonth,
    selectedYear,
  ]);

  // Textos Dinâmicos da Tela
  const getTituloFiltro = () => {
    if (filterMode === "geral") return "Todo o Histórico do Lote";
    if (filterMode === "dia")
      return `Dados do dia ${selectedDate.split("-").reverse().join("/")}`;
    if (filterMode === "mes")
      return `Resumo de ${LocaleConfig.locales["pt-br"].monthNames[selectedMonth - 1]} / ${selectedYear}`;
    if (filterMode === "ano") return `Resumo do ano de ${selectedYear}`;
  };

  const labelSufixo =
    filterMode === "geral"
      ? "(Total)"
      : filterMode === "dia"
        ? "(Dia)"
        : filterMode === "mes"
          ? "(Mês)"
          : "(Ano)";

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `Resumo - ${name || "Lote"}`, 
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

      {/* Cabeçalho e Botão de Filtro */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Visão Geral</Text>
          <Text style={styles.headerSubtitle}>{getTituloFiltro()}</Text>
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="calendar-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4CAF50"
          style={{ marginTop: 50 }}
        />
      ) : (
        <View style={styles.grid}>
          <View style={[styles.card, { borderLeftColor: "#4CAF50" }]}>
            <Text style={styles.cardLabel}>Último Peso Registrado</Text>
            <Text style={styles.cardValue}>
              {resumo.ultimoPeso} <Text style={styles.unit}>g</Text>
            </Text>
          </View>

          <View style={[styles.card, { borderLeftColor: "#F44336" }]}>
            <Text style={styles.cardLabel}>Mortalidade {labelSufixo}</Text>
            <Text style={[styles.cardValue, { color: "#F44336" }]}>
              {resumo.totalMortes} <Text style={styles.unit}>aves</Text>
            </Text>
          </View>

          <View style={[styles.card, { borderLeftColor: "#FFD700" }]}>
            <Text style={styles.cardLabel}>Custo Ração {labelSufixo}</Text>
            <Text style={[styles.cardValue, { color: "#FFD700" }]}>
              R$ {resumo.gasto.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.card, { borderLeftColor: "#2196F3" }]}>
            <Text style={styles.cardLabel}>Consumo Ração {labelSufixo}</Text>
            <Text style={styles.cardValue}>
              {resumo.consumoKg.toFixed(1)} <Text style={styles.unit}>kg</Text>
            </Text>
          </View>

          <View style={[styles.card, { borderLeftColor: "#00BCD4" }]}>
            <Text style={styles.cardLabel}>Água Consumida {labelSufixo}</Text>
            <Text style={[styles.cardValue, { color: "#00BCD4" }]}>
              {resumo.consumoAgua.toFixed(1)} <Text style={styles.unit}>L</Text>
            </Text>
          </View>
          
        </View>
      )}

      {/* Modal Inteligente de Filtro */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
            <Text style={styles.modalTitle}>Escolha o Período</Text>

            {/* Abas do Modal */}
            <View style={styles.tabContainer}>
              {["geral", "dia", "mes", "ano"].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.tab, filterMode === mode && styles.tabActive]}
                  onPress={() => setFilterMode(mode)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      filterMode === mode && styles.tabTextActive,
                    ]}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Conteúdo do Modal dependendo da Aba */}
            {filterMode === "dia" && (
              <Calendar
                theme={{
                  backgroundColor: "#1e1e1e",
                  calendarBackground: "#1e1e1e",
                  textSectionTitleColor: "#4CAF50",
                  selectedDayBackgroundColor: "#4CAF50",
                  dayTextColor: "#fff",
                  monthTextColor: "#fff",
                  arrowColor: "#4CAF50",
                }}
                markedDates={{ [selectedDate]: { selected: true } }}
                onDayPress={(day: any) => setSelectedDate(day.dateString)}
              />
            )}

            {filterMode === "mes" && (
              <View>
                <View style={styles.yearSelector}>
                  <TouchableOpacity
                    onPress={() => setSelectedYear((y) => y - 1)}
                  >
                    <Text style={styles.arrow}>◄</Text>
                  </TouchableOpacity>
                  <Text style={styles.yearText}>{selectedYear}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedYear((y) => y + 1)}
                  >
                    <Text style={styles.arrow}>►</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.chipGrid}>
                  {LocaleConfig.locales["pt-br"].monthNamesShort.map(
                    (m: string, index: number) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.chip,
                          selectedMonth === index + 1 && styles.chipActive,
                        ]}
                        onPress={() => setSelectedMonth(index + 1)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedMonth === index + 1 &&
                              styles.chipTextActive,
                          ]}
                        >
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              </View>
            )}

            {filterMode === "ano" && (
              <View style={styles.chipGrid}>
                {[
                  selectedYear - 2,
                  selectedYear - 1,
                  selectedYear,
                  selectedYear + 1,
                ].map((ano) => (
                  <TouchableOpacity
                    key={ano}
                    style={[
                      styles.chip,
                      selectedYear === ano && styles.chipActive,
                    ]}
                    onPress={() => setSelectedYear(ano)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedYear === ano && styles.chipTextActive,
                      ]}
                    >
                      {ano}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {filterMode === "geral" && (
              <Text style={styles.geralHint}>
                Mostrando dados acumulados desde a abertura do lote até hoje.
              </Text>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Aplicar Filtro</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 15 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  headerSubtitle: {
    color: "#4CAF50",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  filterBtn: {
    backgroundColor: "#1e1e1e",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: "#1e1e1e",
    width: "48%",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardValue: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  unit: { fontSize: 14, fontWeight: "normal", color: "#888" },

  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: "#4CAF50" },
  tabText: { color: "#aaa", fontWeight: "bold" },
  tabTextActive: { color: "#fff" },

  yearSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  yearText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginHorizontal: 20,
  },
  arrow: { color: "#4CAF50", fontSize: 24, padding: 10 },

  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: "#2a2a2a",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
  },
  chipActive: { backgroundColor: "#4CAF50" },
  chipText: { color: "#aaa", fontWeight: "bold" },
  chipTextActive: { color: "#fff" },

  geralHint: {
    color: "#aaa",
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 30,
  },

  closeBtn: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  closeBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
