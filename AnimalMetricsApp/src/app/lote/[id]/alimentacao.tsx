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
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { LineChart } from "react-native-chart-kit";
import api from "@/services/api";
import DailyModal from "@/components/DailyModal";

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

export default function AlimentacaoLote() {
  const { id, name } = useLocalSearchParams(); // Este 'id' é o ID do Lote direto da URL
  const loteId = Array.isArray(id) ? Number(id[0]) : Number(id);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [rationAmount, setRationAmount] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});

  const [rationPriceKg, setRationPriceKg] = useState("0");
  const [totalFoodGrams, setTotalFoodGrams] = useState(0);
  const [totalCostMonth, setTotalCostMonth] = useState(0);
  const [chartLabels, setChartLabels] = useState<string[]>(["1"]);
  const [chartDataValues, setChartDataValues] = useState<number[]>([0]);

  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const loadData = async () => {
    try {
      if (!loteId) return;

      // Busca registros e resumo filtrando estritamente pelo ID do Lote
      const [recordsRes, summaryRes] = await Promise.all([
        api
          .get(`/dailyrecords/lote/${loteId}?t=${new Date().getTime()}`)
          .catch(() => ({ data: [] })),
        api
          .get(
            `/dailyrecords/lote/${loteId}/monthly-summary?month=${viewMonth}&year=${viewYear}&t=${new Date().getTime()}`,
          )
          .catch(() => ({
            data: {
              totalFoodGrams: 0,
              totalCost: 0,
              rationPricePerKg: 0,
              dailyLabels: [],
            },
          })),
      ]);

      const recordsData = recordsRes.data || [];
      setRecords(recordsData);

      const newMarks: any = {};
      recordsData.forEach((record: any) => {
        if (record.recordDate) {
          const dateKey = record.recordDate.split("T")[0];
          newMarks[dateKey] = { marked: true, dotColor: "#4CAF50" };
        }
      });
      setMarkedDates(newMarks);

      const summary = summaryRes.data || {};
      setTotalFoodGrams(summary.totalFoodGrams || 0);
      setTotalCostMonth(summary.totalCost || 0);
      setRationPriceKg(String(summary.rationPricePerKg || 0));

      const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
      const fullLabels: string[] = [];
      const fullData: number[] = [];

      for (let i = 1; i <= daysInMonth; i++) {
        if (i === 1 || i % 5 === 0 || i === daysInMonth) {
          fullLabels.push(String(i));
        } else {
          fullLabels.push("");
        }
        fullData.push(0);
      }

      if (
        summary &&
        summary.dailyLabels &&
        Array.isArray(summary.dailyLabels)
      ) {
        summary.dailyLabels.forEach((d: any) => {
          const dayIndex = parseInt(d.day) - 1;
          if (dayIndex >= 0 && dayIndex < daysInMonth) {
            fullData[dayIndex] = d.foodGrams;
          }
        });
      }

      setChartLabels(fullLabels);
      setChartDataValues(fullData);
    } catch (error) {
      console.error("Erro ao carregar dados do lote:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [viewMonth, viewYear, loteId]);

  const handleSavePrice = async () => {
    if (!rationPriceKg || rationPriceKg.trim() === "") return;

    try {
      const cleanString = String(rationPriceKg).replace(",", ".");
      const formatedPrice = Number(cleanString);

      if (isNaN(formatedPrice)) {
        Alert.alert("Erro", "Preço inválido.");
        return;
      }

      // Atualiza o preço da ração para este lote específico
      await api.put(`/lotes/${loteId}/ration-price`, formatedPrice, {
        headers: { "Content-Type": "application/json" },
      });

      Alert.alert("Sucesso", "Preço da ração atualizado!");
      await loadData();
    } catch (error) {
      console.error("Erro preço:", error);
      Alert.alert("Erro", "Não foi possível salvar o preço.");
    }
  };

  const handleSaveRecord = async () => {
    if (!rationAmount || String(rationAmount).trim() === "") return;

    try {
      const cleanString = String(rationAmount).replace(",", ".");
      const foodAmount = Number(cleanString);

      if (isNaN(foodAmount)) {
        Alert.alert("Erro", "Valor de gramas inválido.");
        return;
      }

      const payload: any = {
        loteId: loteId, // Envia diretamente o ID do lote da URL
        foodGiven: foodAmount,
        currentWeight: 0,
        recordDate: selectedDate,
      };

      if (isEditing && recordId) {
        payload.id = recordId;
      }

      console.log(
        "🚀 [API POST] ENVIANDO REGISTRO DO LOTE:",
        JSON.stringify(payload),
      );

      await api.post("/dailyrecords", payload);

      setModalVisible(false);
      setRationAmount("");
      setRecordId(null);
      setIsEditing(false);
      await loadData();
    } catch (error: any) {
      console.error(
        "Erro daily record:",
        error.response?.data || error.message,
      );
      Alert.alert("Erro", "Falha ao salvar a ração do dia.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: name as string, headerShown: true }} />

      <View style={styles.dashboard}>
        <View style={styles.priceCard}>
          <Text style={styles.cardTitle}>Preço da Ração (R$/Kg)</Text>
          <TextInput
            style={styles.priceInput}
            keyboardType="numeric"
            value={rationPriceKg}
            onChangeText={setRationPriceKg}
            placeholder="Ex: 4.80"
          />
          <TouchableOpacity
            style={styles.savePriceBtn}
            onPress={handleSavePrice}
          >
            <Text style={{ color: "#fff" }}>Definir Preço</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Consumo Mês (g)</Text>
            <Text style={styles.value}>{totalFoodGrams}</Text>
          </View>
          <View
            style={[
              styles.summaryItem,
              { borderLeftWidth: 1, borderLeftColor: "#444" },
            ]}
          >
            <Text style={styles.label}>Gasto Mês (R$)</Text>
            <Text style={[styles.value, { color: "#FFD700" }]}>
              R$ {totalCostMonth.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Consumo Diário (g) - {String(viewMonth).padStart(2, "0")}/{viewYear}
      </Text>
      <LineChart
        data={{
          labels: chartLabels,
          datasets: [{ data: chartDataValues }],
        }}
        width={Math.max(Dimensions.get("window").width - 20, 300)}
        height={180}
        chartConfig={{
          backgroundColor: "#1e1e1e",
          backgroundGradientFrom: "#1e1e1e",
          backgroundGradientTo: "#1e1e1e",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(170, 170, 170, ${opacity})`,
          propsForDots: { r: "5", strokeWidth: "2", stroke: "#4CAF50" },
        }}
        bezier
        style={styles.chart}
      />

      <Text style={styles.sectionTitle}>Registro e Histórico</Text>
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
            const existingRecord = records.find(
              (r: any) => r.recordDate.split("T")[0] === day.dateString,
            );
            if (existingRecord) {
              setRationAmount(String(existingRecord.foodGiven));
              setRecordId(existingRecord.id);
              setIsEditing(true);
            } else {
              setRationAmount("");
              setRecordId(null);
              setIsEditing(false);
            }
            setModalVisible(true);
          }}
        />
      </View>

      <DailyModal
        visible={modalVisible}
        selectedDate={selectedDate}
        isEditing={isEditing}
        rationAmount={rationAmount}
        onChangeRationAmount={setRationAmount}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveRecord}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 10 },
  dashboard: { marginVertical: 10 },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 15,
  },
  priceCard: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardTitle: { color: "#aaa", fontSize: 14, marginBottom: 10 },
  priceInput: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  savePriceBtn: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  summaryCard: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
  },
  summaryItem: { flex: 1, alignItems: "center" },
  label: { color: "#aaa", fontSize: 12, marginBottom: 5 },
  value: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  chart: { marginVertical: 10, borderRadius: 12 },
});
