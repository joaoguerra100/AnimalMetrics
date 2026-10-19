import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Ícones do Expo
import api from "@/services/api";

export default function TimelineLote() {
  const { id, name } = useLocalSearchParams();
  const loteId = Array.isArray(id) ? Number(id[0]) : Number(id);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  const loadTimeline = async () => {
    try {
      setLoading(true);

      // Fazemos o download de todos os módulos de uma só vez (Paralelamente)
      const [pesagensRes, mortalidadeRes, sanidadeRes, manejoRes, dailyRes] =
        await Promise.all([
          api.get(`/pesagens/lote/${loteId}`).catch(() => ({ data: [] })),
          api.get(`/mortalidade/lote/${loteId}`).catch(() => ({ data: [] })),
          api.get(`/sanidade/lote/${loteId}`).catch(() => ({ data: [] })),
          api.get(`/manejo/lote/${loteId}`).catch(() => ({ data: [] })),
          api.get(`/dailyrecords/lote/${loteId}`).catch(() => ({ data: [] })),
        ]);

      const events: any[] = [];

      // 1. Processa Pesagens
      (pesagensRes.data || []).forEach((item: any) => {
        if (item.dataRegistro) {
          events.push({
            id: `peso-${item.id}`,
            date: item.dataRegistro,
            type: "peso",
            title: "Pesagem Realizada",
            description: `Peso Médio: ${item.pesoMedioGramas}g`,
            color: "#4CAF50", // Verde
            icon: "scale-balance",
          });
        }
      });

      // 2. Processa Mortalidade
      (mortalidadeRes.data || []).forEach((item: any) => {
        // Cuidado com o seu nome de variável aqui (datRegistro ou dataRegistro)
        const dateStr = item.datRegistro || item.dataRegistro;
        if (dateStr) {
          events.push({
            id: `morte-${item.id}`,
            date: dateStr,
            type: "morte",
            title: "Mortalidade Registrada",
            description: `${item.quantidadeAves} aves perdidas (Causa: ${item.causa})`,
            color: "#F44336", // Vermelho
            icon: "skull",
          });
        }
      });

      // 3. Processa Sanidade
      (sanidadeRes.data || []).forEach((item: any) => {
        if (item.dataAplicacao) {
          events.push({
            id: `sanidade-${item.id}`,
            date: item.dataAplicacao,
            type: "sanidade",
            title: `Sanidade: ${item.tipo}`,
            description: `${item.nomeProduto} (${item.dosagem})`,
            color: "#2196F3", // Azul
            icon: "needle",
          });
        }
      });

      // 4. Processa Manejo
      (manejoRes.data || []).forEach((item: any) => {
        if (item.dataRegistro) {
          events.push({
            id: `manejo-${item.id}`,
            date: item.dataRegistro,
            type: "manejo",
            title: "Checklist de Manejo",
            description: item.observacoes
              ? `Obs: ${item.observacoes}`
              : "Manutenção de rotina realizada.",
            color: "#FF9800", // Laranja
            icon: "broom",
          });
        }
      });

      // 5. Processa Ração e Água (DailyRecords)
      (dailyRes.data || []).forEach((item: any) => {
        if (item.recordDate) {
          if (item.foodGiven > 0) {
            events.push({
              id: `food-${item.id}`,
              date: item.recordDate,
              type: "racao",
              title: "Alimentação (Ração)",
              description: `Fornecido: ${item.foodGiven}g`,
              color: "#8BC34A", // Verde Claro
              icon: "leaf",
            });
          }
          if (item.waterConsumed > 0) {
            events.push({
              id: `water-${item.id}`,
              date: item.recordDate,
              type: "agua",
              title: "Consumo Hídrico",
              description: `Registrado: ${item.waterConsumed} Litros`,
              color: "#00BCD4", // Ciano
              icon: "water-drop",
            });
          }
        }
      });

      // Ordena TODOS os eventos do mais recente (hoje) para o mais antigo
      events.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      setTimelineEvents(events);
    } catch (error) {
      console.error("Erro ao carregar a Timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loteId) loadTimeline();
  }, [loteId]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Timeline - ${name || "Lote"}`,
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

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Linha do Tempo</Text>
        <Text style={styles.headerSubtitle}>
          Histórico completo de ocorrências do lote
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#FF9800"
          style={{ marginTop: 50 }}
        />
      ) : timelineEvents.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {timelineEvents.map((event, index) => {
            // Lógica para desenhar a linha vertical que conecta os eventos
            const isLast = index === timelineEvents.length - 1;

            return (
              <View key={event.id} style={styles.eventContainer}>
                {/* Lado Esquerdo: Data e Ícone (Com a linha vertical) */}
                <View style={styles.leftColumn}>
                  <Text style={styles.dateDay}>
                    {event.date.split("T")[0].split("-")[2]}
                  </Text>
                  <Text style={styles.dateMonth}>
                    {
                      LocaleConfig.locales["pt-br"]?.monthNamesShort[
                        parseInt(event.date.split("T")[0].split("-")[1]) - 1
                      ]
                    }
                  </Text>

                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: event.color },
                    ]}
                  >
                    {/* Se o ícone for do MaterialCommunityIcons, usa ele. Se não achar, usa um padrão do Ionicons */}
                    {event.icon === "water-drop" ? (
                      <Ionicons name="water" size={16} color="#fff" />
                    ) : event.icon === "leaf" ? (
                      <Ionicons name="leaf" size={16} color="#fff" />
                    ) : (
                      <MaterialCommunityIcons
                        name={event.icon}
                        size={18}
                        color="#fff"
                      />
                    )}
                  </View>

                  {/* Linha vertical (Não aparece no último item) */}
                  {!isLast && (
                    <View
                      style={[
                        styles.verticalLine,
                        { borderColor: event.color },
                      ]}
                    />
                  )}
                </View>

                {/* Lado Direito: O Card com as Informações */}
                <View
                  style={[styles.rightColumn, { borderLeftColor: event.color }]}
                >
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Ainda não há registros para este lote.
          </Text>
        </View>
      )}
    </View>
  );
}

// Configuração rápida de locale para a data
const LocaleConfig = {
  locales: {
    "pt-br": {
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
    },
  },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  headerSubtitle: { color: "#aaa", fontSize: 14, marginTop: 4 },

  scrollContent: { padding: 20, paddingBottom: 50 },

  eventContainer: { flexDirection: "row", marginBottom: 0 }, // marginBottom 0 para a linha vertical grudar

  // Coluna da Esquerda (Data, Bolinha e Linha)
  leftColumn: { width: 60, alignItems: "center", position: "relative" },
  dateDay: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  dateMonth: {
    color: "#888",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  verticalLine: {
    position: "absolute",
    top: 65,
    bottom: -15,
    width: 2,
    borderWidth: 1,
    borderStyle: "dashed",
    zIndex: 1,
  },

  // Coluna da Direita (O Card)
  rightColumn: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    borderLeftWidth: 4,
    marginLeft: 15,
  },
  eventTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  eventDescription: { color: "#aaa", fontSize: 14 },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#666", fontSize: 16, fontStyle: "italic" },
});
