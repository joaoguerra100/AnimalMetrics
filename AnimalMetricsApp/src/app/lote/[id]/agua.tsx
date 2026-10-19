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
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { LineChart } from "react-native-chart-kit";
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

export default function AguaLote() {
  const { id, name } = useLocalSearchParams();
  const loteId = Array.isArray(id) ? Number(id[0]) : Number(id);
  const router = useRouter();

  const [registros, setRegistros] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [aguaLitros, setAguaLitros] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [existingRacao, setExistingRacao] = useState<number>(0);

  // Gráfico
  const [chartLabels, setChartLabels] = useState<string[]>([""]);
  const [chartData, setChartData] = useState<number[]>([0]);

  const loadAgua = async () => {
    try {
      const response = await api.get(`/dailyrecords/lote/${loteId}`);
      const data = response.data || [];

      setRegistros(data);
      const newMarks: any = {};
      const sorted = [...data].sort(
        (a, b) =>
          new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime(),
      );

      // Filtra estritamente os dias em que houve consumo de água
      const registrosComAgua = sorted.filter((r) => r.waterConsumed > 0);

      registrosComAgua.forEach((record: any) => {
        if (record.recordDate) {
          const dateKey = record.recordDate.split("T")[0];
          newMarks[dateKey] = { marked: true, dotColor: "#00BCD4" };
        }
      });
      setMarkedDates(newMarks);

      if (registrosComAgua.length > 0) {
        const recentData = registrosComAgua.slice(-10);
        setChartLabels(
          recentData.map((p) => {
            const dateParts = p.recordDate.split("T")[0].split("-");
            return `${dateParts[2]}/${dateParts[1]}`;
          }),
        );
        setChartData(recentData.map((p) => p.waterConsumed));
      } else {
        setChartLabels([""]);
        setChartData([0]);
      }
    } catch (error) {
      console.error("Erro ao carregar água:", error);
    }
  };

  useEffect(() => {
    if (loteId) loadAgua();
  }, [loteId]);

  const openModal = (dateString: string) => {
    setSelectedDate(dateString);

    const existingRecord = registros.find(
      (r: any) => r.recordDate && r.recordDate.split("T")[0] === dateString,
    );

    if (existingRecord) {
      setAguaLitros(
        existingRecord.waterConsumed > 0
          ? String(existingRecord.waterConsumed)
          : "",
      );
      setRecordId(existingRecord.id);
      setExistingRacao(existingRecord.foodGiven || 0);
      setIsEditing(true);
    } else {
      setAguaLitros("");
      setRecordId(null);
      setExistingRacao(0);
      setIsEditing(false);
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    const aguaValue = Number(aguaLitros.replace(",", "."));
    if (isNaN(aguaValue) || aguaValue <= 0) {
      Alert.alert("Aviso", "Insira um volume válido maior que zero.");
      return;
    }

    try {
      const payload: any = {
        loteId: loteId,
        recordDate: new Date(selectedDate).toISOString(),
        waterConsumed: aguaValue,
        foodGiven: existingRacao, // Garante que a ração não será apagada
      };

      if (isEditing && recordId) {
        payload.id = recordId;
        await api.put(`/dailyrecords/${recordId}`, payload);
      } else {
        await api.post("/dailyrecords", payload);
      }

      setModalVisible(false);
      await loadAgua();
    } catch (error: any) {
      console.error(
        "Erro ao salvar água:",
        error.response?.data || error.message,
      );
      Alert.alert("Erro", "Não foi possível registrar o consumo.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: `Água - ${name || "Lote"}`,
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

      <Text style={styles.sectionTitle}>Consumo Hídrico (Litros)</Text>

      {chartData.length > 0 && chartData[0] !== 0 ? (
        <LineChart
          data={{ labels: chartLabels, datasets: [{ data: chartData }] }}
          width={Math.max(Dimensions.get("window").width - 20, 300)}
          height={220}
          chartConfig={{
            backgroundColor: "#1e1e1e",
            backgroundGradientFrom: "#1e1e1e",
            backgroundGradientTo: "#1e1e1e",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(170, 170, 170, ${opacity})`,
            propsForDots: { r: "5", strokeWidth: "2", stroke: "#00BCD4" },
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Sem registros de água</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Registro Diário</Text>
      <View style={{ marginBottom: 30 }}>
        <Calendar
          markedDates={markedDates}
          theme={{
            backgroundColor: "#1e1e1e",
            calendarBackground: "#1e1e1e",
            textSectionTitleColor: "#00BCD4",
            selectedDayBackgroundColor: "#00BCD4",
            dayTextColor: "#fff",
            monthTextColor: "#fff",
          }}
          onDayPress={(day: any) => openModal(day.dateString)}
        />
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        {/* Usamos apenas uma View normal no fundo, sem função de clique */}
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Editar Água" : "Registrar Água"} -{" "}
              {selectedDate.split("-").reverse().join("/")}
            </Text>

            <Text style={styles.label}>Total Consumido (Litros)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={aguaLitros}
              onChangeText={setAguaLitros}
              placeholder="Ex: 50.5"
              placeholderTextColor="#666"
              autoFocus
            />

            {/* O texto da ração continua removido visualmente, mas o back-end está salvando! */}

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

  // Modal Limpo e Blindado
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 12,
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
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },

  modalActions: { flexDirection: "row", justifyContent: "flex-end" },
  cancelBtn: { padding: 12, marginRight: 10 },
  cancelBtnText: { color: "#aaa", fontWeight: "bold", fontSize: 16 },
  saveBtn: {
    backgroundColor: "#00BCD4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
