import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { LineChart } from "react-native-chart-kit";
import api from "@/services/api";

// Configuração do calendário em Português
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

export default function PesoLote() {
  const { id, name } = useLocalSearchParams();
  const loteId = Array.isArray(id) ? Number(id[0]) : Number(id);

  const [pesos, setPesos] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);

  // Gráfico
  const [chartLabels, setChartLabels] = useState<string[]>([""]);
  const [chartData, setChartData] = useState<number[]>([0]);

  // Controle de Mês/Ano do calendário (opcional para filtro futuro)
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const loadPesos = async () => {
    try {
      const response = await api.get(`/pesagens/lote/${loteId}`);
      const data = response.data || [];

      setPesos(data);

      // 1. Marca os dias no Calendário
      const newMarks: any = {};
      data.forEach((record: any) => {
        if (record.dataRegistro) {
          const dateKey = record.dataRegistro.split("T")[0];
          // Usamos a mesma cor verde padrão do app
          newMarks[dateKey] = { marked: true, dotColor: "#4CAF50" };
        }
      });
      setMarkedDates(newMarks);

      // 2. Prepara dados do Gráfico (Apenas os últimos 7 ou 10 registros para não embolar)
      if (data.length > 0) {
        const sorted = [...data].sort(
          (a, b) =>
            new Date(a.dataRegistro).getTime() -
            new Date(b.dataRegistro).getTime(),
        );

        // Pega apenas os últimos 10 pesos para o gráfico ficar legível
        const recentData = sorted.slice(-10);

        setChartLabels(
          recentData.map((p) => {
            const dateParts = p.dataRegistro.split("T")[0].split("-");
            return `${dateParts[2]}/${dateParts[1]}`; // Retorna DD/MM
          }),
        );
        setChartData(recentData.map((p) => p.pesoMedioGramas));
      } else {
        setChartLabels([""]);
        setChartData([0]);
      }
    } catch (error) {
      console.error("Erro ao carregar pesos:", error);
    }
  };

  useEffect(() => {
    if (loteId) loadPesos();
  }, [loteId]);

  const handleSaveWeight = async () => {
    if (!newWeight || newWeight.trim() === "") {
      Alert.alert("Aviso", "Digite o peso.");
      return;
    }

    const weightValue = Number(newWeight.replace(",", "."));
    if (isNaN(weightValue)) {
      Alert.alert("Erro", "Valor inválido.");
      return;
    }

    try {
      const payload: any = {
        loteId: loteId,
        pesoMedioGramas: weightValue,
        dataRegistro: new Date(selectedDate).toISOString(),
        idadeAvesDias: 0,
      };

      if (isEditing && recordId) {
        // MODO EDIÇÃO: Chama a rota PUT que acabamos de criar no C#
        payload.id = recordId;
        console.log(`Atualizando peso ID: ${recordId}...`);
        await api.put(`/pesagens/${recordId}`, payload);
        Alert.alert("Sucesso", "Pesagem atualizada!");
      } else {
        // MODO CRIAÇÃO: Chama o POST padrão
        await api.post("/pesagens", payload);
        Alert.alert("Sucesso", "Peso registrado!");
      }

      setModalVisible(false);
      setNewWeight("");
      setIsEditing(false);
      setRecordId(null);
      await loadPesos();
    } catch (error: any) {
      console.error(
        "Erro ao salvar peso:",
        error.response?.data || error.message,
      );
      Alert.alert("Erro", "Não foi possível salvar o peso.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{ title: `Peso - ${name || "Lote"}`, headerShown: true }}
      />

      <Text style={styles.sectionTitle}>Curva de Crescimento (g)</Text>

      {chartData.length > 0 && chartData[0] !== 0 ? (
        <LineChart
          data={{ labels: chartLabels, datasets: [{ data: chartData }] }}
          width={Math.max(Dimensions.get("window").width - 20, 300)}
          height={220}
          chartConfig={{
            backgroundColor: "#1e1e1e",
            backgroundGradientFrom: "#1e1e1e",
            backgroundGradientTo: "#1e1e1e",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Linha branca igual ao outro
            labelColor: (opacity = 1) => `rgba(170, 170, 170, ${opacity})`,
            propsForDots: { r: "5", strokeWidth: "2", stroke: "#4CAF50" }, // Ponto verde
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Sem pesagens registradas</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Registro de Pesagem</Text>
      <View style={{ marginBottom: 30 }}>
        <Calendar
          markedDates={markedDates}
          theme={{
            backgroundColor: "#1e1e1e",
            calendarBackground: "#1e1e1e",
            textSectionTitleColor: "#4CAF50",
            selectedDayBackgroundColor: "#4CAF50",
            dayTextColor: "#fff",
            monthTextColor: "#fff",
          }}
          onMonthChange={(month: any) => {
            setViewMonth(month.month);
            setViewYear(month.year);
          }}
          onDayPress={(day: any) => {
            setSelectedDate(day.dateString);

            // Verifica se já existe peso nesse dia para abrir em modo edição
            const existingRecord = pesos.find(
              (r: any) =>
                r.dataRegistro &&
                r.dataRegistro.split("T")[0] === day.dateString,
            );

            if (existingRecord) {
              setNewWeight(String(existingRecord.pesoMedioGramas));
              setRecordId(existingRecord.id);
              setIsEditing(true);
            } else {
              setNewWeight("");
              setRecordId(null);
              setIsEditing(false);
            }
            setModalVisible(true);
          }}
        />
      </View>

      {/* Modal Reutilizado do Estilo Anterior */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Editar Pesagem" : "Nova Pesagem"} -{" "}
              {selectedDate.split("-").reverse().join("/")}
            </Text>

            <Text style={styles.label}>Peso Médio (gramas)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={newWeight}
              onChangeText={setNewWeight}
              placeholder="Ex: 1250"
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveWeight}
              >
                <Text style={styles.saveBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 10 },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 15,
  },

  chart: { marginVertical: 10, borderRadius: 12 },
  emptyChart: {
    height: 220,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  emptyText: { color: "#666" },

  // Modal (Igual ao DailyModal)
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
  label: { color: "#aaa", marginBottom: 5, fontSize: 14 },
  input: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end" },
  cancelBtn: { padding: 12, marginRight: 10 },
  cancelBtnText: { color: "#ff5252", fontWeight: "bold", fontSize: 16 },
  saveBtn: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
