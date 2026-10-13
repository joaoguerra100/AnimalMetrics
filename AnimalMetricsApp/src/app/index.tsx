import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import api from "@/services/api";

export default function MeusLotes() {
  const router = useRouter();
  const [lotes, setLotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os lotes na nossa API .NET
  const carregarLotes = async () => {
    try {
      const response = await api.get("/lotes");
      setLotes(response.data);
    } catch (error) {
      console.error("Erro ao buscar lotes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Usamos useFocusEffect para recarregar a lista sempre que voltar para esta tela (ótimo após criar ou editar)
  useFocusEffect(
    useCallback(() => {
      carregarLotes();
    }, []),
  );

  // 1. Criamos uma função separada que faz a exclusão de fato
  const executarExclusao = async (id: number) => {
    try {
      await api.delete(`/lotes/${id}`);
      if (Platform.OS === "web") {
        window.alert("Lote excluído com sucesso.");
      } else {
        Alert.alert("Sucesso", "Lote excluído com sucesso.");
      }
      carregarLotes(); // Atualiza a lista
    } catch (error) {
      console.error("Erro ao excluir lote:", error);
      if (Platform.OS === "web") {
        window.alert("Não foi possível excluir o lote.");
      } else {
        Alert.alert("Erro", "Não foi possível excluir o lote.");
      }
    }
  };

  // 2. A função do botão agora decide qual alerta mostrar dependendo de onde está rodando
  const confirmarExclusao = (id: number, nome: string) => {
    if (Platform.OS === "web") {
      // Alerta nativo do navegador para o ambiente Web
      const confirmou = window.confirm(
        `Tem certeza que deseja excluir o lote "${nome}"? Esta ação não pode ser desfeita.`,
      );
      if (confirmou) {
        executarExclusao(id);
      }
    } else {
      // Alerta nativo do celular (iOS/Android)
      Alert.alert(
        "Excluir Lote",
        `Tem certeza que deseja excluir o lote "${nome}"? Esta ação não pode ser desfeita.`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: () => executarExclusao(id),
          },
        ],
      );
    }
  };

  const renderLote = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Apenas esta parte abre os detalhes do lote */}
      <TouchableOpacity
        onPress={() => router.push(`/lote/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.loteNome}>{item.nome}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.ativo ? "#4CAF50" : "#F44336" },
            ]}
          >
            <Text style={styles.statusText}>
              {item.ativo ? "Ativo" : "Finalizado"}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.infoText}>
            <FontAwesome5 name="kiwi-bird" size={14} color="#aaa" />{" "}
            {item.quantidadeAtual} aves
          </Text>
          <Text style={styles.infoText}>
            <FontAwesome5 name="bullseye" size={14} color="#aaa" />{" "}
            {item.finalidade} ({item.linhagem})
          </Text>
        </View>
      </TouchableOpacity>

      {/* Botões de Ação Rápida (Isolados fora do toque do card) */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: "/novo-lote",
              params: { id: item.id },
            } as any)
          }
        >
          <FontAwesome5 name="pen" size={13} color="#FFA726" />
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => confirmarExclusao(item.id, item.nome)}
        >
          <FontAwesome5 name="trash" size={13} color="#EF5350" />
          <Text style={styles.deleteText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Meus Lotes",
          headerStyle: { backgroundColor: "#121212" },
          headerTintColor: "#fff",
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={lotes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderLote}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum lote cadastrado ainda.</Text>
          }
        />
      )}

      {/* Botão Flutuante (FAB) para criar Novo Lote */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/novo-lote" as any)}
      >
        <FontAwesome5 name="plus" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 10,
  },
  loteNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardBody: {
    flexDirection: "column",
    gap: 8,
  },
  infoText: {
    color: "#aaa",
    fontSize: 14,
  },
  emptyText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    marginTop: 12,
    paddingTop: 10,
    gap: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editText: {
    color: "#FFA726",
    fontSize: 13,
    fontWeight: "bold",
  },
  deleteText: {
    color: "#EF5350",
    fontSize: 13,
    fontWeight: "bold",
  },
});
